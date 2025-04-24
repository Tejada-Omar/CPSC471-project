import app from './app.js';
import * as db from './db/index.js';

const port = process.env.PORT ?? 8080;

const startServer = async () => {
  const server = app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });

  const shutdown = () => {
    let errCode = 0;

    db.close().catch((err: Error) => {
      console.error('Could not close connection to Postgres server', err);
      errCode = 1;
    });

    server.close(() => {
      console.log('HTTP server closed');
      process.exit(errCode);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Ensure the server is fully started before making the API call
  await new Promise((resolve) => server.once('listening', resolve));

  // Now make the API call after the server is ready
  try {
    const response = await fetch(`http://localhost:${port}/user/createUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'Password!',
        phonenum: '1231231234',
        address: 'test address',
      }),
    });

    // Check if the response is OK
    if (response.ok) {
      const user = await response.json();
      console.log('User created successfully:', user);
      await db.query(`INSERT INTO admin(super_id) VALUES ($1)`, [
        user.user.user_id,
      ]);
      console.log('Default admin added');
    } else if (response.status == 409) {
      console.log('Default admin user already exists.');
    } else {
      console.error('Failed to create admin user. Status:', response.status);
    }
  } catch (error) {
    console.error('Error making the API call:', error);
  }
};

startServer();
