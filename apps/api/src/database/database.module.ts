import { Global, Injectable, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

function databaseOptions() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL must be set before starting the API.');

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection URL.');
  }
  if (parsed.protocol !== 'postgres:' && parsed.protocol !== 'postgresql:') {
    throw new Error('DATABASE_URL must use the postgres or postgresql scheme.');
  }

  const localHost = ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname);
  return {
    type: 'postgres' as const,
    url,
    ssl: localHost ? false : { rejectUnauthorized: true },
    synchronize: false,
    entities: [],
    migrations: [],
    logging: (process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']) as ('error' | 'warn')[],
    extra: { max: Number(process.env.DB_POOL_MAX ?? 10), idleTimeoutMillis: 30_000 },
  };
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  readonly dataSource = new DataSource(databaseOptions());

  async onModuleInit() {
    await this.dataSource.initialize();
  }

  async onModuleDestroy() {
    if (this.dataSource.isInitialized) await this.dataSource.destroy();
  }
}

@Global()
@Module({ providers: [DatabaseService], exports: [DatabaseService] })
export class DatabaseModule {}
