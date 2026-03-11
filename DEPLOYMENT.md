# Deployment Guide

## 1) Configure Environment Variables

Create a root `.env` from `.env.example` and set real values:

- `GROQ_API_KEY`
- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `AI_SERVICE_URL`
- `CORS_ORIGIN`
- `NODE_ENV=production`

Create `frontend/.env` from `frontend/.env.example`:

- `REACT_APP_API_BASE=https://<your-backend-domain>/api`

## 2) Prepare PostgreSQL

Run this SQL:

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);
```

## 3) Deploy AI Service (FastAPI)

From project root:

```bash
pip install -r requirements.txt
uvicorn ai_service.main:app --host 0.0.0.0 --port 8000
```

Set `GROQ_API_KEY` in your hosting provider.

## 4) Deploy Backend (Node/Express)

From `backend/`:

```bash
npm ci
npm start
```

Set backend env vars (`DATABASE_URL`, `JWT_SECRET`, `AI_SERVICE_URL`, `CORS_ORIGIN`, `NODE_ENV`, `PORT`).

## 5) Deploy Frontend (React)

From `frontend/`:

```bash
npm ci
npm run build
```

Deploy the build output using your static host (Vercel/Netlify/etc.).

## 6) Post-Deploy Checks

- Register/login succeeds.
- Cookie auth works on protected routes.
- Generate questions/answer key works.
- Evaluate answers works.
- RAG upload works.
- PDF generation routes work.
