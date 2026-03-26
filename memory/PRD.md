# Bella Cucina - Restaurant Online Ordering System PRD

## Original Problem Statement
Build a high-conversion, mobile-first online ordering system for local restaurants. Template-based SaaS product that can be redeployed for different restaurants by changing config (name, menu, branding).

## Architecture
- **Frontend**: React 19 + Tailwind CSS + shadcn/ui components
- **Backend**: FastAPI (Python) with Motor (async MongoDB driver)
- **Database**: MongoDB (collections: menu_items, orders, admin_users, restaurant_settings, counters)
- **Auth**: JWT-based admin authentication (bcrypt password hashing)
- **Styling**: Cabinet Grotesk + Satoshi fonts, Terracotta Red (#E15A32) accent

## User Personas
1. **Customer** - Mobile-first, wants quick ordering, minimal friction
2. **Restaurant Owner/Staff** - Non-technical, needs simple dashboard for order management

## Core Requirements
- Digital menu with categories, item cards, add-ons, pricing
- Persistent cart (localStorage) with quantity controls
- Frictionless checkout (name, phone, optional address, cash on delivery)
- Order confirmation with status tracking (polling every 10s)
- Admin panel with real-time order feed (polling every 5s)
- Order lifecycle: new → accepted → preparing → ready → completed
- Daily stats dashboard (orders, revenue, pending, avg order value)
- Restaurant open/closed toggle
- Sound notification for new orders (admin)

## What's Been Implemented (March 26, 2026)
- [x] Complete backend API (17 endpoints)
- [x] Auto-seeding with 17 menu items across 5 categories
- [x] Landing page with premium hero section + menu grid
- [x] Category filtering (All, Pizza, Burgers, Sides, Drinks, Desserts)
- [x] Item detail dialog with add-on customization
- [x] Quick-add buttons on menu cards
- [x] Persistent cart with Sheet sidebar
- [x] Mobile floating cart button
- [x] Checkout with delivery/pickup toggle + upsell suggestions
- [x] Order confirmation with progress tracker
- [x] Admin login (JWT auth)
- [x] Admin dashboard with stats cards
- [x] Order feed with tabs (All/Active/New/Done)
- [x] Accept/reject/progress order actions
- [x] Restaurant open/closed toggle (Switch)
- [x] Sound notification toggle
- [x] Manual refresh + auto-polling

## Testing Results
- Backend: 100% (22/22 endpoints)
- Frontend: 100% (23/23 features)
- Integration: 100% (full customer and admin workflows)

## Prioritized Backlog
### P0 (Critical - Next Sprint)
- None (MVP complete)

### P1 (High Value)
- Order history by phone number (customer lookup)
- Push/SMS notification to customer on status change
- Menu item management CRUD in admin panel
- Image upload for menu items

### P2 (Nice to Have)
- Online payment integration (Stripe)
- Multi-restaurant support (template system)
- Order analytics dashboard with charts
- Customer reviews/ratings
- Delivery tracking / driver assignment
- Promo codes / discount system
- WhatsApp/Telegram order notifications
- Print receipt functionality

## Admin Credentials
- Username: `admin`
- Password: `admin123`

## Tech Stack Details
- FastAPI 0.110.1, Motor 3.3.1, PyJWT, bcrypt
- React 19, React Router 7, Tailwind 3, shadcn/ui, Sonner (toasts)
- Fonts: Cabinet Grotesk (headings), Satoshi (body) via Fontshare
