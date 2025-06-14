# AGENTS.md

## Описание проекта

**XRAYGUI** — веб-интерфейс для управления и мониторинга Xray (VPN, прокси, безопасность).
Проект построен на **React + TypeScript** (frontend) и использует **Prisma** для работы с базой данных.

---

## Основные файлы и модули

| Файл/Модуль           | Назначение                                                           |
|-----------------------|---------------------------------------------------------------------|
| App.tsx               | Главный компонент приложения, стартовая точка интерфейса            |
| api.ts                | Функции для HTTP-запросов (авторизация, управление, CRUD)           |
| api.test.ts           | Юнит-тесты для api.ts                                               |
| modules/auth.ts         | Функции аутентификации пользователей |
| modules/telegram.ts     | Интеграция Telegram (токены, поиск) |
| modules/subscription.ts | Запросы и статистика подписок |
| modules/admin.ts        | Проверки прав админа и сообщения |
| modules/payments.ts     | Оплата подписок и транзакции |
| modules/offers.ts       | Управление рекламными предложениями |
| schema.prisma         | Схема базы данных Prisma |
| theme.css             | Основные стили интерфейса |
| PRD.md                | Продуктовые требования, описание сценариев использования |
| development-checklist.md | Чеклист и задачи для текущей и будущей разработки |
| RUN.md                | Инструкция по запуску проекта |
| package.json          | Список зависимостей и npm-скриптов |
| pnpm-lock.yaml        | Замороженные версии зависимостей |
| .gitignore            | Исключает лишние файлы из репозитория |
| index.html            | Корневой HTML-шаблон для Vite |
| main.tsx              | Точка входа React-приложения, обёртка QueryClientProvider |
| vite.config.ts        | Конфигурация сборщика Vite |
| tsconfig.json         | Настройки TypeScript и алиасов |
| client/api.ts         | Демо-данные и простые методы API для фронтенда |
| client/utils.ts       | Простейшие хуки useAuth/useToast |
| components/ui.tsx     | Минимальные UI-компоненты |
| components/Card.tsx   | Компонент карточки с неоновой рамкой |
| components/Button.tsx | Кнопка с вариантами primary/outline |
| components/Tabs.tsx   | Простая таб-система с подчёркиванием |
| components/Badge.tsx  | Бейдж для статусов |
| components/Navbar.tsx | Навигационная панель с NavLink |
| components/Logo.tsx   | Логотип приложения |
| components/PromoCodes.tsx | Поле ввода промокода с кнопкой |
| components/Divider.tsx | Разделитель для секций |
| components/SectionTitle.tsx | Заголовок раздела с подзаголовком |
| components/Modal.tsx | Обёртка модального окна на базе HeadlessUI |
| components/CreateCouponModal.tsx | Модал создания купона |
| components/CreateOfferModal.tsx | Модал создания предложения |
| ProfilePage.tsx | Страница профиля пользователя |
| AdminPanel.tsx | Админ-панель с табами |
| src/components/BrandButton.tsx | Кнопка с цветом brand |
| src/components/BrandCard.tsx | Карточка с тонкой рамкой |
| src/components/BrandTabs.tsx | Вкладки с выделением brand |
| src/layouts/AppShell.tsx | Основной лейаут с Sidebar, MobileTopBar и BottomNav |
| components/ui/sidebar.tsx | Боковая панель навигации |
| components/ui/mobile-nav.tsx | Нижняя мобильная навигация (устаревший вариант) |
| components/ui/MobileTopBar.tsx | Мобильный верхний бар |
| components/ui/BottomNav.tsx | Нижняя навигация с иконками |
| components/EmptyState.tsx | Карточка-заглушка для пустого списка |
| apps/frontend/src/index.css | Tailwind стили и базовые правила |
| tailwind.config.cjs   | Конфигурация Tailwind |
| postcss.config.js     | Настройки PostCSS и autoprefixer |
| LOGGING.md            | Инструкция по ведению логов проекта |
| apps/frontend/src/components/ui/app-shell.tsx | Базовый лейаут приложения |
| apps/frontend/src/components/ui/button.tsx | Кнопка с вариантами CVA |
| apps/frontend/src/components/ui/card.tsx | Карточка с неоновой рамкой |
| apps/frontend/src/components/ui/input.tsx | Текстовое поле с фокусным кольцом |
| apps/frontend/src/components/ui/modal.tsx | Модальное окно на Radix с анимацией |
| apps/frontend/src/components/ui/tabs.tsx | Таб-система Radix |
| DashboardPage.tsx | Демонстрационная страница дашборда |
| server/index.ts | Express-сервер для отдачи статики |
| Dockerfile | Сборка и запуск через nginx |
| deploy/xraygui-update.sh | Скрипт обновления и сборки |
| deploy/xraygui.service | systemd unit для сервиса |
| i18n.ts | Инициализация i18next |
| locales/en/translation.json | Английские переводы |
| locales/ru/translation.json | Русские переводы |
| components/ThemeSwitcher.tsx | Переключатель тёмной/светлой темы |
| components/LanguageSwitcher.tsx | Селектор языка |
| client/theme.ts | Хук useTheme |
| vitest.config.ts | Конфигурация vitest |
| tests/DashboardPage.test.tsx | Снапшот-тест страницы дашборда |
| .github/workflows/ci.yml | CI c lint/test/build |
| vite-env.d.ts | Типы переменных окружения |
| .eslintrc.cjs | Настройки ESLint |

