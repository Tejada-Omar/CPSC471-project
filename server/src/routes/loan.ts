import express from 'express';
import * as db from '../db/index.js';
import {
  body,
  matchedData,
  param,
  query,
  validationResult,
} from 'express-validator';
import {
  librarianConfirmation,
  userConfirmation,
} from '../utils/middleware.js';
import { mapBookResult } from './book.js';

export interface Loan {
  id: number;
  userId: number;
  retDate: Date;
  startDate: Date;
  librarianId?: number;
}

export function mapLoanResult(row: Record<string, unknown>): Loan {
  return {
    id: row.loan_id as number,
    userId: row.user_id as number,
    retDate: row.ret_date as Date,
    startDate: row.start_date as Date,
    librarianId:
      row.librarian_id !== undefined ? (row.librarian_id as number) : undefined,
  };
}

export interface LoanRequest {
  id: number;
  userId: number;
  bookId: number;
  authorId: number;
}

export function mapLoanReqResult(row: Record<string, unknown>): LoanRequest {
  return {
    id: row.loan_id as number,
    userId: row.user_id as number,
    bookId: row.book_id as number,
    authorId: row.author_id as number,
  };
}

const router = express.Router();

router.get(
  '/',
  query(['bookId', 'authorId', 'libraryId']).isInt({ min: 1 }),
  async (req, res) => {
    const vResult = validationResult(req);
    if (!vResult.isEmpty()) {
      res.sendStatus(400);
      return;
    }

    const data = matchedData(req);
    const checkCopiesQuery = `
      SELECT no_of_copies
      FROM library_contains
      WHERE library_id = $1 AND book_id = $2 AND author_id = $3;
      `;
    const result = await db.query(checkCopiesQuery, [
      data.libraryId,
      data.bookId,
      data.authorId,
    ]);

    if (result.rows.length === 0) {
      res.sendStatus(404);
      return;
    }

    const rows = result.rows as Record<string, unknown>[];
    res.json({ noOfCopies: rows[0].no_of_copies });
  },
);

router.get(
  '/user',
  query('approved').default(true).toBoolean(true),
  userConfirmation,
  async (req, res) => {
    const vResult = validationResult(req);
    const userId = req.userId as number;
    if (!vResult.isEmpty()) {
      res.sendStatus(400);
      return;
    }

    const data = matchedData(req);
    const getLoansForUserQuery = `
      SELECT l.*, lb.book_id, lb.author_id, b.*
      FROM loan l
      JOIN ${data.approved ? 'loan_book' : 'loan_request'} lb
        ON l.loan_id = lb.loan_id AND l.user_id = lb.user_id
      JOIN book b
        ON lb.book_id = b.book_id AND lb.author_id = b.author_id
      WHERE l.user_id = $1
      ORDER BY l.ret_date ASC;
      `;

    const result = await db.query(getLoansForUserQuery, [userId.toString()]);
    const rows = result.rows as Record<string, unknown>[];
    const respBody = rows.map((r) => {
      return {
        loan: mapLoanResult(r),
        book: mapBookResult(r),
      };
    });
    res.json(respBody);
  },
);

router.get(
  '/book',
  query(['bookId', 'authorId']).isInt({ min: 1 }),
  query('approved').default(true).toBoolean(true),
  librarianConfirmation,
  async (req, res) => {
    const vResult = validationResult(req);
    if (!vResult.isEmpty()) {
      res.sendStatus(400);
      return;
    }

    const data = matchedData(req);
    const getLoansForUserQuery = `
      SELECT *
      FROM ${data.approved ? 'loan_book' : 'loan_request'}
      WHERE book_id = $1 AND author_id = $2;
      `;
    const result = await db.query(getLoansForUserQuery, [
      data.bookId,
      data.authorId,
    ]);

    if (result.rows.length === 0) {
      res.sendStatus(404);
      return;
    }

    const rows = result.rows as Record<string, unknown>[];
    res.json(rows.map((r) => mapLoanReqResult(r)));
  },
);

// Endpoint to get all available loans for this librarian's library
router.get('/availBooks', librarianConfirmation, async (req, res) => {
  const libraryId = req.libraryId as number;

  const getLoansForUserQuery = `
      SELECT *
      FROM loan_request lr
      JOIN library_contains lc ON lr.book_id = lc.book_id AND lr.author_id = lc.author_id
      WHERE lc.no_of_copies > 0 AND lc.library_id = $1;
      `;
  const result = await db.query(getLoansForUserQuery, [libraryId.toString()]);

  if (result.rows.length === 0) {
    res.sendStatus(404);
    return;
  }

  const rows = result.rows as Record<string, unknown>[];
  res.json(rows);
});

router.post(
  '/',
  body(['bookId', 'authorId']).isInt({ min: 1 }),
  body(['startDate', 'retDate']).isISO8601().toDate(),
  userConfirmation,
  async (req, res) => {
    const vResult = validationResult(req);
    const userId = req.userId;
    if (!vResult.isEmpty()) {
      res.sendStatus(400);
      return;
    }

    const data = matchedData(req);
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const insertLoanQuery = `
      INSERT INTO loan (user_id, ret_date, start_date)
      VALUES ($1, $2, $3)
      RETURNING *;
      `;
      const result = await client.query(insertLoanQuery, [
        userId,
        data.retDate,
        data.startDate,
      ]);
      const rows = result.rows as Record<string, unknown>[];
      if (rows.length === 0) {
        await client.query('ROLLBACK');
        res.sendStatus(500);
        return;
      }
      const loan = mapLoanResult(rows[0]);

      const insertLoanReqQuery = `
        INSERT INTO loan_request (loan_id, user_id, book_id, author_id)
        VALUES ($1, $2, $3, $4);
        `;
      await client.query(insertLoanReqQuery, [
        loan.id,
        userId,
        data.bookId,
        data.authorId,
      ]);

      await client.query('COMMIT');
      res.status(201).json(loan);
    } catch (e) {
      // TODO: Set proper code based on error
      await client.query('ROLLBACK');
      res.sendStatus(500);
      throw e;
    } finally {
      client.release();
    }
  },
);

