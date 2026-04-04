# YallaiApp (sahib.chat) - Architecture & Development Guide

## Context

The user wants to understand the app's architecture and how to develop it. This is an AI-assisted coding workspace called sahib.chat (Sahibo Studio) — a browser-based IDE where users chat with an AI assistant, edit code in Monaco Editor, and see live HTML/CSS/JS previews. The app has no tests, no CI/CD, no Docker, no auth, and uses in-memory storage for shares.

## Architecture Overview

```
User Browser
├── StudioChrome (shell)
│   ├── Header (nav, search, share, settings)
│   ├── Sidebar (file explorer)
│   ├── StudioWorkspace
│   │   ├── ChatPanel ←→ POST /api/chat → AWS Bedrock (Claude 3.5 Sonnet)
│   │   ├── EditorPanel → MonacoEditor
│   │   └── PreviewFrame (sandboxed iframe)
│   └── Modals (Command Palette, Templates, Export, Settings)
├── Zustand Store (lib/store.ts) — single source of truth, persisted to localStorage
└── Code Processor (lib/codeProcessor.ts) — Babel transpilation for JSX → iframe
```

## Data Flow

**Edit → Preview**: Monaco editor → Zustand store → codeProcessor.ts (Babel transpile) → iframe sandbox

**AI Chat**: User message → /api/chat → AWS Bedrock streaming → ChatPanel renders markdown

**Share**: Files snapshot → /api/share → in-memory Map (24hr TTL) → /s/[id] read-only preview

## Key Files

| File | Purpose |
|------|---------|
| `app/page.tsx` | Main entry — renders `<StudioChrome />` |
| `components/StudioChrome.tsx` | Root shell: Header, Sidebar, Workspace, Modals (Command Palette, Templates, Export, Settings, Tour) |
| `components/StudioWorkspace.tsx` | Main panel switcher: Split / Chat-only / Editor-only views |
| `components/ChatPanel.tsx` | Chat UI: message list, streaming responses, InsertCodeButton integration |
| `components/EditorPanel.tsx` | Code editor: file tabs, Monaco wrapper, preview pane, console drawer |
| `components/MonacoEditor.tsx` | Monaco Editor React wrapper with theme sync |
| `components/PreviewFrame.tsx` | Sandboxed iframe for live preview (HTML/CSS/JS/JSX) |
| `lib/store.ts` | Zustand store: messages, files, activeFileId, UI state (sidebar, console, viewMode), persisted to localStorage |
| `lib/codeProcessor.ts` | Babel transpiler for JSX, bundle HTML+CSS+JS into preview doc, console bridge script injection |
| `lib/bedrock.ts` | AWS Bedrock client, streaming API wrapper for Claude 3.5 Sonnet |
| `app/api/chat/route.ts` | Streaming chat endpoint: rate-limited, context-aware, error handling |
| `app/api/share/route.ts` | POST: create share snapshot, returns ID |
| `app/api/share/[id]/route.ts` | GET: retrieve share snapshot by ID |
| `app/s/[id]/page.tsx` | Read-only shared project viewer |

## Component Hierarchy

```
StudioChrome
├── Header
│   ├── SahibLogo
│   ├── CommandPalette trigger
│   ├── Template trigger
│   ├── Export trigger
│   ├── Settings trigger
│   └── ThemeToggle
├── Sidebar
│   └── File tree (add, rename, delete)
├── StudioWorkspace
│   ├── Mode toggle (Split / Chat / Editor)
│   └── Conditional render:
│       ├── ChatPanel
│       │   ├── MessageBubble[]
│       │   │   ├── CodeBlock (with InsertCodeButton)
│       │   │   └── Markdown rendering
│       │   └── Input area
│       └── EditorPanel
│           ├── FileTabs
│           ├── AiToolbar (Ask Sahibo, Fix errors, Explain)
│           ├── Split pane:
│           │   ├── MonacoEditor
│           │   └── PreviewFrame
│           └── ConsolePanel (collapsible)
└── Modals
    ├── CommandPalette (cmdk)
    ├── TemplateModal (load starter projects)
    ├── ExportModal (ZIP, share link)
    ├── SettingsModal (font size, debounce, AWS creds)
    └── TourOverlay (first-time onboarding)
```

## State Management (Zustand)

**Store location**: `lib/store.ts`

