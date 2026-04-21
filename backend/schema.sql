-- Neon PostgreSQL Schema for Sahib Yalla App
-- Run this to initialize your database

-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(24) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) DEFAULT '',
    picture TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(32) PRIMARY KEY,
    user_id VARCHAR(24) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

-- Shares table (project snapshots)
CREATE TABLE IF NOT EXISTS shares (
    id VARCHAR(12) PRIMARY KEY,
    files JSONB NOT NULL,
    active_file_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shares_created_at ON shares(created_at DESC);

-- Chat logs table
CREATE TABLE IF NOT EXISTS chat_logs (
    id VARCHAR(32) PRIMARY KEY,
    user_email VARCHAR(255),
    user_id VARCHAR(24),
    session_id VARCHAR(32),
    message TEXT,
    reply_preview TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_logs_created_at ON chat_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_logs_user_email ON chat_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_chat_logs_user_id ON chat_logs(user_id);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(255) PRIMARY KEY,
    provider VARCHAR(50),
    model VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default LLM settings
INSERT INTO settings (key, provider, model)
VALUES ('llm', 'anthropic', 'claude-sonnet-4-5-20250929')
ON CONFLICT (key) DO NOTHING;
