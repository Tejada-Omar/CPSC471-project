import express from 'express';
import * as db from './db/index.js';

const app = express();

app.get('/', async (_req, res) => {
  const result = await db.query('SELECT * FROM book', []);
  res.send(result.rows);
});

export default app;
