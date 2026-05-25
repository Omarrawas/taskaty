# منصة "خدماتي" — المواصفات التقنية

## Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: tRPC + Drizzle ORM + Hono + MySQL
- **Auth**: OAuth 2.0 (Kimi)
- **State**: React Query (server) + Zustand (client)
- **Animation**: GSAP + Lenis + Framer Motion + react-countup
- **Routing**: react-router v7
- **Icons**: lucide-react

---

## Database Schema (MySQL/Drizzle)

### Tables

```typescript
// users — managed by OAuth (Kimi)
users: {
  id: serial("id").primaryKey(),
  email: varchar("email", 255).notNull().unique(),
  fullName: varchar("full_name", 100),
  avatarUrl: text("avatar_url"),
  phone: varchar("phone", 20),
  isPhoneVerified: boolean("is_phone_verified").default(false),
  role: enum("role", ["buyer","seller","admin","moderator"]).default("buyer"),
  status: enum("status", ["active","suspended","banned"]).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
}

// seller_profiles
sellerProfiles: {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).references(() => users.id).notNull(),
  bio: text("bio"),
  skills: json("skills").$type<string[]>(),
  level: enum("level", ["new","level1","level2","top_rated"]).default("new"),
  totalOrders: int("total_orders").default(0),
  completedOrders: int("completed_orders").default(0),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
  responseTime: int("response_time"), // minutes
  portfolio: json("portfolio").$type<{url:string, title:string}[]>(),
  badges: json("badges").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
}

// categories
categories: {
  id: serial("id").primaryKey(),
  nameAr: varchar("name_ar", 100).notNull(),
  nameEn: varchar("name_en", 100),
  slug: varchar("slug", 100).unique(),
  icon: varchar("icon", 50), // lucide icon name
  parentId: bigint("parent_id", { mode: "number", unsigned: true }).references(() => categories.id),
  isActive: boolean("is_active").default(true),
  sortOrder: int("sort_order").default(0),
}

// services
services: {
  id: serial("id").primaryKey(),
  sellerId: bigint("seller_id", { mode: "number", unsigned: true }).references(() => users.id).notNull(),
  categoryId: bigint("category_id", { mode: "number", unsigned: true }).references(() => categories.id).notNull(),
  title: varchar("title", 200).notNull(),
  slug: varchar("slug", 200).unique(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  deliveryTime: int("delivery_time"), // days
  images: json("images").$type<string[]>(),
  extras: json("extras").$type<{name:string, price:number, deliveryTime:number}[]>(),
  tags: json("tags").$type<string[]>(),
  status: enum("status", ["draft","pending","active","paused","rejected"]).default("pending"),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
  totalReviews: int("total_reviews").default(0),
  totalOrders: int("total_orders").default(0),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}

// orders
orders: {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number", 20).unique(),
  buyerId: bigint("buyer_id", { mode: "number", unsigned: true }).references(() => users.id).notNull(),
  sellerId: bigint("seller_id", { mode: "number", unsigned: true }).references(() => users.id).notNull(),
  serviceId: bigint("service_id", { mode: "number", unsigned: true }).references(() => services.id).notNull(),
  extras: json("extras").$type<{name:string, price:number}[]>(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: enum("status", ["pending","in_progress","delivered","revision","completed","cancelled","disputed"]).default("pending"),
  requirements: text("requirements"),
  deliveryDate: timestamp("delivery_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}

// wallets
wallets: {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).references(() => users.id).notNull().unique(),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
}

// wallet_transactions
walletTransactions: {
  id: serial("id").primaryKey(),
  walletId: bigint("wallet_id", { mode: "number", unsigned: true }).references(() => wallets.id).notNull(),
  type: enum("type", ["deposit","withdrawal","payment","refund","escrow_release","fee"]).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  balanceAfter: decimal("balance_after", { precision: 10, scale: 2 }),
  referenceType: varchar("reference_type", 50),
  referenceId: bigint("reference_id", { mode: "number", unsigned: true }),
  description: text("description"),
  status: enum("status", ["pending","completed","failed","cancelled"]).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
}

// withdrawal_requests
withdrawalRequests: {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  method: enum("method", ["sham_cash","syriatel_cash","mtn_cash","bank_transfer"]).notNull(),
  accountNumber: varchar("account_number", 100),
  accountName: varchar("account_name", 100),
  proofImage: text("proof_image"),
  status: enum("status", ["pending","approved","rejected"]).default("pending"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
}

// payment_proofs
paymentProofs: {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  method: enum("method", ["sham_cash","syriatel_cash","mtn_cash"]).notNull(),
  transactionNumber: varchar("transaction_number", 100),
  proofImage: text("proof_image"),
  senderPhone: varchar("sender_phone", 20),
  status: enum("status", ["pending","approved","rejected"]).default("pending"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
}

// conversations
conversations: {
  id: serial("id").primaryKey(),
  orderId: bigint("order_id", { mode: "number", unsigned: true }).references(() => orders.id),
  buyerId: bigint("buyer_id", { mode: "number", unsigned: true }).references(() => users.id).notNull(),
  sellerId: bigint("seller_id", { mode: "number", unsigned: true }).references(() => users.id).notNull(),
  lastMessage: text("last_message"),
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow(),
}

// messages
messages: {
  id: serial("id").primaryKey(),
  conversationId: bigint("conversation_id", { mode: "number", unsigned: true }).references(() => conversations.id).notNull(),
  senderId: bigint("sender_id", { mode: "number", unsigned: true }).references(() => users.id).notNull(),
  content: text("content"),
  attachments: json("attachments").$type<{type:string, url:string, name:string}[]>(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}

// reviews
reviews: {
  id: serial("id").primaryKey(),
  orderId: bigint("order_id", { mode: "number", unsigned: true }).references(() => orders.id).notNull(),
  reviewerId: bigint("reviewer_id", { mode: "number", unsigned: true }).references(() => users.id).notNull(),
  revieweeId: bigint("reviewee_id", { mode: "number", unsigned: true }).references(() => users.id).notNull(),
  type: enum("type", ["buyer_to_seller","seller_to_buyer"]).notNull(),
  rating: int("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
}

// disputes
disputes: {
  id: serial("id").primaryKey(),
  orderId: bigint("order_id", { mode: "number", unsigned: true }).references(() => orders.id).notNull(),
  openedBy: bigint("opened_by", { mode: "number", unsigned: true }).references(() => users.id).notNull(),
  reason: text("reason"),
  evidence: json("evidence").$type<string[]>(),
  status: enum("status", ["open","under_review","resolved_buyer","resolved_seller","closed"]).default("open"),
  adminDecision: text("admin_decision"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
}

// notifications
notifications: {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).references(() => users.id).notNull(),
  type: varchar("type", 50),
  title: varchar("title", 200),
  body: text("body"),
  data: json("data"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}
```

