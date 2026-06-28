-- BrainBoom Database Schema v1.3
-- Apply via: wrangler d1 execute brainboom-db --file=packages/db/migrations/0001_initial.sql

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('developer', 'admin', 'member')),
    password_hash TEXT,
    access_code_id INTEGER REFERENCES access_codes(id) ON DELETE SET NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER DEFAULT (unixepoch('now') * 1000)
);

CREATE TABLE IF NOT EXISTS access_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('admin', 'member')),
    display_name TEXT NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_active INTEGER NOT NULL DEFAULT 1,
    used_at INTEGER,
    reset_count INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER DEFAULT (unixepoch('now') * 1000)
);

CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('personal', 'ruang_umum')),
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at INTEGER DEFAULT (unixepoch('now') * 1000)
);

CREATE TABLE IF NOT EXISTS room_members (
    room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at INTEGER DEFAULT (unixepoch('now') * 1000),
    PRIMARY KEY (room_id, user_id)
);

CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contact_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    created_at INTEGER DEFAULT (unixepoch('now') * 1000)
);

CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'text' CHECK(type IN ('text', 'image', 'file', 'voice')),
    file_url TEXT,
    reply_to INTEGER REFERENCES messages(id) ON DELETE SET NULL,
    is_edited INTEGER NOT NULL DEFAULT 0,
    deleted_at INTEGER,
    deleted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at INTEGER DEFAULT (unixepoch('now') * 1000)
);

CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    project_name TEXT NOT NULL,
    scheduled_at INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'urgent', 'completed')),
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    updated_at INTEGER DEFAULT (unixepoch('now') * 1000),
    created_at INTEGER DEFAULT (unixepoch('now') * 1000)
);

CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    updated_at INTEGER DEFAULT (unixepoch('now') * 1000),
    created_at INTEGER DEFAULT (unixepoch('now') * 1000)
);

CREATE TABLE IF NOT EXISTS rate_limits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL,
    timestamp INTEGER NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_room_members_user ON room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON rate_limits(key, timestamp);
CREATE INDEX IF NOT EXISTS idx_schedules_status ON schedules(status);
CREATE INDEX IF NOT EXISTS idx_access_codes_code ON access_codes(code);

-- Seed: Ruang Umum (room id=1)
-- INSERT INTO rooms (name, type) VALUES ('Ruang Umum', 'ruang_umum');
-- Developer user must be created manually via Cloudflare dashboard
-- with DEV_ACCESS_CODE env variable before first use
