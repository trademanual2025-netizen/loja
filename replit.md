# Giovana Dias Joias - E-commerce Next.js

## Overview
Giovana Dias Joias is an e-commerce platform for handmade jewelry, built with Next.js, Prisma, PostgreSQL, and TailwindCSS. The platform supports three languages (PT/EN/ES) with automated and manual translation features for products, categories, and UI. Key features include comprehensive SEO, robust security, and integrations with major payment gateways like Stripe and MercadoPago. The system aims to provide a seamless shopping experience for customers and efficient management tools for administrators, including order processing, inventory, and detailed analytics.

## User Preferences
- **Communication Style**: I prefer clear and concise language.
- **Workflow**: I want an iterative development process.
- **Interaction**: Ask for confirmation before making significant changes to the codebase or architectural decisions.
- **Explanations**: Provide detailed explanations for complex implementations.
- **Codebase Changes**:
  - Do not make changes to the `public/` directory unless explicitly instructed.
  - Prioritize maintaining the existing file structure in `src/app/api/` and `src/app/admin/`.
  - Any new external dependencies must be discussed and approved first.
  - Do not alter the core logic within `src/lib/admin-auth.ts` or `src/lib/tracking.ts` without explicit instruction.

## System Architecture

### UI/UX Decisions
- **Color Scheme**: Based on the brand's visual identity.
- **Templates**: Utilizes a custom `ThemeProvider` for independent theming between the store and admin panels.
- **Design Approach**: Responsive design using TailwindCSS, ensuring optimal display across devices. Iconography is handled by Lucide-React.
- **Language Support**: UI texts are managed via a dictionary in `src/lib/i18n.ts`. Product and category data support PT/EN/ES, with automatic translation fallback for empty fields.
- **Landing Page**: Dynamic content from the database for hero section, CTA, and custom banners, configurable via the admin panel.

### Technical Implementations
- **Framework**: Next.js 16 with App Router.
- **Styling**: TailwindCSS 4.
- **State Management**: Zustand for client-side state.
- **Notifications**: Sonner for toast notifications.
- **Database**: PostgreSQL (Neon) accessed via Prisma 7.
- **Authentication**: JWT-based authentication for users and administrators. Passwords are hashed with bcrypt.
- **Internationalization**: Three-language support (PT/EN/ES) with automated translation of product/category data and dynamic UI text based on user locale.
- **SEO**: Dynamic sitemaps, robots.txt, `generateMetadata` for all pages (including layout), JSON-LD for product and organization data, and configurable SEO settings in the admin panel. Settings are invalidated via `revalidateTag('settings')` on save.
- **Payment Gateways**: Integration with Stripe and MercadoPago, including webhook handling and payment status updates. Automatic region detection for gateway selection (MercadoPago for Brazil, Stripe internationally).
- **Shipping**: Real-time shipping calculation using Correios API with multi-layered fallbacks (regional pricing, fixed rates). Supports product-specific dimensions and dynamic package volume calculation.
- **Cart Management**: Server-synced cart for logged-in users, storing items in `cartData` JSON field in the User model.
- **Order Processing**: Detailed order tracking, payment information display (including PIX QR codes), and user-initiated order cancellation for payment method changes.
- **Refund System**: A dedicated refund request and management system with a two-way chat between users and administrators.
- **Tracking**: Server-side tracking for Meta CAPI (PageView, ViewContent, AddToCart, InitiateCheckout, Purchase) and Google Ads Enhanced Conversions, ensuring data accuracy and deduplication.
- **WhatsApp Integration**: Via Evolution API for automated messaging and customer support, configurable from the admin panel.
- **Admin Panel**: Comprehensive dashboard for product, order, user, settings management, and data backup.

### System Design Choices
- **Data Fetching**: Prisma queries optimize performance by using `select` for specific fields and HTTP caching for listing endpoints. Note: Neon DB uses `PrismaPg` adapter with `uselibpqcompat=true`; raw `pg` queries cannot access tables directly — always use Prisma client for DB operations.
- **Admin Settings Pipeline**: Settings are saved via POST `/api/admin/settings` → stored in `Settings` table → cache invalidated via `revalidateTag('settings')` + `clearSettingsCache()` → pages revalidated via `revalidatePath`. All color CSS variables (--primary, --btn-buy, --btn-header, --text, --bg, --bg-card, --text-title, --icon-cart) are applied as inline styles on `<html>` in layout.tsx.
- **Security**: Robust authentication with JWTs and bcrypt, HMAC signature verification for webhooks, and secure handling of environment variables.
- **Performance**: Aggregated database queries, caching strategies for frequently accessed data (e.g., user status, settings), and parallelized API calls. Connection pooling for PostgreSQL.
- **Error Handling**: Global error boundary (`src/app/error.tsx`).
- **Webhook Field Mapping**: Customizable webhook payload fields for integration with external tools.
- **Product Variants**: Support for individual images per product variant, enhancing product display.
- **Product Display**: Configurable products per page, sorting options, and installment display on product cards and pages.

## External Dependencies
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Payments**: Stripe, MercadoPago
- **Authentication**: bcryptjs, jsonwebtoken
- **UI Icons**: Lucide-React
- **Notifications**: Sonner
- **State Management**: Zustand
- **Translation API**: google-translate-api-x (for automated content translation)
- **IP Geolocation**: ipapi.co, ip2c.org (for payment gateway auto-detection)
- **Shipping Calculation**: Correios API
- **WhatsApp API**: Evolution API