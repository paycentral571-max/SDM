# Database schema

The authoritative schema is introduced by [`../migrations/001_initial.sql`](../migrations/001_initial.sql). Apply migrations in numeric order; this directory is reserved for schema diagrams and generated snapshots once a migration runner is added.

The API must verify organization membership and consent before every organization-scoped action. The migration's foreign keys and checks support these rules but do not replace authorization.
