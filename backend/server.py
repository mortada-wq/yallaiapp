"""
صاحب يلا backend — FastAPI with Neon PostgreSQL + Silicon Flow support.

Public endpoints:
  - POST /api/chat            streaming chat with Claude Sonnet 4.5 or DeepSeek (configurable)
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
import json

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Request, Response, Depends, Cookie, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from nanoid import generate as nanoid
from pydantic import BaseModel, Field
import asyncpg

# ── config ──────────────────────────────────────────────────────────────────
# Database: Support both MongoDB (legacy) and PostgreSQL (Neon)
USE_POSTGRES = os.environ.get("USE_POSTGRES", "true").lower() == "true"
DATABASE_URL = os.environ.get("DATABASE_URL", "")

# MongoDB (legacy support)
MONGO_URL = os.environ.get("MONGO_URL", "")
DB_NAME = os.environ.get("DB_NAME", "sahib_yalla")

# LLM Configuration
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
SILICON_FLOW_API_KEY = os.environ.get("SILICON_FLOW_API_KEY", "")
SILICON_FLOW_BASE_URL = os.environ.get("SILICON_FLOW_BASE_URL", "https://api.siliconflow.cn/v1")

DEFAULT_LLM_PROVIDER = os.environ.get("DEFAULT_LLM_PROVIDER", "anthropic")
DEFAULT_LLM_MODEL = os.environ.get("DEFAULT_LLM_MODEL", "claude-sonnet-4-5-20250929")

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

# ── database setup ──────────────────────────────────────────────────────────
pg_pool: Optional[asyncpg.Pool] = None
mongo_client = None
db = None

if USE_POSTGRES and DATABASE_URL:
    # PostgreSQL (Neon) setup will be done on startup
    pass
else:
    # MongoDB (legacy) setup
    from motor.motor_asyncio import AsyncIOMotorClient
    if MONGO_URL:
        mongo_client = AsyncIOMotorClient(MONGO_URL)
        db = mongo_client[DB_NAME]

# ── app ─────────────────────────────────────────────────────────────────────
app = FastAPI(title="Sahib Yalla API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── startup/shutdown ────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    global pg_pool
    if USE_POSTGRES and DATABASE_URL:
        try:
            pg_pool = await asyncpg.create_pool(
                DATABASE_URL,
                min_size=2,
                max_size=10,
                command_timeout=60
            )
            print("✓ Connected to Neon PostgreSQL")
        except Exception as e:
            print(f"✗ Failed to connect to PostgreSQL: {e}")
            raise


@app.on_event("shutdown")
async def shutdown():
    global pg_pool
    if pg_pool:
        await pg_pool.close()
        print("✓ Closed PostgreSQL connection pool")


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


# ── database helpers ────────────────────────────────────────────────────────
class DatabaseAdapter:
    """Abstract database operations to support both PostgreSQL and MongoDB"""

    @staticmethod
    async def get_settings(key: str) -> Optional[dict]:
        if USE_POSTGRES and pg_pool:
            async with pg_pool.acquire() as conn:
                row = await conn.fetchrow(
                    "SELECT provider, model FROM settings WHERE key = $1",
                    key
                )
                return dict(row) if row else None
        else:
            return await db["settings"].find_one({"_id": key}, {"_id": 0})

    @staticmethod
    async def upsert_settings(key: str, provider: str, model: str):
        if USE_POSTGRES and pg_pool:
            async with pg_pool.acquire() as conn:
                await conn.execute(
                    """
                    INSERT INTO settings (key, provider, model, updated_at)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (key) DO UPDATE
                    SET provider = $2, model = $3, updated_at = $4
                    """,
                    key, provider, model, datetime.now(timezone.utc)
                )
        else:
            await db["settings"].update_one(
                {"_id": key},
                {
                    "$set": {
                        "provider": provider,
                        "model": model,
                        "updated_at": datetime.now(timezone.utc),
                    }
                },
                upsert=True,
            )

    @staticmethod
    async def find_user_by_email(email: str) -> Optional[dict]:
        if USE_POSTGRES and pg_pool:
            async with pg_pool.acquire() as conn:
                row = await conn.fetchrow(
                    "SELECT * FROM users WHERE email = $1",
                    email
                )
                return dict(row) if row else None
        else:
            return await db["users"].find_one({"email": email}, {"_id": 0})

    @staticmethod
    async def find_user_by_id(user_id: str) -> Optional[dict]:
        if USE_POSTGRES and pg_pool:
            async with pg_pool.acquire() as conn:
                row = await conn.fetchrow(
                    "SELECT * FROM users WHERE user_id = $1",
                    user_id
                )
                return dict(row) if row else None
        else:
            return await db["users"].find_one({"user_id": user_id}, {"_id": 0})

    @staticmethod
    async def insert_user(user_data: dict):
        if USE_POSTGRES and pg_pool:
            async with pg_pool.acquire() as conn:
                await conn.execute(
                    """
                    INSERT INTO users (user_id, email, name, picture, is_admin, created_at, last_login_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    """,
                    user_data["user_id"],
                    user_data["email"],
                    user_data.get("name", ""),
                    user_data.get("picture"),
                    user_data.get("is_admin", False),
                    user_data["created_at"],
                    user_data.get("last_login_at")
                )
        else:
            await db["users"].insert_one(user_data)

    @staticmethod
    async def update_user(user_id: str, updates: dict):
        if USE_POSTGRES and pg_pool:
            async with pg_pool.acquire() as conn:
                set_clause = ", ".join([f"{k} = ${i+2}" for i, k in enumerate(updates.keys())])
                query = f"UPDATE users SET {set_clause} WHERE user_id = $1"
                await conn.execute(query, user_id, *updates.values())
        else:
            await db["users"].update_one(
                {"user_id": user_id},
                {"$set": updates}
            )

    @staticmethod
    async def insert_session(session_data: dict):
        if USE_POSTGRES and pg_pool:
            async with pg_pool.acquire() as conn:
                await conn.execute(
                    """
                    INSERT INTO user_sessions (id, user_id, session_token, expires_at, created_at)
                    VALUES ($1, $2, $3, $4, $5)
                    """,
                    session_data["_id"],
                    session_data["user_id"],
                    session_data["session_token"],
                    session_data["expires_at"],
                    session_data["created_at"]
                )
        else:
            await db["user_sessions"].insert_one(session_data)

    @staticmethod
    async def find_session(session_token: str) -> Optional[dict]:
        if USE_POSTGRES and pg_pool:
            async with pg_pool.acquire() as conn:
                row = await conn.fetchrow(
                    "SELECT * FROM user_sessions WHERE session_token = $1",
                    session_token
                )
                return dict(row) if row else None
        else:
            return await db["user_sessions"].find_one({"session_token": session_token}, {"_id": 0})

    @staticmethod
    async def delete_session(session_token: str):
        if USE_POSTGRES and pg_pool:
            async with pg_pool.acquire() as conn:
                await conn.execute(
                    "DELETE FROM user_sessions WHERE session_token = $1",
                    session_token
                )
        else:
            await db["user_sessions"].delete_one({"session_token": session_token})

    @staticmethod
    async def insert_chat_log(log_data: dict):
        if USE_POSTGRES and pg_pool:
            async with pg_pool.acquire() as conn:
                await conn.execute(
                    """
                    INSERT INTO chat_logs (id, user_email, user_id, session_id, message, reply_preview, created_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    """,
                    log_data["_id"],
                    log_data.get("user_email"),
                    log_data.get("user_id"),
                    log_data["session_id"],
                    log_data["message"],
                    log_data.get("reply_preview", ""),
                    log_data["created_at"]
                )
        else:
            await db["chat_logs"].insert_one(log_data)

    @staticmethod
    async def insert_share(share_data: dict):
        if USE_POSTGRES and pg_pool:
            async with pg_pool.acquire() as conn:
                await conn.execute(
                    """
                    INSERT INTO shares (id, files, active_file_id, created_at)
                    VALUES ($1, $2, $3, $4)
                    """,
                    share_data["_id"],
                    json.dumps(share_data["files"]),
                    share_data.get("activeFileId"),
                    share_data.get("createdAt", datetime.now(timezone.utc))
                )
        else:
            await db["shares"].insert_one(share_data)

    @staticmethod
    async def find_share(share_id: str) -> Optional[dict]:
        if USE_POSTGRES and pg_pool:
            async with pg_pool.acquire() as conn:
                row = await conn.fetchrow(
                    "SELECT * FROM shares WHERE id = $1",
                    share_id
                )
                if row:
                    result = dict(row)
                    # Parse JSON files
                    if isinstance(result.get("files"), str):
                        result["files"] = json.loads(result["files"])
                    # Rename fields to match MongoDB format
                    result["activeFileId"] = result.pop("active_file_id", None)
                    result["createdAt"] = result.pop("created_at", None)
                    if isinstance(result["createdAt"], datetime):
                        result["createdAt"] = result["createdAt"].isoformat()
                    return result
                return None
        else:
            return await db["shares"].find_one({"_id": share_id}, {"_id": 0})

    @staticmethod
    async def delete_share(share_id: str) -> int:
        if USE_POSTGRES and pg_pool:
            async with pg_pool.acquire() as conn:
                result = await conn.execute(
                    "DELETE FROM shares WHERE id = $1",
                    share_id
                )
                # Extract count from result like "DELETE 1"
                return int(result.split()[-1]) if result else 0
        else:
            res = await db["shares"].delete_one({"_id": share_id})
            return res.deleted_count


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
    doc = await DatabaseAdapter.get_settings("llm")
    if doc and doc.get("provider") and doc.get("model"):
        return doc["provider"], doc["model"]
    return DEFAULT_LLM_PROVIDER, DEFAULT_LLM_MODEL


async def generate_reply_with_silicon_flow(
    user_message: str,
    history: List[ChatMessage],
    extra_system: str,
    model: str,
) -> str:
    """Generate reply using Silicon Flow API (OpenAI-compatible)"""
    system = SYSTEM_PROMPT + (f"\n\n{extra_system.strip()}" if extra_system.strip() else "")

    messages = [{"role": "system", "content": system}]

    for m in history:
        if m.role not in ("user", "assistant"):
            continue
        if m.role == "assistant" and not m.content.strip():
            continue
        messages.append({"role": m.role, "content": m.content})

    messages.append({"role": "user", "content": user_message})

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{SILICON_FLOW_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {SILICON_FLOW_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": messages,
                "stream": False,
                "max_tokens": 4096,
            }
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Silicon Flow API error: {response.text}"
            )

        data = response.json()
        return data["choices"][0]["message"]["content"]


async def generate_reply(
    user_message: str,
    history: List[ChatMessage],
    extra_system: str,
    session_id: str,
) -> str:
    provider, model = await get_current_model()

    # Use Silicon Flow for deepseek models
    if "deepseek" in model.lower() and SILICON_FLOW_API_KEY:
        return await generate_reply_with_silicon_flow(
            user_message, history, extra_system, model
        )

    # Use Emergent integration for other models
    from emergentintegrations.llm.chat import LlmChat, UserMessage

    system = SYSTEM_PROMPT + (f"\n\n{extra_system.strip()}" if extra_system.strip() else "")

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=system,
    ).with_model(provider, model)

    for m in history:
        if m.role not in ("user", "assistant"):
            continue
        if m.role == "assistant" and not m.content.strip():
            continue
        if m.role == "user":
            await chat.send_message(UserMessage(text=m.content))

    response = await chat.send_message(UserMessage(text=user_message))
    return response if isinstance(response, str) else str(response)


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

    sess = await DatabaseAdapter.find_session(token)
    if not sess:
        return None

    expires_at = sess.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if not expires_at or expires_at < datetime.now(timezone.utc):
        return None

    user_doc = await DatabaseAdapter.find_user_by_id(sess["user_id"])
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
    db_status = "postgresql" if USE_POSTGRES else "mongodb"
    return {
        "ok": True,
        "service": "sahib-yalla",
        "database": db_status,
        "time": datetime.now(timezone.utc).isoformat()
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

    async def event_generator():
        full_reply = ""
        try:
            reply = await generate_reply(message, req.history, extra_system, chat_session_id)
            if not reply:
                yield "No response. Please try again."
                return
            full_reply = reply
            async for piece in stream_chunks(reply):
                yield piece
        except Exception as e:  # noqa: BLE001
            err = str(e)
            if "401" in err or "credential" in err.lower():
                yield "Authentication error. The API key may be invalid."
            elif "429" in err or "rate" in err.lower() or "throttl" in err.lower():
                yield "Too many requests. Please wait a moment."
            else:
                yield f"Error: {err[:300]}"
        finally:
            # audit log
            try:
                await DatabaseAdapter.insert_chat_log({
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
    await DatabaseAdapter.insert_share(doc)
    return {"id": share_id, "path": f"/s/{share_id}"}


@app.get("/api/share/{share_id}")
async def get_share(share_id: str) -> dict[str, Any]:
    doc = await DatabaseAdapter.find_share(share_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    return doc


# ── auth routes ────────────────────────────────────────────────────────────
@app.post("/api/auth/session")
async def exchange_session(req: SessionExchange, response: Response) -> dict[str, Any]:
    """
    Exchange an Emergent Auth `session_id` (from the URL fragment) for our own
    session_token stored in the DB, then set a HttpOnly cookie.
    """
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

    # Upsert user
    existing = await DatabaseAdapter.find_user_by_email(email)
    now = datetime.now(timezone.utc)
    if existing:
        user_id = existing["user_id"]
        await DatabaseAdapter.update_user(
            user_id,
            {
                "name": data.get("name") or existing.get("name", ""),
                "picture": data.get("picture") or existing.get("picture"),
                "is_admin": is_admin,
                "last_login_at": now,
            }
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await DatabaseAdapter.insert_user({
            "user_id": user_id,
            "email": email,
            "name": data.get("name") or "",
            "picture": data.get("picture") or "",
            "is_admin": is_admin,
            "created_at": now,
            "last_login_at": now,
        })

    session_token = data.get("session_token") or uuid.uuid4().hex
    expires_at = now + timedelta(days=SESSION_DAYS)
    await DatabaseAdapter.insert_session({
        "_id": uuid.uuid4().hex,
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at,
        "created_at": now,
    })

    response.set_cookie(
        key="session_token",
        value=session_token,
        max_age=SESSION_DAYS * 24 * 60 * 60,
        httponly=True,
        secure=True,
        samesite="none",
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
        await DatabaseAdapter.delete_session(session_token)
    response.delete_cookie("session_token", path="/")
    return {"ok": True}


# ── admin routes ───────────────────────────────────────────────────────────
@app.get("/api/admin/overview")
async def admin_overview(_: User = Depends(require_admin)) -> dict[str, Any]:
    """Admin overview with database stats - PostgreSQL implementation needed"""
    # TODO: Implement admin overview for PostgreSQL
    return {
        "total_shares": 0,
        "total_chats": 0,
        "last24_chats": 0,
        "last24_shares": 0,
        "distinct_users_7d": 0,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/api/admin/shares")
async def admin_shares(
    limit: int = 50,
    _: User = Depends(require_admin),
) -> dict[str, Any]:
    """List recent shares - PostgreSQL implementation needed"""
    # TODO: Implement shares listing for PostgreSQL
    return {"items": [], "count": 0}


@app.delete("/api/admin/shares/{share_id}")
async def admin_delete_share(share_id: str, _: User = Depends(require_admin)) -> dict[str, bool]:
    deleted_count = await DatabaseAdapter.delete_share(share_id)
    if deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}


@app.get("/api/admin/chat-log")
async def admin_chat_log(
    limit: int = 50,
    _: User = Depends(require_admin),
) -> dict[str, Any]:
    """Get recent chat logs - PostgreSQL implementation needed"""
    # TODO: Implement chat log retrieval for PostgreSQL
    return {"items": [], "count": 0}


@app.get("/api/admin/llm-usage")
async def admin_llm_usage(days: int = 14, _: User = Depends(require_admin)) -> dict[str, Any]:
    """Get LLM usage stats - PostgreSQL implementation needed"""
    # TODO: Implement LLM usage stats for PostgreSQL
    return {"days": days, "buckets": []}


@app.get("/api/admin/settings")
async def admin_get_settings(_: User = Depends(require_admin)) -> dict[str, Any]:
    provider, model = await get_current_model()
    return {"provider": provider, "model": model}


@app.put("/api/admin/settings")
async def admin_put_settings(
    body: LLMSettings,
    _: User = Depends(require_admin),
) -> dict[str, Any]:
    allowed_providers = {"openai", "anthropic", "gemini", "siliconflow"}
    if body.provider not in allowed_providers:
        raise HTTPException(status_code=400, detail=f"provider must be one of {sorted(allowed_providers)}")
    if not body.model.strip():
        raise HTTPException(status_code=400, detail="model required")

    await DatabaseAdapter.upsert_settings("llm", body.provider, body.model.strip())
    return {"provider": body.provider, "model": body.model.strip()}


@app.get("/api/")
async def root() -> dict[str, str]:
    return {"service": "sahib-yalla", "version": "1.0.0"}