---

## Журнал разработки и задач

### [2024-06-06]
- Инициализация проекта, добавлены основные модули
- Стартовый UI (App.tsx), структура БД (schema.prisma), API-заготовка

### [2024-06-06] Извлечено из development-checklist.md и PRD.md:
- [ ] Реализовать авторизацию и регистрацию пользователей через API и UI
- [ ] Добавить формы для создания/редактирования пользователей
- [ ] Реализовать страницу просмотра/управления VPN-конфигами
- [ ] Подключить Prisma к реальной базе данных (PostgreSQL)
- [ ] Описать все основные типы данных в отдельном файле types.ts
- [ ] Автоматизировать тестирование (добавить новые тесты, интегрировать CI)
- [ ] Оформить автоматическую генерацию документации по базе через Prisma
- [ ] Реализовать логирование действий пользователей и ошибок
- [ ] Обеспечить обновление журнала разработки и документации при каждом изменении кода
- [ ] Создать страницы: Dashboard, Users, VPN Configs, Settings
- [СДЕЛАНО] Доработать стили и добавить темы (theme.css)
- [ ] Описать схему взаимодействия frontend ↔ backend (api.ts)
- [ ] Добавить управление ролями пользователей (админ/юзер)
- [СДЕЛАНО] Настроить .gitignore для исключения node_modules, .env и сессионных файлов
- [ ] Описывать каждый новый модуль/файл в таблице выше и в этом журнале

### [2025-06-06]
- [СДЕЛАНО] Вынесены функции из api.ts в модули auth.ts, telegram.ts и subscription.ts для лучшей модульности
- [НОВАЯ ЗАДАЧА] Перенести остальные API-функции в отдельные файлы

### [2025-06-06]
- [СДЕЛАНО] Удалены неиспользуемые импорты и TOKEN_EXPIRY_HOURS в api.ts
- [СДЕЛАНО] Созданы модули admin.ts, payments.ts и offers.ts
- [СДЕЛАНО] Проверки администратора перенесены в requireAdmin
- [СДЕЛАНО] В ключевых платежных функциях добавлены Prisma-транзакции
- [СДЕЛАНО] Добавлены простые юнит‑тесты для auth, subscription и telegram

### [2025-06-07]
- [СДЕЛАНО] Добавлен файл RUN.md с инструкцией по запуску проекта

### [2025-06-08]
- [СДЕЛАНО] Создан файл package.json с зависимостями и скриптами

