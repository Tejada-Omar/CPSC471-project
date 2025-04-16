import express from 'express';
import bookRouters from './routes/book.js';

const app = express();

app.use(express.json());
app.use('/book', bookRouters);

export default app;
