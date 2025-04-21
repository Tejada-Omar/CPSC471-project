import express from 'express';
import * as db from '../db/index.js';
import { body, matchedData, param, validationResult } from 'express-validator';
import { mapBookResult } from './book.js';

export interface Librarian {
  id: number;
  loc: string;
  name: string;
}

export function mapLibraryResult(row: Record<string, unknown>): Librarian {
  return {
    id: row.library_id as number,
    loc: row.loc as string,
    name: row.library_name as string,
  };
}

const router = express.Router();

router.get('/', async (_req, res) => {
  const searchQuery = 'SELECT * FROM library';
  const result = await db.query(searchQuery);
  const rows = result.rows as Record<string, unknown>[];
  res.json(rows.map((r) => mapLibraryResult(r)));
});

router.get(
  '/:libraryId',
  param('libraryId').isInt({ min: 1 }),
  async (req, res) => {
    const vResult = validationResult(req);
    if (!vResult.isEmpty()) {
      res.sendStatus(400);
      return;
    }

    const data = matchedData(req);
    const searchQuery = 'SELECT * FROM library WHERE library_id = $1';
    const result = await db.query(searchQuery, [data.libraryId]);
    if (result.rows.length === 0) {
      res.sendStatus(404);
      return;
    }

    const rows = result.rows as Record<string, unknown>[];
    res.json(mapLibraryResult(rows[0]));
  },
);

// TODO: Impl filtering by query param similar to '/book'
router.get(
  '/:libraryId/book',
  param('libraryId').isInt({ min: 1 }),
  async (req, res) => {
    const vResult = validationResult(req);
    if (!vResult.isEmpty()) {
      res.sendStatus(400);
      return;
    }

    const data = matchedData(req);
    const getBooksFromLibraryQuery = `
      SELECT lib.*, b.*, lc.no_of_copies
      FROM library_contains lc
      JOIN book b ON lc.book_id = b.book_id and lc.author_id = b.author_id
      JOIN library lib ON lc.library_id = lib.library_id
      WHERE lc.library_id = $1;
      `;
    const result = await db.query(getBooksFromLibraryQuery, [data.libraryId]);
    if (result.rows.length === 0) {
      res.sendStatus(404);
      return;
    }

    const rows = result.rows as Record<string, unknown>[];
    const library = mapLibraryResult(rows[0]);
    const books = rows.map((r) => mapBookResult(r));
    res.json({ library: library, books: books });
  },
);

router.post(
  '/',
  body('loc').trim().isLength({ max: 16 }).default(null),
  body('name').trim().isLength({ min: 1, max: 32 }),
  async (req, res) => {
    const vResult = validationResult(req);
    if (!vResult.isEmpty()) {
      res.sendStatus(400);
      return;
    }

    const data = matchedData(req);
    const insertLibraryQuery = `
      INSERT INTO library (loc, library_name)
      VALUES ($1, $2)
      RETURNING *;
      `;
    const result = await db.query(insertLibraryQuery, [data.loc, data.name]);
    if (result.rows.length === 0) {
      res.sendStatus(500);
      return;
    }

    const rows = result.rows as Record<string, unknown>[];
    res.status(201).json(mapLibraryResult(rows[0]));
  },
);

router.delete(
  '/:libraryId',
  param('libraryId').isInt({ min: 1 }),
  async (req, res) => {
    const vResult = validationResult(req);
    if (!vResult.isEmpty()) {
      res.sendStatus(400);
      return;
    }

    const data = matchedData(req);
    const deleteByIdQuery = `
      DELETE FROM library
      WHERE library_id = $1
      RETURNING 'deleted' AS status;
      `;

    const result = await db.query(deleteByIdQuery, [data.libraryId]);
    if (result.rows.length === 0) {
      res.sendStatus(404);
    } else {
      res.sendStatus(204);
    }
  },
);

router.put(
  '/:libraryId',
  param('libraryId').isInt({ min: 1 }),
  body('loc').trim().isLength({ min: 1, max: 16 }).optional(),
  body('name').trim().isLength({ min: 1, max: 32 }).optional(),
  async (req, res) => {
    const vResult = validationResult(req);
    if (!vResult.isEmpty()) {
      res.sendStatus(400);
      return;
    }
    const data = matchedData(req);

    let queryValues = '';
    const queryParams = [];
    if (data.loc !== undefined) {
      queryValues += `loc = $${queryParams.length + 1},`;
      // FIXME: loc of 'null' is interpreted as null
      // Hack currently exists since express-validator errors on null and only
      // seems to support mapping null => undefined w/o a custom validator
      queryParams.push(data.loc !== 'null' ? data.loc : null);
    }
    if (data.name !== undefined) {
      queryValues += `library_name = $${queryParams.length + 1},`;
      queryParams.push(data.name);
    }
    queryValues = queryValues.slice(0, -1);
    queryParams.push(data.libraryId);

    const editLibraryQuery = `
      UPDATE library
      SET ${queryValues}
      WHERE library_id = $${queryParams.length}
      RETURNING 'updated' AS status;
      `;
    const result = await db.query(editLibraryQuery, queryParams);
    if (result.rows.length === 0) {
      res.sendStatus(404);
    } else {
      res.sendStatus(200);
    }
  },
);

export default router;
