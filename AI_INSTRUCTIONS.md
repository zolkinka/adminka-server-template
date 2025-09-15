# AI Instructions - Adminka Booking Server

## Общее описание проекта

Это NestJS приложение для системы бронирования с многопроектной архитектурой. Проект представляет собой backend API сервер с аутентификацией и системой ролей.

## Технический стек

- **Framework**: NestJS 11.x
- **Database**: MySQL с TypeORM
- **Authentication**: JWT с Passport
- **Package Manager**: pnpm
- **Language**: TypeScript

## Архитектура и структура

### Основные модули

#### 1. Auth Module (`src/modules/auth/`)
- **Сервис**: AuthService - управление аутентификацией и регистрацией
- **Контроллер**: AuthController - API endpoints для auth
- **Стратегии**: JWT Strategy для валидации токенов
- **DTO**: LoginDto, RegisterDto, AuthResponseDto, JwtPayload

#### 2. Entities (`src/entities/`)
Три основные сущности с soft delete поддержкой:

**Project Entity**:
- UUID первичный ключ
- Уникальное имя проекта
- Описание (опционально)

**User Entity**:
- UUID первичный ключ
- Email (уникальный)
- Хешированный пароль (bcryptjs, 12 rounds)
- Привязки к роли и проекту

### Database Configuration

#### DataSource (`src/database/data-source.ts`)
- MySQL соединение
- Конфигурация из environment переменных
- Миграции в `src/database/migrations/`
- Entities: Project, User
- Charset: utf8mb4

#### Environment Variables
```
DB_HOST - хост БД (default: localhost)
DB_PORT - порт БД (default: 3306)  
DB_USER/DB_USERNAME - пользователь БД (default: root)
DB_PASSWORD - пароль БД (default: password)
DB_NAME/DB_DATABASE - имя БД (default: adminka_booking)
NODE_ENV - окружение (development/production)
```

### Scripts и команды

```bash
# Разработка
pnpm start:dev          # Запуск в dev режиме
pnpm build              # Сборка проекта

# База данных
pnpm db:create          # Создание БД
pnpm migration:generate # Генерация миграции
pnpm migration:run      # Выполнение миграций
pnpm migration:revert   # Откат миграции

# Тестирование
pnpm test              # Unit тесты
pnpm test:e2e          # E2E тесты
```

## Особенности архитектуры

### Многопроектность
- Каждый пользователь привязан к конкретному проекту
- Роли создаются в контексте проекта
- Изоляция данных между проектами

### Система ролей и разрешений
- Три типа ролей: ADMIN, USER, CLIENT
- Гранулярные разрешения в формате строк
- Автоматическое создание базовых ролей при создании проекта

### Аутентификация
- JWT токены с payload: sub, email, projectUuid, roleUuid, permissions
- Защищенные маршруты через JwtAuthGuard
- Декораторы @CurrentUser для получения текущего пользователя

### Soft Delete
- Все основные сущности поддерживают soft delete
- Поле deletedAt для пометки удаленных записей
- Фильтрация по IsNull() в запросах

## Важные файлы конфигурации

- `ormconfig.ts` - экспорт DataSource для TypeORM CLI
- `tsconfig.json` - конфигурация TypeScript с path mapping
- `nest-cli.json` - настройки NestJS CLI
- `.env` файлы для переменных окружения

## Типичные паттерны кода

### Создание пользователя
```typescript
// Проверка существующего пользователя
const existingUser = await this.userRepository.findOne({
  where: { email, deletedAt: IsNull() }
});

// Хеширование пароля
const hashedPassword = await bcrypt.hash(password, 12);

// Создание с связями
const user = this.userRepository.create({
  email, name, password: hashedPassword,
  roleUuid, projectUuid
});
```

### Работа с разрешениями
```typescript
// JWT payload с разрешениями
const payload: JwtPayload = {
  sub: user.uuid,
  email: user.email, 
  projectUuid: user.projectUuid,
  roleUuid: user.roleUuid,
  permissions: user.role.permissions
};
```

### Загрузка с связями
```typescript
const user = await this.userRepository.findOne({
  where: { uuid, deletedAt: IsNull() },
  relations: ['role', 'project']
});
```

## MySQL Особенности

### Проблемы с TEXT полями
- TEXT колонки не могут иметь DEFAULT значения
- Используй `simple-json` тип для массивов без default
- Альтернатива: JSON тип в новых версиях MySQL

### Charset
- Используется utf8mb4 для полной поддержки Unicode
- Настроено в DataSource конфигурации

## Рекомендации при разработке

1. **Всегда проверяй на soft delete**: используй `deletedAt: IsNull()` в where условиях
2. **Изоляция проектов**: включай projectUuid в запросы где необходимо
3. **Безопасность паролей**: используй bcryptjs с saltRounds >= 12
4. **Валидация разрешений**: проверяй permissions в JWT payload
5. **Связи**: загружай relations явно когда они нужны
6. **Ошибки**: используй правильные HTTP статусы и exception типы
7. **TypeORM**: предпочитай Repository pattern над прямыми запросами