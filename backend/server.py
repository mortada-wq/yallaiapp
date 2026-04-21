"""
Yallai backend — FastAPI.
Endpoints:
  - POST /api/chat            streaming chat with Claude Sonnet 4.5 (Emergent LLM key)
  - POST /api/share           save a project snapshot in MongoDB, return id
  - GET  /api/share/{id}      retrieve a saved snapshot
  - GET  /api/health          health check
"""
from __future__ import annotations

import os
import asyncio
from datetime import datetime, timezone
from typing import Any, List, Optional

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
from nanoid import generate as nanoid
from pydantic import BaseModel, Field

# ── config ──────────────────────────────────────────────────────────────────
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
EMERGENT_LLM_KEY = os.environ["EMERGENT_LLM_KEY"]
DEFAULT_LLM_PROVIDER = os.environ.get("DEFAULT_LLM_PROVIDER", "anthropic")
DEFAULT_LLM_MODEL = os.environ.get("DEFAULT_LLM_MODEL", "claude-sonnet-4-5-20250929")

SYSTEM_PROMPT = (
    "You are the Yallai coding assistant. You help the user build working web apps "
    "(HTML/CSS/JS, JSX/React, landing pages, dashboards, UI polish including "
    "glassmorphism, and cloud architecture). Be concise and professional. "
    "Always format code in markdown with a language-tagged fenced block "
    "(```html / ```css / ```javascript / ```jsx) and give a short filename "
    "suggestion (e.g. `index.html`, `styles.css`, `script.js`, `App.jsx`). "
    "Prefer complete, drop-in files over fragments when the user is iterating."
)

# ── mongo ───────────────────────────────────────────────────────────────────
mongo_client = AsyncIOMotorClient(MONGO_URL)
db = mongo_client[DB_NAME]
shares = db["shares"]

# ── app ─────────────────────────────────────────────────────────────────────
app = FastAPI(title="Yallai API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── models ──────────────────────────────────────────────────────────────────
class ChatMessage(BaseModel):
    id: Optional[str] = None
    role: str
    content: str
    timestamp: Optional[str] = None
    isStreaming: Optional[bool] = None


class ChatContext(BaseModel):
    activeFileName: Optional[str] = None
    activeFileContent: Optional[str] = None
    fileTree: Optional[str] = None
    consoleErrors: Optional[str] = None
    selection: Optional[str] = None
    projectInstructions: Optional[str] = None


class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = Field(default_factory=list)
    context: Optional[ChatContext] = None
    provider: Optional[str] = None  # accepted but ignored (always Emergent LLM)
    apiKey: Optional[str] = None
    model: Optional[str] = None


class EditorFile(BaseModel):
    id: str
    name: str
    language: str
    content: str
    isDirty: bool = False


class ShareRequest(BaseModel):
    files: List[EditorFile]
    activeFileId: Optional[str] = None


# ── helpers ─────────────────────────────────────────────────────────────────
def build_context_text(ctx: Optional[ChatContext]) -> str:
    if not ctx:
        return ""
    chunks: list[str] = []
    if ctx.projectInstructions:
        chunks.append(f"## Project Instructions\n{ctx.projectInstructions}\n")
    if ctx.fileTree:
        chunks.append(f"\n## Files\n{ctx.fileTree}")
    if ctx.activeFileName and ctx.activeFileContent:
        chunks.append(
            f"\n## Current file: {ctx.activeFileName}\n"
            f"```\n{ctx.activeFileContent[:24000]}\n```\n"
        )
    if ctx.consoleErrors:
        chunks.append(f"\n## Errors\n{ctx.consoleErrors}")
    if ctx.selection:
        chunks.append(f"\n## Selection\n```\n{ctx.selection}\n```\n")
    return "".join(chunks)


async def generate_reply(
    user_message: str,
    history: List[ChatMessage],
    extra_system: str,
    session_id: str,
) -> str:
    """Single-shot LLM call returning the full assistant reply."""
    from emergentintegrations.llm.chat import LlmChat, UserMessage

    system = SYSTEM_PROMPT + (f"\n\n{extra_system.strip()}" if extra_system.strip() else "")

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=system,
    ).with_model(DEFAULT_LLM_PROVIDER, DEFAULT_LLM_MODEL)

    # Replay conversation history so the model has full multi-turn context.
    for m in history:
        if m.role not in ("user", "assistant"):
            continue
        if m.role == "assistant" and not m.content.strip():
            continue
        if m.role == "user":
            # Resend prior user turns; the library maintains history internally.
            await chat.send_message(UserMessage(text=m.content))
        # assistant turns are implicitly captured after each send_message

    response = await chat.send_message(UserMessage(text=user_message))
    return response if isinstance(response, str) else str(response)


async def stream_chunks(text: str, chunk_size: int = 48):
    """Yield the full text in small chunks so the UI gets a progressive feel."""
    for i in range(0, len(text), chunk_size):
        yield text[i : i + chunk_size]
        # tiny delay so the browser can paint incrementally
        await asyncio.sleep(0.01)


# ── routes ──────────────────────────────────────────────────────────────────
@app.get("/api/health")
async def health() -> dict[str, Any]:
    return {"ok": True, "service": "yallai", "time": datetime.now(timezone.utc).isoformat()}


@app.post("/api/chat")
async def chat(req: ChatRequest, request: Request) -> StreamingResponse:
    message = (req.message or "").strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message is required.")

    extra_system = build_context_text(req.context)
    session_id = (
        request.headers.get("x-session-id")
        or (req.history[0].id if req.history and req.history[0].id else None)
        or nanoid(size=16)
    )

    async def event_generator():
        try:
            reply = await generate_reply(message, req.history, extra_system, session_id)
            if not reply:
                yield "No response. Please try again."
                return
            async for piece in stream_chunks(reply):
                yield piece
        except Exception as e:  # noqa: BLE001
            err = str(e)
            if "401" in err or "credential" in err.lower():
                yield "Authentication error. The Emergent LLM key may be invalid."
            elif "429" in err or "rate" in err.lower() or "throttl" in err.lower():
                yield "Too many requests. Please wait a moment."
            else:
                yield f"Error: {err[:300]}"

    return StreamingResponse(
        event_generator(),
        media_type="text/plain; charset=utf-8",
        headers={"Cache-Control": "no-store", "X-Accel-Buffering": "no"},
    )


@app.post("/api/share")
async def create_share(req: ShareRequest) -> dict[str, Any]:
    if not req.files:
        raise HTTPException(status_code=400, detail="files required")
    share_id = nanoid(size=12)
    doc = {
        "_id": share_id,
        "files": [f.model_dump() for f in req.files],
        "activeFileId": req.activeFileId,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    await shares.insert_one(doc)
    return {"id": share_id, "path": f"/s/{share_id}"}


@app.get("/api/share/{share_id}")
async def get_share(share_id: str) -> dict[str, Any]:
    doc = await shares.find_one({"_id": share_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    return doc


@app.get("/api/")
async def root() -> dict[str, str]:
    return {"service": "yallai", "version": "1.0.0"}
