import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import type { Request, Response } from "express";
import { CorsConfig } from "./common/config/cors.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Безопа��ность
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          imgSrc: [`'self'`, "data:", "validator.swagger.io"],
          scriptSrc: [`'self'`],
          manifestSrc: [`'self'`],
          frameSrc: [`'self'`],
        },
      },
    }),
  );

  // CORS конфигурация
  app.enableCors(CorsConfig.getCorsOptions());
  CorsConfig.logConfiguration();

  // Cookie parser для ��аботы с HTTP-only cookies
  app.use(cookieParser() as any);

  // Глобальная валидация
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger документация
  const config = new DocumentBuilder()
    .setTitle("Adminka Booking API")
    .setDescription(
      "API для системы авторизации административной панели бронирования",
    )
    .setVersion("1.0")
    .addCookieAuth("auth-token", {
      type: "http",
      in: "cookie",
      scheme: "bearer",
      bearerFormat: "JWT",
      description: "HTTP-only cookie с JWT токеном",
    })
    .addApiKey(
      { type: "apiKey", in: "header", name: "X-Project-UUID" },
      "X-Project-UUID",
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // HTML UI
  SwaggerModule.setup("docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // JSON спецификация (через прямой доступ к express инстансу)
  const httpAdapter = app.getHttpAdapter();
  if (httpAdapter.getType() === "express") {
    const expressApp = httpAdapter.getInstance();
    expressApp.get("/docs-json", (_req: Request, res: Response) => {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.send(document);
    });
  }

  const port = process.env.PORT ?? 3000;

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger UI: http://localhost:${port}/docs`);
  console.log(`🧾 Swagger JSON: http://localhost:${port}/docs-json`);
  console.log(`🔐 Auth endpoints: http://localhost:${port}/api/auth`);

  await app.listen(port);
}

bootstrap().catch((error) => {
  console.error("❌ Application failed to start:", error);
  process.exit(1);
});
