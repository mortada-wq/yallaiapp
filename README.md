# Yallai

Glassmorphic **AI coding workspace**: chat with an assistant (AWS Bedrock), edit in **Monaco**, live **HTML/CSS/JS** preview.

📚 **[View Complete Architecture & Development Guide](./ARCHITECTURE.md)**

## Brand & UI

- **Palette:** ocean blue `#3A8AAF`, sunset / rust oranges `#DF7825` → `#CF571F`
- **Background:** `linear-gradient(180deg, #485157 0%, #1B3748 100%)`
- **Surfaces:** frosted glass (`backdrop-blur`, translucent slate), gradient-stroked primary actions (no flat purple fills)
- **Logo:** `public/logo.svg` (gradient wordmark)

Theme tokens live in `app/globals.css` (`.sahib-glass`, `.sahib-input`, `.sahib-msg-user`, etc.) and `lib/sahib-theme.ts`.

## Setup

The app is a **Next.js frontend** plus a **FastAPI backend** (all `/api/*` routes). You need both running; the frontend [proxies](https://nextjs.org/docs/app/api-reference/next-config-js/rewrites) `/api` to the backend.

**1. Backend** (Python, port 8000)

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env: MONGO_URL, DB_NAME, EMERGENT_LLM_KEY, ADMIN_EMAILS
# For local http (no HTTPS), set COOKIE_SECURE=false and COOKIE_SAMESITE=lax
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

**2. Frontend** (Next.js, port 3000)

```bash
cd frontend
npm install
cp .env.example .env.local
# Optional: BACKEND_URL=http://127.0.0.1:8000
npm run dev
```

Open **http://localhost:3000**. Chat, share, and auth calls go to the same origin and are rewritten to FastAPI.

Set `NEXT_PUBLIC_APP_URL` in production so metadata and copied share links use your public URL.

## Stack

Next.js 14, TypeScript, Tailwind, Zustand, Monaco, FastAPI, Motor (MongoDB), Emergent LLM (`emergentintegrations`), `cmdk`, `react-markdown`.

## API (implemented in `backend/server.py`, proxied by Next)

- `POST /api/chat` — streamed text (admin default model or in-app provider/model)
- `POST /api/share`, `GET /api/share/[id]` — snapshots (MongoDB)
- `GET/PUT /api/admin/settings` — default LLM provider and model (admin dashboard)
