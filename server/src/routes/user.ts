import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import * as db from '../db/index.js';
import {
  adminConfirmation,
  headLibrarianConfirmation,
  headLibrarianConfirmationPlus,
  librarianConfirmation,
  userConfirmation,
} from '../utils/middleware.js';

import {
  body,
  matchedData,
  param,
  query,
  validationResult,
} from 'express-validator';

const userRouter = express.Router();

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
const phoneRegex = /^\d{3}-?\d{3}-?\d{4}$/;

// Define request body structure
interface CreateUserRequestBody {
  username: string;
  address?: string;
  password: string;
  phonenum?: string;
}

// Define what comes back from user insert
interface UserInsertRow {
  user_id: number;
  address: string | null;
  uname: string;
  phone_no: string | null;
}

userRouter.post(
  '/createUser',
  async (
    request: Request<{}, {}, CreateUserRequestBody>,
    response: Response,
    next: NextFunction,
  ): Promise<any> => {
    const {
      username,
      password,
      phonenum: rawPhone,
      address: rawAddress,
    } = request.body;

    let phonenum = rawPhone?.trim() || null;
    const address = rawAddress || null;

    // Basic validation
    if (!username || !password) {
      return response.status(400).json({ error: 'Missing required fields' });
    }

    if (/\s/.test(username) || username.length > 16) {
      return response.status(400).json({
        error:
          'Username must not contain spaces and must be 16 characters or less.',
      });
    }

    if (!passwordRegex.test(password)) {
      return response.status(400).json({
        error:
          'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one special character.',
      });
    }

    if (phonenum && !phoneRegex.test(phonenum)) {
      return response.status(400).json({
        error: 'Phone number must be in the format 1234567890 or 123-456-7890.',
      });
    }

    if (phonenum) {
      phonenum = phonenum
        .replace(/-/g, '')
        .replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }

    const client = await db.getClient();
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      await client.query('BEGIN');

      // Insert user
      const userInsertResult = await client.query(
        `INSERT INTO users (uname, address, phone_no)
         VALUES ($1, $2, $3)
         RETURNING user_id, uname, address, phone_no`,
        [username, address, phonenum],
      );

      const newUser: UserInsertRow = userInsertResult.rows[0];

      // Insert into authentication table
      await client.query(
        `INSERT INTO authentication (user_id, username, pass) VALUES ($1, $2, $3)`,
        [newUser.user_id.toString(), username, hashedPassword],
      );

      await client.query('COMMIT');

      return response.status(201).json({ user: newUser });
    } catch (error: any) {
      await client.query('ROLLBACK');

      if (error.code === '23505') {
        return response.status(409).json({ error: 'Username already exists' });
      }

      next(error);
    } finally {
      client.release();
    }
  },
);

// Check if user is librarian
userRouter.get(
  '/checkLibrarian',
  librarianConfirmation,
  async (_req: Request, res: Response, next: NextFunction): Promise<any> => {
    return res.status(200).json({ message: 'successfully validated' });
  },
);

// Check if user is head librarian
userRouter.get(
  '/checkHeadLibrarian',
  headLibrarianConfirmation,
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    return res.status(200).json({ message: 'successfully validated' });
  },
);

// Check if user is admin
userRouter.get(
  '/checkAdmin',
  adminConfirmation,
  async (_req: Request, res: Response, next: NextFunction): Promise<any> => {
    return res.status(200).json({ message: 'successfully validated' });
  },
);

// Get user's own data
userRouter.get(
  '/ownUser',
  userConfirmation,
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const userId = req.userId as number;

      const result = await db.query(
        `SELECT *
       FROM users
       WHERE user_id = $1`,
        [userId.toString()],
      );

      return res.status(200).json(result.rows[0]);
    } catch (error: any) {
      next(error);
    }
  },
);

// Get all users
userRouter.get(
  '/allUsers',
  headLibrarianConfirmationPlus,
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const result = await db.query(
        `SELECT *
       FROM users`,
      );

      return res.status(200).json(result.rows);
    } catch (error: any) {
      next(error);
    }
  },
);

// Get all users that are not librarians
userRouter.get(
  '/allNonLibrarians',
  headLibrarianConfirmationPlus,
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const result = await db.query(
        `SELECT *
       FROM users
       WHERE user_id NOT IN (SELECT librarian_id FROM librarian)`,
      );

      return res.status(200).json(result.rows);
    } catch (error: any) {
      next(error);
    }
  },
);

// Add a librarian
userRouter.post(
  '/librarian',
  body(['userId']).isInt({ min: 1 }),
  headLibrarianConfirmation,
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const vResult = validationResult(req);

      if (!vResult.isEmpty()) {
        res.sendStatus(400);
        return;
      }

      const headLibrarianId = req.userId;
      const libraryId = req.libraryId;

      const data = matchedData(req);

      await db.query(
        `INSERT INTO librarian (librarian_id, manager_id, library_id)
        VALUES ($1, $2, $3)
        RETURNING *`,
        [data.userId, headLibrarianId, libraryId],
      );

      return res.status(201).json({ message: 'librarian created' });
    } catch (error: any) {
      next(error);
    }
  },
);

// Appoint a head librarian
userRouter.post(
  '/headLibrarian',
  body(['userId', 'libraryId']).isInt({ min: 1 }),
  adminConfirmation,
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const vResult = validationResult(req);

    if (!vResult.isEmpty()) {
      res.sendStatus(400);
      return;
    }

    const adminId = req.userId;

    const data = matchedData(req);
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      await db.query(
        `INSERT INTO head_librarian (super_id, appointer)
        VALUES ($1, $2)
        RETURNING *`,
        [data.userId, adminId],
      );

      await db.query(
        `INSERT INTO librarian (librarian_id, manager_id, library_id)
        SELECT $1, $1, $2
        WHERE NOT EXISTS (
          SELECT 1 FROM librarian WHERE librarian_id = $1
        )
        RETURNING *`,
        [data.userId, data.libraryId],
      );

      await client.query('COMMIT');
      return res.status(201).json({ message: 'head librarian created' });
    } catch (error: any) {
      await client.query('ROLLBACK');
      next(error);
    } finally {
      client.release();
    }
  },
);

// Get all librarians (for head librarian)
userRouter.get(
  '/allLibrarians',
  headLibrarianConfirmation,
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const libraryId = req.libraryId as number;

    try {
      const result = await db.query(
        `SELECT *
       FROM librarian l
       JOIN users u ON l.librarian_id = u.user_id
       WHERE library_id = $1`,
        [libraryId.toString()],
      );

      if (result.rows.length === 0) {
        res.sendStatus(404).json({ message: 'No librarians found' });
      }

      return res.status(200).json(result.rows);
    } catch (error: any) {
      next(error);
    }
  },
);

// Delete a user
userRouter.delete(
  '/',
  body(['userId']).isInt({ min: 1 }),
  adminConfirmation,
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const vResult = validationResult(req);

      if (!vResult.isEmpty()) {
        res.sendStatus(400);
        return;
      }

      const data = matchedData(req);

      await db.query(
        `DELETE FROM users
        WHERE user_id = $1`,
        [data.userId],
      );

      return res.status(200).json({ message: 'user deleted' });
    } catch (error: any) {
      next(error);
    }
  },
);

export default userRouter;
