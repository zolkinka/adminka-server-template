import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { AuthService } from '@/modules/auth/auth.service';
import { RegisterDto } from '@/modules/auth/dto/register.dto';
import { RegisterResponseDto } from '@/modules/auth/dto/register-response.dto';
import * as readline from 'readline';

interface CreateUserOptions {
  email?: string;
  name?: string;
  password?: string;
  projectUuid?: string;
  roleUuid?: string;
  interactive?: boolean;
}

async function createUserCommand(options: CreateUserOptions = {}) {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  const authService = app.get(AuthService);

  try {
    let userData: RegisterDto;

    if (options.interactive !== false) {
      userData = await promptForUserData(options);
    } else {
      if (!options.email || !options.name || !options.password) {
        console.error(
          '❌ Для неинтерактивного режима необходимо указать email, name и password',
        );
        process.exit(1);
      }
      userData = {
        email: options.email,
        name: options.name,
        password: options.password,
        projectUuid: options.projectUuid,
        roleUuid: options.roleUuid,
      };
    }

    console.log('🔄 Создание пользователя...');
    const result: RegisterResponseDto = await authService.register(userData);

    console.log('✅ Пользователь успешно создан!');
    console.log(`📧 Email: ${result.user.email}`);
    console.log(`👤 Имя: ${result.user.name}`);
    console.log(`🔑 UUID: ${result.user.uuid}`);
    console.log(`🏢 Проект: ${result.user.projectUuid || 'Не указан'}`);
    console.log(
      `👔 Роль: ${result.user.role?.type || result.user.role || 'Не указана'}`,
    );
    console.log(
      `📅 Создан: ${
        result.user.createdAt
          ? new Date(result.user.createdAt).toISOString()
          : new Date().toISOString()
      }`,
    );
  } catch (error: unknown) {
    console.error('❌ Ошибка при создании пользователя:');
    if (error && typeof error === 'object' && 'response' in error) {
      const nestError = error as {
        response?: {
          error?: {
            code?: string;
            message?: string;
            details?: string[];
          };
        };
      };
      if (nestError.response?.error) {
        console.error(`   Код: ${nestError.response.error.code || 'N/A'}`);
        console.error(
          `   Сообщение: ${nestError.response.error.message || 'N/A'}`,
        );
        if (
          nestError.response.error.details &&
          Array.isArray(nestError.response.error.details) &&
          nestError.response.error.details.length > 0
        ) {
          console.error(
            `   Детали: ${nestError.response.error.details.join(', ')}`,
          );
        }
      }
    } else if (error instanceof Error) {
      console.error(`   ${error.message}`);
    } else {
      console.error(`   ${String(error)}`);
    }
    process.exit(1);
  } finally {
    await app.close();
  }
}

async function promptForUserData(
  initialOptions: CreateUserOptions,
): Promise<RegisterDto> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };

  try {
    const email =
      initialOptions.email || (await question('📧 Email пользователя: '));
    const name =
      initialOptions.name || (await question('👤 Имя пользов��теля: '));

    let password = initialOptions.password;
    if (!password) {
      password = await question(
        '🔐 Пароль (мин. 8 символов, должен содержать заглавные, строчные буквы, цифры и спец. ��имволы): ',
      );
    }

    const projectUuid =
      initialOptions.projectUuid ||
      (await question(
        '🏢 UUID проекта (оставьте пустым для автоматического назначен��я): ',
      )) ||
      undefined;
    const roleUuid =
      initialOptions.roleUuid ||
      (await question(
        '👔 UUID роли (оставьте пустым для роли USER по умолчанию): ',
      )) ||
      undefined;

    return {
      email,
      name,
      password,
      projectUuid,
      roleUuid,
    };
  } finally {
    rl.close();
  }
}

// Обработка аргументов командной строки
function parseArgs(): CreateUserOptions {
  const args = process.argv.slice(2);
  const options: CreateUserOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--email':
        options.email = args[++i];
        break;
      case '--name':
        options.name = args[++i];
        break;
      case '--password':
        options.password = args[++i];
        break;
      case '--project':
        options.projectUuid = args[++i];
        break;
      case '--role':
        options.roleUuid = args[++i];
        break;
      case '--non-interactive':
        options.interactive = false;
        break;
      case '--help':
        printHelp();
        process.exit(0);
        break;
      default:
        if (arg.startsWith('--')) {
          console.error(`❌ Неизвестный аргумент: ${arg}`);
          printHelp();
          process.exit(1);
        }
        break;
    }
  }

  return options;
}

function printHelp() {
  console.log(`
📋 Команда создания пользователя

Использование:
  pnpm user:create [опции]

Опции:
  --email <email>        Email пользователя
  --name <name>          Имя пользователя  
  --password <password>  Пароль пользователя
  --project <uuid>       UUID проекта (опционально)
  --role <uuid>          UUID роли (опционально)
  --non-interactive      Неинтерактивный режим (требуется указать email, name, password)
  --help                 Показать эту справку

Примеры:
  # Интерактивный режим
  pnpm user:create

  # Неинтерактивный режим
  pnpm user:create --email admin@example.com --name "Администратор" --password "SecurePass123!" --non-interactive

  # С указанием проекта и роли
  pnpm user:create --email user@example.com --name "Пользователь" --password "UserPass123!" --project "uuid-here" --role "uuid-here" --non-interactive

Требования к паролю:
  - Минимум 8 символов
  - Содержит заглавные буквы (A-Z)
  - Содержит строчные буквы (a-z)
  - Содержит цифры (0-9)
  - Содержит специальные символы (@$!%*?&)
`);
}

// Запуск команды
if (require.main === module) {
  const options = parseArgs();

  createUserCommand(options).catch((error) => {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
  });
}

export { createUserCommand };