**Persisted to localStorage** as `sahib-chat-storage`:
- `files: EditorFile[]` — all code files in workspace
- `activeFileId: string | null` — current editor tab
- `messages: Message[]` — chat history
- `sidebarCollapsed: boolean`
- `viewMode: ViewMode` — "split" | "editor" | "preview"
- `mainPanelMode` — "split" | "chat" | "editor"
- `editorFontSize`, `previewDebounceMs`, `consoleOpen`, `previewDeviceIndex`

**Not persisted** (runtime only):
- `chatLoading`, `chatError`, `consoleEntries`, `previewRuntimeError`, `lastSavedAt`

**Key actions**:
- `insertOrUpdateFile(name, language, content)` — smart insert or update existing file
- `applyCodeToPreview(language, code)` — detect file type from code/language, create/update file, switch to split view
- `buildChatContextForApi()` — builds context payload (active file, file tree, console errors) for /api/chat

## Code Processing Pipeline

1. **User edits in Monaco** → `updateFileContent(id, content)` → Zustand store
2. **Debounced preview update** (500ms default) → `bundleCode(html, css, js, jsxMode)`
3. **If JSX detected** → `transpileReact(code)` via `@babel/standalone`
4. **Inject console bridge** → postMessage from iframe to parent
5. **Render in sandboxed iframe** → `<iframe sandbox="allow-scripts allow-same-origin" />`

**Console bridge**:
- Overrides `console.log`, `console.warn`, `console.error`, `console.info`
- Sends messages to parent via `postMessage({source:'sahib-preview', type:'console', level, args})`
- Captures `window.onerror` for runtime errors

## Chat Integration

**Flow**:
1. User types message in ChatPanel
2. Click Send → `POST /api/chat` with `{message, history, context}`
3. `context` built from `buildChatContextForApi()` (active file, file tree, errors)
4. Bedrock streams response (AWS SDK v3, `BedrockRuntimeClient.invokeModelWithResponseStream`)
5. ChatPanel displays streaming text with `react-markdown` + `remark-gfm`
6. Code blocks rendered via `CodeBlock.tsx` with syntax highlighting (`highlight.js`)
7. User clicks **"Insert to Editor"** → `insertOrUpdateFile(name, language, code)` → Monaco updates

**AI Toolbar** (in EditorPanel):
- **Ask Sahibo to improve** → sends selected code + context to chat
- **Fix errors** → sends console errors + code to chat
- **Explain this code** → sends code with explanation request

## Share Feature

**Create share**:
1. User clicks Share button
2. `POST /api/share` with `{files, activeFileId}`
3. Server generates nanoid(12), saves to in-memory Map with 24hr TTL (dev environment)
4. Returns `{id, path: '/s/[id]'}`
5. User copies link

**View share**:
1. Navigate to `/s/[id]`
2. `GET /api/share/[id]` returns `{files, activeFileId}`
3. Read-only preview: shows editor + preview, no editing allowed
4. "Fork this project" button → loads files into new workspace

**Storage note**: In production, replace in-memory Map with database (PostgreSQL, DynamoDB, etc.)

## File System

**Virtual file system** (no backend):
- All files stored in Zustand store → persisted to localStorage
- Auto-save on edit (debounced 2s) → `isDirty` flag tracked
- File operations: add, update, rename, delete
- Default templates: `lib/templates/projects.ts`, `lib/templates/landing-page.ts`

**File types**:
- `.html`, `.css`, `.js` → standard web files
- `.jsx`, `.tsx` → React files (triggers JSX transpilation)
- Language detection: Monaco editor, syntax highlighting in preview

## Keyboard Shortcuts

Defined in `lib/shortcuts.ts` and registered in components:

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open Command Palette |
| `Cmd/Ctrl + J` | Toggle Console |
| `Cmd/Ctrl + B` | Toggle Sidebar |
| `Cmd/Ctrl + S` | Save (shows indicator) |
| `Cmd/Ctrl + /` | Toggle comment (Monaco default) |
| `Escape` | Close modals |

## Styling & Theming

**Design system**:
- **Palette**: Ocean blue `#3A8AAF`, sunset/rust oranges `#DF7825` → `#CF571F`
- **Background**: `linear-gradient(180deg, #485157 0%, #1B3748 100%)`
- **Surfaces**: Frosted glass (backdrop-blur, translucent slate), gradient-stroked primary actions
- **Logo**: `public/logo.svg` (gradient wordmark)

**Theme tokens**: `app/globals.css`
- `.sahib-glass` — glassmorphic panels
- `.sahib-input` — styled inputs
- `.sahib-msg-user`, `.sahib-msg-assistant` — message bubbles

**Dark mode only** (currently no light mode toggle, though infrastructure exists via `next-themes`)

