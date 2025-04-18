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

// JWT payload structure
interface JwtPayload {
  username: string;
  id: number;
  role: 'admin' | 'user';
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
    try {
      const { username, password } = request.body;

      const result = await db.query(
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

      const adminResult = await db.query(
        `SELECT 1 FROM admin WHERE super_id = $1`,
        [user.user_id.toString()],
      );

      const role: 'admin' | 'user' =
        adminResult.rows.length > 0 ? 'admin' : 'user';

      const userForToken: JwtPayload = {
        username: user.username,
        id: user.user_id,
        role,
      };

      const secret = process.env.SECRET;
      if (!secret) {
        throw new Error('JWT secret is not defined in environment variables.');
      }

      const token = jwt.sign(userForToken, secret, {
        expiresIn: role === 'admin' ? 3600 : 604800, // 1 hour for admin or 1 week for reg user
      });

      return response.status(200).send({
        token,
        username: user.username,
        id: user.user_id,
      });
    } catch (error) {
      await db.query('ROLLBACK');
      next(error);
    }
  },
);

export default loginRouter;
