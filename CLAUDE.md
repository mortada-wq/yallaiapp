# CLAUDE.md — صاحب يلا (Sahib Yalla / Yallai) Project Context

## IMPORTANT: Read This First

**You are working on an AI-powered IDE. Before implementing any feature that calls an LLM API, you MUST ask the user:**
> "Which AI provider do you want to use? (e.g., Anthropic Claude, OpenAI, Google Gemini, AWS Bedrock, DeepSeek, or another provider)"

Never hardcode or assume a specific AI provider. The project is designed to be **provider-agnostic (BYOK — Bring Your Own Key)**.

---

## What Is This Project?

**صاحب يلا (Sahib Yalla)** is an **Arabic-first, AI-powered web development IDE** — a browser-based workspace where Arabic-speaking users describe what they want to build in Arabic, get code from an AI assistant, and instantly see a live preview.

Think: Replit Agent, but fully RTL and built for Arabic speakers.

**Current name/brand**: صاحب يلا | **Domain**: sahib.chat

**Bigger vision — The Yallai Command Center**: A provider-agnostic "Project Brain" combining:
- Cursor-like code editor with inline AI chat
- Persistent project memory (vector storage)
- Auto-updating live documentation
- Calendar/roadmap (deployment sprints, investor follow-ups)
- The Watchtower: autonomous market intelligence (partner matching, investor tracking)
- Service Toggle: switch LLM providers per task (heavy reasoning vs. lightweight docs)

---

## Tech Stack

### Frontend (`/frontend`)
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v3.4 |
| State | Zustand v4 (persisted to localStorage) |
| Code Editor | Monaco Editor (@monaco-editor/react) |
| JSX Transpile | @babel/standalone (in-browser, for live preview) |
| Icons | Lucide React |
| Toasts | sonner |
| Markdown | react-markdown + remark-gfm |
| Highlight | highlight.js |
| Export | jszip + file-saver |
| IDs | nanoid |
| Theme | next-themes |

### Backend (`/backend`)
| Layer | Technology |
|-------|-----------|
| Framework | FastAPI (Python) |
| Database | MongoDB (motor async) — planned migration to Neon Postgres |
| Auth | Google OAuth (via Emergent) |
| LLM proxy | emergentintegrations SDK |
| HTTP client | httpx (async) |
| Runtime | uvicorn + uvloop |

---

## Architecture Overview

```
User Browser
├── VibeChrome (root shell)          ← components/vibe/VibeChrome.tsx
│   ├── Top bar (logo, share, download buttons — RTL)
│   ├── LivePreview (browser chrome, device toggle)
│   ├── VibeChat (AI chat column — RTL Arabic)
│   │   └── ThinkingIndicator (Replit-style pulsing dots + Arabic phrases)
│   └── CodeDrawer (slide-over Monaco + FileTabs + Console)
├── Zustand Store                    ← frontend/lib/store.ts
│   ├── Messages, files, activeFileId
│   ├── UI state (viewMode, consoleOpen, sidebarCollapsed)
│   └── AI config (provider, keys, models)
└── Code Processor                   ← frontend/lib/codeProcessor.ts
    └── Babel transpile JSX → sandboxed iframe srcdoc

Next.js API Routes (frontend/app/api/)
├── POST /api/chat   → proxies to FastAPI backend → LLM → streaming response
├── POST /api/share  → saves snapshot to MongoDB → returns { id, path }
└── GET  /api/share/[id] → retrieves snapshot

FastAPI Backend (backend/server.py)
├── Receives chat requests with context (active file, file tree, console errors)
├── Calls LLM via emergentintegrations SDK
└── Streams response back as text/plain
```

---

## Key Files