## API Routes

### `POST /api/chat`
**Request**:
```json
{
  "message": "string",
  "history": [
    {"id": "string", "role": "user"|"assistant", "content": "string", "timestamp": "ISO8601"}
  ],
  "context": {
    "activeFileName": "string",
    "activeFileContent": "string",
    "fileTree": "string",
    "consoleErrors": "string"
  }
}
```

**Response**: `text/plain` stream (chunks of text)

**Features**:
- Rate limiting (10 req/min per IP, via `lib/rateLimit.ts`)
- Streaming via AWS Bedrock Runtime
- Error handling: credentials missing, rate limit, network errors

### `POST /api/share`
**Request**:
```json
{
  "files": [{"id": "string", "name": "string", "language": "string", "content": "string", "isDirty": false}],
  "activeFileId": "string|null"
}
```

**Response**:
```json
{
  "id": "string",
  "path": "/s/{id}"
}
```

### `GET /api/share/[id]`
**Response**:
```json
{
  "files": [...],
  "activeFileId": "string|null",
  "createdAt": "ISO8601"
}
```

## Development Setup

**Prerequisites**:
- Node.js 18+
- AWS account with Bedrock access (Claude 3.5 Sonnet enabled)
- AWS credentials with `bedrock:InvokeModel` permission

**Steps**:
```bash
# Clone repo
git clone <repo-url>
cd yallaiapp

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local:
# AWS_ACCESS_KEY_ID=your_key
# AWS_SECRET_ACCESS_KEY=your_secret
# AWS_REGION=us-east-1
# BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
# NEXT_PUBLIC_APP_URL=http://localhost:3000 (or https://sahib.chat in production)

# Run dev server
npm run dev
# Open http://localhost:3000
```

**Build & Deploy**:
```bash
npm run build
npm run start
```

## Tech Stack

**Frontend**:
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS

**State Management**:
- Zustand (with localStorage persistence)

**Editor**:
- Monaco Editor (`@monaco-editor/react`)
- Babel Standalone (JSX transpilation)

**UI Components**:
- `lucide-react` (icons)
- `cmdk` (Command Palette)
- `react-split` (resizable panels)
- `react-markdown` + `remark-gfm` (chat markdown)
- `highlight.js` (code syntax highlighting)
- `sonner` (toast notifications)

**AI Backend**:
- AWS Bedrock Runtime (`@aws-sdk/client-bedrock-runtime`)
- Claude 3.5 Sonnet model

**Utilities**:
- `nanoid` (ID generation)
- `jszip` + `file-saver` (export to ZIP)
- `react-hotkeys-hook` (keyboard shortcuts)
- `next-themes` (theme management infrastructure)

## Security Considerations

**Sandboxing**:
- Preview iframe uses `sandbox="allow-scripts allow-same-origin"`
- No `eval()` or `Function()` constructor in user code
- Babel transpilation runs in browser (client-side)

**API Security**:
- Rate limiting on `/api/chat` (10 req/min per IP)
- AWS credentials never exposed to client
- All Bedrock calls proxied through Next.js API routes

**XSS Prevention**:
- User-generated code runs in sandboxed iframe
- Markdown rendering via `react-markdown` (safe by default)
- No direct HTML injection

## Known Limitations

1. **No authentication** — anyone can use the app
2. **No persistent backend** — shares stored in-memory (dev), localStorage for user files
3. **No collaborative editing** — single-user workspace only
4. **No version control** — no Git integration, no file history
5. **No external imports** — can't install npm packages in preview
6. **Client-side only** — Babel transpilation runs in browser (slower for large files)
7. **24hr share TTL** — shares expire after 24 hours (in-memory storage)

## Future Enhancements

**Planned**:
- [ ] Database for shares (PostgreSQL / DynamoDB)
- [ ] User authentication (NextAuth.js)
- [ ] Project management (save multiple projects)
- [ ] External package support (via Skypack / esm.sh CDN)
- [ ] Light mode theme
- [ ] Mobile responsiveness improvements
- [ ] Collaborative editing (WebSockets)
- [ ] Git integration (commit, push to GitHub)
- [ ] AI-powered features:
  - [ ] Auto-complete with Bedrock
  - [ ] Inline code suggestions
  - [ ] Error auto-fix
  - [ ] Code review comments

## Contributing

**Code style**:
- TypeScript strict mode
- ESLint + Prettier
- Component file naming: PascalCase.tsx
- Utility file naming: camelCase.ts

