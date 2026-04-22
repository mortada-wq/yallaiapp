#!/usr/bin/env python3
"""
MongoDB to Neon PostgreSQL Migration Script

Usage:
    python migrate_mongo_to_neon.py

Prerequisites:
    1. Set MONGO_URL and DB_NAME in .env for source database
    2. Set DATABASE_URL in .env for target Neon database
    3. Run schema.sql on Neon database first
    4. Install dependencies: pip install motor asyncpg python-dotenv
"""
import asyncio
import os
import json
from datetime import datetime, timezone
from typing import Any

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import asyncpg

load_dotenv()

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
DATABASE_URL = os.environ["DATABASE_URL"]


async def migrate():
    """Migrate data from MongoDB to Neon PostgreSQL"""
    print("🔄 Starting migration from MongoDB to Neon PostgreSQL...")

    # Connect to MongoDB
    print("\n📊 Connecting to MongoDB...")
    mongo_client = AsyncIOMotorClient(MONGO_URL)
    db = mongo_client[DB_NAME]

    # Connect to PostgreSQL
    print("📊 Connecting to Neon PostgreSQL...")
    pg_pool = await asyncpg.create_pool(DATABASE_URL, min_size=2, max_size=10)

    try:
        # Migrate users
        print("\n👥 Migrating users...")
        users_count = 0
        async for user in db["users"].find({}):
            try:
                created_at = user.get("created_at")
                if isinstance(created_at, str):
                    created_at = datetime.fromisoformat(created_at)
                elif not isinstance(created_at, datetime):
                    created_at = datetime.now(timezone.utc)

                last_login = user.get("last_login_at")
                if isinstance(last_login, str):
                    last_login = datetime.fromisoformat(last_login)

                async with pg_pool.acquire() as conn:
                    await conn.execute(
                        """
                        INSERT INTO users (user_id, email, name, picture, is_admin, created_at, last_login_at)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                        ON CONFLICT (user_id) DO UPDATE
                        SET email = $2, name = $3, picture = $4, is_admin = $5, last_login_at = $7
                        """,
                        user["user_id"],
                        user["email"],
                        user.get("name", ""),
                        user.get("picture"),
                        user.get("is_admin", False),
                        created_at,
                        last_login
                    )
                users_count += 1
            except Exception as e:
                print(f"  ⚠️  Failed to migrate user {user.get('user_id')}: {e}")

        print(f"  ✓ Migrated {users_count} users")

        # Migrate user sessions
        print("\n🔑 Migrating user sessions...")
        sessions_count = 0
        async for session in db["user_sessions"].find({}):
            try:
                expires_at = session.get("expires_at")
                if isinstance(expires_at, str):
                    expires_at = datetime.fromisoformat(expires_at)

                created_at = session.get("created_at")
                if isinstance(created_at, str):
                    created_at = datetime.fromisoformat(created_at)

                async with pg_pool.acquire() as conn:
                    await conn.execute(
                        """
                        INSERT INTO user_sessions (id, user_id, session_token, expires_at, created_at)
                        VALUES ($1, $2, $3, $4, $5)
                        ON CONFLICT (id) DO NOTHING
                        """,
                        session["_id"],
                        session["user_id"],
                        session["session_token"],
                        expires_at,
                        created_at
                    )
                sessions_count += 1
            except Exception as e:
                print(f"  ⚠️  Failed to migrate session {session.get('_id')}: {e}")

        print(f"  ✓ Migrated {sessions_count} sessions")

        # Migrate shares
        print("\n📦 Migrating shares...")
        shares_count = 0
        async for share in db["shares"].find({}):
            try:
                created_at = share.get("createdAt")
                if isinstance(created_at, str):
                    created_at = datetime.fromisoformat(created_at)
                elif not isinstance(created_at, datetime):
                    created_at = datetime.now(timezone.utc)

                files_json = json.dumps(share.get("files", []))

                async with pg_pool.acquire() as conn:
                    await conn.execute(
                        """
                        INSERT INTO shares (id, files, active_file_id, created_at)
                        VALUES ($1, $2, $3, $4)
                        ON CONFLICT (id) DO NOTHING
                        """,
                        share["_id"],
                        files_json,
                        share.get("activeFileId"),
                        created_at
                    )
                shares_count += 1
            except Exception as e:
                print(f"  ⚠️  Failed to migrate share {share.get('_id')}: {e}")

        print(f"  ✓ Migrated {shares_count} shares")

        # Migrate chat logs
        print("\n💬 Migrating chat logs...")
        logs_count = 0
        async for log in db["chat_logs"].find({}):
            try:
                created_at = log.get("created_at")
                if isinstance(created_at, str):
                    created_at = datetime.fromisoformat(created_at)
                elif not isinstance(created_at, datetime):
                    created_at = datetime.now(timezone.utc)

                async with pg_pool.acquire() as conn:
                    await conn.execute(
                        """
                        INSERT INTO chat_logs (id, user_email, user_id, session_id, message, reply_preview, created_at)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                        ON CONFLICT (id) DO NOTHING
                        """,
                        log["_id"],
                        log.get("user_email"),
                        log.get("user_id"),
                        log.get("session_id"),
                        log.get("message", "")[:2000],
                        log.get("reply_preview", "")[:2000],
                        created_at
                    )
                logs_count += 1
            except Exception as e:
                print(f"  ⚠️  Failed to migrate chat log {log.get('_id')}: {e}")

        print(f"  ✓ Migrated {logs_count} chat logs")

        # Migrate settings
        print("\n⚙️  Migrating settings...")
        settings_count = 0
        async for setting in db["settings"].find({}):
            try:
                updated_at = setting.get("updated_at")
                if isinstance(updated_at, str):
                    updated_at = datetime.fromisoformat(updated_at)
                elif not isinstance(updated_at, datetime):
                    updated_at = datetime.now(timezone.utc)

                async with pg_pool.acquire() as conn:
                    await conn.execute(
                        """
                        INSERT INTO settings (key, provider, model, updated_at)
                        VALUES ($1, $2, $3, $4)
                        ON CONFLICT (key) DO UPDATE
                        SET provider = $2, model = $3, updated_at = $4
                        """,
                        setting["_id"],
                        setting.get("provider"),
                        setting.get("model"),
                        updated_at
                    )
                settings_count += 1
            except Exception as e:
                print(f"  ⚠️  Failed to migrate setting {setting.get('_id')}: {e}")

        print(f"  ✓ Migrated {settings_count} settings")

        # Summary
        print("\n" + "="*60)
        print("✅ Migration completed successfully!")
        print("="*60)
        print(f"  Users:        {users_count}")
        print(f"  Sessions:     {sessions_count}")
        print(f"  Shares:       {shares_count}")
        print(f"  Chat logs:    {logs_count}")
        print(f"  Settings:     {settings_count}")
        print("="*60)
        print("\n📝 Next steps:")
        print("  1. Update .env: SET USE_POSTGRES=true")
        print("  2. Restart your application")
        print("  3. Verify the migration by checking admin dashboard")
        print("  4. Once verified, you can safely remove MongoDB")

    finally:
        await pg_pool.close()
        mongo_client.close()


if __name__ == "__main__":
    asyncio.run(migrate())
