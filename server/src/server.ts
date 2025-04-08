import app from './app.js';
import * as db from './db/index.js';

const port = process.env.PORT ?? 8080;

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
