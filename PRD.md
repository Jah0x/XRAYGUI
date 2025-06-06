# Product Requirements Document for VPN Dashboard

## Table of Contents

1. [App Overview](#app-overview)
2. [System Architecture](#system-architecture)
3. [Database Schema](#database-schema)
4. [Authentication & Authorization](#authentication--authorization)
5. [API Documentation](#api-documentation)
6. [Frontend Components](#frontend-components)
7. [Workflow](#workflow)
8. [Coupon System](#coupon-system)
9. [Subscription Management](#subscription-management)
10. [Admin Features](#admin-features)
11. [User Features](#user-features)

## App Overview
- Name: VPN Dashboard
- Tagline: Manage your X-Ray Core VPN subscriptions in one place
- Category: web_application
- Visual Style: Refined Technical (e.g. Stripe)

## System Architecture

The VPN Dashboard is built using a modern React frontend with a TypeScript backend. The system follows a client-server architecture with the following components:

### Frontend
- Single-page React application with React Router for navigation
- React Query for data fetching and state management
- Tailwind CSS for styling with custom theme variables
- Responsive design for mobile and desktop

### Backend
- TypeScript-based API layer with RPC-style functions
- Prisma ORM for database interactions
- Authentication via AC1's auth system
- Integration with X-Ray Core VPN server API

### Communication Flow
1. User interacts with the React frontend
2. Frontend makes API calls to the backend using React Query
3. Backend processes requests, interacts with the database, and communicates with the X-Ray VPN server when needed
4. Backend returns responses to the frontend
5. Frontend updates UI based on responses

## Database Schema

### Database Overview
The application uses a Turso database (built on SQLite) with Prisma as the ORM. The database is structured to support user management, subscription tracking, payments, and VPN service integration.

The application uses a relational database with the following primary models:

### User
Stores user information and authentication details
- Core fields: id, name, handle, image (synced with AC1)
- App-specific fields: isAdmin, role, telegramId, telegramUsername
- Relationships: subscriptions, tokens, payments, messages, discounts

### Subscription
Represents a user's VPN subscription
- Fields: planName, planDuration, status, startDate, endDate, price, bandwidth, etc.
- Relationships: user, payment, xrayUser

### Payment
Tracks payment information for subscriptions
- Fields: amount, status, paymentDetails, adminApproved, etc.
- Relationships: user, subscription

### Discount (Coupon System)
Manages promotional codes and discounts
- Fields: code, percentage, isActive, expiresAt, targetRole, description, isGift, giftDetails, usageCount, maxUsageCount
- Relationships: user (optional targeting)
- Features: Supports percentage-based discounts, gift codes, role-targeting, usage tracking and limits

### XrayUser
Links users to X-Ray VPN system
- Fields: email, uuid, inbound
- Relationships: user, subscription, traffic

### Additional Models
- Message: System messages between users
- News: System announcements and news items
- SubscriptionPlan: Available subscription plans
- TelegramToken: Tokens for Telegram integration
- VpnOption: Available VPN configuration options
- XrayConfig: X-Ray server configuration
- XrayTraffic: Traffic usage statistics

## Authentication & Authorization

### Authentication
- Uses AC1's centralized authentication system
- Users log in with their AC1 credentials
- Session-based authentication with token management

### Authorization
- Role-based access control with the following roles:
  - Regular users: Access to their own subscriptions and profile
  - Testers: Access to testing features
  - VIP users: Access to premium features
  - Admins: Full access to all features and admin panel
- Feature-based permissions
- Resource-based access control (users can only access their own data)

## Workflow

1. User registers or logs in to their account
2. User is directed to their dashboard
3. Dashboard displays active VPN subscriptions and their details
4. User can view subscription status, expiration dates, and service information

## Frontend Components

### Core Pages
- **Landing Page**: Login/registration with promo code entry
- **Dashboard**: Main user interface showing subscription stats and active subscriptions
- **Profile**: User profile management
- **Admin Panel**: Administrative interface with tabs for different management functions

### Key Components
- **Navigation**: Responsive navigation bar with role-based links
- **Subscription Cards**: Display subscription details with status indicators
- **Promo Code Section**: Interface for applying and viewing available promo codes
- **Admin Coupon Management**: CRUD interface for managing promotional codes
- **Stats Cards**: Display key metrics in card format

## Coupon System

The coupon system allows administrators to create and manage promotional codes that users can redeem for discounts or special offers.

### Coupon Types
- **Percentage Discount**: Reduces subscription price by a percentage
- **Gift/Bonus**: Provides special benefits (e.g., extended subscription period, premium features)

### Coupon Targeting
- **Global**: Available to all users
- **Role-based**: Targeted to specific user roles (Regular, Tester, VIP)
- **User-specific**: Created for individual users

### Coupon Properties
- **Code**: Unique alphanumeric identifier (can be auto-generated)
- **Value**: Discount percentage or gift description
- **Expiration**: Optional date when the coupon becomes invalid
- **Description**: Details about the promotion
- **Active Status**: Whether the coupon can be used
- **Usage Tracking**: Count of how many times the coupon has been used

### User Flow
1. Admin creates coupon in admin panel
2. User enters coupon code during registration or in dashboard
3. System validates coupon and applies discount/benefit
4. User receives confirmation of applied coupon

## Offers System

The offers system allows administrators to create and manage special offers that are displayed to users on the dashboard or in dedicated sections of the application.

### Offer Properties
- **Title**: Clear name of the offer
- **Description**: Detailed explanation of what's included
- **Image**: Optional visual representation
- **Price**: Cost of the offer
- **Visibility**: Whether the offer is currently shown to users
- **Priority**: Determines display order (higher priority offers shown first)
- **Date Range**: Optional start and end dates for seasonal offers

### Offer Management
- **Create Offers**: Admins can create new offers with all properties
- **Edit Offers**: Update any offer property
- **Show/Hide Offers**: Toggle visibility without deleting
- **Delete Offers**: Remove offers that are no longer needed
- **Prioritize Offers**: Arrange the display order

### User Experience
- **Browse Offers**: Users can see all visible offers on their dashboard
- **View Details**: Users can view more information about specific offers
- **Purchase**: Integration with payment system for offer purchases

## Authentication System

The application supports two authentication methods to provide flexibility for users.

### Email Authentication
- **Registration**: Users can register with email and password
- **Verification**: Email verification process to confirm ownership
- **Password Reset**: Secure password recovery process
- **Login**: Standard email/password login flow

### Telegram Authentication
- **Bot Integration**: Authentication via Telegram bot
- **First-time Flow**: New users get a registration link from the bot
- **Account Linking**: Existing users can link their Telegram account
- **Auto-linking**: Telegram accounts automatically link during registration via bot

### Dual Authentication Support
- **Method Selection**: Users can choose their preferred login method
- **Account Merging**: Support for linking accounts created through different methods
- **Consistent Experience**: Same user experience regardless of authentication method

## Email Communication System

### User Emails
- **Verification Emails**: For confirming new accounts or email changes
- **Password Reset**: Secure links for password recovery
- **Subscription Notifications**: Alerts about expiring subscriptions
- **Payment Confirmations**: Receipts and payment status updates

### Admin Newsletter System
- **Targeted Campaigns**: Send to all users or specific roles
- **Rich Content**: Support for markdown formatting
- **Opt-out Management**: Respect user communication preferences
- **Tracking**: Basic metrics on newsletter delivery

## API Documentation

### User Management
- `getUsers` - Get a list of users with optional role filtering (admin only)
- `getCurrentUser` - Get the current authenticated user's details
- `sendAdminMessage` - Send a message to users by role or specific user IDs (admin only)
- `updateVpnOption` - Create or update VPN options (name, price, description) (admin only)

### News Management
- `createNews` - Create a news item (admin only)
- `getNews` - Get list of news items (published only for regular users, all for admins)
- `deleteNews` - Delete a news item (admin only)

### VPN Management
- `createXrayUser` - Create a new X-Ray VPN user
- `deleteXrayUser` - Delete an X-Ray VPN user
- `getXrayUsers` - Get all X-Ray VPN users
- `getXrayUser` - Get a specific X-Ray VPN user by email
- `getXrayUserStats` - Get traffic stats for a specific X-Ray VPN user
- `getXrayUsageSummary` - Get usage summary for all X-Ray VPN users
- `restartXrayService` - Restart the X-Ray VPN service
- `reloadXrayConfig` - Reload the X-Ray VPN configuration
- `getXrayConfig` - Get the current X-Ray VPN configuration
- `updateXrayConfig` - Update the X-Ray VPN configuration
- `manageXrayServerConfig` - Manage X-Ray server configuration settings

### Subscription Management
- `getUserSubscriptions` - Get the current user's subscriptions
- `getSubscriptionStats` - Get statistics about the current user's subscriptions
- `getSubscriptionPlans` - Get available subscription plans
- `createSubscriptionPlan` - Create a new subscription plan (admin only)
- `initiatePayment` - Initiate a payment for a subscription
- `approvePayment` - Approve a payment (admin only)
- `rejectPayment` - Reject a payment (admin only)
- `extendSubscription` - Extend an existing subscription
- `getUserPayments` - Get the current user's payment history
- `getAllSubscriptions` - Get all subscriptions (admin only)
- `getAllPayments` - Get all payments (admin only)
- `addSubscription` - Add a subscription for a user (admin only)

### Client-Specific Endpoints
- `getUserMessages` - Get messages for the current user
- `markMessageAsRead` - Mark a message as read
- `getUserDiscounts` - Get available discounts for the current user
- `applyDiscountCode` - Apply a discount code

### Coupon/Promo Management
- `setDiscount` - Create a new discount/promo code (admin only)
- `updateDiscount` - Update an existing discount/promo code (admin only)
- `deleteDiscount` - Delete a discount/promo code (admin only)
- `getAllDiscounts` - Get all discount/promo codes (admin only)
- `generatePromoCode` - Generate a random promo code (admin only)
- `getDiscountStats` - Get statistics about discount/promo code usage (admin only)

## Workflow

### User Registration and Login
1. User visits the landing page
2. User can register a new account or log in to an existing one
3. During registration or login, user can enter a promo code
4. Upon successful authentication, user is redirected to the dashboard

### Subscription Management
1. User views active subscriptions on the dashboard
2. User can view subscription details including status, expiration date, and bandwidth usage
3. User can apply promo codes to get discounts on subscriptions
4. User can initiate payment for new subscriptions

### Admin Workflow
1. Admin logs in and accesses the admin panel
2. Admin can create, edit, and delete promo codes
3. Admin can manage users, subscriptions, and payments
4. Admin can approve or reject pending payments
5. Admin can configure VPN server settings

## Admin Features

- **User Management**: View and manage user accounts, roles, and permissions
- **Subscription Management**: View all subscriptions, extend or modify subscriptions
- **Payment Processing**: Approve or reject pending payments
- **Coupon Management**: Create, edit, delete, and track usage of promotional codes
- **VPN Server Configuration**: Manage X-Ray VPN server settings and configurations
- **System Monitoring**: View system statistics and monitor VPN usage

## User Features

- **Dashboard**: View subscription status and statistics
- **Subscription Management**: View active subscriptions and usage details
- **Promo Code Application**: Apply promotional codes for discounts
- **Profile Management**: Update profile information and account settings
- **Payment History**: View payment history and subscription details