# Testura

Testura is a QA test management application built with the MERN stack (**M**ongoDB, **E**xpress, **R**eact, **N**ode.js). It provides end-to-end test case management, test run execution with pass/fail/blocked tracking, bug reporting with Excel export, and GitHub issue synchronization.

## Project structure

```
server/          — Express API (port 5000)
  src/
    config/      — DB connection, env
    controllers/ — Route handlers
    models/      — Mongoose schemas
    routes/      — Express routers
    middleware/  — Auth, project access, validation
    services/    — External integrations (GitHub)
    validators/  — Zod schemas
    utils/       — Helpers, API response shape
client/          — React + Vite + Tailwind (port 5173)
  src/
    api/         — Axios wrappers per resource
    pages/       — Route-level components
    components/  — Reusable UI (BugForm, ResultMeter, etc.)
    context/     — AuthContext, ProjectContext
    layouts/     — AppLayout (sidebar + topbar)
```

## Prerequisites

- Node.js v18 or later
- A MongoDB instance (Atlas or local)
- Git

## Quick start

### 1. Server

```bash
cd server
npm install
```

Create a `.env` file inside `server/` (this file is gitignored):

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=<any-random-string>
CLIENT_URL=http://localhost:5173
ENCRYPTION_KEY=<any-random-string>
```

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default 5000) |
| `MONGO_URI` | **Yes** | MongoDB connection string |
| `JWT_SECRET` | No | JWT signing secret (auto-warns if missing) |
| `CLIENT_URL` | No | Frontend URL for CORS (default http://localhost:5173) |
| `ENCRYPTION_KEY` | No | Key to encrypt GitHub PATs (auto-warns if missing) |

Start the server:

```bash
npm start
```

The API is available at http://localhost:5000/api.

### 2. Client

```bash
cd client
npm install
```

Create a `.env` file inside `client/` (already gitignored):

```env
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
```

The app opens at http://localhost:5173.

### 3. Use the app

1. Register a new account at http://localhost:5173/register.
2. Create a project.
3. Add test cases, create runs, execute them, and log bugs.

## Features

| Feature | Description |
|---|---|
| **Dashboard** | Metric cards (totals), test-case/bug breakdowns, recent runs with result meters |
| **Test cases** | Create, edit, organise with steps, tags, modules, priority, lifecycle status |
| **Test runs** | Build runs from selected test cases, execute with step-by-step results, pass/fail/blocked/skip |
| **Bugs** | Log bugs linked to test executions, filter by type/severity/status, export to Excel |
| **GitHub sync** | Connect a repository via PAT, push bugs as GitHub issues, sync run results as issue comments |

## API response format

Every endpoint returns:

```json
{
  "success": true,
  "data": { ... },
  "message": "Success"
}
```

Errors return `success: false` with a human-readable `message`.

## Notes

- The server loads `.env` from `server/.env` automatically via `dotenv`.
- The server has no user roles — every authenticated user is a QA engineer.
- Project access is enforced via membership: only project members can read/write its data.
- `.env` files are gitignored. Always create them manually after cloning.
