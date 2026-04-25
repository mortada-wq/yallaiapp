"""
صاحب يلا backend — FastAPI.

Public endpoints:
  - POST /api/chat            streaming chat (Anthropic / OpenAI / Gemini / DeepSeek)
  - POST /api/share           save a project snapshot, return id
  - GET  /api/share/{id}      retrieve a saved snapshot
  - GET  /api/health          health check

Auth (Emergent-managed Google):
  - POST /api/auth/session    exchange session_id → session_token + HttpOnly cookie
  - GET  /api/auth/me         current user (401 if not authed)
  - POST /api/auth/logout     revoke session

Admin (gated by email allowlist):
  - GET  /api/admin/overview      totals
  - GET  /api/admin/shares        list/delete snapshots
  - DELETE /api/admin/shares/{id}
  - GET  /api/admin/chat-log      recent chat calls
  - GET  /api/admin/llm-usage     per-day counts
  - GET  /api/admin/settings      default LLM model
  - PUT  /api/admin/settings
"""
from __future__ import annotations

import os
import uuid
import asyncio
import httpx
from datetime import datetime, timezone, timedelta
from typing import Any, List, Optional

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Request, Response, Depends, Cookie, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from nanoid import generate as nanoid
from pydantic import BaseModel, Field

# ── config ──────────────────────────────────────────────────────────────────
MONGO_URL = os.environ.get("MONGO_URL", "mock")
DB_NAME = os.environ.get("DB_NAME", "sahib_yalla")

# LLM keys — provider-specific keys take priority; EMERGENT_LLM_KEY is a fallback
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "") or EMERGENT_LLM_KEY
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "") or EMERGENT_LLM_KEY
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY", "") or EMERGENT_LLM_KEY
DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY", "") or EMERGENT_LLM_KEY

DEFAULT_LLM_PROVIDER = os.environ.get("DEFAULT_LLM_PROVIDER", "anthropic")
DEFAULT_LLM_MODEL = os.environ.get("DEFAULT_LLM_MODEL", "claude-sonnet-4-5-20250929")
COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "true").lower() in ("1", "true", "yes")
_raw_samesite = (os.environ.get("COOKIE_SAMESITE", "none") or "none").lower()
COOKIE_SAMESITE = _raw_samesite if _raw_samesite in ("lax", "strict", "none") else "none"
ADMIN_EMAILS = {
    e.strip().lower()
    for e in os.environ.get("ADMIN_EMAILS", "mortadagzar@gmail.com").split(",")
    if e.strip()
}
EMERGENT_AUTH_SESSION_URL = (
    "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"
)
SESSION_DAYS = 7

SYSTEM_PROMPT = (
    "You are the Sahib Yalla (صاحب يلا) coding assistant. You help the user build "
    "working web apps (HTML/CSS/JS, JSX/React, landing pages, dashboards, UI "
    "polish including glassmorphism, and cloud architecture). Be concise and "
    "professional. Always format code in markdown with a language-tagged fenced "
    "block (```html / ```css / ```javascript / ```jsx) and give a short filename "
    "suggestion (e.g. `index.html`, `styles.css`, `script.js`, `App.jsx`). "
    "Prefer complete, drop-in files over fragments when the user is iterating. "
    "When the user writes in Arabic, reply in Arabic but keep filenames and "
    "code (identifiers, CSS properties, JS keywords) in English."
)

# ── mongo ───────────────────────────────────────────────────────────────────
_USE_MOCK_DB = not MONGO_URL or MONGO_URL in ("mock", "mock://") or MONGO_URL.startswith("mock://")

if _USE_MOCK_DB:
    import warnings
    warnings.warn(
        "MONGO_URL not set or is 'mock' — using in-memory mongomock. Data will not persist.",
        RuntimeWarning,
        stacklevel=2,
    )
    from mongomock_motor import AsyncMongoMockClient  # type: ignore
    mongo_client = AsyncMongoMockClient()
else:
    from motor.motor_asyncio import AsyncIOMotorClient
    mongo_client = AsyncIOMotorClient(MONGO_URL)

db = mongo_client[DB_NAME]
shares = db["shares"]
users = db["users"]
user_sessions = db["user_sessions"]
chat_logs = db["chat_logs"]
settings = db["settings"]

# ── app ─────────────────────────────────────────────────────────────────────
app = FastAPI(title="Sahib Yalla API", version="1.0.0")

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
    provider: Optional[str] = None
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


class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    is_admin: bool = False
    created_at: str


class SessionExchange(BaseModel):
    session_id: str


class LLMSettings(BaseModel):
    provider: str
    model: str


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


