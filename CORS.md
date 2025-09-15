# CORS Configuration

Этот проект поддерживает гибкую настройку CORS (Cross-Origin Resource Sharing) для безопасного взаимодействия с фронтенд приложениями.

## Основные возможности

- ✅ Гибкая настройка разрешенных origins через переменные окружения
- ✅ Автоматическое разрешение localhost в режиме разработки
- ✅ Поддержка HTTP-only cookies с credentials
- ✅ Логирование CORS запросов для отладки
- ✅ Кеширование preflight запросов (24 часа)
- ✅ Декораторы для настройки CORS на уровне контроллеров
- ✅ Guard для точного контроля доступа

## Конфигурация через переменные окружения

### .env файл

```bash
# Список разрешенных origins, разделенных запятыми
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,https://yourdomain.com

# URL фронтенд приложения (автоматически добавляется к CORS_ORIGINS)
FRONTEND_URL=http://localhost:3000

# Окружение (в development режиме localhost разрешен с любым портом)
NODE_ENV=development
```

### Автоматические разрешения

В режиме `development`:
- Все localhost адреса с любыми портами
- Все 127.0.0.1 адреса с любыми портами

## Использование декораторов

### На уровне контроллера

```typescript
import { Controller } from '@nestjs/common';
import { CorsOrigins, AllowAllOrigins, BlockCors } from '@/common/decorators/cors.decorator';

// Разрешить только определенные origins
@CorsOrigins('https://app.example.com', 'https://admin.example.com')
@Controller('api/admin')
export class AdminController {}

// Разрешить все origins (только в development)
@AllowAllOrigins()
@Controller('api/public')
export class PublicController {}

// Заблокировать все cross-origin запросы
@BlockCors()
@Controller('api/internal')
export class InternalController {}
```

### На уровне метода

```typescript
import { Get, Post } from '@nestjs/common';
import { CorsOrigins } from '@/common/decorators/cors.decorator';

@Controller('api/data')
export class DataController {
  // Общая настройка для контроллера
  
  @Get()
  getData() {}

  // Специальная настройка для конкретного метода
  @CorsOrigins('https://special-app.com')
  @Post('upload')
  uploadData() {}
}
```

## Использование Guard

```typescript
import { UseGuards } from '@nestjs/common';
import { CorsGuard } from '@/common/guards/cors.guard';

@UseGuards(CorsGuard)
@Controller('api/protected')
export class ProtectedController {}
```

## Логирование

В режиме разработки CORS middleware автоматически логирует:
- Preflight запросы (OPTIONS)
- Cross-origin запросы
- Заголовки ответов
- Заблокированные origins

Пример логов:
```
[CORS] Preflight request from http://localhost:3000 to OPTIONS /api/auth/login
[CORS] Requested method: POST
[CORS] Requested headers: Content-Type,Authorization
[CORS] Cross-origin POST request from http://localhost:3000 to /api/auth/login
```

## Настройки безопасности

### Разрешенные заголовки
- Content-Type
- Authorization
- X-Project-UUID
- X-Requested-With
- Accept
- Origin
- Cache-Control
- Pragma

### Экспонируемые заголовки
- Set-Cookie
- X-Total-Count
- X-Rate-Limit-*
- Content-Range
- Accept-Ranges

### Дополнительные настройки
- `credentials: true` - поддержка cookies
- `maxAge: 86400` - кеширование preflight на 24 часа
- `optionsSuccessStatus: 200` - совместимость со старыми браузерами

## Troubleshooting

### Проблема: CORS блокирует запросы

1. Проверьте переменные окружения `CORS_ORIGINS` и `FRONTEND_URL`
2. Убедитесь, что origin точно совпадает (включая протокол и порт)
3. Проверьте логи сервера для деталей

### Проблема: Cookies не передаются

1. Убедитесь, что `credentials: true` в клиенте
2. Проверьте, что origin разрешен в настройках CORS
3. Убедитесь, что используется HTTPS в production

### Проблема: Preflight запросы не проходят

1. Проверьте поддерживаемые методы и заголовки
2. Убедитесь, что сервер отвечает на OPTIONS запросы
3. Проверьте логи middleware

## Production рекомендации

1. **Никогда не используйте `*` в production**
2. **Указывайте точные домены** в `CORS_ORIGINS`
3. **Используйте HTTPS** для всех origins
4. **Регулярно проверяйте** список разрешенных origins
5. **Мониторьте** заблокированные запросы в логах