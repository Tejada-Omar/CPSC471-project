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
import { adminConfirmation, userConfirmation } from '../utils/middleware.js';

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

// Get all reviews
// No query parameters = all reviews
// userId as query param = get all reviews by that user id
// Both bookId and authorId as query params = get all reviews of that specific book (note that identifying a book requires both according to our db)
router.get(
  '/',
  query(['bookId', 'authorId', 'userId']).isInt({ min: 1 }).optional(),
  async (req, res) => {
    const vResult = validationResult(req);

    if (!vResult.isEmpty()) {
      res.status(400).send('Invalid request parameters.');
      return;
    }

    const data = matchedData(req, { includeOptionals: true });

    let result;
    if (data.bookId && data.authorId) {
      // Case 1: Searching by both bookId and authorId (must be both provided)
      const searchByBookAndAuthorQuery = `
        SELECT r.review_id, u.uname AS reviewer, r.rating, r.body
        FROM review r
        JOIN users u ON r.user_id = u.user_id
        WHERE r.book_id = $1 AND r.author_id = $2;
      `;
      result = await db.query(searchByBookAndAuthorQuery, [
        data.bookId,
        data.authorId,
      ]);
    } else if (data.userId) {
      // Case 2: Searching by userId alone
      const searchByUserQuery = `
        SELECT r.review_id, u.uname AS reviewer, r.rating, r.body
        FROM review r
        JOIN users u ON r.user_id = u.user_id
        WHERE u.user_id = $1;
      `;
      result = await db.query(searchByUserQuery, [data.userId]);
    } else {
      // Case 3: Returning all reviews if no filter parameters are provided
      const searchQuery = `
        SELECT r.review_id, u.uname AS reviewer, r.rating, r.body
        FROM review r
        JOIN users u ON r.user_id = u.user_id;
      `;
      result = await db.query(searchQuery);
    }

    // If no results are found, send a 404 response
    if (result.rows.length === 0) {
      res.sendStatus(404);
      return;
    }

    const rows = result.rows;

    res.status(200).json(rows);
  },
);

// TODO: Allow filtering by authorId
/* router.get(
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
); */

// Post a review to a book
// It will use user id based on token
router.post(
  '/',
  body(['bookId', 'authorId']).isInt({ min: 1 }),
  body('rating').isInt({ min: 1, max: 5 }),
  body('body').trim(),
  userConfirmation,
  async (req, res) => {
    const vResult = validationResult(req);
    const userId = req.userId;

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
      userId,
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

// Edit a review
router.put(
  '/:reviewId',
  param('reviewId').isInt({ min: 1 }),
  body('rating').isInt({ min: 1, max: 5 }).optional(),
  body('body').trim().optional({ values: 'falsy' }),
  userConfirmation,
  async (req, res) => {
    const vResult = validationResult(req);

    const role = req.role;
    const userId = req.userId;

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

    let editReviewQuery;
    let result;

    if (role === 'admin') {
      editReviewQuery = `
        UPDATE review
        SET ${queryValues}
        WHERE review_id = $${queryParams.length}
        RETURNING 'updated' AS status;
      `;
      result = await db.query(editReviewQuery, queryParams);
    } else {
      editReviewQuery = `
        UPDATE review
        SET ${queryValues}
        WHERE review_id = $${queryParams.length} AND user_id = $${queryParams.length + 1}
        RETURNING 'updated' AS status;
      `;
      queryParams.push(userId);
      result = await db.query(editReviewQuery, queryParams);
    }

    if (result.rows.length === 0) {
      res.sendStatus(404);
    } else {
      res.sendStatus(200);
    }
  },
);

// Delete a review
router.delete(
  '/:reviewId',
  param('reviewId').isInt({ min: 1 }),
  query('userId').isInt({ min: 1 }).optional(),
  userConfirmation,
  async (req, res) => {
    const vResult = validationResult(req);
    if (!vResult.isEmpty()) {
      res.sendStatus(400);
      return;
    }

    const role = req.role;
    const userId = req.userId;

    const data = matchedData(req);

    let deleteQuery;
    let result;

    if (role === 'admin') {
      deleteQuery = `
      DELETE FROM review
      WHERE review_id = $1
      RETURNING 'deleted' AS status;
      `;
      result = await db.query(deleteQuery, [data.reviewId]);
    } else {
      deleteQuery = `
      DELETE FROM review
      WHERE review_id = $1 AND user_id = $2
      RETURNING 'deleted' AS status;
      `;
      result = await db.query(deleteQuery, [data.reviewId, userId]);
    }

    if (result.rows.length === 0) {
      res.sendStatus(404);
    } else {
      res.sendStatus(204);
    }
  },
);

export default router;