router.patch(
  '/:loanId',
  param('loanId').isInt({ min: 1 }),
  body(['bookId', 'authorId']).isInt({ min: 1 }),
  librarianConfirmation,
  async (req, res) => {
    const vResult = validationResult(req);
    const userId = req.userId;
    const libraryId = req.libraryId;
    if (!vResult.isEmpty()) {
      res.sendStatus(400);
      return;
    }

    const data = matchedData(req);
    const client = await db.getClient();
    try {
      const loanParams = [data.loanId, userId, data.bookId, data.authorId];
      const copiesParams = [libraryId, data.bookId, data.authorId];

      await client.query('BEGIN');

      const setLibrarianQuery = `
        UPDATE loan
        SET librarian_id = $3
        WHERE loan_id = $1 AND user_id = $2
        RETURNING 'updated' AS status;
        `;
      let result = await client.query(setLibrarianQuery, [
        data.loanId,
        userId,
        libraryId,
      ]);
      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        res.sendStatus(404);
        return;
      }

      const removeLoanReqQuery = `
        DELETE FROM loan_request
        WHERE loan_id = $1 AND user_id = $2 AND book_id = $3 AND author_id = $4
        RETURNING 'deleted' AS status;
        `;
      result = await client.query(removeLoanReqQuery, loanParams);
      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        res.sendStatus(404);
        return;
      }

      const insertLoanAppQuery = `
        INSERT INTO loan_book (loan_id, user_id, book_id, author_id)
        VALUES ($1, $2, $3, $4);
        `;
      await client.query(insertLoanAppQuery, loanParams);

      const lockCopiesRowQuery = `
        SELECT no_of_copies
        FROM library_contains
        WHERE library_id = $1 AND book_id = $2 AND author_id = $3
          AND no_of_copies > 0
        FOR UPDATE;
        `;
      result = await client.query(lockCopiesRowQuery, copiesParams);
      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(409).send('No copies for requested book available');
        return;
      }

      const removeCopyQuery = `
        UPDATE library_contains
        SET no_of_copies = no_of_copies - 1
        WHERE library_id = $1 AND book_id = $2 AND author_id = $3
          AND no_of_copies > 0
        RETURNING 'deleted' AS status;
        `;
      result = await client.query(removeCopyQuery, copiesParams);
      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        res.sendStatus(500);
        return;
      }

      await client.query('COMMIT');
      res.sendStatus(200);
    } catch (e) {
      // TODO: Set proper code based on error
      await client.query('ROLLBACK');
      res.sendStatus(500);
      throw e;
    } finally {
      client.release();
    }
  },
);

router.delete(
  '/:loanId',
  param('loanId').isInt({ min: 1 }),
  body(['bookId', 'authorId']).isInt({ min: 1 }),
  userConfirmation,
  async (req, res) => {
    const vResult = validationResult(req);
    const userId = req.userId;
    if (!vResult.isEmpty()) {
      res.sendStatus(400);
      return;
    }

    const data = matchedData(req);
    const client = await db.getClient();
    try {
      const loanParams = [data.loanId, userId, data.bookId, data.authorId];

      await client.query('BEGIN');

      const getLibraryIdQuery = `
        SELECT library_id
        FROM librarian
        WHERE librarian_id = (
          SELECT librarian_id
          FROM loan
          WHERE loan_id = $1 AND user_id = $2
        );
        `;
      let result = await client.query(getLibraryIdQuery, [data.loanId, userId]);
      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        res.sendStatus(404);
        return;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      } else if (result.rows[0].library_id === null) {
        await client.query('ROLLBACK');
        res.sendStatus(409);
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const libraryId = result.rows[0].library_id as number;
      const copiesParams = [libraryId, data.bookId, data.authorId];

      const removeLoanReqQuery = `
        DELETE FROM loan_book
        WHERE loan_id = $1 AND user_id = $2 AND book_id = $3 AND author_id = $4
        RETURNING 'deleted' AS status;
        `;
      result = await client.query(removeLoanReqQuery, loanParams);
      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        res.sendStatus(404);
        return;
      }

      const lockCopiesRowQuery = `
        SELECT no_of_copies
        FROM library_contains
        WHERE library_id = $1 AND book_id = $2 AND author_id = $3
        FOR UPDATE;
        `;
      result = await client.query(lockCopiesRowQuery, copiesParams);
      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(409).send('No copies for requested book available');
        return;
      }

      const addCopyQuery = `
        UPDATE library_contains
        SET no_of_copies = no_of_copies + 1
        WHERE library_id = $1 AND book_id = $2 AND author_id = $3
        RETURNING 'updated' AS status;
        `;
      result = await client.query(addCopyQuery, copiesParams);
      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        res.sendStatus(500);
        return;
      }

      const deleteLoanQuery = `
        DELETE FROM loan
        WHERE loan_id = $1 AND user_id = $2
          AND NOT EXISTS
            (SELECT 1 FROM loan_book WHERE loan_id = $1 AND user_id = $2)
        RETURNING 'deleted' AS status;
        `;
      result = await client.query(deleteLoanQuery, [data.loanId, userId]);
      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        res.sendStatus(500);
        return;
      }

      await client.query('COMMIT');
      res.sendStatus(200);
    } catch (e) {
      // TODO: Set proper code based on error
      await client.query('ROLLBACK');
      res.sendStatus(500);
      throw e;
    } finally {
      client.release();
    }
  },
);

export default router;