---

## API Endpoints (tRPC Routers)

### auth (OAuth — managed by Kimi SDK)
- `auth.me` — query — current user
- `auth.logout` — mutation — clear session

### services
- `services.list` — query — list with filters (category, price range, rating, sort, pagination)
- `services.featured` — query — featured services (limit 8)
- `services.bySlug` — query — single service with seller, category, reviews
- `services.bySeller` — query — seller's services
- `services.create` — mutation — create service (seller only)
- `services.update` — mutation — update service (seller only)
- `services.delete` — mutation — delete service (seller only)

### categories
- `categories.list` — query — all active categories with service counts

### sellers
- `sellers.list` — query — top sellers with filters
- `sellers.profile` — query — seller profile by ID/slug

### orders
- `orders.list` — query — user's orders (buyer/seller filter)
- `orders.create` — mutation — create order
- `orders.updateStatus` — mutation — update order status
- `orders.byId` — query — order details

### wallet
- `wallet.balance` — query — current balance
- `wallet.transactions` — query — transaction history
- `wallet.deposit` — mutation — create deposit request
- `wallet.withdraw` — mutation — create withdrawal request

### payments
- `payments.submitProof` — mutation — upload payment proof

### chat
- `chat.conversations` — query — user's conversations
- `chat.messages` — query — messages by conversation
- `chat.sendMessage` — mutation — send message
- `chat.markRead` — mutation — mark messages as read

### reviews
- `reviews.list` — query — reviews by service/seller
- `reviews.create` — mutation — create review

