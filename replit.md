# Resilient — Luxury E-commerce Platform & Contacts Dashboard

## Overview
A high-end luxury streetwear e-commerce platform for the brand "Resilient" with an integrated Contacts/CRM dashboard. Styled after modern tech-wear / industrial streetwear brands (Fear of God, Off-White, Stüssy aesthetic).

## Architecture
- **Frontend**: React + TypeScript + Tailwind CSS + Framer Motion + wouter routing
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Session**: express-session with connect-pg-simple

## Key Features
1. **Drop Lock Gate** — Password-protected entry page (password: `resilient2026`) with shutter animation, dust particles, breathing logo, Electric Blue glow
2. **Shop** — Product catalog with category filtering (hoodies, tees, pants, jackets), oversized product cards with Quick Add hover, watermark overlay
3. **Product Detail** — Size selection with Electric Blue active state, stock checking, add-to-cart
4. **Cart & Checkout** — Full checkout flow with order creation, monospaced prices
5. **Gallery** — Masonry-style editorial photo gallery with mouse-tilt effect, thick borders, full-screen lightbox
6. **Admin Dashboard** (password: `admin2026`) — Dark industrial aesthetic with neon status badges, full CRUD product management, inline stock editing, Contacts tab with search/filter by name+email+order#, mailto email button, delete with confirmation dialog, mobile card view, address pulled from latest order, CSV export, order tracking
7. **Product Display Ordering** — `display_order` column on products; inline rank number input per row in admin inventory auto-saves on blur/Enter; shop page sorted server-side by displayOrder ASC
8. **Image Gallery Drag-and-Drop** — Thumbnails in the product edit form are reorderable via dnd-kit SortableContext; drag handle (GripVertical) appears on hover; first image is marked as "Hero" with blue border

## Visual Design System
- **Background**: Off-Black (#0A0A0A) via CSS `--background: 0 0% 4%`
- **Accent Color**: Electric Blue (#0080FF) via CSS `--accent-blue: 210 100% 50%` / Tailwind `accent-blue`
- **Typography**: Archivo Black (display/headers), Inter (body), JetBrains Mono (prices, data, labels)
- **Border Radius**: 0px globally (sharp, aggressive look)
- **Borders**: Thick 2px solid borders on cards, buttons, images, inputs
- **Navigation**: Center-aligned logo, all-caps menu links with Electric Blue hover underlines, left-side nav links
- **Noise Overlay**: Fixed SVG fractal noise at 0.04 opacity via `.noise-overlay` class
- **Loading Bar**: Electric Blue animated bar during navigation
- **Liquid Fill Buttons**: Electric Blue fill on hover via `.btn-liquid` CSS
- **Product Cards**: Aspect-ratio 2/3 oversized images, Quick Add button slides up from bottom on hover
- **Admin Badges**: Neon-colored status badges — `.badge-neon-green` (Live/Paid), `.badge-neon-amber` (Low/Pending), `.badge-neon-red` (Out/Archived), `.badge-neon-blue` (Featured/Elite)

## Visual Effects
- **Parallax Images**: Hero and collection images use Framer Motion scroll-based transforms
- **Watermark**: Large "RESILIENT" text drifting diagonally at 3% opacity, Electric Blue tint
- **Marquee**: Infinite scrolling text with Electric Blue/60 tint
- **Split Text**: Letter-by-letter reveal animation for headings
- **Scroll-triggered Fades**: Sections slide up and fade in on scroll

## Data Models
- `products` — name, description, price, category, images[], featured, active, createdAt
- `stock` — productId, size (dynamic: XS through 5XL, configurable per product), quantity
- `customers` — email, name, phone, totalSpent, lastPurchase, smsSubscribed
- `orders` — customerId, items (JSONB), total, status, shippingAddress (JSONB)
- `smsSubscribers` — phone, email
- `siteSettings` — key/value store for maintenance_mode, site_password
- `categories` — id (uuid PK), name, slug (unique), createdAt; managed via admin Category Manager

## Routes
- `/` — Homepage with hero, featured products, marquee, gallery teaser
- `/shop` — Product catalog with category filters and watermark
- `/product/:id` — Product detail
- `/cart` — Shopping cart
- `/checkout` — Checkout flow
- `/gallery` — Masonry photo gallery with tilt + lightbox
- `/admin` — Admin login + full CRUD dashboard

## API Endpoints
- `POST /api/auth/unlock` — Site password gate (uses dynamic DB password)
- `GET /api/auth/check` — Check site unlock status + maintenance mode flag
- `POST /api/admin/login` — Admin login
- `GET /api/admin/check` — Check admin auth
- `GET /api/products` — List all active products with stock
- `GET /api/products/:id` — Single product with stock
- `POST /api/sms-subscribe` — SMS drop alerts signup
- `POST /api/orders` — Create order (handles customer creation, stock updates)
- `GET /api/categories` — List all categories (public)
- `GET /api/admin/categories` — List all categories (admin)
- `POST /api/admin/categories` — Create category
- `PATCH /api/admin/categories/:id` — Rename category (auto-reassigns products)
- `DELETE /api/admin/categories/:id` — Delete category (requires reassignTo body param)
- `GET /api/admin/dashboard` — Admin data (all products inc. inactive, customers, orders, stats, categories)
- `POST /api/admin/upload` — Upload product image file (multipart, returns `{ url }`)
- `PATCH /api/admin/products/batch` — Batch update multiple products (category, price, visibility, featured, stock)
- `POST /api/admin/products` — Create product with stock
- `PATCH /api/admin/products/:id` — Update product details
- `DELETE /api/admin/products/:id` — Soft-delete (archive) product
- `PATCH /api/admin/stock/:productId` — Update stock counts per size
- `GET /api/admin/settings` — Get site settings (maintenance mode, password)
- `PATCH /api/admin/settings` — Update site settings
- `GET /api/admin/marketing/stats` — Integration status + subscriber counts
- `POST /api/admin/sms-blast` — Blast SMS to all opted-in customers (Twilio)
- `POST /api/admin/email-blast` — Blast email to all customers (Resend)

## Integrations (credential-gated, all graceful no-op if unconfigured)
- **Twilio SMS** (`server/sms.ts`) — Order confirmation + SMS blast. Env: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- **Resend Email** (`server/email.ts`) — Order confirmation + email blast. Env: `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (optional, default `orders@resilient.com`)
- **Google Analytics 4** (injected in `client/src/App.tsx`) — Page-view tracking on route change. Env: `VITE_GA_MEASUREMENT_ID` (format: `G-XXXXXXXXXX`)

## Key Components
- `client/src/components/watermark.tsx` — Drifting watermark overlay with Electric Blue tint
- `client/src/components/marquee.tsx` — Infinite scrolling text with Electric Blue tint
- `client/src/components/split-text.tsx` — SplitText + FadeInSection animation components
- `client/src/components/navbar.tsx` — Fixed nav with center logo, all-caps menu, Electric Blue underline hover
- `client/src/pages/gallery.tsx` — Masonry gallery with TiltCard, thick borders, lightbox
- `client/src/pages/admin/dashboard.tsx` — Full admin CRUD with ProductFormModal + NeonBadge component
