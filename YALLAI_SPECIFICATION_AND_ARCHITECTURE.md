# Project Yallai: A Multi-Agent Vibe Coding Workspace on AWS Bedrock

**Date:** April 25, 2026  
**Prepared For:** Sahib App Developer (Admin/Owner)  
**Purpose:** To document the architecture, purpose, and functionality of Yallai — a meta-builder for AI chat applications.

---

## 1. Executive Summary

Yallai is a password-protected, multi-agent vibe coding workspace designed to build, maintain, and develop an AI chat application called Sahib. Yallai runs on Amazon Bedrock (using multiple AI agents in parallel) and is hosted entirely on AWS — funded by $700 in AWS credits. Only the admin (you) uses Yallai. The end product, Sahib, is what 1,000+ real users will interact with.

**In short:**
> Yallai builds Sahib. Sahib serves users.

---

## 2. The Two Applications — Clear Distinction

|  | **Yallai** | **Sahib** |
|--|-----------|---------|
| **What it is** | Multi-agent vibe coding builder | AI chat app for end users |
| **Who uses it** | Only the admin (you) | 1,000+ regular users |
| **Access** | builder.yallai.com with simple password | chat.sahib.com with full user auth (Cognito) |
| **Purpose** | Build, maintain, and deploy Sahib | Provide AI chat + research + deep thinking |
| **Auth method** | HTTP Basic Auth (one shared password) | User signup/login (Cognito/Auth0) |
| **AI backend** | Amazon Bedrock (multi-agent) | Multiple providers (OpenAI, Anthropic, Gemini, Bedrock) via Sahib's backend |

> **Critical:** Users of Sahib never touch Yallai. Yallai is your private development factory.

---

## 3. What Yallai Does (The Builder)

Yallai is not a simple app. It is a production-grade multi-agent workspace modeled after tools like Cursor or Claude's agent workspace, but running on AWS Bedrock with parallel agents.

### Yallai's Core Functions

| Function | How Yallai Achieves It |
|----------|----------------------|
| **Builds Sahib** | Bedrock agents generate code for Sahib's frontend, backend, database, and AI integrations |
| **Maintains Sahib** | Agents monitor logs, suggest fixes, and auto-deploy patches |
| **Develops Sahib** | You chat naturally ("add web search to Sahib") and agents implement it in parallel |
| **Manages deployment** | Yallai pushes updates to Sahib's hosting (Amplify/S3/ECS) with one click |

### The 4 Agents Running in Parallel

| Agent | Role | Example Task |
|-------|------|-------------|
| **Frontend Agent** | React/TypeScript, UI components | Builds chat interface, search bar, settings panel |
| **Backend Agent** | API routes, database logic, providers | Creates /api/chat, integrates OpenAI/Anthropic |
| **Research Agent** | Deep thinking, web search, RAG | Implements research mode, citations, long-term memory |
| **Reviewer Agent** | Code review, security, testing | Checks all code for bugs, performance, and security |

> All 4 agents run simultaneously on every prompt you give Yallai. You see their logs streaming in real time.

---

## 4. Yallai's User Interface (3 Panels)

Yallai has a three-panel layout inspired by Cursor/Claude workspace:

### Panel 1: Chat (Talk to All Agents)
- Natural language prompt input
- Chat history with all agents
- Ability to mention specific agents: `@frontend fix the chat bubbles`
- Each agent maintains its own conversation thread

### Panel 2: Agent Activity (Live Streaming)
- Real-time logs from each agent
- Progress bars for each agent's task
- See what each agent is writing, editing, or reviewing

### Panel 3: Sahib's Code Files (Explorer + Editor)
- Full file tree of Sahib's codebase
- Click to view/edit any file
- Live preview (iframe showing Sahib running)
- All changes saved to S3 instantly

---

## 5. How Yallai Works (AWS Architecture)

### High-Level Flow