async def get_current_model() -> tuple[str, str]:
    doc = await settings.find_one({"_id": "llm"}, {"_id": 0})
    if doc and doc.get("provider") and doc.get("model"):
        return doc["provider"], doc["model"]
    return DEFAULT_LLM_PROVIDER, DEFAULT_LLM_MODEL


_EMERGENT_ALIASES = {
    "bedrock": "anthropic",
}
_SUPPORTED_CLIENT = {"openai", "anthropic", "gemini", "deepseek"}


async def resolve_effective_model(req: ChatRequest) -> tuple[str, str]:
    default_p, default_m = await get_current_model()
    raw_p = (req.provider or "").strip().lower() if req.provider else ""
    raw_m = (req.model or "").strip() if req.model else ""
    if not raw_p or not raw_m:
        return default_p, default_m
    mapped = _EMERGENT_ALIASES.get(raw_p, raw_p)
    if mapped not in _SUPPORTED_CLIENT:
        return default_p, default_m
    return mapped, raw_m


async def generate_reply(
    user_message: str,
    history: List[ChatMessage],
    extra_system: str,
    session_id: str,
    provider: str,
    model: str,
) -> str:
    system = SYSTEM_PROMPT + (f"\n\n{extra_system.strip()}" if extra_system.strip() else "")

    # Build conversation messages from history
    messages: list[dict[str, str]] = []
    for m in history:
        if m.role not in ("user", "assistant"):
            continue
        if not m.content.strip():
            continue
        messages.append({"role": m.role, "content": m.content})
    messages.append({"role": "user", "content": user_message})

    if provider == "anthropic":
        import anthropic  # type: ignore
        api_key = ANTHROPIC_API_KEY
        if not api_key:
            raise ValueError("No ANTHROPIC_API_KEY set. Add it to backend/.env")
        client = anthropic.AsyncAnthropic(api_key=api_key)
        response = await client.messages.create(
            model=model,
            max_tokens=8192,
            system=system,
            messages=messages,  # type: ignore[arg-type]
        )
        return response.content[0].text  # type: ignore[union-attr]

    if provider == "openai":
        import openai  # type: ignore
        api_key = OPENAI_API_KEY
        if not api_key:
            raise ValueError("No OPENAI_API_KEY set. Add it to backend/.env")
        client = openai.AsyncOpenAI(api_key=api_key)
        openai_messages = [{"role": "system", "content": system}] + messages
        resp = await client.chat.completions.create(
            model=model,
            messages=openai_messages,  # type: ignore[arg-type]
        )
        return resp.choices[0].message.content or ""

    if provider == "gemini":
        import google.generativeai as genai  # type: ignore
        api_key = GOOGLE_API_KEY
        if not api_key:
            raise ValueError("No GOOGLE_API_KEY set. Add it to backend/.env")
        genai.configure(api_key=api_key)
        gemini_model = genai.GenerativeModel(model_name=model, system_instruction=system)
        gemini_history = []
        for m in messages[:-1]:
            role = "user" if m["role"] == "user" else "model"
            gemini_history.append({"role": role, "parts": [m["content"]]})
        chat = gemini_model.start_chat(history=gemini_history)
        resp = await chat.send_message_async(user_message)
        return resp.text

    if provider == "deepseek":
        import openai  # type: ignore
        api_key = DEEPSEEK_API_KEY
        if not api_key:
            raise ValueError("No DEEPSEEK_API_KEY set. Add it to backend/.env")
        client = openai.AsyncOpenAI(api_key=api_key, base_url="https://api.deepseek.com/v1")
        openai_messages = [{"role": "system", "content": system}] + messages
        resp = await client.chat.completions.create(
            model=model,
            messages=openai_messages,  # type: ignore[arg-type]
        )
        return resp.choices[0].message.content or ""

    raise ValueError(f"Unsupported provider: {provider!r}")


async def stream_chunks(text: str, chunk_size: int = 48):
    for i in range(0, len(text), chunk_size):
        yield text[i : i + chunk_size]
        await asyncio.sleep(0.01)


# ── auth dependency ────────────────────────────────────────────────────────
async def get_optional_user(
    session_token: Optional[str] = Cookie(default=None),
    authorization: Optional[str] = Header(default=None),
) -> Optional[User]:
    token = session_token
    if not token and authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
    if not token:
        return None

    sess = await user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not sess:
        return None

    expires_at = sess.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if not expires_at or expires_at < datetime.now(timezone.utc):
        return None

    user_doc = await users.find_one({"user_id": sess["user_id"]}, {"_id": 0})
    if not user_doc:
        return None
    created = user_doc.get("created_at")
    if isinstance(created, datetime):
        user_doc["created_at"] = created.isoformat()
    return User(
        user_id=user_doc["user_id"],
        email=user_doc["email"],
        name=user_doc.get("name", ""),
        picture=user_doc.get("picture"),
        is_admin=bool(user_doc.get("is_admin", False)),
        created_at=user_doc.get("created_at") or datetime.now(timezone.utc).isoformat(),
    )


