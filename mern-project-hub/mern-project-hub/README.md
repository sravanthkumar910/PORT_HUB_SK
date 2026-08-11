# Project Hub — MERN Control Room

A full-stack project/idea/task tracker with **live** GitHub, Google Calendar, and Google Drive integrations — production-ready and deployable.

## What's included

| Module | Description |
|---|---|
| Dashboard | Live counts, running projects, milestone %, GitHub activity feed, upcoming calendar events, deadlines |
| Ideas | Name, description, photo, file/reference link, status pipeline |
| Projects | Skills, links (GitHub/YouTube/LinkedIn/live), start/deadline dates, status, milestones |
| Project Store | Shipped work: deployed link, LinkedIn post, process type |
| Daily Tasks | Name, deadline, timing, status — one click to push into Google Calendar |
| Documents | Upload PDFs/PPTs/docs directly into your connected Google Drive |
| Profile / Settings | Edit profile, connect/disconnect GitHub & Google |

Auth is multi-user with JWT (signup/login), so each user only sees their own data.

## Stack

- **Backend**: Node.js, Express, MongoDB Atlas (Mongoose), JWT auth, googleapis, GitHub REST API
- **Frontend**: React (Vite), Tailwind CSS, React Router, Recharts, Axios
- **Production hardening**: Helmet (security headers), express-rate-limit (auth + general API), compression (gzip), CORS allowlist, health check endpoint, graceful shutdown

---

## Part 1 — MongoDB Atlas (the database, same for dev & prod)

1. Create a free cluster at https://cloud.mongodb.com
2. **Database Access** → add a database user with a password (not your Atlas login).
3. **Network Access** → add an IP entry. For deployment on Render/Railway (dynamic IPs), add `0.0.0.0/0` (allow from anywhere) — access is still gated by the DB username/password.
4. **Connect → Drivers** → copy the connection string. It looks like:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
5. Add your database name before the `?`, e.g. `.../project-hub?retryWrites=true...` — this is your `MONGO_URI`.

This same URI is used in both local dev and production — Atlas is already cloud-hosted, so there's nothing else to deploy for the database.

## Part 2 — Deploy the backend (Render, free tier)

1. Push this project to a GitHub repo.
2. On https://render.com → **New → Blueprint** → connect your repo. Render will detect `render.yaml` at the project root and pre-fill a `project-hub-backend` service pointed at the `backend/` folder.
   - No `render.yaml`/Blueprint? Create manually instead: **New → Web Service** → root directory `backend` → build command `npm install` → start command `npm start`.
3. Fill in the environment variables Render asks for (marked `sync: false` in `render.yaml`):
   - `MONGO_URI` — from Part 1
   - `JWT_SECRET` — any long random string (e.g. generate with `openssl rand -base64 32`)
   - `CLIENT_URL` — your frontend URL (you'll get this in Part 3 — you can fill it in after, then redeploy)
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — from Part 4 below
4. Deploy. Render gives you a URL like `https://project-hub-backend.onrender.com`.
5. Verify it's alive: visit `https://project-hub-backend.onrender.com/api/health` — should return `{"status":"ok",...}`.

**Alternative**: Railway works the same way — new project from repo, set root directory to `backend`, add the same env vars, it auto-detects `npm start`.

## Part 3 — Deploy the frontend (Vercel, free tier)

1. On https://vercel.com → **New Project** → import the same repo.
2. Set **Root Directory** to `frontend`.
3. Framework preset: Vite (auto-detected). Build command `npm run build`, output directory `dist` (defaults are correct).
4. Add environment variable:
   - `VITE_API_URL` = `https://project-hub-backend.onrender.com/api` (your Render URL from Part 2, with `/api` on the end)
5. Deploy. Vercel gives you a URL like `https://project-hub.vercel.app`.
6. `vercel.json` (already included) handles SPA routing so React Router deep links and page refreshes work correctly. (A Netlify `_redirects` file is included too, in `frontend/public/`, in case you deploy there instead.)
7. **Go back to Render** and set `CLIENT_URL` to this Vercel URL (comma-separate multiple URLs if you also want to allow a preview deployment URL), then redeploy the backend so CORS allows requests from it.

## Part 4 — Google OAuth (Calendar + Drive), for production

1. https://console.cloud.google.com → create/select a project.
2. **APIs & Services → Library** → enable **Google Calendar API** and **Google Drive API**.
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID → Web application**.
4. Authorized redirect URI — add **both**, so dev and prod both work:
   - `http://localhost:5000/api/integrations/google/callback`
   - `https://project-hub-backend.onrender.com/api/integrations/google/callback`
5. Copy the Client ID + Secret into Render's env vars (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) and your local `backend/.env`. Also set `GOOGLE_REDIRECT_URI` per environment (it must match exactly what you're calling from).
6. While your OAuth consent screen is in **Testing** mode, add your own Google account under **OAuth consent screen → Test users**, or Google will block sign-in. Publish the app (or keep it in testing with only your accounts as users) — that's fine for a personal tool.

