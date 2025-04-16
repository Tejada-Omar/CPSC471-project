import { Router } from 'express';
import * as db from '../db/index.js';

const router = Router();

router.get('/', async (_req, res) => {
  const result = await db.query('SELECT * FROM book', []);
  res.send(result.rows);
});

export default router;
