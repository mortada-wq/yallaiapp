# Yallai (sahib.chat) — Product Requirements

## Original problem statement
> "fix it to be a full stack .. i can use it in mobile browser and here .. i can build apps by it using api"

The user wanted the existing Next.js AI coding workspace (Yallai / sahib.chat) to run here on the Emergent preview and work on mobile browsers, so they can use the AI chat to generate code and build small apps live in the browser.

## Architecture (now)
- **Frontend** (`/app/frontend`): Next.js 14 (App Router), TypeScript, Tailwind, Zustand, Monaco editor.
  Runs via `yarn start` → `next dev -H 0.0.0.0 -p 3000` (supervisor-managed, hot reload).
- **Backend** (`/app/backend`): FastAPI on `0.0.0.0:8001` (supervisor-managed, uvicorn --reload).
- **Database**: MongoDB (local, via supervisor).
- **LLM**: Claude Sonnet 4.5 via Emergent LLM key (`emergentintegrations`). Non-streaming call from the library, re-chunked on the backend into a text stream so the existing ChatPanel streaming UI works unchanged.

## Core user flows
1. Open the app → workspace loads (chat left, editor+preview right on desktop; stacked on mobile).
2. Type a prompt → assistant replies with code fenced blocks → click **Insert to Editor** → Monaco updates → live preview renders instantly in sandboxed iframe.
3. Use **Share** → POST `/api/share` stores snapshot in MongoDB → copy link → open `/s/{id}` for a read-only preview.
4. Use templates (landing page / dashboard / portfolio / react-app) to seed a starter project.

## API surface (backend)
| Method | Path                  | Purpose |
|--------|-----------------------|---------|
| GET    | `/api/health`         | Health check |
| POST   | `/api/chat`           | Streamed assistant reply (Claude Sonnet 4.5) |
| POST   | `/api/share`          | Create a share snapshot → `{ id, path }` |
| GET    | `/api/share/{id}`     | Retrieve a share snapshot |

## What changed in this session (2026-04-21)
- Moved Next.js source into `/app/frontend/` so it matches the platform's supervisor layout.
- Created a new FastAPI backend at `/app/backend/` with `/api/chat`, `/api/share`, `/api/share/{id}`, `/api/health`.
- Replaced the Next.js `/api/*` routes + `middleware.ts` + `/login` page (removed).
  - No auth gate anymore — the workspace opens directly so the user can just start building.
- Swapped AWS Bedrock for Claude Sonnet 4.5 via Emergent LLM key (`emergentintegrations`). No user-supplied keys required.
- Replaced in-memory share store with MongoDB collection `shares` (persists across restarts).
- Client-only `lib/aiProvider.ts` kept (minimal) so `store.ts` still compiles.
- Mobile responsiveness: `ActivityBar` + `Sidebar` hidden below `md` breakpoint; split view stacks vertically on mobile.
- `package.json`: `start` → `next dev -H 0.0.0.0 -p 3000` (hot reload in preview).
- `frontend/.env`: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_BACKEND_URL`, `REACT_APP_BACKEND_URL` → preview URL.
- `backend/.env`: `MONGO_URL`, `DB_NAME=yallai`, `EMERGENT_LLM_KEY`.

## Verified (2026-04-21)
- Backend health: `GET /api/health` → 200.
- Chat: `POST /api/chat` returns a real Claude Sonnet 4.5 reply, streamed in text chunks.
- Share: `POST /api/share` + `GET /api/share/{id}` round-trips through MongoDB.
- Frontend: loads on desktop (1440px) and mobile (390px); sidebar hidden on mobile; Chat/Editor/Split tabs work.

## Prioritized backlog
- **P1** Swap the “Settings → provider/apiKey” UI to a simpler one-setting “LLM model” dropdown (Claude 4.5 / GPT-5.2 / Gemini 3 Pro) backed by the Emergent key.
- **P1** Add a public `POST /api/generate` (non-streaming, app-token protected) so external apps can call Yallai to generate code snippets.
- **P2** Project save/load via MongoDB (currently projects live only in localStorage).
- **P2** Re-introduce simple admin auth (single-user) now that the backend persists state.
- **P2** Packaging: `next build` + `next start` for faster serve (currently `next dev`).
- **P3** Collaborative editing (WebSockets), Git integration, external-package support in preview.

## Tech stack
- Next.js 14, React 18, Tailwind, Zustand, Monaco, `@babel/standalone`
- FastAPI, motor (Mongo), `emergentintegrations` (Claude Sonnet 4.5)
- Supervisor, MongoDB