async def require_admin(
    user: Optional[User] = Depends(get_optional_user),
) -> User:
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if user.email.lower() not in ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Access denied")
    return user


# ── public routes ──────────────────────────────────────────────────────────
@app.get("/api/health")
async def health() -> dict[str, Any]:
    return {
        "ok": True,
        "service": "sahib-yalla",
        "time": datetime.now(timezone.utc).isoformat(),
        "db": "mock (in-memory)" if _USE_MOCK_DB else "mongodb",
    }


@app.post("/api/chat")
async def chat_endpoint(
    req: ChatRequest,
    request: Request,
    user: Optional[User] = Depends(get_optional_user),
) -> StreamingResponse:
    message = (req.message or "").strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message is required.")

    extra_system = build_context_text(req.context)
    chat_session_id = (
        request.headers.get("x-session-id")
        or (req.history[0].id if req.history and req.history[0].id else None)
        or nanoid(size=16)
    )

    provider, model = await resolve_effective_model(req)

    async def event_generator():
        full_reply = ""
        try:
            reply = await generate_reply(
                message, req.history, extra_system, chat_session_id, provider, model
            )
            if not reply:
                yield "No response. Please try again."
                return
            full_reply = reply
            async for piece in stream_chunks(reply):
                yield piece
        except Exception as e:  # noqa: BLE001
            err = str(e)
            if "401" in err or "credential" in err.lower() or "api_key" in err.lower():
                yield "Authentication error. Check your API key in backend/.env"
            elif "429" in err or "rate" in err.lower() or "throttl" in err.lower():
                yield "Too many requests. Please wait a moment."
            elif "No ANTHROPIC_API_KEY" in err or "No OPENAI_API_KEY" in err or "No GOOGLE_API_KEY" in err or "No DEEPSEEK_API_KEY" in err:
                yield err
            else:
                yield f"Error: {err[:300]}"
        finally:
            try:
                await chat_logs.insert_one({
                    "_id": uuid.uuid4().hex,
                    "user_email": user.email if user else None,
                    "user_id": user.user_id if user else None,
                    "session_id": chat_session_id,
                    "message": message[:2000],
                    "reply_preview": full_reply[:2000] if full_reply else "",
                    "created_at": datetime.now(timezone.utc),
                })
            except Exception:
                pass

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


# ── auth routes ────────────────────────────────────────────────────────────
@app.post("/api/auth/session")
async def exchange_session(req: SessionExchange, response: Response) -> dict[str, Any]:
    if not req.session_id or len(req.session_id) < 4:
        raise HTTPException(status_code=400, detail="Invalid session_id")

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            r = await client.get(
                EMERGENT_AUTH_SESSION_URL,
                headers={"X-Session-ID": req.session_id},
            )
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"Auth upstream error: {e}") from e

    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Session exchange failed")
    data = r.json()
    email = (data.get("email") or "").strip().lower()
    if not email:
        raise HTTPException(status_code=401, detail="No email on session")

    is_admin = email in ADMIN_EMAILS

    existing = await users.find_one({"email": email}, {"_id": 0})
    now = datetime.now(timezone.utc)
    if existing:
        user_id = existing["user_id"]
        await users.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "name": data.get("name") or existing.get("name", ""),
                    "picture": data.get("picture") or existing.get("picture"),
                    "is_admin": is_admin,
                    "last_login_at": now,
                }
            },
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await users.insert_one(
            {
                "user_id": user_id,
                "email": email,
                "name": data.get("name") or "",
                "picture": data.get("picture") or "",
                "is_admin": is_admin,
                "created_at": now,
                "last_login_at": now,
            }
        )

    session_token = data.get("session_token") or uuid.uuid4().hex
    expires_at = now + timedelta(days=SESSION_DAYS)
    await user_sessions.insert_one(
        {
            "_id": uuid.uuid4().hex,
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": expires_at,
            "created_at": now,
        }
    )

    response.set_cookie(
        key="session_token",
        value=session_token,
        max_age=SESSION_DAYS * 24 * 60 * 60,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        path="/",
    )

    return {
        "user": {
            "user_id": user_id,
            "email": email,
            "name": data.get("name") or "",
            "picture": data.get("picture") or "",
            "is_admin": is_admin,
        }
    }


@app.get("/api/auth/me")
async def auth_me(user: Optional[User] = Depends(get_optional_user)) -> dict[str, Any]:
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user.model_dump()


