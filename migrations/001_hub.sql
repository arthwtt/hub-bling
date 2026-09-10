BEGIN;
CREATE TABLE IF NOT EXISTS hub_sessions (
  session_hash text PRIMARY KEY, owner_id text NOT NULL, expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS hub_login_limits (
  key text PRIMARY KEY, attempts integer NOT NULL DEFAULT 0, resets_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS hub_oauth_states (
  state_hash text PRIMARY KEY, session_hash text NOT NULL REFERENCES hub_sessions(session_hash) ON DELETE CASCADE,
  owner_id text NOT NULL, expires_at timestamptz NOT NULL, consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS hub_tenants (
  id uuid PRIMARY KEY, owner_id text NOT NULL UNIQUE, bling_company_id text NOT NULL UNIQUE,
  name text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS hub_connections (
  tenant_id uuid PRIMARY KEY REFERENCES hub_tenants(id), token_envelope text NOT NULL,
  expires_at timestamptz NOT NULL, scopes text NOT NULL DEFAULT '',
  version integer NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'active',
  encryption_key_version text NOT NULL DEFAULT 'v1', updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS hub_rate_limits (
  bucket text PRIMARY KEY, next_at timestamptz NOT NULL DEFAULT now(), daily_date date NOT NULL DEFAULT CURRENT_DATE,
  daily_count integer NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS hub_resources (
  tenant_id uuid NOT NULL REFERENCES hub_tenants(id), kind text NOT NULL, resource_id text NOT NULL,
  payload jsonb NOT NULL, connection_version integer NOT NULL, collected_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, kind, resource_id)
);
CREATE INDEX IF NOT EXISTS hub_resources_kind ON hub_resources(tenant_id, kind);
CREATE TABLE IF NOT EXISTS hub_sync (
  tenant_id uuid NOT NULL REFERENCES hub_tenants(id), kind text NOT NULL,
  page integer NOT NULL DEFAULT 1, imported integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending', date_start date NOT NULL, date_end date NOT NULL,
  lease_id uuid, lease_until timestamptz, connection_version integer NOT NULL,
  last_error text, updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, kind)
);
COMMIT;
