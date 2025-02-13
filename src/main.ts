import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config/envs';

async function bootstrap() {
  const logger = new Logger('Main');
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3000);

  logger.log(`\n🚀  Server running at:`);
  logger.log(`📜  API Docs: \x1b[36mhttp://localhost:${envs.port}/api\x1b[0m`);
  logger.log(`🔗  API URL: \x1b[32mhttp://localhost:${envs.port}\x1b[0m\n`);
}
bootstrap();
