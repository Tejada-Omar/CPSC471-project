import express from 'express';
import bookRouters from './routes/book.js';
import loginRouter from './routes/login.js';
import userRouter from './routes/user.js';
import { errorHandler } from './utils/middleware.js';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cors());
app.use('/book', bookRouters);
app.use('/login', loginRouter);
app.use('/user', userRouter);
app.use(errorHandler);

export default app;
