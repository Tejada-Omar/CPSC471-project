import { NextFunction, Router } from 'express';
import * as db from '../db/index.js';
import { userConfirmation } from '../utils/middleware.js';

const router = Router();

router.get('/', async (_req, res, next: NextFunction) => {
  try {
    const result = await db.query('SELECT * FROM book', []);
    res.send(result.rows);
  } catch (error) {
    next(error);
  }
});

export default router;