## Part 5 — GitHub integration

No deployment setup needed — this is per-user, not per-app. Each user pastes their own GitHub username + a Personal Access Token (https://github.com/settings/tokens, scopes `repo` + `read:user`) into the app's **Settings** page, and it's stored against their account in MongoDB.

---

## Running locally

```bash
# Backend
cd backend
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, GOOGLE_*
npm install
npm run dev             # http://localhost:5000

# Frontend (separate terminal)
cd frontend
cp .env.example .env    # leave VITE_API_URL empty for local dev
npm install
npm run dev              # http://localhost:5173
```

Vite's dev server proxies `/api` to `http://localhost:5000` (see `vite.config.js`), so the frontend works against your local backend with no extra config. Open http://localhost:5173/register to create your account.

## Project structure

```
render.yaml              Render Blueprint (one-click backend deploy)

backend/
  config/        MongoDB + Google OAuth client setup
  models/        User, Idea, Project, ProjectStore, Task, Document
  controllers/   business logic (+ controllers/integrations for GitHub/Calendar/Drive)
  routes/        Express routers
  middleware/    JWT auth guard, error handler
  server.js      helmet, rate limiting, CORS allowlist, compression, health check
  Procfile       for Railway/Heroku-style platforms

frontend/
  src/pages/       one file per screen (Dashboard, Ideas, Projects, ...)
  src/components/  Sidebar, Modal, StatCard, StatusBadge, ProtectedRoute, Layout
  src/context/     AuthContext (login/register/logout, current user)
  src/api/axios.js axios instance - VITE_API_URL in prod, dev proxy locally
  vercel.json      SPA rewrite rule for Vercel
  public/_redirects  SPA rewrite rule for Netlify
```

## Integration notes

- **GitHub**: Personal Access Token per user. Dashboard pulls recent public events + repos live. A Project can also store `githubRepo` (`owner/repo`) for a live per-repo status lookup.
- **Google Calendar**: OAuth2 with `access_type: offline`, so a refresh token is stored and syncing keeps working after the access token expires. Syncing a task creates a real Calendar event from its deadline + timing.
- **Google Drive**: files upload via `googleapis`' `drive.files.create` (in-memory buffer via `multer`), get set to "anyone with the link can view", and the link is saved as a Document.

## Production checklist (already done vs. still worth doing)

Already in this codebase:
- [x] Helmet security headers
- [x] Rate limiting on `/api/auth` and general `/api`
- [x] gzip compression
- [x] CORS allowlist (not `*`) driven by `CLIENT_URL`
- [x] `/api/health` endpoint for uptime checks
- [x] Stack traces hidden in error responses when `NODE_ENV=production`
- [x] Graceful shutdown on `SIGTERM`
- [x] `.env` files git-ignored everywhere

Worth adding before real-world/public use:
- [ ] Encrypt stored GitHub tokens & Google refresh tokens at rest (currently plain strings in MongoDB, fine for personal use)
- [ ] Move JWT to an httpOnly cookie instead of `localStorage` if you want XSS-proof auth
- [ ] Add automated backups on the Atlas cluster (free tier doesn't include them by default)
- [ ] Add a CI step (GitHub Actions) running `npm run build` on push, so broken deploys are caught before Render/Vercel builds
