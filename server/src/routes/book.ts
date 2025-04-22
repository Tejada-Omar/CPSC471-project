import { Router } from 'express';
import * as db from '../db/index.js';
import {
  body,
  matchedData,
  param,
  query,
  validationResult,
} from 'express-validator';
import { librarianConfirmation } from '../utils/middleware.js';

const router = Router();

export interface Book {
  id: number;
  authorId: number;
  title: string;
  publishedDate: Date;
  synopsis: string;
  noOfCopies?: number;
}

export function mapBookResult(row: Record<string, unknown>): Book {
  return {
    id: row.book_id as number,
    authorId: row.author_id as number,
    publishedDate: row.pdate as Date,
    synopsis: row.synopsis as string,
    title: row.title as string,
    noOfCopies:
      row.no_of_copies !== undefined ? (row.no_of_copies as number) : undefined,
  };
}

export interface ExtendedBook {
  id: number;
  authorId: number;
  title: string;
  publishedDate: Date;
  synopsis: string;
  noOfCopies?: number;
  authorName: string;
  genres: string[];
}

export function mapExtendedBookResult(
  row: Record<string, unknown>,
): ExtendedBook {
  return {
    id: row.book_id as number,
    authorId: row.author_id as number,
    publishedDate: row.pdate as Date,
    synopsis: row.synopsis as string,
    title: row.title as string,
    noOfCopies:
      row.no_of_copies !== undefined ? (row.no_of_copies as number) : undefined,
    authorName: row.author as string,
    genres: row.genres as string[],
  };
}

// Search for a book by the title
router.get('/', query('title').trim().notEmpty(), async (req, res) => {
  const vResult = validationResult(req);

  // If no query, return all books
  if (!vResult.isEmpty()) {
    const result =
      await db.query(`SELECT b.book_id, b.title, b.pdate, b.synopsis, a.author_id, a.aname AS author,
        ARRAY_AGG(g.label) AS genres
        FROM book b
        JOIN author a ON b.author_id = a.author_id
        LEFT JOIN genre g ON b.book_id = g.book_id
        GROUP BY b.book_id, b.title, b.pdate, b.synopsis, a.aname, a.author_id;`);
    const rows = result.rows as Record<string, unknown>[];
    res.json(rows.map((r) => mapExtendedBookResult(r)));
    return;
  }

  const data = matchedData(req);
  const searchByTitleQuery = `
    SELECT b.book_id, b.title, b.pdate, b.synopsis, a.aname AS author,
      STRING_AGG(g.label, ', ') AS genres
    FROM book b
    JOIN author a ON b.author_id = a.author_id
    LEFT JOIN genre g ON b.book_id = g.book_id
    WHERE b.title = $1
    GROUP BY b.book_id, b.title, b.pdate, b.synopsis, a.aname;
    `;

  const result = await db.query(searchByTitleQuery, [data.title]);
  if (result.rows.length === 0) {
    res.sendStatus(404);
  } else {
    const rows = result.rows as Record<string, unknown>[];
    res.json(rows.map((r) => ({ ...mapBookResult(r), author: r.author })));
  }
});

// Search for all books in librarian
router.get('/libraryBooks', librarianConfirmation, async (req, res) => {
  const libraryId = req.libraryId as number;

  const searchByTitleQuery = `
    SELECT
      b.book_id,
      b.author_id,
      b.title,
      TO_CHAR(b.pdate, 'YYYY-MM-DD') AS pdate,
      b.synopsis,
      a.aname AS author,
      ARRAY_AGG(g.label) AS genres
    FROM book b
    JOIN author a ON b.author_id = a.author_id
    LEFT JOIN genre g ON b.book_id = g.book_id
    JOIN library_contains lc ON lc.book_id = b.book_id AND lc.author_id = b.author_id
    WHERE lc.library_id = $1
    GROUP BY b.book_id, b.author_id, b.title, b.pdate, b.synopsis, a.aname;
    `;

  const result = await db.query(searchByTitleQuery, [libraryId.toString()]);
  if (result.rows.length === 0) {
    res.sendStatus(404);
  } else {
    const rows = result.rows as Record<string, unknown>[];
    res.json(rows);
  }
});

// Search for a book by book and author id
router.get(
  '/:bookId',
  param('bookId').isInt({ min: 1 }),
  query('authorId').isInt({ min: 1 }),
  async (req, res) => {
    const vResult = validationResult(req);

    // If no query, return all books
    if (!vResult.isEmpty()) {
      res.status(400).json({ error: 'missing book id or author id' });
      return;
    }

    const data = matchedData(req);
    const searchByIdQuery = `
      SELECT
      b.book_id,
      b.title,
      TO_CHAR(b.pdate, 'YYYY-MM-DD') AS pdate,
      b.synopsis,
      a.aname AS author,
      ARRAY_AGG(g.label) AS genres
    FROM book b
    JOIN author a ON b.author_id = a.author_id
    LEFT JOIN genre g ON b.book_id = g.book_id
    WHERE b.book_id = $1 AND a.author_id = $2
    GROUP BY b.book_id, b.title, b.pdate, b.synopsis, a.aname;
    `;

    const result = await db.query(searchByIdQuery, [
      data.bookId,
      data.authorId,
    ]);
    if (result.rows.length === 0) {
      res.sendStatus(404);
    } else {
      const rows = result.rows as Record<string, unknown>[];
      res.send(rows);
    }
  },
);

