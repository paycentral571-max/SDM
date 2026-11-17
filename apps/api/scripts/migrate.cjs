const fs = require('node:fs/promises');
const path = require('node:path');
const { Pool } = require('pg');

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('Set DATABASE_URL in the API environment first.');
  const parsed = new URL(connectionString);
  if (parsed.protocol !== 'postgres:' && parsed.protocol !== 'postgresql:') {
    throw new Error('DATABASE_URL must use the postgres or postgresql scheme.');
  }
  const local = ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname);
  const pool = new Pool({
    connectionString,
    ssl: local ? false : { rejectUnauthorized: true },
    max: 1,
  });
  const client = await pool.connect();
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS public.sdm_schema_migrations (
      name text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )`);
    await client.query("SELECT pg_advisory_lock(hashtext('secure-device-monitor-schema'))");

    const directory = path.resolve(__dirname, '../../../database/migrations');
    const files = (await fs.readdir(directory)).filter(name => /^\d+_[a-z0-9_-]+\.sql$/i.test(name)).sort();
    for (const name of files) {
      const existing = await client.query('SELECT 1 FROM public.sdm_schema_migrations WHERE name = $1', [name]);
      if (existing.rowCount) continue;

      const sql = await fs.readFile(path.join(directory, name), 'utf8');
      await client.query(sql);
      await client.query('INSERT INTO public.sdm_schema_migrations(name) VALUES ($1)', [name]);
      process.stdout.write(`Applied ${name}\n`);
    }
  } finally {
    try { await client.query("SELECT pg_advisory_unlock(hashtext('secure-device-monitor-schema'))"); } catch { /* connection is closing */ }
    client.release();
    await pool.end();
  }
}

main().catch(error => {
  process.stderr.write(`Migration failed: ${error instanceof Error ? error.message : 'unknown error'}\n`);
  process.exitCode = 1;
});
