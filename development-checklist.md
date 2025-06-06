# Development Checklist

## Done
- Create database schema with User and Subscription models
- Implement authentication using AC1's auth system
- Create API endpoints for retrieving user subscriptions and stats
- Implement landing page with login/registration forms
- Build dashboard page showing subscription details and stats
- Create profile page for account management
- Add responsive navigation with protected routes
- Implement status indicators for subscription states (active, expired, suspended)
- Create seed function to populate sample subscription data
- Style the application with a clean, technical design inspired by Stripe
- Add custom theme variables for status indicators and branding
- Implement basic API testing
- Improve error handling in API endpoints
- Update database schema to support Telegram integration and new subscription features
- Implement API endpoints for Telegram token generation and verification
- Add subscription plans and payment processing
- Create admin functionality for subscription management
- Implement offer management system
- Add admin newsletter functionality
- Prepare database schema for email verification
- Tailwind sci-fi theme complete

## Needs Verification

## Planned
- Implement subscription detail view page
- Add bandwidth usage charts and graphs
- Create admin interface for managing user subscriptions
- Implement notification system for expiring subscriptions
- Add support for multiple VPN services beyond X-Ray Core
- Update frontend UI to include Telegram login option
- Add subscription purchase page
- Create admin dashboard for payment approvals
- UI Polish Round 2 (Promo, Profile, Admin, Modals)
# Development Checklist  – XRAYGUI
_Последнее обновление: 2025-06-06_

## :rocket:  Critical-Fixes (блокируют запуск)

- [ ] **Wrap root in QueryClientProvider**  
  `apps/frontend/src/main.tsx` (и любые альтернативные entry-points).  
  Без этого React Query падает: `No QueryClient set`.

- [ ] **Fail-safe Error Boundary**  
  Добавить компонент‐обёртку, выводящий UI-ошибку вместо «белого листа».

- [ ] **`.env` sanity**  
  - `VITE_API_URL` у фронта  
  - `DATABASE_URL` / `PORT` у бэка  
  - Пример-шаблон `.env.example` обновить.

- [ ] **Prisma migrations**
- [ ] Tailwind “sci-fi” theme  
  - config, index.css, кастомные компоненты.  
  - Navbar на NavLink, активная вкладка иконкой/цветом.
