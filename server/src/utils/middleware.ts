import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { DbError } from './errors.js';

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
      libraryId?: number;
      role?: string;
    }
  }
}

// JWT payload structure
interface JwtPayload {
  username: string;
  id: number;
  role: 'admin' | 'user' | 'librarian' | 'headLibrarian';
  libraryId: number | null;
}

// Helper function to get the token from the Authorization header
const getTokenFromHeader = (
  authorization: string | undefined,
): string | undefined => {
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '');
  }
  return undefined;
};

// Helper function to verify token and set userId
const verifyTokenAndSetUserId = (
  token: string,
  validRoles: string[],
): JwtPayload | null => {
  try {
    const decodedToken = jwt.verify(token, SECRET) as JwtPayload;

    if (!decodedToken.id || !validRoles.includes(decodedToken.role)) {
      return null; // Invalid role
    }

    // Make sure librarian has library id
    if (
      decodedToken.role === 'librarian' ||
      decodedToken.role === 'headLibrarian'
    ) {
      if (!decodedToken.libraryId) {
        return null;
      }
    }

    return decodedToken;
  } catch (error) {
    return null; // Invalid token
  }
};

// Middleware to handle JWT verification and role-based authorization
const roleConfirmation = (validRoles: string[]) => {
  return (request: Request, _response: Response, next: NextFunction) => {
    const authorization = request.get('authorization');
    const token = getTokenFromHeader(authorization);

    if (!token) {
      console.log('Authorization header is missing or invalid');
      return next(
        new jwt.JsonWebTokenError('Authorization header is missing or invalid'),
      );
    }

    const decodedToken = verifyTokenAndSetUserId(token, validRoles);

    if (!decodedToken) {
      console.log('Invalid token or insufficient role');
      return next(
        new jwt.JsonWebTokenError('Invalid token or insufficient role'),
      );
    }

    request.userId = decodedToken.id;

    // For librarians, also add the library id
    if (decodedToken.libraryId) {
      request.libraryId = decodedToken.libraryId;
    }

    if (decodedToken.role === 'admin') {
      request.role = decodedToken.role;
    }

    next();
  };
};

// Specific role-based middlewares using the roleConfirmation function
export const userConfirmation = roleConfirmation([
  'user',
  'admin',
  'librarian',
  'headLibrarian',
]);
export const librarianConfirmation = roleConfirmation([
  'librarian',
  'headLibrarian',
]);
export const headLibrarianConfirmation = roleConfirmation(['headLibrarian']);
export const adminConfirmation = roleConfirmation(['admin']);
export const headLibrarianConfirmationPlus = roleConfirmation([
  'headLibrarian',
  'admin',
]);

// General error handler
export const errorHandler: ErrorRequestHandler = (
  error: Error,
  _req,
  res,
  next,
) => {
  if (error instanceof jwt.JsonWebTokenError) {
    res.status(401).json({ error: 'token invalid' });
    return;
  } else if (error instanceof jwt.TokenExpiredError) {
    res.status(401).json({ error: 'token expired' });
    return;
  } else if (error instanceof DbError) {
    res.status(error.status).json({ error: error.message });
    return;
  }

  next(error);
};
