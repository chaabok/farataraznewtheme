import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { AppModule } from "./app.module";

const PORT = 3002; // apps-service — composite host for ERP app modules (Task 18)

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ["log", "error", "warn"] });
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: false }),
  );
  app.enableShutdownHooks();
  await app.listen(PORT, "127.0.0.1");
  Logger.log(`apps-service listening on http://127.0.0.1:${PORT}`, "Bootstrap");
}

void bootstrap();