| File | Purpose |
|------|---------|
| `frontend/app/page.tsx` | Entry point — renders `<VibeChrome />` |
| `frontend/app/layout.tsx` | Root layout — sets `dir="rtl" lang="ar"`, loads fonts |
| `frontend/components/vibe/VibeChrome.tsx` | Root shell with top bar, preview, chat, code drawer |
| `frontend/components/vibe/VibeChat.tsx` | Arabic chat interface, message list, composer |
| `frontend/components/vibe/LivePreview.tsx` | Browser chrome + sandboxed iframe preview |
| `frontend/components/vibe/ThinkingIndicator.tsx` | Pulsing ocean-blue dots + rotating Arabic phrases |
| `frontend/components/vibe/CodeDrawer.tsx` | Slide-over / bottom-sheet wrapping Monaco + console |
| `frontend/lib/store.ts` | Zustand store — single source of truth (localStorage-persisted) |
| `frontend/lib/aiProvider.ts` | AI provider config + DEFAULT_MODELS (do not hardcode a default) |
| `frontend/lib/codeProcessor.ts` | Babel JSX transpiler + iframe bundle builder |
| `frontend/lib/projectStore.ts` | Projects Zustand store |
| `frontend/lib/knowledgeStore.ts` | Knowledge base Zustand store |
| `frontend/app/api/chat/route.ts` | Streaming chat endpoint (proxies to backend) |
| `backend/server.py` | FastAPI — LLM proxy, MongoDB, auth, admin endpoints |
| `memory/PRD.md` | Product Requirements (Arabic identity, UI specs) |
| `documentation/yallai_vision.md` | Strategic vision — Yallai Command Center |

---

## Development Rules

### 1. AI Provider — The Cardinal Rule
**Never hardcode any specific AI provider or model.**

Before writing any code that calls an LLM:
1. Ask: *"Which AI provider do you want to use for this feature?"*
2. List the options: Anthropic Claude, OpenAI, Google Gemini, AWS Bedrock, DeepSeek, or other
3. Wait for user confirmation before importing provider-specific SDKs or writing provider-specific code

The `frontend/lib/aiProvider.ts` lists currently supported providers (`bedrock`, `anthropic`, `openai`, `deepseek`) — this is the reference, not the mandate. Users may want to add or swap providers.

### 2. Arabic-First UI
- All UI strings must be in Arabic (except code, filenames, technical identifiers)
- Use logical CSS properties: `ms-` / `me-` instead of `ml-` / `mr-`
- Never add `ml-` or `mr-` to layout elements; use `ms-` (margin-start) / `me-` (margin-end)
- Code blocks and Monaco editor must stay `dir="ltr"` — wrap them explicitly
- The `<html>` element is always `dir="rtl" lang="ar"`

### 3. Glassmorphic Design (See `DESIGN.md`)
- Ocean Blue `#3A8AAF` for accents, strokes, glows
- Rust Orange gradient `#DF7825 → #CF571F` for primary buttons and logo
- Dark surfaces: `#252526` (chrome), `#1E1E1E` (editor), `#0A0B0D` (overlay)
- Tailwind `backdrop-blur`, translucent backgrounds, 300ms ease transitions

### 4. State Management
- All state lives in Zustand stores (see `lib/store.ts`, `lib/projectStore.ts`, `lib/knowledgeStore.ts`)
- Stores are persisted to `localStorage` — never use React state for data that should survive refresh
- localStorage keys: `sahib-chat-storage`, `yallai-projects-storage`, `yallai-knowledge-storage`

### 5. No Empty Files
- Every file added to the project must have substantive content
- No placeholder/stub files

---

## Current Backlog (Priority Order)

- **P0**: Migrate MongoDB → Neon Postgres (user has free credits; awaiting connection string)
- **P1**: Persist projects + chat history in DB (currently localStorage-only on client)
- **P2**: Full Google Auth flow (admin gated by `ADMIN_EMAILS` allowlist in `server.py`)
- **P3**: Token-level streaming (currently non-streaming chunked via Emergent SDK)
- **P4**: Public `/api/generate` endpoint for external integrations

---

## Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAIL=you@example.com
SESSION_SECRET=32-char-random-string

# Backend (environment)
MONGO_URL=mongodb://...
DB_NAME=yallai
EMERGENT_LLM_KEY=your-emergent-key   # ask user which provider before using
DEFAULT_LLM_PROVIDER=                # DO NOT set without asking user
DEFAULT_LLM_MODEL=                   # DO NOT set without asking user
```

---

## Running Locally

```bash
# Frontend
cd frontend && npm install && npm run dev   # http://localhost:3000

# Backend
cd backend && pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

---

## Reminders for Every Session

1. Ask about the AI provider before any LLM work
2. Keep the UI RTL and Arabic
3. Check `memory/PRD.md` for UI copy (exact Arabic phrases, toast messages, etc.)
4. Check `DESIGN.md` for exact colors, fonts, and spacing before any styling work
5. The `documentation/yallai_vision.md` file explains the long-term product strategy — read it before planning major features
