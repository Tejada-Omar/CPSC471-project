import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import * as db from '../db/index.js';
import {
  adminConfirmation,
  librarianConfirmation,
  userConfirmation,
} from '../utils/middleware.js';

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
  adminConfirmation,
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {

      const result = await db.query(
        `SELECT *
       FROM users`
      );

      return res.status(200).json(result.rows);
    } catch (error: any) {
      next(error);
    }
  },
);

export default userRouter;
