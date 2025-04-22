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
import { Pool, PoolClient } from 'pg';
import { DbError } from '../utils/errors.js';
import {
  decrementBookCopies,
  incrementBookCopies,
} from '../utils/book-copies.js';

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

async function removeLoanReq(
  approved: boolean,
  client: PoolClient,
  data: { loanId: number; bookId: number; authorId: number; userId: number },
) {
  const removeLoanReqQuery = `
    DELETE FROM ${approved ? 'loan_book' : 'loan_request'}
    WHERE loan_id = $1 AND user_id = $2 AND book_id = $3 AND author_id = $4
    RETURNING 'deleted' AS status;
    `;
  const result = await client.query(removeLoanReqQuery, [
    data.loanId,
    data.userId,
    data.bookId,
    data.authorId,
  ]);
  if (result.rows.length === 0) {
    throw new DbError(404, 'Could not remove loan request');
  }
}

async function removeLoan(
  client: PoolClient | Pool,
  data: { loanId: number; userId: number },
) {
  const deleteLoanQuery = `
    DELETE FROM loan
    WHERE loan_id = $1 AND user_id = $2
      AND NOT EXISTS
        (SELECT 1 FROM loan_book WHERE loan_id = $1 AND user_id = $2)
      AND NOT EXISTS
        (SELECT 1 FROM loan_request WHERE loan_id = $1 AND user_id = $2)
    RETURNING 'deleted' AS status;
    `;
  const result = await client.query(deleteLoanQuery, [
    data.loanId,
    data.userId,
  ]);
  if (result.rows.length === 0) {
    throw new DbError(500, 'Loan could not be removed');
  }
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
      throw new DbError(404, 'Could not identify book copy');
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
      throw new DbError(404, 'Could not find loans');
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
      JOIN book b ON lr.book_id = b.book_id AND lr.author_id = b.author_id
      JOIN loan l ON lr.loan_id = l.loan_id AND lr.user_id = l.user_id
      WHERE lc.no_of_copies > 0 AND lc.library_id = $1;
      `;
  const result = await db.query(getLoansForUserQuery, [libraryId.toString()]);

  if (result.rows.length === 0) {
    res.json([]);
    return;
  }

  const rows = result.rows as Record<string, unknown>[];
  res.json(rows);
});

// Endpoint to get all active loans for this librarian's library
router.get('/activeLoans', librarianConfirmation, async (req, res) => {
  const libraryId = req.libraryId as number;

  const getLoansForUserQuery = `
      SELECT *
      FROM loan_book lr
      JOIN library_contains lc ON lr.book_id = lc.book_id AND lr.author_id = lc.author_id
      JOIN book b ON lr.book_id = b.book_id AND lr.author_id = b.author_id
      JOIN loan l ON lr.loan_id = l.loan_id AND lr.user_id = l.user_id
      WHERE lc.library_id = $1;
      `;
  const result = await db.query(getLoansForUserQuery, [libraryId.toString()]);

  if (result.rows.length === 0) {
    res.json([]);
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
        throw new DbError(500, 'Could not request loan');
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
      throw e;
    } finally {
      client.release();
    }
  },
);

router.patch(
  '/:loanId',
  param('loanId').isInt({ min: 1 }),
  body(['bookId', 'authorId', 'userId']).isInt({ min: 1 }),
  librarianConfirmation,
  async (req, res) => {
    const vResult = validationResult(req);
    const libraryId = req.libraryId as number;
    if (!vResult.isEmpty()) {
      res.sendStatus(400);
      return;
    }

    const data = matchedData(req);
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      const setLibrarianQuery = `
        UPDATE loan
        SET librarian_id = $3
        WHERE loan_id = $1 AND user_id = $2
        RETURNING 'updated' AS status;
        `;
      const result = await client.query(setLibrarianQuery, [
        data.loanId,
        data.userId,
        libraryId,
      ]);
      if (result.rows.length === 0) {
        throw new DbError(404, 'Could not find librarian user to approve loan');
      }

      const params = {
        loanId: data.loanId as number,
        bookId: data.bookId as number,
        authorId: data.authorId as number,
        userId: data.userId as number,
        libraryId: libraryId,
      };
      await removeLoanReq(false, client, params);
      await decrementBookCopies(client, params);

      const insertLoanAppQuery = `
        INSERT INTO loan_book (loan_id, user_id, book_id, author_id)
        VALUES ($1, $2, $3, $4);
        `;
      await client.query(insertLoanAppQuery, [
        data.loanId,
        data.userId,
        data.bookId,
        data.authorId,
      ]);

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    res.sendStatus(200);
  },
);

async function deleteUnapprovedLoan(
  client: PoolClient,
  params: { loanId: number; bookId: number; authorId: number; userId: number },
) {
  await removeLoanReq(false, client, params);
  await removeLoan(client, params);
}

async function deleteApprovedLoan(
  client: PoolClient,
  data: { loanId: number; bookId: number; authorId: number; userId: number },
) {
  const getLibraryIdQuery = `
    SELECT library_id
    FROM librarian
    WHERE librarian_id = (
      SELECT librarian_id
      FROM loan
      WHERE loan_id = $1 AND user_id = $2
    );
    `;
  const result = await client.query(getLibraryIdQuery, [
    data.loanId,
    data.userId,
  ]);
  if (result.rows.length === 0) {
    throw new DbError(404, 'Loan could not be associated to library');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  } else if (result.rows[0].library_id === null) {
    throw new DbError(409, 'Loan could not be associated to library');
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const libraryId = result.rows[0].library_id as number;

  await removeLoanReq(true, client, data);
  await incrementBookCopies(client, {
    bookId: data.bookId,
    authorId: data.authorId,
    libraryId: libraryId,
  });
  await removeLoan(client, { loanId: data.loanId, userId: data.userId });
}

router.delete(
  '/:loanId',
  param('loanId').isInt({ min: 1 }),
  body(['bookId', 'authorId']).isInt({ min: 1 }),
  body('approved').default(true).toBoolean(true),
  userConfirmation,
  async (req, res) => {
    const vResult = validationResult(req);
    const userId = req.userId as number;
    if (!vResult.isEmpty()) {
      res.sendStatus(400);
      return;
    }

    const data = matchedData(req);
    const client = await db.getClient();

    const params = {
      loanId: data.loanId as number,
      bookId: data.bookId as number,
      authorId: data.authorId as number,
      userId: userId,
    };
    try {
      await client.query('BEGIN');

      if (data.approved) {
        await deleteApprovedLoan(client, params);
      } else {
        await deleteUnapprovedLoan(client, params);
      }

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    res.sendStatus(200);
  },
);

export default router;
