import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { APP_FILTER, APP_PIPE } from "@nestjs/core";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ValidationPipe } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/auth.module";
import { ExecModule } from "@/modules/exec/exec.module";
import { RolesModule } from "@/modules/roles/roles.module";
import { AuthExceptionFilter } from "@/modules/auth/filters/auth-exception.filter";
import { CorsLoggingMiddleware } from "@/common/middleware/cors-logging.middleware";
import { Project, User, Role, TokenBlacklist } from "@/entities";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "mysql",
        host: config.get<string>("DB_HOST", "localhost"),
        port: parseInt(config.get<string>("DB_PORT", "3306"), 10),
        username:
          config.get<string>("DB_USER") ||
          config.get<string>("DB_USERNAME", "root"),
        password: config.get<string>("DB_PASSWORD", "password"),
        database:
          config.get<string>("DB_NAME") ||
          config.get<string>("DB_DATABASE", "adminka_booking"),
        entities: [Project, User, Role, TokenBlacklist],
        synchronize: false,
        logging: config.get<string>("NODE_ENV") === "development",
        charset: "utf8mb4",
      }),
    }),
    AuthModule,
    ExecModule,
    RolesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          whitelist: true,
          transform: true,
          forbidNonWhitelisted: true,
          transformOptions: {
            enableImplicitConversion: true,
          },
        }),
    },
    {
      provide: APP_FILTER,
      useClass: AuthExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Применяем CORS logging middleware ко всем роутам
    consumer.apply(CorsLoggingMiddleware).forRoutes("*");
  }
}
