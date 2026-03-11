# AI Auto Grader

End-to-end auto-grading system with:
- `frontend`: React web app (teacher UI)
- `backend`: Node.js/Express API (auth + orchestration)
- `ai_service`: FastAPI service (question generation, OCR grading, PDFs, RAG)

## Project Structure

```text
AI_AUTO_GRADER/
  backend/      # Express API
  frontend/     # React app
  ai_service/   # FastAPI AI service
  requirements.txt
```

## Prerequisites

- Node.js 18+ (or 20+)
- Python 3.11 (recommended)
- PostgreSQL (local or hosted)
- Tesseract OCR installed (required for `/evaluate`)
- Poppler installed (required by `pdf2image`)

### Windows Notes

- Tesseract default path expected:
  - `C:\Program Files\Tesseract-OCR\tesseract.exe`
- You can override with env var:
  - `TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe`

## Environment Variables

Create root `.env`:

```env
GROQ_API_KEY=your_groq_key
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your_jwt_secret
AI_SERVICE_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
HF_TOKEN=optional_huggingface_token
TESSERACT_CMD=optional_tesseract_path
```

Create `frontend/.env` (optional for local; fallback is already localhost):

```env
REACT_APP_API_BASE=http://localhost:5000/api
```

## Install Dependencies

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

### AI Service (Python)

From project root:

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

## Database Setup

Run this SQL in PostgreSQL:

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);
```

## Run Locally (3 terminals)

### 1) AI Service

From project root:

```bash
python -m uvicorn ai_service.main:app --host 127.0.0.1 --port 8000 --reload
```

Health check:
- `http://127.0.0.1:8000/`

### 2) Backend

```bash
cd backend
npm run dev
```

Backend runs on:
- `http://localhost:5000`

### 3) Frontend

```bash
cd frontend
npm start
```

Frontend runs on:
- `http://localhost:3000`

## Common Issues

### `ECONNREFUSED http://localhost:8000`

AI service is not running. Start uvicorn first.

### `TesseractNotFoundError`

Install Tesseract and set `TESSERACT_CMD` if needed.

### Groq `413 Request too large`

RAG context is too large for model/token limits. Reduce context size/chunks.

### RAG upload 500/502

Check both:
- backend logs (`/api/upload-rag-documents`)
- ai_service logs (`/upload-rag-documents`)

## Scripts

### Backend
- `npm run dev` - start with nodemon
- `npm start` - production start

### Frontend
- `npm start` - dev server
- `npm run build` - production build

