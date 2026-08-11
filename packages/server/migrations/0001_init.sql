-- Static migration source for managed PostgreSQL.
-- Apply via your platform's migration tooling using DATABASE_URL.
-- Do not embed credentials in this file.

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS queues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_by_id UUID NOT NULL REFERENCES users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID NOT NULL REFERENCES queues (id),
  customer_name VARCHAR(255) NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  serving BOOLEAN NOT NULL DEFAULT FALSE,
  created_by_id UUID NOT NULL REFERENCES users (id)
);