### [2025-06-09]
- [СДЕЛАНО] Настроена сборка Vite, добавлены скрипты `dev` и `build`
- [СДЕЛАНО] Созданы файлы `index.html`, `main.tsx`, `vite.config.ts`, `tsconfig.json`
- [СДЕЛАНО] Добавлены простые заглушки для API и UI-компонентов
- [НОВАЯ ЗАДАЧА] Реализовать полноценные UI-компоненты и API-клиент

### [2025-06-10]
- [СДЕЛАНО] Добавлена конфигурация `deploy/nginx.conf`
- [СДЕЛАНО] В `RUN.md` описан процесс сборки и деплоя через Nginx
- [НОВАЯ ЗАДАЧА] Проверить развёртывание на тестовом сервере

### [2025-06-11]
- [СДЕЛАНО] Создан файл `LOGGING.md` с инструкциями по учёту логов
- [СДЕЛАНО] В `RUN.md` добавлен раздел о запуске проекта как службы через Nginx
- [НОВАЯ ЗАДАЧА] Проверить работу логирования и автозапуска на сервере

### [2025-06-12]
- [СДЕЛАНО] В `client/api.ts` добавлены демонстрационные данные для отображения страниц
- [НОВАЯ ЗАДАЧА] Реализовать полноценное подключение к бекенду

### [2025-06-13]
- [СДЕЛАНО] Добавлен параметр `base: './'` в `vite.config.ts` для корректной загрузки
  бандлов без веб‑сервера
- [СДЕЛАНО] Исправлен импорт в `api.test.ts` (`./api.ts`) для совместимости с `ts-node`
- [НОВАЯ ЗАДАЧА] Настроить запуск тестов через `ts-node` с поддержкой ESM

### [2025-06-14]
- [СДЕЛАНО] Обновлена конфигурация `deploy/nginx.conf`: разделены статика и проксирование API
- [СДЕЛАНО] Расширен `LOGGING.md` разделом о логировании сборки
- [НОВАЯ ЗАДАЧА] Проверить вывод логов после нового деплоя

### [2025-06-15]
- [СДЕЛАНО] `main.tsx` обёрнут в `QueryClientProvider`, создан `QueryClient`

### [2025-06-16]
- [СДЕЛАНО] Добавлены `ReactQueryDevtools` в `main.tsx` для режима разработки

### [2025-06-17]
- [СДЕЛАНО] Добавлены базовые стили в `theme.css`
- [СДЕЛАНО] Подключение `theme.css` в `index.html`
- [СДЕЛАНО] Обновлён `LOGGING.md` разделом о логах сборки стилей

### [2025-06-18]
- [СДЕЛАНО] Подключена CDN-версия Tailwind в `theme.css`
- [СДЕЛАНО] Добавлены стили навигации с переносом элементов
- [НОВАЯ ЗАДАЧА] Проверить отображение интерфейса на мобильных устройствах

### [2025-06-19]
- [СДЕЛАНО] Подключен Tailwind через PostCSS и настроена sci-fi тема
- [СДЕЛАНО] Созданы компоненты Card, Button, Tabs и Badge
- [СДЕЛАНО] Добавлен Navbar с NavLink и Logo

### [2025-06-20]
- [СДЕЛАНО] Добавлены компоненты PromoCodes, Divider, Modal и SectionTitle
- [СДЕЛАНО] Созданы страницы ProfilePage и AdminPanel
- [СДЕЛАНО] Удалён устаревший CSS из theme.css, иконки и лейаут переведены на Tailwind
- [НОВАЯ ЗАДАЧА] UI Polish Round 2 (Promo, Profile, Admin, Modals)


### [2025-06-21]
- [СДЕЛАНО] Страницы ProfilePage и AdminPanel подключены в App.tsx
- [СДЕЛАНО] В AdminPanel добавлены модальные окна CreateCouponModal и CreateOfferModal

### [2025-06-22]
- [СДЕЛАНО] Удалена папка `deploy` и обновлены инструкции в RUN.md и LOGGING.md
- [НОВАЯ ЗАДАЧА] Подготовить отдельный репозиторий или раздел документации с примерами конфигурации Nginx

