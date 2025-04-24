# OneShelf

## Tech Stack

- Frontend: React
- Backend: Express.js w/ Node
- Database: PostgreSQL

## ✅ Prerequisites

Make sure the following tools are installed on your machine:

- [Docker](https://www.docker.com/get-started) – Used to build and run containers.
- [Docker Compose](https://docs.docker.com/compose/) – Often bundled with Docker Desktop.
  - **Verify installation**:
    ```bash
    docker --version
    docker compose version
    ```

## 🚀 Running the Project

To start the entire stack (frontend, backend, and database), run:

```bash
docker compose up --build
```

## 🔐 Environment Configuration

Before running the project, ensure the following files are present and properly configured:

1. **.pgpass** (in the root directory):  
   This file should contain your PostgreSQL password as a singular word, with no whitespace

2. **.env** (in the `server/` directory):  
This file is used to pass environment variables to the backend. Create a `.env` file with the following content:
```
PGPASSWORD=<your password, should be the same as the one in .pgpass>
SECRET=<your secret string, should be quite long as this is used for encryption>
```
