-- Apply with psql -v ON_ERROR_STOP=1 -f database/migrations/001_initial.sql.
-- Application role must have only the privileges its API needs; never use a superuser.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL CHECK (length(trim(name)) BETWEEN 2 AND 160),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), auth_subject text NOT NULL UNIQUE,
  email text NOT NULL, display_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE UNIQUE INDEX users_email_active_idx ON users (lower(email)) WHERE deleted_at IS NULL;
CREATE TABLE memberships (
  organization_id uuid NOT NULL REFERENCES organizations(id), user_id uuid NOT NULL REFERENCES users(id),
  role text NOT NULL CHECK (role IN ('owner','admin','analyst','device_owner')),
  created_at timestamptz NOT NULL DEFAULT now(), revoked_at timestamptz,
  PRIMARY KEY (organization_id,user_id)
);
CREATE INDEX memberships_user_idx ON memberships (user_id) WHERE revoked_at IS NULL;

CREATE TABLE device_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  created_by uuid NOT NULL REFERENCES users(id), token_hash bytea NOT NULL UNIQUE,
  invited_email text, requested_purposes text[] NOT NULL DEFAULT '{}',
  expires_at timestamptz NOT NULL, accepted_at timestamptz, revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (expires_at > created_at), CHECK (accepted_at IS NULL OR revoked_at IS NULL)
);
CREATE INDEX device_invitations_org_idx ON device_invitations (organization_id, created_at DESC);
CREATE TABLE devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  owner_id uuid NOT NULL REFERENCES users(id), invitation_id uuid UNIQUE REFERENCES device_invitations(id),
  name text NOT NULL, platform text NOT NULL CHECK (platform IN ('android','ios')),
  model text, os_version text, status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','protected','needs_review','offline','revoked')),
  registered_at timestamptz NOT NULL DEFAULT now(), last_connected_at timestamptz, revoked_at timestamptz,
  UNIQUE (id, organization_id)
);
CREATE INDEX devices_org_idx ON devices (organization_id,status,last_connected_at DESC);
CREATE INDEX devices_owner_idx ON devices (owner_id);
CREATE TABLE consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL,
  device_id uuid NOT NULL, user_id uuid NOT NULL REFERENCES users(id),
  purpose text NOT NULL CHECK (purpose IN ('device_registration','camera_test','selected_media','location_sharing','notifications')),
  explanation_version text NOT NULL, granted_at timestamptz NOT NULL DEFAULT now(), revoked_at timestamptz,
  FOREIGN KEY (device_id,organization_id) REFERENCES devices(id,organization_id),
  CHECK (revoked_at IS NULL OR revoked_at >= granted_at)
);
CREATE UNIQUE INDEX consents_active_idx ON consents (device_id,user_id,purpose) WHERE revoked_at IS NULL;
CREATE UNIQUE INDEX consents_identity_idx ON consents (id,organization_id,device_id,user_id);
CREATE INDEX consents_org_idx ON consents (organization_id,device_id);

CREATE TABLE security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL,
  device_id uuid NOT NULL, event_type text NOT NULL, severity text NOT NULL CHECK (severity IN ('low','medium','high','critical')),
  source text NOT NULL CHECK (source IN ('user_report','device_diagnostic','server_auth')),
  description text NOT NULL, occurred_at timestamptz NOT NULL, received_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (device_id,organization_id) REFERENCES devices(id,organization_id)
);
CREATE INDEX security_events_org_time_idx ON security_events (organization_id,occurred_at DESC);
CREATE TABLE evidence_objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL,
  device_id uuid NOT NULL, uploader_id uuid NOT NULL REFERENCES users(id), consent_id uuid NOT NULL REFERENCES consents(id),
  object_key text NOT NULL UNIQUE, original_name text NOT NULL, content_type text NOT NULL,
  byte_size bigint NOT NULL CHECK (byte_size BETWEEN 1 AND 52428800), sha256 bytea,
  scan_status text NOT NULL DEFAULT 'pending' CHECK (scan_status IN ('pending','clean','rejected')),
  uploaded_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz,
  FOREIGN KEY (device_id,organization_id) REFERENCES devices(id,organization_id),
  FOREIGN KEY (consent_id,organization_id,device_id,uploader_id) REFERENCES consents(id,organization_id,device_id,user_id)
);
CREATE INDEX evidence_org_time_idx ON evidence_objects (organization_id,uploaded_at DESC);
CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  created_by uuid NOT NULL REFERENCES users(id), title text NOT NULL,
  period_start timestamptz NOT NULL, period_end timestamptz NOT NULL,
  object_key text, created_at timestamptz NOT NULL DEFAULT now(), CHECK (period_end > period_start)
);
CREATE INDEX reports_org_time_idx ON reports (organization_id,created_at DESC);
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES organizations(id),
  recipient_id uuid NOT NULL REFERENCES users(id), event_id uuid REFERENCES security_events(id),
  channel text NOT NULL CHECK (channel IN ('push','email','in_app')),
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','failed')),
  created_at timestamptz NOT NULL DEFAULT now(), sent_at timestamptz
);
CREATE INDEX notifications_recipient_idx ON notifications (recipient_id,created_at DESC);
CREATE TABLE audit_logs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, organization_id uuid REFERENCES organizations(id),
  actor_id uuid REFERENCES users(id), action text NOT NULL, resource_type text NOT NULL, resource_id text,
  outcome text NOT NULL CHECK (outcome IN ('success','denied','error')),
  occurred_at timestamptz NOT NULL DEFAULT now(), metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX audit_logs_org_time_idx ON audit_logs (organization_id,occurred_at DESC);
CREATE TABLE refresh_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id),
  token_hash bytea NOT NULL UNIQUE, family_id uuid NOT NULL, expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), revoked_at timestamptz, replaced_by uuid REFERENCES refresh_tokens(id)
);
CREATE INDEX refresh_tokens_user_idx ON refresh_tokens (user_id) WHERE revoked_at IS NULL;
COMMIT;
