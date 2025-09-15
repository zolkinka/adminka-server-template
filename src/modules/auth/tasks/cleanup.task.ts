import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { AuthService } from "../auth.service";

@Injectable()
export class CleanupTask {
  private readonly logger = new Logger(CleanupTask.name);

  constructor(private readonly authService: AuthService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleCleanupExpiredTokens() {
    this.logger.log("Starting cleanup of expired tokens...");

    try {
      await this.authService.cleanupExpiredTokens();
      this.logger.log("Expired tokens cleanup completed successfully");
    } catch (error) {
      this.logger.error("Failed to cleanup expired tokens", error.stack);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyMaintenance() {
    this.logger.log("Starting daily maintenance tasks...");

    try {
      // Очистка истекших токенов
      await this.authService.cleanupExpiredTokens();

      // Здесь можно добавить другие задачи обслуживания
      // Например, сброс счетчиков неудачных попыток входа для разблокированных аккаунтов

      this.logger.log("Daily maintenance completed successfully");
    } catch (error) {
      this.logger.error("Daily maintenance failed", error.stack);
    }
  }
}
