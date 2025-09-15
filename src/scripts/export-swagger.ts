import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

async function generate() {
  const app = await NestFactory.create(AppModule, { logger: false });

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

  const outDir = join(process.cwd(), "dist");
  mkdirSync(outDir, { recursive: true });
  const filePath = join(outDir, "swagger.json");
  writeFileSync(filePath, JSON.stringify(document, null, 2), "utf-8");

  await app.close();

  console.log(`Swagger JSON сохранён: ${filePath}`);
}

// eslint-disable-next-line unicorn/prefer-top-level-await
generate().catch((e) => {
  console.error("Ошибка генерации Swagger JSON:", e);
  process.exit(1);
});