@app.post("/api/auth/logout")
async def logout(
    response: Response,
    session_token: Optional[str] = Cookie(default=None),
) -> dict[str, bool]:
    if session_token:
        await user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie("session_token", path="/", secure=COOKIE_SECURE, samesite=COOKIE_SAMESITE)
    return {"ok": True}


# ── admin routes ───────────────────────────────────────────────────────────
@app.get("/api/admin/overview")
async def admin_overview(_: User = Depends(require_admin)) -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    day_ago = now - timedelta(hours=24)
    total_shares = await shares.count_documents({})
    total_chats = await chat_logs.count_documents({})
    last24_chats = await chat_logs.count_documents({"created_at": {"$gte": day_ago}})
    last24_shares = await chat_logs.count_documents({"created_at": {"$gte": day_ago}})
    seven_days = now - timedelta(days=7)
    cursor = chat_logs.aggregate([
        {"$match": {"created_at": {"$gte": seven_days}, "user_email": {"$ne": None}}},
        {"$group": {"_id": "$user_email"}},
        {"$count": "count"},
    ])
    distinct_users_7d = 0
    async for doc in cursor:
        distinct_users_7d = int(doc.get("count", 0))
    return {
        "total_shares": total_shares,
        "total_chats": total_chats,
        "last24_chats": last24_chats,
        "last24_shares": last24_shares,
        "distinct_users_7d": distinct_users_7d,
        "generated_at": now.isoformat(),
    }


@app.get("/api/admin/shares")
async def admin_shares(
    limit: int = 50,
    _: User = Depends(require_admin),
) -> dict[str, Any]:
    limit = max(1, min(limit, 200))
    cursor = shares.find({}, {"_id": 1, "files": 1, "createdAt": 1}).sort("createdAt", -1).limit(limit)
    items: list[dict[str, Any]] = []
    async for doc in cursor:
        files_list = doc.get("files") or []
        items.append(
            {
                "id": doc["_id"],
                "file_count": len(files_list),
                "primary_file": (files_list[0].get("name") if files_list else None),
                "createdAt": doc.get("createdAt"),
            }
        )
    return {"items": items, "count": len(items)}


@app.delete("/api/admin/shares/{share_id}")
async def admin_delete_share(share_id: str, _: User = Depends(require_admin)) -> dict[str, bool]:
    res = await shares.delete_one({"_id": share_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}


@app.get("/api/admin/chat-log")
async def admin_chat_log(
    limit: int = 50,
    _: User = Depends(require_admin),
) -> dict[str, Any]:
    limit = max(1, min(limit, 200))
    cursor = chat_logs.find({}, {"_id": 0}).sort("created_at", -1).limit(limit)
    items: list[dict[str, Any]] = []
    async for doc in cursor:
        ts = doc.get("created_at")
        if isinstance(ts, datetime):
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)
            doc["created_at"] = ts.isoformat()
        items.append(doc)
    return {"items": items, "count": len(items)}


@app.get("/api/admin/llm-usage")
async def admin_llm_usage(days: int = 14, _: User = Depends(require_admin)) -> dict[str, Any]:
    days = max(1, min(days, 60))
    since = datetime.now(timezone.utc) - timedelta(days=days)
    cursor = chat_logs.aggregate([
        {"$match": {"created_at": {"$gte": since}}},
        {
            "$group": {
                "_id": {
                    "$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}
                },
                "count": {"$sum": 1},
            }
        },
        {"$sort": {"_id": 1}},
    ])
    buckets: list[dict[str, Any]] = []
    async for doc in cursor:
        buckets.append({"date": doc["_id"], "count": int(doc.get("count", 0))})
    return {"days": days, "buckets": buckets}


@app.get("/api/admin/settings")
async def admin_get_settings(_: User = Depends(require_admin)) -> dict[str, Any]:
    provider, model = await get_current_model()
    return {"provider": provider, "model": model}


@app.put("/api/admin/settings")
async def admin_put_settings(
    body: LLMSettings,
    _: User = Depends(require_admin),
) -> dict[str, Any]:
    allowed_providers = {"openai", "anthropic", "gemini", "deepseek"}
    if body.provider not in allowed_providers:
        raise HTTPException(status_code=400, detail=f"provider must be one of {sorted(allowed_providers)}")
    if not body.model.strip():
        raise HTTPException(status_code=400, detail="model required")
    await settings.update_one(
        {"_id": "llm"},
        {
            "$set": {
                "provider": body.provider,
                "model": body.model.strip(),
                "updated_at": datetime.now(timezone.utc),
            }
        },
        upsert=True,
    )
    return {"provider": body.provider, "model": body.model.strip()}


@app.get("/api/")
async def root() -> dict[str, str]:
    return {"service": "sahib-yalla", "version": "1.0.0"}
