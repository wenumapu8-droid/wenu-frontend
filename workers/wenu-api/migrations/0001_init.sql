-- Initial D1 schema for the store API.
-- The iMac Prisma schema was not available (wenu-platform is not on GitHub).
-- Reconcile this file with that schema before `wrangler d1 migrations apply --remote`.

CREATE TABLE IF NOT EXISTS subscribers (
  email TEXT PRIMARY KEY,
  name TEXT,
  source TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  method TEXT NOT NULL,
  items_json TEXT NOT NULL,
  shipping REAL,
  total REAL,
  status TEXT NOT NULL,
  mp_preference_id TEXT,
  mp_init_point TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS orders_email_idx ON orders(email);
CREATE INDEX IF NOT EXISTS orders_created_idx ON orders(created_at);
