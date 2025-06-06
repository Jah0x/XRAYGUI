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

- Nginx по умолчанию пишет логи в `/var/log/nginx/xraygui_access.log` и `/var/log/nginx/xraygui_error.log` (см. `deploy/nginx.conf`).
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
