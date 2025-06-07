# Логирование проекта

Этот файл описывает, где искать логи и как их вести как в процессе разработки, так и в продакшене.

## Логи разработки

- Во время запуска `npm run dev` можно сохранять вывод в файл `logs/dev.log`:
  ```bash
  mkdir -p logs
  npm run dev > logs/dev.log 2>&1
  ```
- Для просмотра логов в реальном времени используйте:
  ```bash
  tail -f logs/dev.log
  ```

## Логи продакшена

- Nginx по умолчанию пишет логи в `/var/log/nginx/xraygui_access.log` и `/var/log/nginx/xraygui_error.log` (конфигурацию создавайте самостоятельно).
- Просмотр логов:
  ```bash
  sudo tail -f /var/log/nginx/xraygui_error.log
  ```
- Рекомендуется настроить `logrotate` для этих файлов, чтобы ограничить размер логов.

## Логи systemd

- Статус и журнал работы сервиса Nginx можно получить командой:
  ```bash
  sudo journalctl -u nginx.service
  ```

## Логи сборки

- Сохраняйте вывод `npm run build` в файл `logs/build.log`, чтобы отследить возможные ошибки сборки:
  ```bash
  mkdir -p logs
  npm run build > logs/build.log 2>&1
  ```
- Прогресс можно просмотреть командой `tail -f logs/build.log`.

## Логи тестов

- Результаты выполнения тестов можно сохранять в `logs/test.log`:
  ```bash
  mkdir -p logs
  npm test > logs/test.log 2>&1
  ```
- Отчёт удобно смотреть командой `tail -f logs/test.log`.

## Логи сборки стилей

- Для отслеживания изменений `theme.css` можно сохранять вывод инструментов
  сборки в файл `logs/style.log`:
  ```bash
  mkdir -p logs
  npm run dev > logs/style.log 2>&1
  ```
- Просматривать лог можно командой `tail -f logs/style.log`.

## Логи React Query

- React Query выводит ошибки и предупреждения в консоль браузера.
- При разработке можно перенаправлять вывод `npm run dev` в `logs/dev.log`, чтобы сохранять эти сообщения.
- Для более подробной отладки установите `@tanstack/react-query-devtools` и подключите Devtools в `main.tsx`.

## Журнал изменений

### 2025-06-18
- Обновлен файл `theme.css`: подключен Tailwind CDN и добавлены стили навигации.

### 2025-06-22
- Удалена папка `deploy` с примером конфигурации Nginx, описание логов скорректировано.