**File organization**:
- `/app` — Next.js pages and API routes
- `/components` — React components
- `/lib` — Utilities, stores, types
- `/hooks` — Custom React hooks
- `/public` — Static assets
- `/types` — TypeScript type definitions

## Troubleshooting

**Monaco Editor not loading**:
- Check network tab for CDN errors
- Monaco loads dynamically (client-side only)
- Ensure JavaScript is enabled

**Bedrock errors**:
- Verify AWS credentials in `.env.local`
- Check region is `us-east-1` or supported region
- Ensure Bedrock model access is enabled in AWS console
- Check IAM permissions for `bedrock:InvokeModel`

**Preview not updating**:
- Check console for syntax errors
- Verify debounce delay in settings
- Clear localStorage and refresh
- Check browser console for iframe errors

**Share link not working**:
- In dev: shares expire after 24 hours
- Check `/api/share/[id]` returns 200
- Verify share ID is correct

## Appendix: File Structure

```
yallaiapp/
├── app/
│   ├── layout.tsx              # Root layout, ThemeProvider
│   ├── page.tsx                # Main entry: <StudioChrome />
│   ├── globals.css             # Global styles, theme tokens
│   ├── api/
│   │   ├── chat/route.ts       # POST /api/chat (streaming)
│   │   └── share/
│   │       ├── route.ts        # POST /api/share (create)
│   │       └── [id]/route.ts   # GET /api/share/[id] (retrieve)
│   └── s/[id]/page.tsx         # Shared project viewer
├── components/
│   ├── StudioChrome.tsx        # Root shell
│   ├── StudioWorkspace.tsx     # Main panel switcher
│   ├── Header.tsx              # Top nav
│   ├── Sidebar.tsx             # File explorer
│   ├── ChatPanel.tsx           # Chat interface
│   ├── EditorPanel.tsx         # Code editor panel
│   ├── MonacoEditor.tsx        # Monaco wrapper
│   ├── PreviewFrame.tsx        # Iframe preview
│   ├── ConsolePanel.tsx        # Console drawer
│   ├── FileTabs.tsx            # Editor tabs
│   ├── MessageBubble.tsx       # Chat message
│   ├── CodeBlock.tsx           # Code syntax highlighting
│   ├── InsertCodeButton.tsx    # Insert code to editor
│   ├── AiToolbar.tsx           # AI helper buttons
│   ├── CommandPalette.tsx      # Cmd+K palette
│   ├── TemplateModal.tsx       # Project templates
│   ├── ExportModal.tsx         # Export options
│   ├── SettingsModal.tsx       # User settings
│   ├── TourOverlay.tsx         # Onboarding tour
│   ├── ThemeToggle.tsx         # Theme switcher
│   ├── SahibLogo.tsx           # Logo component
│   └── SahibButton.tsx         # Styled button
├── lib/
│   ├── store.ts                # Zustand store
│   ├── codeProcessor.ts        # Babel transpiler, bundler
│   ├── bedrock.ts              # AWS Bedrock client
│   ├── contextBuilder.ts       # Chat context builder
│   ├── codeExtractor.ts        # Extract code from markdown
│   ├── shareStore.ts           # In-memory share storage
│   ├── rateLimit.ts            # Rate limiting logic
│   ├── shortcuts.ts            # Keyboard shortcut definitions
│   ├── site.ts                 # Site metadata
│   ├── types.ts                # TypeScript types
│   ├── utils.ts                # Utility functions (cn, etc.)
│   └── templates/
│       ├── projects.ts         # Starter project templates
│       └── landing-page.ts     # Landing page template
├── hooks/
│   └── useCodeEditor.ts        # (deprecated, logic moved to store)
├── types/
│   └── babel-standalone.d.ts   # Babel type definitions
├── public/
│   └── logo.svg                # Sahibo logo
├── .env.example                # Example environment variables
├── package.json                # Dependencies
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── next.config.mjs             # Next.js configuration
```

## Glossary

- **Sahibo**: The AI assistant (Claude via Bedrock)
- **Studio**: The IDE workspace
- **Glassmorphic**: UI design style with frosted glass effect
- **Zustand**: Minimal state management library
- **Bedrock**: AWS service for managed LLM APIs
- **Monaco**: Code editor engine (powers VS Code)
- **Babel Standalone**: Browser-based JSX transpiler
- **JSX**: JavaScript XML syntax for React
- **Split pane**: Resizable panel layout
- **Command Palette**: Quick action menu (Cmd+K)

---

**Last updated**: 2026-04-04
**Version**: 0.1.0
**License**: Private
