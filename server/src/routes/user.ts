import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import * as db from '../db/index.js'; // Make sure your db layer supports transactions

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

    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      await db.query('BEGIN');

      // Insert user
      const userInsertResult = await db.query(
        `INSERT INTO users (uname, address, phone_no) 
         VALUES ($1, $2, $3) 
         RETURNING user_id, uname, address, phone_no`,
        [username, address, phonenum],
      );

      const newUser: UserInsertRow = userInsertResult.rows[0];

      // Insert into authentication table
      await db.query(
        `INSERT INTO authentication (user_id, username, pass) VALUES ($1, $2, $3)`,
        [newUser.user_id.toString(), username, hashedPassword],
      );

      await db.query('COMMIT');

      return response.status(201).json({ user: newUser });
    } catch (error: any) {
      await db.query('ROLLBACK');

      if (error.code === '23505') {
        return response.status(409).json({ error: 'Username already exists' });
      }

      next(error);
    }
  },
);

export default userRouter;
