# YALLAI BUILD TASK PLAN
## Convert Current Build → Full Yallai (Multi-Agent Vibe Coding Workspace)

**Source of Truth:** `YALLAI_SPECIFICATION_AND_ARCHITECTURE.md`  
**Goal:** Transform the current Next.js sahib.chat studio app into **Yallai** — a password-protected, 3-panel, multi-agent vibe coding workspace on AWS Bedrock that builds and deploys **Sahib** (the end-user AI chat app).

**Status Key:** 🔴 Not Started | 🟡 In Progress | 🟢 Complete

---

## PHASE 0 — Understand Current State

> Before writing a single line of code, fully audit what exists.

- [ ] 🔴 Read `ARCHITECTURE.md` — understand the current single-agent Next.js app
- [ ] 🔴 Read `YALLAI_SPECIFICATION_AND_ARCHITECTURE.md` — understand the target
- [ ] 🔴 Map every current component to: (a) keep as-is, (b) repurpose, or (c) delete
- [ ] 🔴 Identify what currently exists that maps to Yallai's 3 panels:
  - Panel 1 (Chat) → current `ChatPanel.tsx` — **repurpose**
  - Panel 2 (Agent Activity) → **does not exist** — build from scratch
  - Panel 3 (File Explorer + Editor + Live Preview) → current `EditorPanel.tsx` + `Sidebar.tsx` + `PreviewFrame.tsx` — **repurpose**
- [ ] 🔴 Confirm current AWS Bedrock integration (`lib/bedrock.ts`) and what must change for multi-agent support

---

## PHASE 1 — AWS Infrastructure Setup

> All AWS services must be provisioned before the UI can connect to them.

