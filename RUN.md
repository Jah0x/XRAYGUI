# Инструкция по запуску

1. Установите Node.js 18+ и npm.
2. Склонируйте репозиторий и перейдите в папку проекта.
3. Установите зависимости:
   ```bash
   npm install
   ```
4. Подготовьте базу данных и переменные окружения:
   - создайте файл `.env` с параметрами подключения к базе (см. `schema.prisma`).
   - выполните генерацию клиента и миграции:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```
5. Запустите приложение:
   ```bash
   npm run dev
   ```
6. Интерфейс будет доступен по адресу `http://localhost:3000`.

## Сборка и деплой через Nginx

1. Соберите фронтенд в папку `dist`:
   ```bash
   npm run build
   ```
2. Скопируйте содержимое `dist` на сервер, например в `/opt/XRAYGUI/dist`.
3. Настройте Nginx, добавив конфигурацию из файла `deploy/nginx.conf`.
4. Перезапустите Nginx и перейдите по адресу, указанному в `server_name`.

Если страница пустая, убедитесь, что директория `dist` содержит файлы после сборки и что в конфигурации Nginx верно указан путь `root`.


## Запуск как служба через Nginx

1. Установите Nginx, если он ещё не установлен:
   ```bash
   sudo apt install nginx
   ```
2. Скопируйте `deploy/nginx.conf` в `/etc/nginx/sites-available/xraygui` и создайте ссылку:
   ```bash
   sudo cp deploy/nginx.conf /etc/nginx/sites-available/xraygui
   sudo ln -s /etc/nginx/sites-available/xraygui /etc/nginx/sites-enabled/xraygui
   ```
3. Убедитесь, что путь `root` в конфигурации указывает на папку с собранным фронтендом, например `/opt/XRAYGUI/dist`.
4. Проверьте конфигурацию и перезапустите Nginx:
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```
5. Включите автозапуск службы:
   ```bash
   sudo systemctl enable nginx
   ```
6. Статус службы можно посмотреть командой `sudo systemctl status nginx`.
7. Логи работы расположены в `/var/log/nginx/xraygui_access.log` и `/var/log/nginx/xraygui_error.log`.
8. Если после деплоя страница пустая, проверьте наличие файлов в `dist` и ошибки в логах Nginx.
