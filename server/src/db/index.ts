import { readFileSync } from 'node:fs';
import pg from 'pg';
const { Pool } = pg;

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

const pool = new Pool({
  database: 'oneshelf',
  user: 'oneshelf',
  password() {
    if (process.env.PGPASSWORD) {
      return process.env.PGPASSWORD;
    }

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

export const query = (text: string, params?: string[]) => {
  console.debug('query executed', { text, params });
  // undefined params implicitly treated as empty
  return pool.query(text, params);
};

export const close = async () => {
  console.log('closing connection to postgres server');
  await pool.end();
  console.log('connection to postgres server closed');
};