### [2025-06-23]
- [СДЕЛАНО] Добавлены UI-компоненты на базе CVA и Radix (app-shell, button, card, input, modal, tabs)
- [СДЕЛАНО] Создан DashboardPage для демонстрации нового стиля
- [НОВАЯ ЗАДАЧА] Перенести существующие страницы на новую библиотеку компонентов

### [2025-06-24]
- [СДЕЛАНО] Добавлен цвет `onSurface` в `tailwind.config.cjs` для корректной сборки стилей
- [НОВАЯ ЗАДАЧА] Проверить остальные классы Tailwind на наличие устаревших значений

### [2025-06-25]
- [СДЕЛАНО] Подключена shadcn/ui с тёмным пресетом, добавлены BrandButton, BrandCard и BrandTabs
- [СДЕЛАНО] Создан лейаут AppShell с Sidebar и MobileNav
- [СДЕЛАНО] Очищен index.css и добавлен цвет brand в Tailwind config
- [НОВАЯ ЗАДАЧА] Проверить новые страницы после рефакторинга

### [2025-06-26]
- [СДЕЛАНО] Добавлены MobileTopBar и BottomNav для мобильного интерфейса
- [СДЕЛАНО] Обновлён AppShell с новым расположением main и футером
- [СДЕЛАНО] Создан компонент EmptyState и подключен в AdminPanel
- [СДЕЛАНО] TabsList получил горизонтальный скролл через no-scrollbar
- [НОВАЯ ЗАДАЧА] Проверить Lighthouse на мобильных устройствах (цель ≥90)

### [2025-06-27]
- [СДЕЛАНО] Добавлены ESLint и CI с vitest
- [СДЕЛАНО] Создан Dockerfile и express-сервер
- [СДЕЛАНО] Реализованы переключатели темы и языка, добавлены переводы
- [СДЕЛАНО] Настроен vitest с тестом DashboardPage
- [СДЕЛАНО] Создан скрипт деплоя `xraygui-update.sh` и unit-файл systemd

### [2025-06-28]
- [СДЕЛАНО] Добавлен `pnpm-lock.yaml` для фиксированных версий зависимостей
- [СДЕЛАНО] Обновлён workflow CI: условная установка зависимостей

### [2025-06-29]
- [СДЕЛАНО] Workflow CI обновлён до pnpm 9 для совместимости с lockfile
- [НОВАЯ ЗАДАЧА] Проверить прохождение сборки на GitHub Actions


---

## Инструкция для Codex/OpenAI

- **Вся новая функциональность и исправления должны вноситься в этот файл!**
- Каждый новый файл, модуль или компонент обязательно описывать в таблице «Основные файлы и модули» и кратко — в журнале задач.
- Любые новые задачи/идеи/баги — сразу записывать отдельными чекбоксами ([ ]), указывать дату и статус.
- **Журнал разработки вести в формате "дата — изменения, задачи, комментарии".**
- Обязательно поддерживать описание всех используемых API и их параметров.
- Автоматически добавлять summary по итогам недели или спринта (что сделано, что осталось).
- Обновлять раздел задач при выполнении/добавлении нового функционала или фиксе багов.

---

## Ссылки

- [GitHub репозиторий XRAYGUI](https://github.com/Jah0x/XRAYGUI)
- [Документация Prisma](https://www.prisma.io/docs)
- [Документация React](https://react.dev/)

---

**Пример ведения журнала:**

```markdown
### [2024-06-08]
- [СДЕЛАНО] Реализована форма регистрации пользователей
- [НОВАЯ ЗАДАЧА] Требуется интеграция backend-авторизации через JWT
- [БАГ] В форме VPN-конфигов не отображаются последние изменения

### [2024-06-09]
- [ ] Добавить unit-тесты для всех новых API
- [ ] Переписать структуру theme.css для поддержки нескольких цветовых схем
