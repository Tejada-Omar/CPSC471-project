import { readFileSync } from 'node:fs';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  database: 'oneshelf',
  user: 'oneshelf',
  password() {
    const file = process.env.PGPASSFILE ?? '.pgpass';
    return (
      // Synchronous call should be fine since this is called at startup
      readFileSync(file)
        .toString()
        // Line-endings are trimmed when password is created using PGPASSFILE
        // Emulates behaviour on unixy systems where LF is default line-ending
        // NOTE: No clue how this works on windows w/ CRLF line-endings
        .slice(0, -1)
    );
  },
});

export const getClient = () => {
  return pool.connect();
};

export const query = (text: string, params: string[]) => {
  console.debug('query executed', { text, params });
  return pool.query(text, params);
};

export const close = async () => {
  console.log('closing connection to postgres server');
  await pool.end();
  console.log('connection to postgres server closed');
};
