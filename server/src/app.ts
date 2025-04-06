import express from 'express';

const app = express();
const port = 8080;

app.get('/', (_req, res) => {
  res.send('hello world');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