### admin
- `admin.stats` — query — dashboard statistics
- `admin.users` — query — users list
- `admin.services` — query — pending services
- `admin.orders` — query — orders list
- `admin.withdrawals` — query — withdrawal requests
- `admin.approveWithdrawal` — mutation
- `admin.rejectWithdrawal` — mutation
- `admin.disputes` — query — disputes list
- `admin.resolveDispute` — mutation
- `admin.approveService` — mutation
- `admin.rejectService` — mutation

---

## Component Inventory

### shadcn/ui (built-in)
- `button` — all buttons
- `input` — form inputs
- `card` — cards
- `badge` — status badges, tags
- `avatar` — user avatars
- `dialog` — modals, confirmations
- `dropdown-menu` — nav dropdowns, filters
- `select` — sort dropdowns
- `tabs` — tabbed interfaces
- `separator` — dividers
- `scroll-area` — scrollable areas
- `table` — data tables
- `textarea` — text areas
- `checkbox` — filter checkboxes
- `switch` — toggle switches
- `toast` — notifications
- `tooltip` — tooltips
- `accordion` — FAQ sections
- `label` — form labels
- `skeleton` — loading states

### Custom Components
- `ServiceCard` — service listing card
- `CategoryCard` — category display card
- `SellerCard` — seller profile card
- `OrderCard` — order summary card
- `ReviewCard` — review display card
- `StatCard` — dashboard stat with count-up
- `StarRating` — star rating display + input
- `PriceDisplay` — formatted price in SYP
- `SearchBar` — hero search input
- `ImageGallery` — service image gallery
- `FilterSidebar` — services page filters
- `Pagination` — page navigation
- `ConversationList` — chat sidebar
- `MessageBubble` — chat message
- `SidebarNav` — dashboard sidebar
- `Breadcrumb` — page breadcrumbs
- `HeroSection` — home hero
- `HowItWorks` — steps section
- `CTABanner` — call-to-action banner
- `AuthForm` — login/register forms

### Custom Hooks
- `useAuth` — authentication state
- `useSocket` — socket.io connection
- `useNotifications` — notification state
- `useScrollAnimation` — GSAP scroll triggers
- `useLenis` — smooth scroll

---

## Animation Implementation

| Animation | Library | Approach | Complexity |
|---|---|---|---|
| Smooth scroll | Lenis | Global init with GSAP ScrollTrigger sync | Low |
| Hero entrance | GSAP | Timeline: title words stagger 0.12s, search bar scale+fade 0.4s delay, stats count-up 0.6s | Medium |
| Section headings | GSAP ScrollTrigger | y:20, opacity:0, duration:0.6, ease:power2.out | Low |
| Card entrance | GSAP ScrollTrigger | y:40, opacity:0, stagger:0.08, duration:0.5 | Low |
| Category card hover | CSS | Scale icon 1.1, bg change, shadow transition | Low |
| Service card hover | CSS | translateY(-4px), hover shadow | Low |
| How It Works steps | GSAP ScrollTrigger | Steps stagger RTL 0.15s, connector lines animate width | Medium |
| Trust section | GSAP ScrollTrigger | Items fade in stagger 0.15s | Low |
| CTA Banner | GSAP ScrollTrigger | Fade + scale 0.97 | Low |
| Stats count-up | react-countup | Triggered on viewport enter | Low |
| Toast notifications | Framer Motion | AnimatePresence, slide from left | Low |
| Page transitions | Framer Motion | AnimatePresence, fade | Low |
| Mobile menu | Framer Motion | Slide from right | Low |
| Image gallery | Framer Motion | AnimatePresence for image swap | Low |
| Search bar glow | CSS | Subtle box-shadow pulse on focus | Low |
| Button hover | CSS | Scale 1.02, shadow increase | Low |
| Card image zoom | CSS | Scale 1.05 on hover | Low |
| Loading skeletons | CSS | Shimmer animation | Low |

---

## State Management

### Zustand Stores

```typescript
// authStore — auth state, user data
// uiStore — theme, sidebar open, toast queue
// cartStore — order draft, selected extras
```

### React Query Keys

