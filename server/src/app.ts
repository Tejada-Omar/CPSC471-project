import express from 'express';
import * as db from './db/index.js';

// Env vars that must exist for pg to function correctly
const pgEnvDefaults: Record<string, string> = {
  PGHOST: 'localhost',
  PGPORT: '8090',
  PGPASSFILE: '.pgpass',
};

for (const [k, v] of Object.entries(pgEnvDefaults)) {
  if (!process.env[k]) {
    process.env[k] = v;
  }
}

const app = express();
const port = 8080;

app.get('/', async (_req, res) => {
  const result = await db.query('SELECT * FROM book', []);
  res.send(result.rows);
});

const server = app.listen(port, () => {
  console.log(`server listening at http://localhost:${port}`);
});

const shutdown = () => {
  let errCode = 0;

  db.close().catch((err: Error) => {
    console.error('could not close connection to postgres server', err);
    errCode = 1;
  });

  server.close(() => {
    console.log('http server closed');
    process.exit(errCode);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('SIGUS2', shutdown); // Sent by nodemon when reloading
