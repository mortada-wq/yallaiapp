# Yallai — Product Requirements

## Original problem statement
> "fix it to be a full stack .. i can use it in mobile browser and here .. i can build apps by it using api"
> "let's enhance the app more… really complicated UI… I mostly going to use this by mobile… responsive… like vibe coding (replit agent) with thinking/awaiting animation"

The user wants a portable, full-stack AI coding workspace they can use on both desktop and phone. Current iteration: a **vibe-coding studio** — preview-first, chat-first, AI-driven, with a Replit-Agent-style thinking animation.

## Architecture
- **Frontend** (`/app/frontend`): Next.js 14 App Router, TypeScript, Tailwind, Zustand, Monaco, `@babel/standalone`.
  `yarn start` → `next dev -H 0.0.0.0 -p 3000`.
- **Backend** (`/app/backend`): FastAPI on `0.0.0.0:8001` (uvicorn --reload).
- **Database**: MongoDB (will migrate to Neon Postgres next, per user).
- **LLM**: Claude Sonnet 4.5 via Emergent LLM key (`emergentintegrations`). Non-streaming call on backend, re-chunked into a text stream for the UI.

## Vibe-coding UI (2026-04-21 — this session)
- **Top bar (minimal)**: Yallai mark + "vibe coding studio" subtitle, `Code(N)` button with file count badge + green flash when a new file is added, `Share` (copy link), `Copy`, `Download ZIP`.
- **Preview (hero)**: browser-chrome styled (traffic-light dots, device pill, refresh), live iframe with the current build. Device toggle: Mobile / Tablet / Desktop.
- **Chat (right column on desktop, tab on mobile)**:
  - Empty state: big sparkle mark, "Let's build something" + 5 prompt chips (Landing page, Todo app, Dashboard, Portfolio, Login screen).
  - Messages: existing `MessageBubble` with code blocks + **Insert to Editor** / **Apply to Preview** buttons.
  - **ThinkingIndicator**: 3 pulsing ocean-blue dots + rotating phrases ("Reading your request…", "Planning the structure…", "Writing the code…", "Styling & polish…", "Wiring it up…", "Almost there…") cycling every 1.8s while the AI is working.
  - **Streaming cursor** (pulsing ocean-blue bar) after the last streamed char.
  - **Composer**: large 52px-min-height textarea with glowing ring focus + round gradient send button (ArrowUp). `Enter` to send, `Shift+Enter` for newline.
- **Code drawer**: slide-over (desktop right, mobile bottom-sheet) wrapping the existing Monaco `EditorPanel`. Lazy-mounted — doesn't run until opened, so files stay empty until the user actually builds something.
- **Mobile**: single-pane tab switcher (Chat / Preview), sticky composer, touch-friendly (44-52px hit targets).

### Files added/changed this session
- NEW `components/vibe/VibeChrome.tsx` — top-level shell
- NEW `components/vibe/VibeChat.tsx` — chat + composer + chips + thinking
- NEW `components/vibe/LivePreview.tsx` — hero preview with browser chrome
- NEW `components/vibe/ThinkingIndicator.tsx` — Replit-Agent style thinking animation
- NEW `components/vibe/CodeDrawer.tsx` — slide-over / bottom-sheet wrapping EditorPanel
- MOD `app/page.tsx` → renders `<VibeChrome />`
- MOD `app/globals.css` → `.vibe-bg`, `@keyframes vibe-pulse`, `@keyframes vibe-fade-in`, `xs:` breakpoint

Retired but not deleted (available as reference / for rollback):
`StudioChrome`, `StudioWorkspace`, `Header`, `Sidebar`, `ActivityBar`, `CommandPalette`, `TourOverlay`, `ProjectsModal`, `ProjectFormModal`, `ProjectMemoryPanel`, `KnowledgeTowerPanel`, `UserProfilePanel`, `TemplateModal`, `ExportModal`, `SettingsModal`.

## API surface (backend, unchanged this session)
| Method | Path                  | Purpose |
|--------|-----------------------|---------|
| GET    | `/api/health`         | Health check |
| POST   | `/api/chat`           | Streamed assistant reply (Claude Sonnet 4.5) |
| POST   | `/api/share`          | Create a share snapshot → `{ id, path }` |
| GET    | `/api/share/{id}`     | Retrieve a share snapshot |

## Verified end-to-end (2026-04-21)
- **Desktop (1440×900)**: empty state → prompt → thinking indicator shows with rotating phrase → code block streams in → "Apply to Preview" → iframe instantly renders the built HTML. Code button shows file count + green flash.
- **Mobile (390×780)**: empty state, chip prefill, send, thinking phrase visible, code + buttons, "Apply to Preview" toast, Preview tab shows live "My Tasks" todo app.
- Share link round-trip through Mongo: OK.

## Prioritized backlog
- **P0** Migrate MongoDB → **Neon Postgres** (shares + projects + chat history) when user provides the connection string — one DB to own when they move off Emergent.
- **P1** Persist projects in DB (currently only localStorage) — needed for true cross-device vibe coding.
- **P1** Model-swap dropdown in a small Settings popover (Claude 4.5 / GPT-5.2 / Gemini 3 Pro, all via Emergent key; Bedrock when user migrates to AWS).
- **P2** Public `POST /api/generate` with a simple app-token so the user can call Yallai from external apps.
- **P2** True streaming from the LLM (currently full-reply chunked for smooth display).
- **P3** Optional single-user auth (JWT) now that DB persists.
- **P3** Collaborative multi-user workspaces.

## Tech stack
- Next.js 14, React 18, Tailwind, Zustand, Monaco, `@babel/standalone`
- FastAPI, motor (Mongo) → will become asyncpg/SQLAlchemy (Neon)
- `emergentintegrations` for LLM (Claude Sonnet 4.5)
- Supervisor, MongoDB