// Delete a book entirely from a library
// Will only delete the book if it is from the same library as the librarian doing this request
router.delete(
  '/:bookId',
  param('bookId').isInt({ min: 1 }),
  query('authorId').isInt({ min: 1 }),
  librarianConfirmation,
  async (req, res) => {
    const vResult = validationResult(req);
    const libraryId = req.libraryId;
    if (!vResult.isEmpty()) {
      res.status(400).send('Missing search parameters');
      return;
    }

    const data = matchedData(req);
    const deleteByIdQuery = `
      DELETE FROM library_contains
      WHERE library_id = $1 AND book_id = $2 AND author_id = $3
      RETURNING 'deleted' AS status;
      `;

    const result = await db.query(deleteByIdQuery, [
      libraryId,
      data.bookId,
      data.authorId,
    ]);
    if (result.rows.length === 0) {
      res.sendStatus(404);
    } else {
      res.status(200).json({ success: true, message: 'Book deleted' });
    }
  },
);

// Edit a book
// Must be a librarian from the correct library to do this
router.put(
  '/:bookId',
  param('bookId').isInt({ min: 1 }),
  query('authorId').isInt({ min: 1 }),
  body('title').trim().notEmpty().optional(),
  body('publishedDate').isISO8601().toDate().optional(),
  body('synopsis').trim().optional({ values: 'falsy' }),
  librarianConfirmation,
  async (req, res) => {
    const vResult = validationResult(req);

    // From librarian auth middleware
    const libraryId = req.libraryId;

    if (!vResult.isEmpty()) {
      res.status(400).send('Invalid request body sent');
      return;
    }

    const data = matchedData(req, { includeOptionals: true });

    // FIXME: Use parameterized query instead
    let queryValues = '';
    if (data.title) queryValues += `title = '${data.title}',`;
    if (data.publishedDate) queryValues += `pdate = '${data.publishedDate}',`;
    if (data.synopsis) queryValues += `synopsis = '${data.synopsis}',`;
    queryValues = queryValues.slice(0, -1);

    const updateQuery = `
      UPDATE book
      SET ${queryValues}
      WHERE book_id = $1
        AND author_id = $2
        AND EXISTS (
          SELECT 1
          FROM library_contains
          WHERE book_id = $1
            AND author_id = $2
            AND library_id = $3
        )
      RETURNING 'updated' AS status;
      `;

    const result = await db.query(updateQuery, [
      data.bookId,
      data.authorId,
      libraryId,
    ]);
    if (result.rows.length === 0) {
      res.sendStatus(404);
    } else {
      res.sendStatus(200);
    }
  },
);

// Create a new book in a library of a certain genre
// Will create the book in the same library as the librarian doing this request
router.post(
  '/',
  body(['authorId', 'noOfCopies']).isInt({ min: 1 }),
  body(['title', 'genre']).trim().notEmpty(),
  body('publishedDate').isISO8601().toDate(),
  body('synopsis').trim().optional({ values: 'falsy' }),
  body('genre')
    .isArray()
    .withMessage('Genre must be an array')
    .bail()
    .custom((value: any) => {
      if (value.some((g: any) => typeof g !== 'string' || g.trim() === '')) {
        throw new Error('Each genre must be a non-empty string');
      }
      return true;
    }),
  librarianConfirmation,
  async (req, res) => {
    const vResult = validationResult(req);
    const libraryId = req.libraryId;

    if (!vResult.isEmpty()) {
      res.sendStatus(400);
      return;
    }

    const data = matchedData(req);

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Insert book
      const insertBookQuery = `
        INSERT INTO book (author_id, pdate, synopsis, title)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;
      const fResult = await client.query(insertBookQuery, [
        data.authorId,
        data.publishedDate,
        data.synopsis,
        data.title,
      ]);
      // Guaranteed by schema
      const book = mapBookResult(
        (fResult.rows as Record<string, unknown>[])[0],
      );

      // Insert multiple genres
      const insertGenreQuery = `
        INSERT INTO genre (book_id, author_id, label)
        VALUES ($1, $2, $3);
      `;
      for (const genre of data.genre as string[]) {
        await client.query(insertGenreQuery, [book.id, data.authorId, genre]);
      }

      // Insert book-library relation
      const insertLibraryRelationQuery = `
        INSERT INTO library_contains (library_id, book_id, author_id, no_of_copies)
        VALUES ($1, $2, $3, $4);
      `;
      await client.query(insertLibraryRelationQuery, [
        libraryId,
        book.id,
        data.authorId,
        data.noOfCopies,
      ]);

      await client.query('COMMIT');
      res.status(201).json(book);
    } catch (e) {
      await client.query('ROLLBACK');
      // TODO: Set proper code based on error
      res.sendStatus(500);
      throw e;
    } finally {
      client.release();
    }
  },
);

export default router;
