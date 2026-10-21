CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  stock INTEGER NOT NULL CHECK (stock >= 0)
);
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  request_hash TEXT NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('NGN','USD')),
  total BIGINT NOT NULL CHECK (total > 0),
  items JSONB NOT NULL,
  customer JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'demo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);
