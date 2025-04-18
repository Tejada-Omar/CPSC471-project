import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

// Ensure SECRET is a non-undefined string, or throw an error if it's missing
const SECRET = process.env.SECRET;
if (!SECRET) {
  throw new Error('No secret key configured');
}

// Extend Express Request interface to include `userId`
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

// JWT payload structure
interface JwtPayload {
  username: string;
  id: number;
  role: 'admin' | 'user';
}

export const errorHandler: ErrorRequestHandler = (
  error: Error,
  _request,
  response,
  next,
) => {
  if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'token invalid' });
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: 'token expired' });
  }

  next(error);
  return;
};

export const userConfirmation = (
  request: Request,
  _response: Response,
  next: NextFunction,
) => {
  let token: string | undefined;

  const authorization = request.get('authorization');
  if (authorization && authorization.startsWith('Bearer ')) {
    token = authorization.replace('Bearer ', '');

    if (!token) {
      return next(jwt.JsonWebTokenError);
    }

    try {
      // jwt.verify returns a decoded token that could either be a JwtPayload or an object
      const decodedToken = jwt.verify(token, SECRET) as JwtPayload;

      // Ensure the decoded token contains the required fields
      if (
        !decodedToken.id ||
        (decodedToken.role !== 'user' && decodedToken.role !== 'admin')
      ) {
        return next(jwt.JsonWebTokenError);
      }

      // Add the userId to the request object
      request.userId = decodedToken.id;

      next();
    } catch (error) {
      return next(error);
    }
  } else {
    return next(
      new jwt.JsonWebTokenError('Authorization header is missing or invalid'),
    );
  }
};
