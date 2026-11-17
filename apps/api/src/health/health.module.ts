import { Controller, Get, Module, ServiceUnavailableException } from '@nestjs/common';
import { DatabaseService } from '../database/database.module';

@Controller('health')
class HealthController {
  constructor(private readonly database: DatabaseService) {}

  @Get('ready')
  async ready() {
    try {
      await this.database.dataSource.query('SELECT 1');
      return { status: 'ready', database: 'connected' };
    } catch {
      throw new ServiceUnavailableException({ status: 'not_ready', database: 'unavailable' });
    }
  }
}

@Module({ controllers: [HealthController] })
export class HealthModule {}
