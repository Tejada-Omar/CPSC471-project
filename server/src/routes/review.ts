import express from 'express';
import pg from 'pg';
import * as db from '../db/index.js';
import {
  body,
  matchedData,
  param,
  query,
  validationResult,
} from 'express-validator';

export type Rating = 1 | 2 | 3 | 4 | 5;
// Use standard int parser for custom Rating
pg.types.setTypeParser(
  pg.types.builtins.INT4,
  pg.types.getTypeParser(pg.types.builtins.INT4),
);

export interface Review {
  id: number;
  userId: number;
  rating: Rating;
  body: string;
  bookId: number;
  authorId: number;
}

export function mapReviewResult(row: Record<string, unknown>): Review {
  return {
    id: row.review_id as number,
    userId: row.user_id as number,
    rating: row.rating as Rating,
    body: row.body as string,
    bookId: row.book_id as number,
    authorId: row.author_id as number,
  };
}

const router = express.Router();

router.get('/', async (_req, res) => {
  const searchQuery = 'SELECT * FROM review';
  const result = await db.query(searchQuery);
  const rows = result.rows as Record<string, unknown>[];
  res.send(rows.map((r) => mapReviewResult(r)));
});

// TODO: Allow filtering by authorId
router.get(
  '/:reviewId',
  param('reviewId').isInt({ min: 1 }),
  query(['bookId', 'userId']).isInt({ min: 1 }).optional(),
  async (req, res) => {
    const vResult = validationResult(req);
    if (!vResult.isEmpty()) {
      res.status(400).send('Missing search parameters');
      return;
    }

    const data = matchedData(req, { includeOptionals: true });
    let result;
    if (data.bookId) {
      const searchByBookQuery = `
        SELECT r.review_id, u.uname AS reviewer, r.rating, r.body
        FROM review r
        JOIN users u ON r.user_id = u.user_id
        WHERE r.book_id = $1;
        `;
      result = await db.query(searchByBookQuery, [data.bookId]);
    } else if (data.userId === undefined) {
      const searchQuery = `SELECT * FROM review WHERE review_id = $1`;
      result = await db.query(searchQuery, [data.reviewId]);
    } else {
      const searchQuery = `
        SELECT * FROM review
        WHERE review_id = $1 AND user_id = $2
        `;
      result = await db.query(searchQuery, [data.reviewId, data.userId]);
    }

    const retArray = data.bookId !== undefined || data.userId === undefined;
    if (result.rows.length === 0 && !retArray) {
      res.sendStatus(404);
      return;
    }

    const rows = result.rows as Record<string, unknown>[];
    const respBody = retArray
      ? rows.map((r) => mapReviewResult(r))
      : mapReviewResult(rows[0]);

    res.status(200).json(respBody);
  },
);

router.post(
  '/',
  body(['bookId', 'userId', 'authorId']).isInt({ min: 1 }),
  body('rating').isInt({ min: 1, max: 5 }),
  body('body').trim(),
  async (req, res) => {
    const vResult = validationResult(req);
    if (!vResult.isEmpty()) {
      res.sendStatus(400);
      return;
    }

    const data = matchedData(req);
    const insertReviewQuery = `
      INSERT INTO review (user_id, rating, body, book_id, author_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
      `;
    const result = await db.query(insertReviewQuery, [
      data.userId,
      data.rating,
      data.body,
      data.bookId,
      data.authorId,
    ]);
    if (result.rows.length === 0) {
      res.sendStatus(500);
      return;
    }

    const row = (result.rows as Record<string, unknown>[])[0];
    res.status(201).json(mapReviewResult(row));
  },
);

router.put(
  '/:reviewId',
  param('reviewId').isInt({ min: 1 }),
  body('rating').isInt({ min: 1, max: 5 }).optional(),
  body('body').trim().optional({ values: 'falsy' }),
  async (req, res) => {
    const vResult = validationResult(req);
    if (!vResult.isEmpty()) {
      res.sendStatus(400);
      return;
    }

    const data = matchedData(req, { includeOptionals: true });

    let queryValues = '';
    const queryParams = [];
    if (data.rating !== undefined) {
      queryValues += 'rating = $1,';
      queryParams.push(data.rating);
    }
    if (data.body !== undefined && data.body !== null) {
      queryValues += `body = $${queryParams.length + 1},`;
      queryParams.push(data.body);
    }
    queryValues = queryValues.slice(0, -1);
    queryParams.push(data.reviewId);

    const editReviewQuery = `
    UPDATE review
    SET ${queryValues}
    WHERE review_id = $${queryParams.length}
    RETURNING 'updated' AS status;
    `;
    const result = await db.query(editReviewQuery, queryParams);
    if (result.rows.length === 0) {
      res.sendStatus(404);
    } else {
      res.sendStatus(200);
    }
  },
);

router.delete(
  '/:reviewId',
  param('reviewId').isInt({ min: 1 }),
  query('userId').isInt({ min: 1 }),
  async (req, res) => {
    const vResult = validationResult(req);
    if (!vResult.isEmpty()) {
      res.sendStatus(400);
      return;
    }

    const data = matchedData(req);
    const deleteQuery = `
      DELETE FROM review
      WHERE review_id = $1 AND user_id = $2
      RETURNING 'deleted' AS status;
      `;
    const result = await db.query(deleteQuery, [data.reviewId, data.userId]);
    if (result.rows.length === 0) {
      res.sendStatus(404);
    } else {
      res.sendStatus(204);
    }
  },
);

export default router;
