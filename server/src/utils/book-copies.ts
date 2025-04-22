import { Pool, PoolClient } from 'pg';
import { DbError } from './errors.js';

async function decrementBookCopies(
  client: PoolClient | Pool,
  data: {
    bookId: number;
    authorId: number;
    libraryId: number;
  },
) {
  const lockCopiesRowQuery = `
    SELECT no_of_copies
    FROM library_contains
    WHERE library_id = $1 AND book_id = $2 AND author_id = $3
      AND no_of_copies > 0
    FOR UPDATE;
    `;
  let result = await client.query(lockCopiesRowQuery, [
    data.libraryId,
    data.bookId,
    data.authorId,
  ]);
  if (result.rows.length === 0) {
    throw new DbError(409, 'No copies for requested book available');
  }

  const removeCopyQuery = `
        UPDATE library_contains
        SET no_of_copies = no_of_copies - 1
        WHERE library_id = $1 AND book_id = $2 AND author_id = $3
          AND no_of_copies > 0
        RETURNING 'updated' AS status;
        `;
  result = await client.query(removeCopyQuery, [
    data.libraryId,
    data.bookId,
    data.authorId,
  ]);
  if (result.rows.length === 0) {
    throw new DbError(500, 'Could not update number of copies for book');
  }
}

async function incrementBookCopies(
  client: PoolClient | Pool,
  data: {
    bookId: number;
    authorId: number;
    libraryId: number;
  },
) {
  const lockCopiesRowQuery = `
    SELECT no_of_copies
    FROM library_contains
    WHERE library_id = $1 AND book_id = $2 AND author_id = $3
    FOR UPDATE;
    `;
  let result = await client.query(lockCopiesRowQuery, [
    data.libraryId,
    data.bookId,
    data.authorId,
  ]);
  if (result.rows.length === 0) {
    throw new DbError(409, 'No copies for requested book available');
  }

  const addCopyQuery = `
    UPDATE library_contains
    SET no_of_copies = no_of_copies + 1
    WHERE library_id = $1 AND book_id = $2 AND author_id = $3
    RETURNING 'updated' AS status;
    `;
  result = await client.query(addCopyQuery, [
    data.libraryId,
    data.bookId,
    data.authorId,
  ]);
  if (result.rows.length === 0) {
    throw new DbError(500, 'Could not update number of copies for book');
  }
}

export { decrementBookCopies, incrementBookCopies };
