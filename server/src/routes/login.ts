import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import express, { Request, Response, NextFunction } from 'express';
import * as db from '../db/index.js';

const loginRouter = express.Router();

// Expected user row structure
interface UserRow {
  user_id: number;
  username: string;
  pass: string;
}

type role = 'admin' | 'librarian' | 'user' | 'headLibrarian';

// JWT payload structure
interface JwtPayload {
  username: string;
  id: number;
  role: role;
  libraryId: number | null;
}

// Request body type
interface LoginRequestBody {
  username: string;
  password: string;
}

loginRouter.post(
  '/',
  async (
    request: Request<{}, {}, LoginRequestBody>,
    response: Response,
    next: NextFunction,
  ): Promise<any> => {
    const { username, password } = request.body;
    const client = await db.getClient();

    try {
      const result = await client.query(
        `SELECT * FROM authentication WHERE username = $1`,
        [username],
      );

      const user: UserRow | undefined = result.rows[0];

      if (!user) {
        return response.status(401).json({
          error: 'invalid username or password',
        });
      }

      const passwordCorrect = await bcrypt.compare(password, user.pass);

      if (!passwordCorrect) {
        return response.status(401).json({
          error: 'invalid username or password',
        });
      }

      let role: role = 'user';
      let libraryId = null;

      const libraryResult = await client.query(
        `SELECT library_id FROM librarian WHERE librarian_id = $1`,
        [user.user_id.toString()],
      );

      if (libraryResult.rows.length > 0) {
        role = 'librarian';
        libraryId = libraryResult.rows[0].library_id;
      }

      const headLibraryResult = await client.query(
        `SELECT l.library_id FROM librarian l JOIN head_librarian hl ON hl.super_id = l.librarian_id WHERE librarian_id = $1`,
        [user.user_id.toString()],
      );

      if (headLibraryResult.rows.length > 0) {
        role = 'headLibrarian';
        libraryId = headLibraryResult.rows[0].library_id;
      }

      const adminResult = await client.query(
        `SELECT 1 FROM admin WHERE super_id = $1`,
        [user.user_id.toString()],
      );

      if (adminResult.rows.length > 0) {
        role = 'admin';
      }

      const userForToken: JwtPayload = {
        username: user.username,
        id: user.user_id,
        role,
        libraryId,
      };

      const secret = process.env.SECRET;
      if (!secret) {
        throw new Error('JWT secret is not defined in environment variables.');
      }

      let token;
      if (role === 'admin' || role === 'librarian') {
        token = jwt.sign(userForToken, secret, { expiresIn: 60 * 60 }); // Token expires after one hour for admin or librarian
      } else {
        token = jwt.sign(userForToken, secret, { expiresIn: 604800 }); // Token expires in one week for normal user
      }

      return response.status(200).send({
        token,
        username: user.username,
        id: user.user_id,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      next(error);
    } finally {
      client.release();
    }
  },
);

export default loginRouter;
