import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() { const app = await NestFactory.create(AppModule); app.use(helmet()); app.enableCors({ origin: process.env.WEB_ORIGIN?.split(',') ?? false, credentials: true }); app.enableShutdownHooks(); await app.listen(process.env.PORT ?? 3001); }
bootstrap();