### 1A — S3 (Sahib's Codebase Storage)
- [ ] 🔴 Create an S3 bucket: `sahib-codebase` (stores all of Sahib's generated source files)
- [ ] 🔴 Enable versioning on the bucket (for file history / rollback)
- [ ] 🔴 Configure CORS so Yallai's frontend can read/write files directly (or via Lambda)
- [ ] 🔴 Set up S3 event notifications → triggers when agents write new files (feeds Panel 3 live updates)

### 1B — DynamoDB (Yallai Session State)
- [ ] 🔴 Create table: `yallai-sessions` (stores prompt history, correlation IDs, agent task states)
- [ ] 🔴 Schema: `{ sessionId (PK), timestamp (SK), agentId, status, taskPayload, result }`
- [ ] 🔴 TTL on records: 7 days

### 1C — Amazon Bedrock — 4 Agent Setup
- [ ] 🔴 Confirm Bedrock access in AWS account (Claude 3.5 Sonnet + multi-agent APIs)
- [ ] 🔴 Create **Bedrock Supervisor Agent** — receives user prompt, decomposes into sub-tasks
- [ ] 🔴 Create **Frontend Agent** — specializes in React/TypeScript/UI code generation for Sahib
- [ ] 🔴 Create **Backend Agent** — specializes in API routes, database logic, AI provider integrations
- [ ] 🔴 Create **Research Agent** — specializes in deep thinking, web search, RAG, citations
- [ ] 🔴 Create **Reviewer Agent** — specializes in code review, security checks, testing
- [ ] 🔴 Write system prompts for each agent (each agent knows its role and knows it's building Sahib)
- [ ] 🔴 Configure agent knowledge bases (link to Sahib's architecture docs as context)

### 1D — Step Functions (Agent Orchestration)
- [ ] 🔴 Create Step Functions state machine: `YallaiOrchestrator`
- [ ] 🔴 Flow: receive prompt → invoke Supervisor → fan-out to 4 agents (parallel Map state) → collect results → write to S3 → notify frontend via WebSocket
- [ ] 🔴 Handle agent timeouts and partial failures gracefully

### 1E — EventBridge (Task Broadcasting)
- [ ] 🔴 Create EventBridge event bus: `yallai-agent-bus`
- [ ] 🔴 Rules: route agent task events to correct Lambda handlers
- [ ] 🔴 Dead-letter queue for failed events

### 1F — API Gateway + Lambda (Yallai's Chat API)
- [ ] 🔴 Create REST API: `YallaiChatAPI`
- [ ] 🔴 **Password auth:** Add Lambda@Edge authorizer — checks `Authorization: Basic <base64(admin:PASSWORD)>` header. Return 401 if wrong.
- [ ] 🔴 `POST /chat` → triggers Step Functions orchestrator
- [ ] 🔴 `GET /files` → reads file tree from S3
- [ ] 🔴 `GET /files/{key}` → reads file content from S3
- [ ] 🔴 `PUT /files/{key}` → admin writes/edits file in S3 directly
- [ ] 🔴 `POST /deploy` → triggers Sahib deployment pipeline (Amplify rebuild)

### 1G — WebSocket API (Real-Time Agent Streaming)
- [ ] 🔴 Create WebSocket API: `YallaiAgentStream`
- [ ] 🔴 Lambda handler: manage `$connect`, `$disconnect`, `$default` routes
- [ ] 🔴 DynamoDB table: `yallai-connections` (maps connectionId → sessionId)
- [ ] 🔴 When agents produce output, Lambda posts to WebSocket → Panel 2 updates live

### 1H — Amplify (Sahib Hosting + Deployment)
- [ ] 🔴 Set up AWS Amplify app pointing to Sahib's codebase in S3/GitHub
- [ ] 🔴 Configure build pipeline: when Yallai's "Deploy" button is clicked → Amplify rebuild triggered
- [ ] 🔴 Custom domain: `chat.sahib.com`
- [ ] 🔴 Separate from Yallai's domain: `builder.yallai.com`

---

## PHASE 2 — Yallai Frontend (3-Panel UI)

> Build the Yallai workspace UI. This replaces/heavily modifies the current single-panel studio.

### 2A — Root Layout Restructure
- [ ] 🔴 Replace `StudioChrome.tsx` with `YallaiWorkspace.tsx` — new 3-panel root shell
- [ ] 🔴 Layout: `[Panel 1: Chat | Panel 2: Agent Activity | Panel 3: File Explorer + Editor + Preview]`
- [ ] 🔴 All panels resizable (use `react-split` or CSS grid with drag handles)
- [ ] 🔴 Yallai branding: rename all "Sahibo Studio" references to "Yallai"
- [ ] 🔴 Header: show "Yallai" logo, connection status (WebSocket), Deploy button, password-protected indicator

### 2B — Panel 1: Chat (Repurpose `ChatPanel.tsx`)
- [ ] 🔴 Keep the existing chat UI skeleton (message bubbles, input bar)
- [ ] 🔴 Remove single-agent assumptions — each message must show which agent responded
- [ ] 🔴 Add `@mention` support: `@frontend`, `@backend`, `@research`, `@reviewer` to direct prompts
- [ ] 🔴 Update API calls: `POST /chat` → Yallai's new API Gateway (not current `/api/chat`)
- [ ] 🔴 Add Basic Auth header to all API calls (password from env variable or settings)
- [ ] 🔴 Show a "4 agents working..." indicator while Step Functions runs
- [ ] 🔴 Stream partial agent outputs into the chat as they arrive via WebSocket

### 2C — Panel 2: Agent Activity (Build from Scratch)
- [ ] 🔴 Create `AgentActivityPanel.tsx`
- [ ] 🔴 Show 4 agent cards: Frontend | Backend | Research | Reviewer
- [ ] 🔴 Each card has:
  - Agent name + icon
  - Status badge: Idle / Thinking / Writing / Done / Error
  - Progress bar (animated while active)
  - Live log feed (streaming text from WebSocket, most recent lines visible)
  - Expand/collapse log history
- [ ] 🔴 Connect to WebSocket API — update agent cards in real time as events arrive
- [ ] 🔴 Color-code each agent (e.g., Frontend = blue, Backend = green, Research = purple, Reviewer = orange)

### 2D — Panel 3: File Explorer + Editor + Preview (Repurpose existing components)
- [ ] 🔴 Replace virtual in-memory filesystem with S3-backed filesystem
  - File tree: `GET /files` from Yallai API → renders Sahib's real S3 codebase
  - File content: `GET /files/{key}` on click
  - File save: `PUT /files/{key}` on Ctrl+S or auto-save
- [ ] 🔴 Keep Monaco Editor (`MonacoEditor.tsx`) — no changes needed
- [ ] 🔴 Keep `PreviewFrame.tsx` for live preview — but point it at Sahib's deployed Amplify URL (not the local transpiler)
  - Or: show iframe of `https://chat.sahib.com` (live Sahib)
  - Or: show a local preview of the specific file being edited (keep existing Babel pipeline for HTML/CSS/JS files)
- [ ] 🔴 Keep `FileTabs.tsx` — minimal changes
- [ ] 🔴 Remove `ExportModal.tsx` — not needed (files are already in S3)
- [ ] 🔴 Remove `TemplateModal.tsx` — not needed (agents generate code, not templates)
- [ ] 🔴 Remove `ShareModal.tsx` / share feature — not needed
- [ ] 🔴 Add **Deploy Button** in Panel 3 header → calls `POST /deploy` → triggers Amplify rebuild → shows progress toast

### 2E — State Management Updates (`lib/store.ts`)
- [ ] 🔴 Remove `localStorage` persistence for files (files now live in S3)
- [ ] 🔴 Keep `localStorage` persistence for UI state only (panel sizes, active file, theme)
- [ ] 🔴 Add WebSocket connection state: `wsConnected`, `wsUrl`
- [ ] 🔴 Add agent state: `agents: { frontend, backend, research, reviewer }` each with `{ status, logs, progress }`
- [ ] 🔴 Add S3 file cache: `s3Files: { [key]: { content, lastModified } }` with cache invalidation

### 2F — Password Auth in Frontend
- [ ] 🔴 On app load: if no password stored → show simple password prompt modal
- [ ] 🔴 Store password in `sessionStorage` (not localStorage — clears on tab close)
- [ ] 🔴 Attach password as `Authorization: Basic` header on all API calls
- [ ] 🔴 If API returns 401 → clear stored password → show password prompt again

---

## PHASE 3 — Backend API Layer (Next.js → AWS Lambda)

> The current Next.js API routes (`/api/chat`, `/api/share`) must be replaced or extended with AWS Lambda functions behind API Gateway.

### 3A — Replace `/api/chat`
- [ ] 🔴 Current: single Bedrock call (Claude 3.5 Sonnet streaming)
- [ ] 🔴 New: call API Gateway → Lambda → Step Functions → 4 parallel Bedrock agents
- [ ] 🔴 Remove the old `app/api/chat/route.ts` or keep as a fallback development stub

### 3B — Remove `/api/share`
- [ ] 🔴 Delete `app/api/share/route.ts` and `app/api/share/[id]/route.ts`
- [ ] 🔴 Delete `lib/shareStore.ts`
- [ ] 🔴 Remove all share UI references

### 3C — New Lambda Functions
- [ ] 🔴 `lambda/auth-authorizer.js` — Lambda@Edge for Basic Auth password check
- [ ] 🔴 `lambda/chat-handler.js` — receives prompt, starts Step Functions execution
- [ ] 🔴 `lambda/files-handler.js` — CRUD operations on S3 (list, read, write files)
- [ ] 🔴 `lambda/deploy-handler.js` — triggers Amplify build via AWS SDK
- [ ] 🔴 `lambda/websocket-connect.js` — handles WebSocket $connect, stores connectionId in DynamoDB
- [ ] 🔴 `lambda/websocket-disconnect.js` — removes connectionId from DynamoDB
- [ ] 🔴 `lambda/agent-notifier.js` — receives agent output events, posts to WebSocket connections

### 3D — Step Functions State Machine Definition
- [ ] 🔴 Write `infrastructure/orchestrator.asl.json` (Amazon States Language)
- [ ] 🔴 States: ReceivePrompt → SupervisorDecompose → ParallelAgents (Map) → AggregateResults → WriteToS3 → NotifyFrontend
- [ ] 🔴 Error handling: Catch + Retry on Bedrock throttling

---

## PHASE 4 — Infrastructure as Code (IaC)

> All AWS resources should be defined in code, not clicked through the console.

- [ ] 🔴 Choose IaC tool: **AWS CDK (TypeScript)** recommended (fits the Node.js stack)
- [ ] 🔴 Create `/infrastructure` directory
- [ ] 🔴 CDK stack: `YallaiStack` — provisions all Phase 1 resources
- [ ] 🔴 CDK stack: `SahibStack` — provisions Sahib's Amplify app, Cognito, RDS/DynamoDB
- [ ] 🔴 Environment variables: use AWS Secrets Manager for the Yallai admin password
- [ ] 🔴 CDK deploy command documented in README

---

## PHASE 5 — Sahib (The Product Being Built)

> Sahib is what Yallai builds. It is a separate app for 1,000+ users.

- [ ] 🔴 Create a **separate repository** for Sahib's source code: `sahib-app`
  - Or: create a `/sahib` subdirectory in this repo (simpler for now)
- [ ] 🔴 Sahib's tech stack (to be generated by Yallai's agents):
  - Frontend: React/Next.js, hosted on Amplify
  - Backend: API routes (chat, auth, search, history)
  - Auth: Cognito user pools (signup, login, password reset)
  - Database: DynamoDB (chat history) + optional RDS (user profiles)
  - AI providers: OpenAI, Anthropic, Gemini, AWS Bedrock (selectable per chat)
- [ ] 🔴 Sahib's features (agents will build these iteratively via Yallai):
  - [ ] 🔴 Chat interface (like ChatGPT/DeepSeek)
  - [ ] 🔴 Model selector (choose AI provider per conversation)
  - [ ] 🔴 Research mode (deep thinking + web search + citations)
  - [ ] 🔴 Long-term memory (RAG from past conversations)
  - [ ] 🔴 User accounts (Cognito: signup, login, session)
  - [ ] 🔴 Chat history (DynamoDB, per user)
  - [ ] 🔴 Subscription/billing (if monetizing)

---

## PHASE 6 — Testing & Validation

- [ ] 🔴 Test password auth: wrong password → 401, correct password → access
- [ ] 🔴 Test single agent prompt → all 4 agents activate → Panel 2 shows live logs
- [ ] 🔴 Test `@frontend` mention → only Frontend Agent responds
- [ ] 🔴 Test file write: agent writes file → Panel 3 file tree updates live
- [ ] 🔴 Test manual file edit → Ctrl+S → saved to S3
- [ ] 🔴 Test Deploy button → Amplify rebuild triggered → Sahib updates
- [ ] 🔴 Test WebSocket reconnect on disconnect
- [ ] 🔴 Cost check: verify Bedrock usage is within $700 credit budget

---

## PHASE 7 — Domains & Deployment

- [ ] 🔴 Register / configure `builder.yallai.com` → points to Yallai (API Gateway + CloudFront + Amplify)
- [ ] 🔴 Register / configure `chat.sahib.com` → points to Sahib (Amplify hosting)
- [ ] 🔴 SSL certificates via AWS Certificate Manager (ACM) for both domains
- [ ] 🔴 CloudFront distribution for Yallai's static frontend assets

---

## Mapping: Current Files → Yallai Destination

| Current File | Action | Reason |
|-------------|--------|--------|
| `components/StudioChrome.tsx` | 🔄 Replace with `YallaiWorkspace.tsx` | Full layout restructure |
| `components/StudioWorkspace.tsx` | 🗑️ Delete | Replaced by 3-panel layout |
| `components/ChatPanel.tsx` | 🔄 Repurpose (Panel 1) | Multi-agent + auth updates |
| `components/EditorPanel.tsx` | 🔄 Repurpose (Panel 3) | S3 filesystem integration |
| `components/Sidebar.tsx` | 🔄 Repurpose (Panel 3 file tree) | S3-backed file list |
| `components/PreviewFrame.tsx` | 🔄 Repurpose (Panel 3 preview) | Point at Sahib URL |
| `components/MonacoEditor.tsx` | ✅ Keep as-is | No changes needed |
| `components/FileTabs.tsx` | ✅ Keep as-is | Minor updates |
| `components/AiToolbar.tsx` | 🔄 Repurpose | Update for multi-agent context |
| `components/MessageBubble.tsx` | 🔄 Update | Show agent name per message |
| `components/CodeBlock.tsx` | ✅ Keep as-is | No changes needed |
| `components/ExportModal.tsx` | 🗑️ Delete | Files in S3, no export needed |
| `components/TemplateModal.tsx` | 🗑️ Delete | Agents generate code |
| `components/SettingsModal.tsx` | 🔄 Update | Add Yallai password field, AWS config |
| `components/CommandPalette.tsx` | 🔄 Update | Yallai-specific commands |
| `components/TourOverlay.tsx` | 🗑️ Delete or rewrite | Yallai onboarding instead |
| `lib/store.ts` | 🔄 Major update | Remove local FS, add agent state |
| `lib/bedrock.ts` | 🔄 Update | Multi-agent calls |
| `lib/shareStore.ts` | 🗑️ Delete | Not needed |
| `lib/rateLimit.ts` | ✅ Keep | Still relevant |
| `app/api/chat/route.ts` | 🔄 Update | Proxy to API Gateway |
| `app/api/share/route.ts` | 🗑️ Delete | Not needed |
| `app/api/share/[id]/route.ts` | 🗑️ Delete | Not needed |
| `app/s/[id]/page.tsx` | 🗑️ Delete | Not needed |
| `ARCHITECTURE.md` | 🔄 Update | Reflect Yallai architecture |
| **NEW:** `components/AgentActivityPanel.tsx` | ✨ Create | Panel 2 — agent logs |
| **NEW:** `components/YallaiWorkspace.tsx` | ✨ Create | Root 3-panel layout |
| **NEW:** `components/DeployButton.tsx` | ✨ Create | One-click Sahib deployment |
| **NEW:** `components/PasswordPrompt.tsx` | ✨ Create | Admin password gate |
| **NEW:** `lib/websocket.ts` | ✨ Create | WebSocket client + reconnect |
| **NEW:** `lib/s3Client.ts` | ✨ Create | S3 file read/write via API |
| **NEW:** `infrastructure/` | ✨ Create | AWS CDK stacks |
| **NEW:** `lambda/` | ✨ Create | All Lambda function handlers |

---

## Environment Variables Required

```env
# Yallai Admin Password (HTTP Basic Auth)
YALLAI_ADMIN_PASSWORD=your_secure_password_here

# AWS
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1

# Bedrock
BEDROCK_SUPERVISOR_AGENT_ID=...
BEDROCK_SUPERVISOR_AGENT_ALIAS_ID=...
BEDROCK_FRONTEND_AGENT_ID=...
BEDROCK_BACKEND_AGENT_ID=...
BEDROCK_RESEARCH_AGENT_ID=...
BEDROCK_REVIEWER_AGENT_ID=...

# AWS Resources
S3_SAHIB_CODEBASE_BUCKET=sahib-codebase
DYNAMODB_SESSIONS_TABLE=yallai-sessions
DYNAMODB_CONNECTIONS_TABLE=yallai-connections
STEP_FUNCTIONS_ARN=arn:aws:states:...
WEBSOCKET_API_URL=wss://...execute-api...amazonaws.com/prod
AMPLIFY_APP_ID=...
AMPLIFY_BRANCH_NAME=main

# Domains
NEXT_PUBLIC_YALLAI_URL=https://builder.yallai.com
NEXT_PUBLIC_SAHIB_URL=https://chat.sahib.com
```

---

## Build Order (Recommended Sequence)

```
Phase 0 → Audit current code (1 session)
Phase 1A-B → S3 + DynamoDB setup (1 session)
Phase 1C → Bedrock 4 agents + system prompts (2 sessions)
Phase 1D-E → Step Functions + EventBridge (1 session)
Phase 1F-G → API Gateway + WebSocket API (1 session)
Phase 1H → Amplify (Sahib) setup (1 session)
Phase 2A → Root layout restructure (1 session)
Phase 2B → Panel 1 Chat update (1 session)
Phase 2C → Panel 2 Agent Activity (new build) (1-2 sessions)
Phase 2D → Panel 3 S3 integration (1-2 sessions)
Phase 2E-F → State + auth updates (1 session)
Phase 3 → Lambda functions (2 sessions)
Phase 4 → CDK IaC (1-2 sessions)
Phase 5 → Sahib scaffold (ongoing — agents build it)
Phase 6 → Testing (1 session)
Phase 7 → Domains + final deploy (1 session)
```

---

*This task file is the single source of truth for converting the current build into Yallai. Work through phases in order. Do not skip infrastructure phases before building the frontend.*

**Last Updated:** April 26, 2026  
**Status:** 🔴 Not Started — Awaiting "start coding" instruction
