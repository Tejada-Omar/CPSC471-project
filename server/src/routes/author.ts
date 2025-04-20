import express from 'express';
import * as db from '../db/index.js';
import { body, matchedData, param, validationResult } from 'express-validator';
import { mapBookResult } from './book.js';

export interface Author {
  id: number;
  name: string;
  biography: string;
}

// Only safe to run on [sub-]objects of type pg.QueryResult
// Will only break if the database schema changes
export function mapAuthorResult(row: Record<string, unknown>): Author {
  return {
    id: row.author_id as number,
    name: row.aname as string,
    biography: row.biography as string,
  };
}

const router = express.Router();

router.get('/', async (_req, res) => {
  const searchQuery = 'SELECT * FROM author';
  const result = await db.query(searchQuery);
  const rows = result.rows as Record<string, unknown>[];
  res.send(rows.map((r) => mapAuthorResult(r)));
});

router.get(
  '/:authorId',
  param('authorId').isInt({ min: 1 }),
  async (req, res) => {
    const vResult = validationResult(req);
    if (!vResult.isEmpty()) {
      res.sendStatus(400);
      return;
    }

    const data = matchedData(req);
    const getAuthorQuery = 'SELECT * FROM author WHERE author_id = $1;';
    const result = await db.query(getAuthorQuery, [data.authorId]);
    if (result.rows.length === 0) {
      res.sendStatus(404);
    } else {
      const rows = result.rows as Record<string, unknown>[];
      const author = rows.map((r) => mapAuthorResult(r))[0];
      res.status(200).send(author);
    }
  },
);

router.get(
  '/:authorId/book',
  param('authorId').isInt({ min: 1 }),
  async (req, res) => {
    const vResult = validationResult(req);
    if (!vResult.isEmpty()) {
      res.sendStatus(400);
      return;
    }

    const data = matchedData(req);
    const getAuthorBooksQuery = `
      SELECT
        a.author_id,
        a.aname,
        a.biography,
        b.book_id,
        b.title,
        b.pdate,
        b.synopsis
      FROM author a
      LEFT JOIN book b ON a.author_id = b.author_id
      WHERE a.author_id = $1;
      `;
    const result = await db.query(getAuthorBooksQuery, [data.authorId]);
    if (result.rows.length === 0) {
      res.sendStatus(404);
      return;
    }

    const rows = result.rows as Record<string, unknown>[];
    const author = rows.map((r) => mapAuthorResult(r))[0];
    const books = rows.map((r) => mapBookResult(r));
    res.status(200).json({ author: author, books: books });
  },
);

router.post(
  '/',
  body(['name', 'biography']).trim().notEmpty(),
  async (req, res) => {
    const vResult = validationResult(req);
    if (!vResult.isEmpty()) {
      res.sendStatus(400);
      return;
    }

    const data = matchedData(req);
    const insertAuthorQuery = `
      INSERT INTO author (aname, biography)
      VALUES ($1, $2)
      RETURNING *;
      `;
    const result = await db.query(insertAuthorQuery, [
      data.name,
      data.biography,
    ]);
    if (result.rows.length === 0) {
      res.sendStatus(500);
      return;
    }

    const row = (result.rows as Record<string, unknown>[])[0];
    res.status(201).json(mapAuthorResult(row));
  },
);

router.delete(
  '/:authorId',
  param('authorId').isInt({ min: 1 }),
  async (req, res) => {
    const vResult = validationResult(req);
    if (!vResult.isEmpty()) {
      res.sendStatus(400);
      return;
    }

    const data = matchedData(req);
    const deleteByIdQuery = `
      DELETE FROM author
      WHERE author_id = $1
      RETURNING 'deleted' AS status;
      `;
    const result = await db.query(deleteByIdQuery, [data.authorId]);
    if (result.rows.length === 0) {
      res.sendStatus(404);
    } else {
      res.sendStatus(204);
    }
  },
);

export default router;
