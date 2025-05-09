import express from 'express';
import authorRouter from './routes/author.js';
import bookRouters from './routes/book.js';
import libraryRouter from './routes/library.js';
import loanRouter from './routes/loan.js';
import loginRouter from './routes/login.js';
import reviewRouter from './routes/review.js';
import userRouter from './routes/user.js';
import { errorHandler } from './utils/middleware.js';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cors());
app.use('/author', authorRouter);
app.use('/book', bookRouters);
app.use('/library', libraryRouter);
app.use('/loan', loanRouter);
app.use('/login', loginRouter);
app.use('/review', reviewRouter);
app.use('/user', userRouter);
app.use(errorHandler);

export default app;
