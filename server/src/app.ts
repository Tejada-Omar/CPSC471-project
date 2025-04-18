import express from 'express';
import bookRouters from './routes/book.js';
import loginRouter from './routes/login.js';
import userRouter from './routes/user.js';

const app = express();

app.use(express.json());
app.use('/book', bookRouters);
app.use('/login', loginRouter);
app.use('/user', userRouter);

export default app;