```typescript
// ['services', { filters }] — services list
// ['services', 'featured'] — featured services
// ['service', slug] — single service
// ['categories'] — categories
// ['sellers', { filters }] — sellers list
// ['seller', id] — seller profile
// ['orders', { status }] — orders list
// ['order', id] — single order
// ['wallet', 'balance'] — wallet balance
// ['wallet', 'transactions'] — transactions
// ['conversations'] — chat conversations
// ['messages', conversationId] — messages
// ['reviews', { serviceId | sellerId }] — reviews
// ['notifications'] — notifications
// ['admin', 'stats'] — admin stats
// ['admin', 'users'] — admin users
// ['admin', 'services'] — admin services
// ['admin', 'orders'] — admin orders
// ['admin', 'withdrawals'] — admin withdrawals
// ['admin', 'disputes'] — admin disputes
```

---

## Project File Structure

```
/mnt/agents/output/app/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── layout/          # Header, Footer, Sidebar, DashboardLayout
│   │   ├── cards/           # ServiceCard, CategoryCard, SellerCard, OrderCard, ReviewCard, StatCard
│   │   ├── shared/          # StarRating, PriceDisplay, SearchBar, Breadcrumb, Pagination, ImageGallery
│   │   ├── chat/            # ConversationList, MessageBubble
│   │   ├── filters/         # FilterSidebar
│   │   └── forms/           # AuthForm
│   ├── sections/            # Page sections (Hero, Categories, FeaturedServices, HowItWorks, TopSellers, TrustGuarantees, CTABanner)
│   ├── pages/               # Page components (Home, Services, ServiceDetails, SellerProfile, Dashboard, Admin, Login, Register, NotFound)
│   ├── hooks/               # useAuth, useSocket, useNotifications, useScrollAnimation, useLenis
│   ├── stores/              # Zustand stores (authStore, uiStore, cartStore)
│   ├── providers/           # TRPCProvider, QueryProvider
│   ├── lib/                 # utils, constants, mockData, formatters
│   ├── types/               # TypeScript types
│   ├── App.tsx              # Routes
│   ├── main.tsx             # Entry point
│   └── index.css            # Tailwind + custom styles + fonts
├── api/
│   ├── router.ts            # tRPC app router
│   ├── middleware.ts        # Auth, rate limiting, admin middleware
│   ├── boot.ts              # Hono server
│   ├── routes/              # Route handlers per domain
│   │   ├── services.ts
│   │   ├── categories.ts
│   │   ├── sellers.ts
│   │   ├── orders.ts
│   │   ├── wallet.ts
│   │   ├── payments.ts
│   │   ├── chat.ts
│   │   ├── reviews.ts
│   │   └── admin.ts
│   └── queries/             # Database queries
│       └── connection.ts    # Drizzle connection
├── db/
│   ├── schema.ts            # All table definitions
│   ├── seed.ts              # Seed script
│   └── migrations/          # Migration files
├── contracts/               # Shared types/constants
├── public/
│   └── images/              # Static images
├── dist/                    # Build output
├── .env                     # Environment variables
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── drizzle.config.ts
```

---

## Key Implementation Notes

**RTL Layout**: Apply `dir="rtl"` and `lang="ar"` on `<html>`. Use Tailwind RTL utilities (`rtl:`, `space-x-reverse`). All flex layouts naturally reverse in RTL.

**Fonts**: Import Cairo (400, 500, 600, 700) and Reem Kufi (500) from Google Fonts via `<link>` in index.html.

**Mock Data**: Comprehensive seed script populating ~100 services, ~20 sellers, ~50 reviews, ~30 orders. All content in Arabic with realistic Syrian-market prices.

**Auth Flow**: OAuth 2.0 via Kimi. After login, redirect to intended page. Role-based access control (RBAC) on routes and API endpoints.

**Image Handling**: Service images from Unsplash via picsum or generated. Avatars from DiceBear. Optimized with lazy loading.

**Real-time Chat**: Socket.io for instant messaging. Fallback to polling on connection failure.

**Admin Guard**: `adminQuery` and `adminMutation` procedures that check role === "admin". Return 403 for non-admin.

**Payment Flow**: Manual payment with proof upload → Admin review → Approve/Reject → Wallet balance update.

**Form Validation**: Zod schemas on all tRPC inputs. Client-side with react-hook-form + zodResolver.

**Accessibility**: Focus-visible states, ARIA labels, color contrast compliance, reduced-motion support.
