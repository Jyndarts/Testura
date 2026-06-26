# Deployment

## Prerequisites

- Node 18+ and npm
- A MongoDB Atlas cluster (free tier is sufficient)
- A Render account (for the backend API)
- A Vercel account (for the frontend)

---

## 1. Database — MongoDB Atlas

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
2. Under **Security → Network Access**, add an IP allowlist entry:
   - `0.0.0.0/0` (allow from everywhere — required for Render's dynamic IPs).  
     In production, restrict to Render's [published IP ranges](https://render.com/docs/static-ip) if needed.
3. Under **Security → Database Access**, create a database user with read/write privileges.
4. Click **Connect → Connect your application** and copy the connection string.
   - Replace `<password>` with your user's password.
   - Replace `<dbname>` with your database name (e.g. `testura`).

> **Connection string format:**
> ```
> mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
> ```

---

## 2. Backend — Render

### Prepare the repo

Push the project to GitHub (or any Git provider Render supports).

### Create a Web Service on Render

1. Click **New + → Web Service** and connect your repository.
2. Fill in the form:

| Field | Value |
|-------|-------|
| **Name** | `testura-api` (or your choice) |
| **Runtime** | `Node` |
| **Build Command** | `cd server && npm install` |
| **Start Command** | `cd server && npm start` |
| **Plan** | Free (or your choice) |

3. Under **Environment Variables**, add every key from the checklist below.
4. Click **Deploy**.

### Verify

Once deployed, visit `https://<your-service>.onrender.com/api/health`.  
You should see `{ "success": true, "data": { "status": "ok" }, "message": "healthy" }`.

---

## 3. Frontend — Vercel

1. Push the repo to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **Add New → Project**.
3. Import your repository.
4. In the **Configure Project** step:

| Field | Value |
|-------|-------|
| **Framework Preset** | `Vite` (auto-detected) |
| **Root Directory** | `client` |
| **Build Command** | `vite build` (auto-detected) |
| **Output Directory** | `dist` (auto-detected) |

5. Add the environment variable:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://<your-service>.onrender.com/api` |

6. Click **Deploy**.

Vercel will detect `client/vercel.json` and apply the SPA rewrite rule automatically so that client-side routing works.

---

## 4. Env-var Checklist

### Server (`server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No (default 5000) | Port Render listens on — Render sets this automatically |
| `MONGO_URI` | **Yes** | Full MongoDB Atlas connection string |
| `JWT_SECRET` | **Yes** | Random 64-char hex string (`openssl rand -hex 32`) |
| `CLIENT_URL` | **Yes** | The deployed frontend URL (e.g. `https://testura.vercel.app`) |
| `ENCRYPTION_KEY` | **Yes** | 32-char string used to encrypt GitHub PATs (`openssl rand -hex 16`) |

### Client (`client/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | **Yes** | Full backend URL with `/api` suffix (e.g. `https://testura-api.onrender.com/api`) |

---

## 5. Local Production Test

Before deploying, verify the production build locally:

```bash
# Backend
cd server
MONGO_URI=<your-atlas-uri> JWT_SECRET=<secret> CLIENT_URL=http://localhost:5173 node src/server.js

# Frontend (separate terminal)
cd client
VITE_API_URL=http://localhost:5000/api npm run build
npx vite preview
```

Then open `http://localhost:4173` and run through a full workflow.

---

## 6. Git Workflow

- Do **not** commit actual `.env` files — they are already in `.gitignore`.
- Commit the `.env.example` files instead so new contributors know what to set.