1. You type a prompt in Yallai's chat panel
2. API Gateway (with simple password auth) receives it
3. Bedrock Supervisor Agent decomposes the prompt into tasks
4. EventBridge broadcasts tasks to all 4 agents
5. Agents run in parallel — each writing code, files, or tests
6. All agents write to S3 (Sahib's codebase)
7. Panel 3 updates live via WebSocket
8. When done, you click "Deploy" and Sahib updates for all users

### AWS Services Used (Funded by $700 Credits)

| Service | Purpose | Used By |
|---------|---------|---------|
| **Amazon Bedrock** | Multi-agent orchestration + 4 parallel agents | Yallai |
| **Step Functions** | Agent coordination and workflow state | Yallai |
| **EventBridge** | Task broadcasting and agent communication | Yallai |
| **API Gateway + Lambda** | Chat API with simple password auth | Yallai |
| **S3** | Store Sahib's generated code files | Yallai + Sahib |
| **DynamoDB** | Yallai session state, correlation IDs | Yallai |
| **Amplify** | Hosting for Sahib (user-facing app) | Sahib |
| **CloudFront** | CDN for Sahib's static assets | Sahib |
| **RDS / DynamoDB** | User accounts, chat history for 1,000+ users | Sahib |
| **Cognito** | User authentication for Sahib's users | Sahib |

---

## 6. Authentication — Simple but Correct

### Yallai (Admin only)
- **Method:** HTTP Basic Auth
- **Location:** builder.yallai.com
- **Setup:** One password hardcoded in Lambda@Edge or environment variable
- **No:** Cognito, user pools, email verification, password reset, roles, or permissions

### Sahib (1,000+ users)
- **Method:** Full user authentication (Cognito or Auth0)
- **Features:** Signup, login, password reset, session management
- **Scales to:** Thousands of concurrent users

> **Critical:** Do not reuse Yallai's simple password for Sahib's users.

---

## 7. The $700 AWS Credit Strategy

Your credits cover Yallai building Sahib, not Sahib's ongoing user traffic.

| Cost Center | Monthly Estimate | Covered by Credits? |
|-------------|-----------------|-------------------|
| Bedrock (4 agents, 1M tokens/day) | $200–400 | ✅ Yes |
| Step Functions + EventBridge | $35 | ✅ Yes |
| DynamoDB (Yallai state) | $5 | ✅ Yes |
| S3 (code storage) | $2 | ✅ Yes |
| Amplify (Sahib hosting) | $0–20 | ✅ Yes |
| Sahib user database (RDS) | $50–150 | ⚠️ After credits |
| Cognito (1,000 MAU) | $0 (free tier) | ✅ Yes |
| Sahib API usage (OpenAI/etc.) | Variable | ❌ User pays or you allocate |

> **Estimated credit duration:** 6–8 weeks of heavy Yallai usage. After that, only Sahib's operational costs remain.

---

## 8. What Makes Yallai "Vibe Coding"

- **Natural language prompts** — no complex commands
- **Parallel agents** — everything happens simultaneously
- **Full visibility** — see code changes live, agent logs streaming
- **Intervention possible** — stop agents, edit code manually, redirect tasks
- **One-click deployment** — from Yallai directly to Sahib's users

---

## 9. What Yallai Is NOT

| Not This | Because |
|----------|---------|
| A simple chatbot | It has 4 parallel agents, file explorer, live preview |
| Open to users | Only the admin accesses Yallai |
| Using Cognito for auth | Simple password is sufficient for a single admin |
| Hosted on Heroku/Vercel | It's AWS-native (Bedrock, Step Functions, S3) |
| Pay-per-API-call | Bedrock is covered by $700 credits |

---

## 10. Summary of What You (The Admin) Want

1. Yallai = password-protected vibe coding workspace on a subdomain
2. Yallai = 3 panels: Chat + Agent Activity + File Explorer
3. Yallai = 4 Bedrock agents running in parallel (frontend, backend, research, reviewer)
4. Yallai = Builds, maintains, and develops Sahib
5. Sahib = AI chat app for 1,000+ users (like DeepSeek but with tweaks)
6. You = Only user of Yallai
7. $700 AWS credits = Fund Yallai's Bedrock usage
8. Simple password = All Yallai needs for auth
9. No Cognito for Yallai — Cognito is for Sahib's users
10. Deployment = Yallai pushes updates to Sahib instantly

---

## 11. Next Steps (Building Yallai)

With this report as the source of truth, the next development phases are:

1. Set up AWS Amplify + S3 + DynamoDB + password auth
2. Build the 3-panel React frontend (Chat + Agent Activity + File Explorer)
3. Create 4 Bedrock agents (frontend, backend, research, reviewer)
4. Implement Step Functions + EventBridge for parallel orchestration
5. Add WebSocket for real-time agent streaming
6. Build S3 file watcher + live preview
7. One-click deployment from Yallai → Sahib

---

## End of Report

Anyone reading this now understands:  
**Yallai is a multi-agent Bedrock-powered vibe coding workspace that builds and maintains Sahib — an AI chat app for 1,000+ users — while you (the admin) use only a simple password and $700 in AWS credits.**
