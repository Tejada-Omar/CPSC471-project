import { Router } from 'express';
import * as db from '../db/index.js';
import {
  body,
  matchedData,
  param,
  query,
  validationResult,
} from 'express-validator';

const router = Router();

export interface Book {
  id: number;
  authorId: number;
  title: string;
  publishedDate: Date;
  synopsis: string;
}

export function mapBookResult(row: Record<string, unknown>): Book {
  return {
    id: row.book_id as number,
    authorId: row.author_id as number,
    publishedDate: row.pdate as Date,
    synopsis: row.synopsis as string,
    title: row.title as string,
  };
}

// Search for a book by the title
router.get('/', query('title').trim().notEmpty(), async (req, res) => {
  const vResult = validationResult(req);

  // If no query, return all books
  if (!vResult.isEmpty()) {
    const result = await db.query('SELECT * FROM book');
    res.send(mapBookResult(result));
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
    res.send(rows.map((r) => mapBookResult(r)));
  }
});

// TODO: Put behind 'librarianConfirmation' middleware
// Delete a book entirely from a library
router.delete(
  '/:bookId',
  param('bookId').isInt({ min: 1 }),
  query('libraryId').isInt({ min: 1 }),
  async (req, res) => {
    const vResult = validationResult(req);
    if (!vResult.isEmpty()) {
      res.status(400).send('Missing search parameters');
      return;
    }

    const data = matchedData(req);
    const deleteByIdQuery = `
      DELETE FROM library_contains
      WHERE library_id = $1 AND book_id = $2
      RETURNING 'deleted' AS status;
      `;

    const result = await db.query(deleteByIdQuery, [
      data.libraryId,
      data.bookId,
    ]);
    if (result.rows.length === 0) {
      res.sendStatus(404);
    } else {
      res.sendStatus(204);
    }
  },
);

// Edit a book
router.put(
  '/:bookId',
  query('authorId').isInt({ min: 1 }),
  body('title').trim().notEmpty().optional(),
  body('publishedDate').isDate().optional(),
  body('synopsis').trim().optional({ values: 'falsy' }),
  async (req, res) => {
    const vResult = validationResult(req);
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
      WHERE book_id = $1 AND author_id = $2
      RETURNING 'updated' AS status;
      `;

    const result = await db.query(updateQuery, [data.bookId, data.authorId]);
    if (result.rows.length === 0) {
      res.sendStatus(404);
    } else {
      res.sendStatus(200);
    }
  },
);

// Create a new book in a library of a certain genre
router.post(
  '/',
  body(['authorId', 'libraryId', 'noOfCopies']).isInt({ min: 1 }),
  body(['title', 'genre']).trim().notEmpty(),
  body('publishedDate').toDate(),
  body('synopsis').trim().optional({ values: 'falsy' }),
  async (req, res) => {
    const vResult = validationResult(req);
    if (!vResult.isEmpty()) {
      res.sendStatus(400);
      return;
    }

    const data = matchedData(req);

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const insertBookQuery = `
        INSERT INTO book (author_id, pdate, synopsis, title)
        VALUES ($1, $2, $3, $4)
        RETURNING book_id;
        `;
      const fResult = await client.query(insertBookQuery, [
        data.authorId,
        data.publishedDate,
        data.synopsis,
        data.title,
      ]);
      // Guaranteed by schema
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const bookId = fResult.rows[0].book_id as number;

      const insertGenreQuery = `
        INSERT INTO genre (book_id, author_id, label)
        VALUES ($1, $2, $3);
        `;
      await client.query(insertGenreQuery, [bookId, data.authorId, data.genre]);

      const insertLibraryRelationQuery = `
        INSERT INTO library_contains (library_id, book_id, author_id, no_of_copies)
        VALUES ($1, $2, $3, $4);
        `;
      await client.query(insertLibraryRelationQuery, [
        data.libraryId,
        bookId,
        data.authorId,
        data.noOfCopies,
      ]);

      await client.query('COMMIT');
      res.sendStatus(200);
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
