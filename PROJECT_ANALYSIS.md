# 📊 PHÂN TÍCH CHI TIẾT EBAY TMDT APP - COMPREHENSIVE PROJECT ANALYSIS

> **Tài liệu này cung cấp cái nhìn toàn diện về cấu trúc, quy trình làm việc, kiến trúc và quy tắc phát triển**
>
> **Phiên bản**: 1.0.0 | **Ngày cập nhật**: 2026-01-22

---

## 📋 MỤC LỤC

1. [Tổng Quan Dự Án](#1-tổng-quan-dự-án)
2. [Stack Công Nghệ](#2-stack-công-nghệ)
3. [Cấu Trúc Thư Mục Chuyên Sâu](#3-cấu-trúc-thư-mục-chuyên-sâu)
4. [Kiến Trúc Tổng Thể](#4-kiến-trúc-tổng-thể)
5. [Luồng Hoạt Động Dữ Liệu](#5-luồng-hoạt-động-dữ-liệu)
6. [Hệ Thống Typing & Adapter](#6-hệ-thống-typing--adapter)
7. [Routing & Navigation](#7-routing--navigation)
8. [State Management](#8-state-management)
9. [API Layer & Validation](#9-api-layer--validation)
10. [Authentication & Token Management](#10-authentication--token-management)
11. [Quy Tắc & Constraints](#11-quy-tắc--constraints)
12. [Hướng Dẫn Tạo Feature Mới](#12-hướng-dẫn-tạo-feature-mới)
13. [File Organization Guide](#13-file-organization-guide)

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1. Mục Đích Dự Án

**CanoX** là ứng dụng mobile thương mại điện tử (E-commerce) được phát triển bằng **React Native + Expo SDK 54**, hỗ trợ iOS và Android.

### 1.2. Tên Chính Thức

- **Tên App**: CanoX
- **Tên Repo**: EBAY_TMDT_APP_mobi_DEV03
- **Package Name (Android)**: com.cano.canox / com.cano.canox.dev / com.cano.canox.preview
- **Bundle ID (iOS)**: com.cano.canox / com.cano.canox.dev / com.cano.canox.preview

### 1.3. Tính Năng Chính

| Tính Năng | Mô Tả | Status |
|-----------|-------|--------|
| **Catalog & Search** | Danh mục, tìm kiếm sản phẩm | ✅ |
| **Cart** | Giỏ hàng, quản lý items | ✅ |
| **Checkout** | Tính toán vận chuyển, voucher, totals | ✅ |
| **Authentication** | Login, Register, JWT + Biometric | ✅ |
| **Real-time Chat** | WebSocket (STOMP) messaging | ✅ |
| **Notifications** | Push notifications | ✅ |
| **User Profile** | Quản lý tài khoản, địa chỉ | ✅ |
| **Order Management** | Lịch sử đơn hàng | ✅ |

### 1.4. Triết Lý Kiến Trúc

```
┌────────────────────────────────────────────────────┐
│              DESIGN PHILOSOPHY                     │
├────────────────────────────────────────────────────┤
│                                                    │
│  1. Clean Architecture (3 layers)                  │
│  2. Type-Safe: TypeScript strict mode              │
│  3. Data Transformation: DTO → Zod → Adapter → UI  │
│  4. Separation of Concerns:                        │
│     - Presentation: Components + Screens           │
│     - Application: Hooks + Stores                  │
│     - Data: API Client + Validation                │
│                                                    │
│  5. Pattern-Driven Development                     │
│  6. Zero Runtime Errors Policy                     │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## 2. STACK CÔNG NGHỆ

### 2.1. Core Framework (React Native Ecosystem)

```
┌─────────────────────────────────────────────────────────┐
│                    TECH STACK LAYERS                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  FRAMEWORK LAYER                                        │
│  ├── React 19.1.0            (UI components)            │
│  ├── React Native 0.81.5     (Cross-platform)           │
│  └── Expo SDK 54.0.31        (Dev platform)             │
│                                                          │
│  NAVIGATION LAYER                                       │
│  ├── Expo Router ~6.0.21     (File-based routing)       │
│  └── @react-navigation/native 7.1.26 (Navigation core)  │
│                                                          │
│  STATE MANAGEMENT LAYER                                 │
│  ├── Zustand 5.0.9           (Global state)             │
│  ├── @tanstack/react-query 5.90.12 (Server state)       │
│  └── react-native-mmkv 4.1.0 (Fast storage)             │
│                                                          │
│  UI & STYLING LAYER                                     │
│  ├── react-native-unistyles 3.0.19 (Theme styling)      │
│  ├── @shopify/flash-list 2.0.2     (Perf. lists)        │
│  ├── expo-image 3.0.11              (Optimized images)   │
│  ├── react-native-reanimated ~4.1.1 (Animations)        │
│  └── @gorhom/bottom-sheet 5.2.8    (Modals)             │
│                                                          │
│  FORMS & VALIDATION LAYER                               │
│  ├── react-hook-form 7.68.0  (Form management)          │
│  ├── zod 4.2.1               (Schema validation)        │
│  └── @hookform/resolvers 5.2.2 (Zod integration)        │
│                                                          │
│  NETWORKING & REAL-TIME LAYER                           │
│  ├── axios 1.13.2            (HTTP client)              │
│  ├── @stomp/stompjs 7.2.1   (WebSocket STOMP)           │
│  └── sockjs-client 1.6.1     (WebSocket fallback)       │
│                                                          │
│  SECURITY LAYER                                         │
│  ├── expo-secure-store 15.0.8     (Secure token)        │
│  └── expo-local-authentication 17.0.8 (Biometric)       │
│                                                          │
│  I18N & LOCALIZATION LAYER                              │
│  ├── i18next 25.7.3          (i18n framework)           │
│  ├── react-i18next 16.5.0    (React bindings)           │
│  └── expo-localization ~17.0.8 (Device locale)          │
│                                                          │
│  DEVELOPMENT LAYER                                      │
│  ├── TypeScript ~5.9.2       (Type safety)              │
│  └── Babel (via Expo)        (JS transpilation)         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 2.2. Environment Configuration

```javascript
// app.config.js - Expo Configuration
{
  - APP_VARIANT: development|preview|production
  - Name, icon, splash screen
  - Firebase google-services.json (variant-specific)
  - Platform-specific config (iOS/Android)
  - Plugins: expo-router, expo-notifications, google-signin
}
```

### 2.3. Build System & Commands

```bash
# Development
npm start                    # Expo dev server
npm run android             # Android emulator/device
npm run ios                 # iOS simulator
npm run web                 # Web browser

# Build Commands
npm run a-dev              # Android DEV + prebuild
npm run a-prod             # Android PROD (gradlew assembleRelease)
npm run build-dev          # EAS build DEV
npm run build-preview      # EAS build PREVIEW
npm run build-prod         # EAS build PRODUCTION
```

---

## 3. CẤU TRÚC THƯ MỤC CHUYÊN SÂU

### 3.1. Toàn Bộ Cấu Trúc Thư Mục

```
EBAY_TMDT_APP_mobi_DEV03/
│
├── app/                                    # Expo Router (File-Based Routing)
│   ├── (auth)/                            # Group: Authentication screens
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── [otp].tsx
│   │
│   ├── (main)/                            # Group: Main pushed screens (no tab bar)
│   │   ├── (shop)/                        # Sub-domain: Shop-related
│   │   │   ├── product/
│   │   │   │   ├── [id].tsx              # Dynamic route: product/:id
│   │   │   │   └── _layout.tsx
│   │   │   ├── shop/
│   │   │   │   ├── [id].tsx
│   │   │   │   └── _layout.tsx
│   │   │   └── _layout.tsx                # Uses <Slot /> (no layout wrapper)
│   │   │
│   │   ├── (user)/                        # Sub-domain: User-related
│   │   │   ├── profile/
│   │   │   ├── settings/
│   │   │   └── _layout.tsx
│   │   │
│   │   ├── (order)/                       # Sub-domain: Order-related
│   │   │   ├── detail/[id].tsx
│   │   │   └── _layout.tsx
│   │   │
│   │   ├── checkout.tsx                   # Full-screen checkout
│   │   ├── _layout.tsx                    # Main layout (headerShown: false)
│   │   └── [other screens].tsx
│   │
│   ├── (tabs)/                            # Group: Tab-based screens (with bottom tabs)
│   │   ├── home.tsx                       # Home / Dashboard
│   │   ├── category.tsx                   # Category browser
│   │   ├── cart.tsx                       # Shopping cart
│   │   ├── notifications.tsx              # Notifications
│   │   ├── me.tsx                         # User menu / Profile
│   │   └── _layout.tsx                    # Tab layout with bottom nav
│   │
│   ├── _layout.tsx                        # Root layout + Global Providers
│   ├── +html.tsx                          # Web HTML root (for Expo Web)
│   ├── +not-found.tsx                     # 404 fallback
│   └── modal.tsx                          # Modal wrapper (optional)
│
├── components/                             # Reusable UI Components
│   ├── ui/                                # Base UI Atoms (Button, Icon, Input)
│   │   ├── Button.tsx
│   │   ├── Icon.tsx
│   │   ├── Input.tsx
│   │   ├── Text.tsx
│   │   ├── View.tsx
│   │   └── ...
│   │
│   ├── cart/                              # Cart Feature Components
│   │   ├── CartItem.tsx                   # Single cart item
│   │   ├── CartShopGroup.tsx              # Items grouped by shop
│   │   ├── CartFooter.tsx                 # Summary + checkout button
│   │   └── ...
│   │
│   ├── checkout/                          # Checkout Feature Components
│   │   ├── CheckoutHeader.tsx
│   │   ├── ShopSection.tsx                # Shop summary
│   │   ├── ShippingSelector.tsx           # Shipping method selection
│   │   ├── VoucherSection.tsx             # Voucher application
│   │   ├── OrderSummary.tsx
│   │   └── ...
│   │
│   ├── home/                              # Home Screen Components
│   │   ├── Banner.tsx
│   │   ├── FlashSaleSection.tsx
│   │   ├── CategoryGrid.tsx
│   │   └── ...
│   │
│   ├── chat/                              # Chat/Messaging Components
│   │   ├── ChatList.tsx
│   │   ├── ChatMessage.tsx
│   │   └── ...
│   │
│   ├── notifications/                     # Notification Components
│   │   ├── NotificationItem.tsx
│   │   └── ...
│   │
│   ├── profile/                           # Profile Components
│   │   ├── ProfileHeader.tsx
│   │   ├── AddressSelector.tsx
│   │   └── ...
│   │
│   └── common/                            # Generic Components
│       ├── Header.tsx
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       └── ...
│
├── constants/                              # App Configuration & Constants
│   ├── apiRoutes.ts                       # API endpoint definitions
│   │   # Structure:
│   │   # export const API_ROUTES = {
│   │   #   CART: { GET: '/api/v1/cart', ... },
│   │   #   CHECKOUT: { POST: '/api/v1/cart/checkout', ... },
│   │   #   ...
│   │   # }
│   │
│   ├── routes.ts                          # Navigation route definitions
│   │   # ROUTES.AUTH.LOGIN, ROUTES.TABS.HOME, etc.
│   │
│   ├── unistyles.ts                       # Theme tokens & styling config
│   │   # Colors, spacing, typography, breakpoints
│   │
│   ├── i18n/                              # Internationalization
│   │   ├── en.json                        # English translations
│   │   ├── vi.json                        # Vietnamese translations
│   │   └── i18n.ts                        # i18next config
│   │
│   └── [other constants].ts               # Feature-specific constants
│
├── hooks/                                  # Custom React Hooks
│   ├── api/                               # TanStack Query Hooks (API Data Fetching)
│   │   ├── cart/
│   │   │   ├── useCart.ts                 # GET /api/v1/cart
│   │   │   ├── useCartMutations.ts        # POST/PUT/DELETE cart items
│   │   │   └── useCartSelection.ts        # Toggle selection state
│   │   │
│   │   ├── checkout/
│   │   │   ├── useCheckoutPreview.ts      # POST /api/v1/cart/checkout
│   │   │   └── ...
│   │   │
│   │   ├── product/
│   │   │   ├── useProductDetail.ts        # GET /api/v1/product/:id
│   │   │   ├── useRelatedProducts.ts
│   │   │   └── ...
│   │   │
│   │   ├── profile/
│   │   │   ├── useProfile.ts              # GET user profile
│   │   │   ├── useUpdateProfile.ts        # PUT profile
│   │   │   └── ...
│   │   │
│   │   ├── useAuth.ts                     # Login/Register/OTP mutations
│   │   ├── useUserAddresses.ts            # CRUD addresses
│   │   ├── useAddressData.ts              # Province/Ward lookup
│   │   ├── useCategories.ts               # Category tree
│   │   ├── useNotifications.ts            # Notifications CRUD
│   │   ├── useOrders.ts                   # Order history
│   │   └── ...
│   │
│   ├── useCustomHook.ts                   # Custom logic hooks (non-API)
│   ├── useDebounce.ts
│   ├── useInfiniteScroll.ts
│   └── ...
│
├── services/                               # External Services (Singleton Pattern)
│   ├── api/
│   │   ├── client.ts                      # Axios instance + interceptors
│   │   │   # - BaseURL, timeout, headers
│   │   │   # - Request interceptor: Auto-attach Bearer token
│   │   │   # - Response interceptor: Handle 401 + token refresh
│   │   │   # - request<T>(config, schema): Zod-validated wrapper
│   │   │
│   │   └── queryClient.ts                 # TanStack Query configuration
│   │       # - Default staleTime, gcTime
│   │       # - Retry logic (skip 401)
│   │       # - Error handling
│   │
│   └── auth/
│       ├── tokenManager.ts                # Token lifecycle management
│       │   # - 3-layer refresh strategy
│       │   # - Layer 1: Eager (app launch/foreground)
│       │   # - Layer 2: Proactive (timer before expiry)
│       │   # - Layer 3: Reactive (on 401)
│       │
│       └── ...
│
├── store/                                  # Zustand Global State Management
│   ├── useAuthStore.ts                    # Authentication state
│   │   # - token, isAuthenticated, user
│   │   # - hydrate(), login(), logout()
│   │
│   ├── useCartStore.ts                    # Cart client state
│   │   # - selectedItemIds, appliedVouchers
│   │   # - isEditMode, etc.
│   │
│   ├── useCheckoutStore.ts                # Checkout session state
│   │   # - previewData, selectedShipping
│   │   # - selectedVouchers, etc.
│   │
│   ├── useChatStore.ts                    # Chat/Messaging state
│   └── ...
│
├── types/                                  # TypeScript Type Definitions
│   ├── cart.ts                            # Cart UI types + Zod schemas
│   │   # - CartUI interface
│   │   # - CartItemSchema (Zod)
│   │   # - CartCalculationResult type
│   │   # - etc.
│   │
│   ├── checkout.ts                        # Checkout UI types
│   │   # - CheckoutUI, CheckoutItemUI
│   │   # - ShippingMethod, VoucherResult
│   │   # - CheckoutCalculationResult
│   │
│   ├── checkout/
│   │   └── checkoutPreview.ts             # Checkout API DTO + Zod schemas
│   │       # - CheckoutPreviewItemDTO (raw from API)
│   │       # - CheckoutPreviewItemSchema (Zod validation)
│   │       # - CheckoutPreviewRequest (what we send)
│   │
│   ├── address.ts                         # Address types + Zod
│   │   # - ShippingAddress, AddressFormData
│   │   # - BuyerAddressDTO (from API)
│   │   # - AddressSchema (Zod)
│   │
│   ├── product.ts                         # Product types
│   │   # - ProductDetailUI, VariantUI
│   │   # - ProductDTO, etc.
│   │
│   ├── auth.ts                            # Auth types
│   │   # - LoginRequest, RegisterRequest
│   │   # - AuthResponse, User type
│   │
│   ├── api.ts                             # Generic API types
│   │   # - ApiResponse<T>, ApiError
│   │   # - PaginationMeta, etc.
│   │
│   └── ...
│
└── utils/                                  # Utility Functions
    ├── adapter/                           # Data Transformers (DTO → UI)
    │   ├── cartAdapter.ts                 # Transform cart DTO → UI
    │   │   # - toCartUI(), transformCartItem()
    │   │   # - calculateCartTotals()
    │   │   # - getAllItemsCheckboxState()
    │   │
    │   ├── checkoutPreviewAdapter.ts      # Transform checkout DTO → UI
    │   │   # - toCheckoutPreviewUI()
    │   │   # - toCheckoutShopUI()
    │   │   # - toCheckoutItemUI()
    │   │   # - toShippingMethod()
    │   │   # - toVoucherResult()
    │   │
    │   ├── addressAdapter.ts              # Transform address DTO ↔ Request
    │   │   # - toShippingAddress()
    │   │   # - toCreateAddressRequest()
    │   │
    │   ├── productAdapter.ts              # Transform product DTO → UI
    │   │
    │   └── ...
    │
    ├── format.ts                          # Formatting utilities
    │   # - formatCurrency(1000, 'VND') → "1.000₫"
    │   # - formatDate(), formatNumber()
    │   # - etc.
    │
    ├── url.ts                             # URL builders
    │   # - buildImageUrl(basePath, ext)
    │   # - buildApiUrl()
    │   # - etc.
    │
    ├── validation.ts                      # Validation helpers
    │
    ├── helpers.ts                         # Generic helpers
    │
    └── ...
│
├── assets/                                 # Static Assets
│   ├── images/                            # Images
│   │   ├── icon.png                       # App icon
    │   ├── splash-icon.png
    │   ├── icon-android.png
    │   └── ...
    │
    ├── fonts/                             # Custom fonts (if needed)
    └── ...
│
├── contexts/                               # React Context (if needed)
│   # Usually minimal if using Zustand
│
├── node_modules/                          # Dependencies
├── android/                               # Android native code (auto-generated)
├── google-services/                       # Firebase config (variant-specific)
│   ├── google-services.dev.json
│   ├── google-services.preview.json
│   └── google-services.production.json
│
├── docs/                                   # Documentation
│   ├── ARCHITECTURE.md                    # System architecture
│   ├── API_HOOKS_REFERENCE.md             # API hooks guide
│   ├── ADAPTERS_TYPES_REFERENCE.md        # Types & adapters guide
│   └── README.md                          # Doc index
│
├── .expo/                                 # Expo config cache
├── .github/                               # GitHub workflows
├── .vscode/                               # VS Code settings
├── .git/                                  # Git history
│
├── .env.local                             # Development environment
├── .env.prod                              # Production environment
├── .gitignore
├── .npmrc
├── app.config.js                          # Expo/EAS configuration
├── app.json.bak                           # Backup
├── babel.config.js                        # Babel configuration
├── eas.json                               # EAS build config
├── expo-env.d.ts                          # Expo environment types
├── tsconfig.json                          # TypeScript config
├── package.json                           # Dependencies & scripts
├── package-lock.json
├── README.md                              # Project README
└── firebase-debug.log

```

### 3.2. Path Aliases (TypeScript)

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]  // Import from @/components, @/utils, etc.
    }
  }
}
```

**Usage**:
```typescript
import { Button } from '@/components/ui/Button';
import { useCart } from '@/hooks/api/cart/useCart';
import { API_ROUTES } from '@/constants/apiRoutes';
import { toCheckoutUI } from '@/utils/adapter/checkoutPreviewAdapter';
```

---

## 4. KIẾN TRÚC TỔNG THỂ

### 4.1. Layered Architecture (Clean Architecture)

```
┌──────────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Screens (app/*)        Components          Hooks  │   │
│  │   - Cart Screen          - CartItem          - useCart    │
│  │   - Checkout Screen      - CartShopGroup     - useCheckout│
│  │   - Product Screen       - Button, Icon      - useAuth    │
│  │   - Home Screen          - Input, Text       - useProfile │
│  └──────────────────────────────────────────────────────┘   │
│                            ▲                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │ (subscribe/dispatch)
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                   APPLICATION LAYER                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  TanStack Query Hooks    Zustand Stores    Adapters   │ │
│  │  ├─ useCart (query)      ├─ useAuthStore   ├─ to*UI() │ │
│  │  ├─ useCheckout (mut)    ├─ useCartStore   ├─ format()│ │
│  │  ├─ useAuth (mut)        ├─ useCheckoutSt. ├─ parse() │ │
│  │  └─ useProfile (query)   └─ useChatStore   └─ build() │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ▲                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │ (API calls, validation)
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                      DATA LAYER                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  API Client (Axios)     Zod Schemas      SecureStore   │ │
│  │  ├─ baseURL setup       ├─ CartSchema    ├─ Token       │ │
│  │  ├─ Interceptors        ├─ CheckoutSchema├─ RefreshToken│
│  │  ├─ Error handling      └─ ProductSchema └─ User data   │ │
│  │  └─ request<T>()                                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ▲                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │ (HTTP, Storage)
                             │
                    ┌────────────────┐
                    │   BACKEND API  │
                    │  (Server)      │
                    └────────────────┘
```

### 4.2. Data Flow Patterns

#### 4.2.1. Server State Flow (TanStack Query)

```
┌─────────────┐
│  Component  │ useCart() → subscribe to cached data
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│  useQuery/useMutation   │ TanStack Query hook
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  API Client (axios)     │ → HTTP request
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  Zod Schema.parse()     │ → Type-safe validation
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  Adapter (toUI())       │ → DTO → UI transformation
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  Component receives     │ Render with UI data
│  type-safe data        │
└─────────────────────────┘
```

#### 4.2.2. Client State Flow (Zustand)

```
┌──────────────┐
│  Component   │ useCheckoutStore() → subscribe to state
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  Store (Zustand)     │ Global mutable state
│  ├─ previewData      │
│  ├─ selectedShipping │
│  └─ selectedVouchers │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  store.setState()    │ Update state
│  or selector()       │ Optimized subscription
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Component re-render │
└──────────────────────┘
```

#### 4.2.3. Complete Checkout Flow Example

```
USER ACTION: Click "Thanh toán" in Cart
  ↓
Cart Screen:
  └─ useCheckoutStore.initSession(selectedIds, address)
  └─ router.push(ROUTES.MAIN.CHECKOUT)
  ↓
Checkout Screen:
  ├─ useEffect hook:
  │   └─ Call useCheckoutPreview.mutate(requestBody)
  │
  ├─ API Request:
  │   ├─ POST /api/v1/cart/checkout
  │   ├─ Request body: { shops, shippingAddress, usingSavedAddress }
  │   ├─ Response: CheckoutPreviewResponse (raw JSON)
  │   └─ Zod: CheckoutPreviewResponseSchema.parse(response)
  │
  ├─ Transformation:
  │   ├─ checkoutPreviewAdapter.toCheckoutPreviewUI(dto)
  │   ├─ Returns: CheckoutPreviewUI (component-ready)
  │   └─ Store: useCheckoutStore.setPreviewData(ui)
  │
  ├─ UI Render:
  │   ├─ Display: shops, items, shipping, vouchers, totals
  │   └─ Data comes from useCheckoutStore
  │
  ├─ User Interaction:
  │   ├─ Select shipping → store.selectShippingMethod(shopId, serviceCode)
  │   ├─ Apply voucher → store.applyShopVoucher(voucherId)
  │   └─ Each change: Re-fetch preview with new params
  │
  └─ Place Order:
      ├─ Validate: useCanPlaceOrder() === true
      ├─ Call: submitOrder.mutate(requestBody)
      ├─ Success: router.push(ROUTES.MAIN.ORDER.DETAIL(orderId))
      └─ Cache invalidation:
          ├─ queryClient.invalidateQueries(['cart'])
          ├─ queryClient.invalidateQueries(['orders'])
          └─ useCheckoutStore.reset()
```

---

## 5. LUỒNG HOẠT ĐỘNG DỮ LIỆU

### 5.1. Type Flow: DTO → Zod → Adapter → UI

```typescript
// STEP 1: Server sends raw JSON
{
  "cartId": "123",
  "items": [
    {
      "itemId": "item1",
      "productName": "Laptop",
      "basePath": "https://cdn/img",
      "extension": ".jpg",
      "variantAttributes": null,
      "unitPrice": 1000,
      "quantity": 2
    }
  ],
  "summary": { ... }
}

// STEP 2: Define DTO Interface (Raw API structure)
interface CheckoutPreviewItemDTO {
  itemId: string;
  productName: string;
  basePath: string | null;
  extension: string | null;
  variantAttributes: string | null;
  unitPrice: number;
  quantity: number;
}

// STEP 3: Define Zod Schema (Runtime validation)
const CheckoutPreviewItemSchema = z.object({
  itemId: z.string(),
  productName: z.string(),
  basePath: z.string().nullable(),
  extension: z.string().nullable(),
  variantAttributes: z.string().nullable(),
  unitPrice: z.number(),
  quantity: z.number().int().positive(),
});

// STEP 4: Parse with Zod
const parsedDto: CheckoutPreviewItemDTO = 
  CheckoutPreviewItemSchema.parse(rawResponse);

// STEP 5: Define UI Interface (Component-ready structure)
interface CheckoutItemUI {
  id: string;  // Renamed from itemId
  productName: string;
  imageUrl: string;  // Built from basePath + extension
  variantAttributes: string;  // Null → empty string
  unitPrice: number;
  quantity: number;
  shopId: string;  // Added by parent transformer
}

// STEP 6: Create Adapter (Transform DTO → UI)
export const toCheckoutItemUI = (dto: CheckoutPreviewItemDTO): CheckoutItemUI => ({
  id: dto.itemId,  // Field rename
  productName: dto.productName,
  imageUrl: toSizedImageUrl(dto.basePath, dto.extension) ?? DEFAULT_IMAGE,  // Build URL
  variantAttributes: dto.variantAttributes || '',  // Handle null
  unitPrice: dto.unitPrice,
  quantity: dto.quantity,
  shopId: '',  // Will be injected by parent
});

// STEP 7: Component receives UI type
const CheckoutItem = ({ item }: { item: CheckoutItemUI }) => {
  // item is 100% type-safe
  // item.imageUrl is guaranteed string (never null)
  // item.id exists (not itemId)
  return <Image src={item.imageUrl} />;
};
```

### 5.2. Request-Response Cycle

```
USER ACTION
  ↓
Component calls Hook: useCheckoutPreview()
  ↓
Hook creates Request object:
  {
    shops: [{ shopId, itemIds, vouchers, serviceCode }],
    shippingAddress: { addressId },
    usingSavedAddress: true
  }
  ↓
Hook calls mutation.mutate(request)
  ↓
TanStack Query executes mutationFn:
  ├─ Call: request(config, schema)
  ├─ HTTP POST /api/v1/cart/checkout
  └─ Axios handles interceptors:
      ├─ Request Interceptor: Add Bearer token
      └─ Response Interceptor: Handle 401 + refresh
  ↓
Raw Response received:
  {
    code: 200,
    success: true,
    message: "OK",
    data: { shops: [...], summary: {...} }
  }
  ↓
Zod validates: CheckoutPreviewResponseSchema.parse(response)
  ├─ If invalid: throws error
  └─ If valid: returns typed object
  ↓
Adapter transforms: toCheckoutPreviewUI(validDto)
  ├─ Renames fields: itemId → id
  ├─ Builds URLs: basePath + extension → imageUrl
  ├─ Handles nulls: null → default values
  └─ Returns: CheckoutPreviewUI
  ↓
Store updates: useCheckoutStore.setPreviewData(uiData)
  ↓
Component receives: data from store
  ├─ useCheckoutStore(s => s.previewData)
  └─ UI renders with type-safe data
```

---

## 6. HỆ THỐNG TYPING & ADAPTER

### 6.1. Type Categories & Naming Convention

| Category | Suffix | Location | Purpose | Example |
|----------|--------|----------|---------|---------|
| **API Response DTO** | `*DTO` | `types/[feature]/` | Raw API structure | `CheckoutPreviewItemDTO` |
| **Zod Schema** | `*Schema` | `types/[feature]/` | Runtime validation | `CheckoutPreviewItemSchema` |
| **UI Type** | `*UI` | `types/[feature].ts` | Component-ready | `CheckoutItemUI` |
| **Request** | `*Request` | `types/[feature]/` | What we send | `CheckoutPreviewRequest` |
| **Adapter Function** | `to*` | `utils/adapter/` | DTO → UI transform | `toCheckoutItemUI()` |
| **Zod Inferred** | (inferred) | `types/` | Type from schema | `type CartItem = z.infer<typeof CartItemSchema>` |

### 6.2. File Organization for Types

```
types/
├── cart.ts                          # ✅ Cart UI types + schemas
│   ├── interface CartUI
│   ├── interface CartItemUI
│   ├── interface CartCalculationResult
│   ├── const CartItemSchema (Zod)
│   └── type CartItem = z.infer<typeof CartItemSchema>
│
├── checkout.ts                      # ✅ Checkout UI types
│   ├── interface CheckoutUI
│   ├── interface CheckoutItemUI
│   ├── interface CheckoutCalculationResult
│   └── type ShippingMethod
│
├── checkout/
│   └── checkoutPreview.ts           # ✅ Checkout API DTOs + Zod
│       ├── interface CheckoutPreviewItemDTO
│       ├── const CheckoutPreviewItemSchema (Zod)
│       ├── interface CheckoutPreviewRequest
│       ├── type CheckoutPreviewItemFromAPI = z.infer<typeof...>
│       └── (NOT UI types - those go to checkout.ts)
│
├── address.ts                       # ✅ Address types + schemas
│   ├── interface ShippingAddress (UI)
│   ├── interface AddressFormData
│   ├── interface BuyerAddressDTO (API)
│   ├── const AddressSchema (Zod)
│   └── etc.
│
├── product.ts                       # ✅ Product types
├── auth.ts                          # ✅ Auth types
├── api.ts                           # ✅ Generic API types
└── [feature].ts                     # ✅ Other feature types

utils/adapter/
├── cartAdapter.ts                   # ✅ Transform cart DTO → UI
│   ├── toCartUI()
│   ├── transformCartItem()
│   ├── calculateCartTotals()
│   └── etc.
│
├── checkoutPreviewAdapter.ts        # ✅ Transform checkout DTO → UI
│   ├── toCheckoutPreviewUI()
│   ├── toCheckoutShopUI()
│   ├── toCheckoutItemUI()
│   └── etc.
│
├── addressAdapter.ts                # ✅ Transform address DTO ↔ Request
│   ├── toShippingAddress()
│   ├── toCreateAddressRequest()
│   └── etc.
│
└── [feature]Adapter.ts              # ✅ Other feature adapters
```

### 6.3. Pattern: Creating Types for a Feature

```typescript
// ============================================
// STEP 1: types/checkout/checkoutPreview.ts
// ============================================

// 1a. API DTO (raw from backend)
export interface CheckoutPreviewItemDTO {
  itemId: string;
  productName: string;
  basePath: string | null;
  extension: string | null;
  variantAttributes: string | null;
  unitPrice: number;
  quantity: number;
}

// 1b. Zod Schema (validation + type inference)
export const CheckoutPreviewItemSchema = z.object({
  itemId: z.string(),
  productName: z.string(),
  basePath: z.string().nullable(),
  extension: z.string().nullable(),
  variantAttributes: z.string().nullable(),
  unitPrice: z.number(),
  quantity: z.number().int().positive(),
});

// 1c. Type from schema (optional, for consistency)
export type CheckoutPreviewItem = z.infer<typeof CheckoutPreviewItemSchema>;

// 1d. Request type (what we send to API)
export interface CheckoutPreviewRequest {
  shops: CheckoutPreviewShopRequest[];
  shippingAddress?: { addressId: string };
  usingSavedAddress?: boolean;
}

// 1e. Response wrapper schema
export const CheckoutPreviewResponseSchema = z.object({
  code: z.number(),
  success: z.boolean(),
  message: z.string(),
  data: CheckoutPreviewDataSchema,
});

// ============================================
// STEP 2: types/checkout.ts
// ============================================

// 2a. UI Type (component-ready)
export interface CheckoutItemUI {
  id: string;                    // Renamed from itemId
  productName: string;
  imageUrl: string;              // Built from basePath+extension
  variantAttributes: string;     // Null handled
  unitPrice: number;
  quantity: number;
  shopId: string;                // Added by parent
}

// 2b. Other UI types
export interface CheckoutUI {
  cartId: string;
  currency: string;
  shops: CheckoutShopUI[];
  calculation: CheckoutCalculationResult;
  isValid: boolean;
  validationErrors: string[];
}

// ============================================
// STEP 3: utils/adapter/checkoutPreviewAdapter.ts
// ============================================

export const toCheckoutItemUI = (dto: CheckoutPreviewItemDTO): CheckoutItemUI => ({
  id: dto.itemId,
  productName: dto.productName,
  imageUrl: toSizedImageUrl(dto.basePath, dto.extension) ?? DEFAULT_IMAGE,
  variantAttributes: dto.variantAttributes || '',
  unitPrice: dto.unitPrice,
  quantity: dto.quantity,
  shopId: '', // Will be injected by parent toCheckoutShopUI()
});

export const toCheckoutPreviewUI = (dto: CheckoutPreviewDTO): CheckoutUI => ({
  cartId: dto.cartId,
  currency: dto.currency,
  shops: dto.shops.map(toCheckoutShopUI),
  calculation: calculateTotals(dto.summary),
  isValid: dto.isValid,
  validationErrors: dto.validationErrors || [],
});

// ============================================
// STEP 4: hooks/api/checkout/useCheckoutPreview.ts
// ============================================

export const useCheckoutPreview = () => {
  return useMutation({
    mutationFn: async (request: CheckoutPreviewRequest) => {
      // ✅ Type-safe request
      const response = await request(
        {
          url: API_ROUTES.CHECKOUT.PREVIEW,
          method: 'POST',
          data: request,
        },
        CheckoutPreviewResponseSchema  // ✅ Validation with Zod
      );
      // ✅ response.data is now CheckoutPreviewDTO
      return toCheckoutPreviewUI(response.data);  // ✅ Transform to UI
      // ✅ Return type is CheckoutUI
    },
  });
};

// ============================================
// STEP 5: Component usage
// ============================================

export const CheckoutScreen = () => {
  // ✅ Type inference works perfectly
  const { data, isLoading } = useCheckoutPreview();
  // ✅ data is CheckoutUI | undefined
  
  return (
    <View>
      {data?.shops.map(shop => (
        <CheckoutShop key={shop.shopId} shop={shop} />
      ))}
    </View>
  );
};
```

---

## 7. ROUTING & NAVIGATION

### 7.1. Expo Router File-Based Routing

```typescript
// File structure = Route structure
app/(auth)/login.tsx              → /login
app/(auth)/register.tsx           → /register
app/(tabs)/home.tsx               → /home (with tab bar)
app/(main)/checkout.tsx           → /checkout (no tab bar)
app/(main)/(shop)/product/[id].tsx → /product/:id

// Dynamic routes
app/product/[id].tsx              → /product/:id, /product/:slug, etc.
app/[...missing].tsx              → /any/route/not/found

// Groups (don't affect route path)
app/(auth)/... (grouped, no route prefix)
app/(tabs)/... (grouped, no route prefix)
app/(main)/... (grouped, no route prefix)
```

### 7.2. Route Constants

```typescript
// constants/routes.ts
export const ROUTES = {
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    OTP: '/otp',
  },
  TABS: {
    HOME: '/(tabs)/home',
    CATEGORY: '/(tabs)/category',
    CART: '/(tabs)/cart',
    NOTIFICATIONS: '/(tabs)/notifications',
    ME: '/(tabs)/me',
  },
  MAIN: {
    CHECKOUT: '/checkout',
    PRODUCT: {
      DETAIL: (id: string) => ({
        pathname: '/product/[id]',
        params: { id },
      }),
    },
    SHOP: {
      DETAIL: (id: string) => ({
        pathname: '/shop/[id]',
        params: { id },
      }),
    },
    ORDER: {
      DETAIL: (id: string) => ({
        pathname: '/order/[id]',
        params: { id },
      }),
    },
  },
};

// Usage in components
import { router } from 'expo-router';
import { ROUTES } from '@/constants/routes';

// Navigate with type safety (Typed Routes enabled)
router.push(ROUTES.TABS.HOME);
router.push(ROUTES.MAIN.PRODUCT.DETAIL('123'));
router.replace(ROUTES.AUTH.LOGIN);
```

### 7.3. Layout Structure

```
Root Layout: app/_layout.tsx
├─ headerShown: false
├─ Providers (QueryClientProvider, Zustand hydration, i18n, etc.)
└─ Content:
    ├── (auth) Layout: app/(auth)/_layout.tsx
    │   ├─ Login Screen
    │   ├─ Register Screen
    │   └─ OTP Screen
    │
    ├── (tabs) Layout: app/(tabs)/_layout.tsx  (Tab Navigation)
    │   ├─ Tab Bar at bottom
    │   ├─ Home Screen
    │   ├─ Category Screen
    │   ├─ Cart Screen
    │   ├─ Notifications Screen
    │   └─ Me Screen
    │
    └── (main) Layout: app/(main)/_layout.tsx
        ├─ headerShown: false
        ├─ (shop) Domain: app/(main)/(shop)/_layout.tsx (Uses <Slot />)
        │   ├─ Product Detail Screen
        │   └─ Shop Detail Screen
        │
        ├─ (user) Domain: app/(main)/(user)/_layout.tsx (Uses <Slot />)
        │   ├─ Profile Screen
        │   └─ Settings Screen
        │
        ├─ (order) Domain: app/(main)/(order)/_layout.tsx (Uses <Slot />)
        │   └─ Order Detail Screen
        │
        └─ Full-screen Screens
            ├─ Checkout Screen
            ├─ Address Selection Screen
            └─ etc.
```

### 7.4. Navigation Flow Rules

```typescript
// ✅ CORRECT: Navigation after action
const onLogin = async (credentials) => {
  await login.mutateAsync(credentials);
  // After successful login, navigate to home
  router.replace(ROUTES.TABS.HOME);
};

// ❌ WRONG: Navigation before action completes
const onLogin = async (credentials) => {
  router.replace(ROUTES.TABS.HOME);  // Too early!
  await login.mutateAsync(credentials);
};

// ✅ CORRECT: Push for modal/stack navigation
const onCheckout = () => {
  router.push(ROUTES.MAIN.CHECKOUT);  // Push to checkout
};

// ✅ CORRECT: Replace for auth flow
const onLogout = async () => {
  await logout();
  router.replace(ROUTES.AUTH.LOGIN);  // Replace entire stack
};

// ✅ CORRECT: Back navigation
const onCancel = () => {
  router.back();  // Go back to previous screen
};
```

---

## 8. STATE MANAGEMENT

### 8.1. Zustand Stores (Client State)

#### 8.1.1. Auth Store

```typescript
// store/useAuthStore.ts

interface AuthState {
  // State
  token: string | null;
  isAuthenticated: boolean;
  user: User | null;
  
  // Actions
  hydrate: () => Promise<void>;
  login: (access: string, refresh: string, buyerId: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  isAuthenticated: false,
  user: null,
  
  hydrate: async () => {
    const token = await getAccessToken();
    if (token) {
      set({ token, isAuthenticated: true });
      checkTokenOnAppLaunch();  // Layer 1 refresh
    }
  },
  
  login: async (access, refresh, buyerId) => {
    await saveTokens(access, refresh);  // Triggers Layer 2 refresh
    set({ token: access, isAuthenticated: true });
  },
  
  logout: async () => {
    await clearTokens();
    queryClient.removeQueries({ queryKey: ['cart'] });
    queryClient.removeQueries({ queryKey: ['profile'] });
    set({ token: null, isAuthenticated: false, user: null });
    router.replace(ROUTES.AUTH.LOGIN);
  },
  
  setUser: (user) => set({ user }),
}));
```

#### 8.1.2. Cart Store (Client State, not Server State)

```typescript
// store/useCartStore.ts

interface CartState {
  // Selection state
  selectedItemIds: Set<string>;
  
  // Edit mode
  isEditMode: boolean;
  
  // Applied vouchers
  appliedVouchers: Map<string, string>;  // shopId → voucherId
  
  // Actions
  toggleItemSelection: (itemId: string) => void;
  toggleEditMode: () => void;
  applyVoucher: (shopId: string, voucherId: string) => void;
  removeVoucher: (shopId: string) => void;
}

export const useCartStore = create<CartState>((set) => ({
  selectedItemIds: new Set(),
  isEditMode: false,
  appliedVouchers: new Map(),
  
  toggleItemSelection: (itemId) => {
    set((state) => {
      const newSelected = new Set(state.selectedItemIds);
      if (newSelected.has(itemId)) {
        newSelected.delete(itemId);
      } else {
        newSelected.add(itemId);
      }
      return { selectedItemIds: newSelected };
    });
  },
  
  toggleEditMode: () => {
    set((state) => ({ isEditMode: !state.isEditMode }));
  },
  
  applyVoucher: (shopId, voucherId) => {
    set((state) => {
      const newVouchers = new Map(state.appliedVouchers);
      newVouchers.set(shopId, voucherId);
      return { appliedVouchers: newVouchers };
    });
  },
  
  removeVoucher: (shopId) => {
    set((state) => {
      const newVouchers = new Map(state.appliedVouchers);
      newVouchers.delete(shopId);
      return { appliedVouchers: newVouchers };
    });
  },
}));

// Usage in components
const { selectedItemIds, toggleItemSelection } = useCartStore();
const canCheckout = selectedItemIds.size > 0;
```

#### 8.1.3. Checkout Store (Session State)

```typescript
// store/useCheckoutStore.ts

interface CheckoutState {
  // Session data
  previewData: CheckoutUI | null;
  selectedShipping: Map<string, ShippingMethod>;  // shopId → method
  selectedVouchers: Map<string, string>;  // shopId → voucherId
  
  // Loading
  isLoadingPreview: boolean;
  
  // Initialization
  initSession: (selectedIds: string[], address: ShippingAddress) => void;
  
  // Data updates
  setPreviewData: (data: CheckoutUI) => void;
  selectShippingMethod: (shopId: string, method: ShippingMethod) => void;
  applyShopVoucher: (shopId: string, voucherId: string) => void;
  
  // Selectors (optimized subscriptions)
  useCanPlaceOrder: () => boolean;
  useCheckoutTotal: () => number;
  
  // Cleanup
  reset: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set, get) => ({
  previewData: null,
  selectedShipping: new Map(),
  selectedVouchers: new Map(),
  isLoadingPreview: false,
  
  initSession: (selectedIds, address) => {
    // Store initialization data
    set({ ... });
  },
  
  setPreviewData: (data) => {
    set({ previewData: data });
  },
  
  selectShippingMethod: (shopId, method) => {
    set((state) => {
      const newShipping = new Map(state.selectedShipping);
      newShipping.set(shopId, method);
      return { selectedShipping: newShipping };
    });
  },
  
  useCanPlaceOrder: () => {
    return useShallow((state) => {
      const { previewData, selectedShipping } = state;
      return (
        previewData?.isValid &&
        previewData?.shops.every(shop =>
          selectedShipping.has(shop.shopId)
        )
      );
    });
  },
  
  useCheckoutTotal: () => {
    return useShallow((state) => {
      return state.previewData?.calculation.totalAmount ?? 0;
    });
  },
  
  reset: () => {
    set({
      previewData: null,
      selectedShipping: new Map(),
      selectedVouchers: new Map(),
      isLoadingPreview: false,
    });
  },
}));

// Usage in Checkout Screen
const { previewData } = useCheckoutStore();
const canPlaceOrder = useCheckoutStore(state => state.useCanPlaceOrder());
```

### 8.2. TanStack Query (Server State)

```typescript
// Services/API Layer
// Hooks call request() which:
// 1. Makes HTTP call via Axios
// 2. Validates with Zod
// 3. Transforms with Adapter
// 4. Returns UI type

// hooks/api/cart/useCart.ts
export const useCart = () => {
  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await request(
        { url: API_ROUTES.CART.GET },
        CartResponseSchema
      );
      return transformCart(response.data);  // Returns CartUI
    },
    staleTime: 5 * 60 * 1000,  // 5 minutes
  });
};

// hooks/api/checkout/useCheckoutPreview.ts
export const useCheckoutPreview = () => {
  return useMutation({
    mutationFn: async (request: CheckoutPreviewRequest) => {
      const response = await request(
        {
          url: API_ROUTES.CHECKOUT.PREVIEW,
          method: 'POST',
          data: request,
        },
        CheckoutPreviewResponseSchema
      );
      return toCheckoutPreviewUI(response.data);  // Returns CheckoutUI
    },
  });
};

// Component usage
const CheckoutScreen = () => {
  const { mutate } = useCheckoutPreview();
  const { setPreviewData } = useCheckoutStore();
  
  const handleCheckout = () => {
    mutate(requestBody, {
      onSuccess: (data) => {
        setPreviewData(data);  // Update Zustand store
      },
    });
  };
  
  return <View>...</View>;
};
```

### 8.3. When to Use What

| State Type | Tool | Example | Shared |
|-----------|------|---------|--------|
| **Server Cache** | TanStack Query | Cart items, product details | ✅ |
| **Selection/Session** | Zustand | Selected items, checkout data | ✅ |
| **Auth/User** | Zustand | Token, user ID, is authenticated | ✅ |
| **UI/Local** | useState | Form input, modal open/close | ❌ |
| **Animation** | useSharedValue (Reanimated) | Scroll position, gesture state | ❌ |

---

## 9. API LAYER & VALIDATION

### 9.1. API Client Setup

```typescript
// services/api/client.ts

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { z } from 'zod';

// Singleton Axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Bearer token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 + refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      return handle401Error(error, apiClient.request);  // Token refresh
    }
    throw new ApiError(message, status, code);
  }
);

// Zod-validated request wrapper
export async function request<T>(
  config: AxiosRequestConfig,
  schema: z.ZodType<T>
): Promise<T> {
  const response = await apiClient(config);
  return schema.parse(response.data);  // Type-safe validation
}
```

### 9.2. API Routes Definition

```typescript
// constants/apiRoutes.ts

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/v1/auth/login/buyer/mobile',
    REGISTER: '/api/v1/auth/register/buyer/mobile',
    VERIFY_OTP: '/api/v1/auth/verify-otp',
    REFRESH: '/api/v1/auth/refresh',
  },
  
  CART: {
    GET: '/api/v1/cart',
    ADD_ITEM: '/api/v1/cart/add-item',
    UPDATE_ITEM: '/api/v1/cart/update-item',
    REMOVE_ITEM: '/api/v1/cart/remove-item',
    APPLY_VOUCHER: '/api/v1/cart/apply-voucher',
  },
  
  CHECKOUT: {
    PREVIEW: '/api/v1/cart/checkout',
    PLACE_ORDER: '/api/v1/order/place',
  },
  
  PRODUCT: {
    DETAIL: (id: string) => `/api/v1/product/${id}`,
    SEARCH: '/api/v1/product/search',
  },
  
  USER: {
    PROFILE: '/api/v1/user/profile',
    UPDATE_PROFILE: '/api/v1/user/profile',
    ADDRESSES: '/api/v1/user/addresses',
    CREATE_ADDRESS: '/api/v1/user/addresses',
  },
} as const;
```

### 9.3. Zod Schema Patterns

```typescript
// types/checkout/checkoutPreview.ts

// Basic schema
export const CheckoutPreviewItemSchema = z.object({
  itemId: z.string(),
  productName: z.string(),
  basePath: z.string().nullable(),
  extension: z.string().nullable(),
  unitPrice: z.number().nonnegative(),
  quantity: z.number().int().positive(),
});

// Nested schema
const CheckoutShopSchema = z.object({
  shopId: z.string(),
  shopName: z.string(),
  items: z.array(CheckoutPreviewItemSchema),
  summary: CheckoutShopSummarySchema,
});

// Response wrapper
export const CheckoutPreviewResponseSchema = z.object({
  code: z.number(),
  success: z.boolean(),
  message: z.string().optional(),
  data: z.object({
    cartId: z.string(),
    shops: z.array(CheckoutShopSchema),
    summary: CheckoutOrderSummarySchema,
    isValid: z.boolean(),
    validationErrors: z.array(z.string()).optional(),
  }),
});

// Type inference
export type CheckoutPreviewResponse = z.infer<typeof CheckoutPreviewResponseSchema>;
```

### 9.4. Error Handling

```typescript
// Custom API Error class
export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public code: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Usage in error handlers
const { mutate } = useMutation({
  onError: (error) => {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        // Auth store handles logout
        return;
      }
      showToast('error', error.message);
    } else {
      showToast('error', 'Đã có lỗi xảy ra');
    }
  },
});
```

---

## 10. AUTHENTICATION & TOKEN MANAGEMENT

### 10.1. 3-Layer Token Refresh Strategy

```
┌─────────────────────────────────────────────────────────┐
│              TOKEN LIFECYCLE MANAGEMENT                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  LAYER 1: Eager Refresh (App Launch / Come to Foreground)
│  ├─ When: App starts or comes to foreground              │
│  ├─ Action: Check if token > 50% used                   │
│  ├─ If yes: Refresh immediately                         │
│  ├─ Triggers: checkTokenOnAppLaunch()                   │
│  │                                                       │
│  LAYER 2: Proactive Refresh (Background Timer)           │
│  ├─ When: After successful login or app launch          │
│  ├─ How: Schedule timer for 60 mins before expiry       │
│  ├─ Action: Refresh token in background                │
│  ├─ Triggers: scheduleProactiveRefresh(expiryTime)      │
│  │                                                       │
│  LAYER 3: Reactive Refresh (On API 401 Error)            │
│  ├─ When: API request returns 401                       │
│  ├─ Action: Try to refresh token                        │
│  ├─ If success: Retry original request                  │
│  ├─ If fail: Log out user                               │
│  ├─ Triggers: handle401Error() in response interceptor  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 10.2. Token Storage & Structure

```typescript
// services/auth/tokenManager.ts

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'user_access_token',
  REFRESH_TOKEN: 'user_refresh_token',
  TOKEN_EXPIRY: 'user_token_expiry',
};

// Save tokens with expiry calculation
export const saveTokens = async (access: string, refresh: string) => {
  const expiryTime = Date.now() + TOKEN_LIFETIME_MS;  // e.g., 7 days
  
  await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, access);
  await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refresh);
  await SecureStore.setItemAsync(
    STORAGE_KEYS.TOKEN_EXPIRY,
    expiryTime.toString()
  );
  
  // Schedule proactive refresh (Layer 2)
  scheduleProactiveRefresh(expiryTime);
};

// Get access token
export const getAccessToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
};

// Refresh token from server
export const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  
  const response = await apiClient.post(API_ROUTES.AUTH.REFRESH, {
    refreshToken,
  });
  
  const newAccessToken = response.data.accessToken;
  await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
  
  return newAccessToken;
};

// Clear tokens (logout)
export const clearTokens = async () => {
  await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
  await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN_EXPIRY);
};
```

### 10.3. Integration with Auth Store

```typescript
// store/useAuthStore.ts

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isAuthenticated: false,
  
  hydrate: async () => {
    const token = await getAccessToken();
    if (token) {
      set({ token, isAuthenticated: true });
      checkTokenOnAppLaunch();  // Layer 1
    }
  },
  
  login: async (access, refresh, buyerId) => {
    await saveTokens(access, refresh);  // Saves + Layer 2 scheduled
    set({ token: access, isAuthenticated: true });
  },
  
  logout: async () => {
    await clearTokens();
    queryClient.removeQueries({ queryKey: ['cart'] });
    set({ token: null, isAuthenticated: false });
    router.replace(ROUTES.AUTH.LOGIN);
  },
}));
```

### 10.4. Interceptor 401 Handling

```typescript
// services/api/client.ts

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      return handle401Error(error, apiClient.request);
    }
    throw error;
  }
);

async function handle401Error(error: AxiosError, requestFn: any) {
  const originalRequest = error.config;
  
  try {
    // Layer 3: Try to refresh token
    const newToken = await refreshAccessToken();
    
    // Retry original request with new token
    originalRequest.headers.Authorization = `Bearer ${newToken}`;
    return apiClient(originalRequest);
  } catch (refreshError) {
    // Refresh failed - log out user
    useAuthStore.getState().logout();
    throw error;  // Throw original 401 error
  }
}
```

---

## 11. QUY TẮC & CONSTRAINTS

### 11.1. BLOCKING RULES (Vi phạm = Code Reject)

| Rule # | Rule | ✅ Correct | ❌ Forbidden | Reason |
|--------|------|-----------|-------------|--------|
| **1** | Icons | `<IconSymbol name="home" />` | `<MaterialIcons />` | Consistency |
| **2** | Colors | `theme.colors.primary` | Hardcoded `#FF0000` | Theming |
| **3** | Typing | Proper interfaces | `any` type | Type safety |
| **4** | API Calls | `@/services/api/client` | Raw `fetch()` or `axios()` | Centralized control |
| **5** | Data Fetching | TanStack Query + Zod | `useEffect + useState` | Caching |
| **6** | Long Lists | `FlashList` | `FlatList` | Performance |
| **7** | Images | `expo-image` | React Native `Image` | Optimization |
| **8** | Validations | Zod schemas | Manual validation | Runtime safety |
| **9** | Storage | `SecureStore` (tokens) + `MMKV` (cache) | `AsyncStorage` | Security |
| **10** | Forms | `react-hook-form` | Manual state | DX |

### 11.2. Code Organization Rules

```typescript
// Component structure order
export default function MyComponent() {
  // 1. Imports (top of file)
  import { useQuery } from '@tanstack/react-query';
  import { useStore } from '@/store/...';
  
  // 2. Hooks (Store, API, Animations)
  const { data } = useQuery();
  const { isLoading, error } = useCheckoutPreview();
  const store = useMyStore();
  const animation = useSharedValue(0);
  
  // 3. Derived state / Memos
  const filteredData = useMemo(() => data?.filter(...), [data]);
  const isValid = useCallback(() => checks..., []);
  
  // 4. Effect hooks (if needed)
  useEffect(() => {
    // Initialization
  }, [dependencies]);
  
  // 5. Render functions (if complex)
  const renderItem = useCallback(({ item }) => (
    <ItemComponent item={item} />
  ), []);
  
  // 6. Main Return JSX
  return (
    <View>
      {isLoading && <Spinner />}
      {error && <ErrorMessage error={error} />}
      {data && <Content data={data} />}
    </View>
  );
}
```

### 11.3. Naming Conventions

| Type | Pattern | Example | Location |
|------|---------|---------|----------|
| **API Types (DTO)** | `*DTO` | `CheckoutPreviewItemDTO` | `types/[feature]/` |
| **UI Types** | `*UI` | `CheckoutItemUI` | `types/[feature].ts` |
| **Zod Schemas** | `*Schema` | `CartItemSchema` | `types/` |
| **Adapters** | `to*` or `transform*` | `toCheckoutItemUI()` | `utils/adapter/` |
| **Query Hooks** | `use*` | `useCheckoutPreview()` | `hooks/api/` |
| **Store Hooks** | `use*Store` | `useCheckoutStore` | `store/` |
| **Store Selectors** | `use*` | `useCanPlaceOrder()` | `store/` |
| **Utility Functions** | `*` (verb-first) | `calculateTotals()`, `parseDate()` | `utils/` |
| **Components** | `PascalCase` | `CheckoutScreen`, `CartItem` | `components/` |
| **Screens** | `PascalCase` + Screen suffix | `CheckoutScreen` | `app/` |
| **Constants** | `SCREAMING_SNAKE_CASE` | `API_ROUTES`, `ROUTES` | `constants/` |

### 11.4. Import Path Conventions

```typescript
// ✅ CORRECT: Always use @ alias
import { Button } from '@/components/ui/Button';
import { useCart } from '@/hooks/api/cart/useCart';
import { API_ROUTES } from '@/constants/apiRoutes';
import { toCheckoutUI } from '@/utils/adapter/checkoutPreviewAdapter';
import { useAuthStore } from '@/store/useAuthStore';
import type { CheckoutUI } from '@/types/checkout';

// ❌ WRONG: Relative imports
import { Button } from '../../../components/ui/Button';
import { useCart } from '../../hooks/api/cart/useCart';

// ❌ WRONG: Mix of @ and relative
import { Button } from '@/components/ui/Button';
import { format } from '../utils/format';
```

### 11.5. File Comments & Documentation

```typescript
/**
 * CheckoutScreen - Checkout flow for user purchases.
 * 
 * Displays order preview, allows shipping/voucher selection,
 * and handles order placement.
 * 
 * @example
 * <CheckoutScreen />
 * 
 * @see
 * - docs/ARCHITECTURE.md#checkout-flow
 * - docs/API_HOOKS_REFERENCE.md#useCheckoutPreview
 * - utils/adapter/checkoutPreviewAdapter.ts
 */
export default function CheckoutScreen() {
  // ...
}

/**
 * Transform checkout API response to UI-ready data.
 * 
 * Changes:
 * - itemId → id (field rename)
 * - basePath + extension → imageUrl (URL building)
 * - null variantAttributes → empty string (null handling)
 * - Adds shopId injected by parent
 * 
 * @param dto CheckoutPreviewItemDTO from API
 * @returns CheckoutItemUI ready for components
 * 
 * @example
 * const uiItem = toCheckoutItemUI(dtoItem);
 */
export const toCheckoutItemUI = (dto: CheckoutPreviewItemDTO): CheckoutItemUI => {
  // ...
};
```

---

## 12. HƯỚNG DẪN TẠO FEATURE MỚI

### 12.1. 10-Step Feature Creation Checklist

```
FEATURE: Add "Wishlist" feature
├─ Step 1: Define Types
├─ Step 2: Create Zod Schemas
├─ Step 3: Create API Hooks
├─ Step 4: Create Adapters
├─ Step 5: Create Store (if state needed)
├─ Step 6: Create Components
├─ Step 7: Create Screens
├─ Step 8: Add Routes
├─ Step 9: Add API Routes
├─ Step 10: Update Documentation
```

### 12.2. Step-by-Step Example: "Wishlist" Feature

#### STEP 1: Define Types

```typescript
// types/wishlist.ts

// API DTO
export interface WishlistItemDTO {
  wishlistItemId: string;
  productId: string;
  productName: string;
  basePath: string | null;
  extension: string | null;
  unitPrice: number;
  addedAt: string;
}

// UI Type
export interface WishlistItemUI {
  id: string;
  productId: string;
  productName: string;
  imageUrl: string;
  unitPrice: number;
  addedAt: Date;
}

export interface WishlistUI {
  items: WishlistItemUI[];
  totalCount: number;
}
```

#### STEP 2: Create Zod Schemas

```typescript
// types/wishlist.ts (add to file)

export const WishlistItemSchema = z.object({
  wishlistItemId: z.string(),
  productId: z.string(),
  productName: z.string(),
  basePath: z.string().nullable(),
  extension: z.string().nullable(),
  unitPrice: z.number(),
  addedAt: z.string(),
});

export const WishlistResponseSchema = z.object({
  code: z.number(),
  success: z.boolean(),
  data: z.object({
    items: z.array(WishlistItemSchema),
    totalCount: z.number(),
  }),
});
```

#### STEP 3: Create API Hooks

```typescript
// hooks/api/wishlist/useWishlist.ts

import { useQuery } from '@tanstack/react-query';
import { request } from '@/services/api/client';
import { API_ROUTES } from '@/constants/apiRoutes';
import { WishlistResponseSchema } from '@/types/wishlist';
import { toWishlistUI } from '@/utils/adapter/wishlistAdapter';

export const useWishlist = () => {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const response = await request(
        { url: API_ROUTES.WISHLIST.GET },
        WishlistResponseSchema
      );
      return toWishlistUI(response.data);
    },
    staleTime: 5 * 60 * 1000,
  });
};

// hooks/api/wishlist/useWishlistMutations.ts

export const useWishlistMutations = () => {
  const queryClient = useQueryClient();
  
  const addToWishlist = useMutation({
    mutationFn: async (productId: string) => {
      return await request(
        {
          url: API_ROUTES.WISHLIST.ADD,
          method: 'POST',
          data: { productId },
        },
        AddToWishlistResponseSchema
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
  
  const removeFromWishlist = useMutation({
    mutationFn: async (wishlistItemId: string) => {
      return await request(
        {
          url: API_ROUTES.WISHLIST.REMOVE,
          method: 'POST',
          data: { wishlistItemId },
        },
        RemoveFromWishlistResponseSchema
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
  
  return { addToWishlist, removeFromWishlist };
};
```

#### STEP 4: Create Adapters

```typescript
// utils/adapter/wishlistAdapter.ts

import type { WishlistItemDTO, WishlistUI, WishlistItemUI } from '@/types/wishlist';
import { toSizedImageUrl } from '@/utils/url';

export const toWishlistItemUI = (dto: WishlistItemDTO): WishlistItemUI => ({
  id: dto.wishlistItemId,
  productId: dto.productId,
  productName: dto.productName,
  imageUrl: toSizedImageUrl(dto.basePath, dto.extension) ?? DEFAULT_IMAGE,
  unitPrice: dto.unitPrice,
  addedAt: new Date(dto.addedAt),
});

export const toWishlistUI = (data: any): WishlistUI => ({
  items: data.items.map(toWishlistItemUI),
  totalCount: data.totalCount,
});
```

#### STEP 5: Create Store (if needed)

```typescript
// store/useWishlistStore.ts

interface WishlistState {
  isWishlisted: Map<string, boolean>;
  toggleWishlisted: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  isWishlisted: new Map(),
  
  toggleWishlisted: (productId) => {
    set((state) => {
      const newMap = new Map(state.isWishlisted);
      newMap.set(productId, !newMap.get(productId));
      return { isWishlisted: newMap };
    });
  },
  
  isWishlisted: (productId) => {
    return get().isWishlisted.get(productId) ?? false;
  },
}));
```

#### STEP 6-10: Create Components, Screens, Routes, etc.

```typescript
// components/wishlist/WishlistButton.tsx
export const WishlistButton = ({ productId }: { productId: string }) => {
  const { addToWishlist, removeFromWishlist } = useWishlistMutations();
  const isWishlisted = useWishlistStore(s => s.isWishlisted(productId));
  
  const toggleWishlist = async () => {
    if (isWishlisted) {
      await removeFromWishlist.mutateAsync(productId);
    } else {
      await addToWishlist.mutateAsync(productId);
    }
  };
  
  return (
    <Button
      onPress={toggleWishlist}
      icon={isWishlisted ? 'heart-fill' : 'heart'}
    />
  );
};

// app/(tabs)/wishlist.tsx
export default function WishlistScreen() {
  const { data, isLoading } = useWishlist();
  
  return (
    <View>
      {data?.items.map(item => (
        <WishlistItem key={item.id} item={item} />
      ))}
    </View>
  );
}
```

---

## 13. FILE ORGANIZATION GUIDE

### 13.1. Creating Files by Feature

**Feature: Cart Management**

```
File Creation Order:
1. types/cart.ts                              # Types + Zod schemas
2. utils/adapter/cartAdapter.ts               # DTO → UI transforms
3. hooks/api/cart/useCart.ts                  # GET cart query
4. hooks/api/cart/useCartMutations.ts         # Add/Remove mutations
5. store/useCartStore.ts                      # Client state
6. components/cart/CartItem.tsx               # Atomic component
7. components/cart/CartShopGroup.tsx          # Composite component
8. app/(tabs)/cart.tsx                        # Screen/Page
9. constants/apiRoutes.ts                     # Add API endpoints
10. docs/ARCHITECTURE.md                      # Update docs

File Structure:
```

### 13.2. Do's and Don'ts for File Organization

| Aspect | ✅ DO | ❌ DON'T |
|--------|-------|---------|
| **Grouping Types** | Group by feature (`types/cart.ts`, `types/checkout.ts`) | Scatter types everywhere |
| **Adapter Location** | Always in `utils/adapter/` | Inline in components or hooks |
| **API Hooks** | Organize by feature (`hooks/api/cart/`, `hooks/api/checkout/`) | Random naming in `hooks/` |
| **Stores** | One store per domain (`useCartStore.ts`, `useCheckoutStore.ts`) | Multiple stores per domain |
| **Components** | Group by feature with `components/cart/`, `components/checkout/` | Flat structure or inconsistent naming |
| **Imports** | Always use `@/` alias | Mix of relative + absolute paths |
| **Type Exports** | Export in one place at top of file | Scattered exports |
| **Constants** | Centralized in `constants/` | Scattered in multiple files |

---

## 📊 QUICK REFERENCE DIAGRAMS

### Project Timeline

```
Development Flow:
1. Plan (Types/Zod)
2. API Integration (Hooks + Adapter)
3. State Management (Store)
4. UI Components
5. Screen/Features
6. Testing
7. Documentation
```

### Common Code Patterns

```typescript
// Pattern 1: API Query
const { data, isLoading, error } = useQuery({
  queryKey: ['key'],
  queryFn: async () => {
    const response = await request(config, Schema);
    return toUIType(response.data);
  },
});

// Pattern 2: Mutation with Optimistic Update
const { mutate } = useMutation({
  mutationFn: async (data) => await request(config, Schema),
  onMutate: (newData) => {
    const previous = queryClient.getQueryData(['key']);
    queryClient.setQueryData(['key'], newData);
    return { previous };
  },
  onError: (err, vars, context) => {
    queryClient.setQueryData(['key'], context.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['key'] });
  },
});

// Pattern 3: Zustand Store
const useStore = create((set) => ({
  state: value,
  action: () => set({ state: newValue }),
}));

// Pattern 4: Component with Type Safety
export default function Component() {
  const { data } = useQuery();
  const { action } = useStore();
  
  return <View>{/* JSX */}</View>;
}
```

---

## 🎯 DECISION MATRIX: WHAT GOES WHERE?

```
┌─────────────────────────────────────────────────────────────────┐
│                     WHAT GOES WHERE?                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Component Logic (useState, useEffect)     → Use inside component│
│  Feature State (user selection, session)   → Zustand store      │
│  Server Data (api response, cache)         → TanStack Query     │
│  Type Definitions (interfaces)             → types/ folder      │
│  Data Transformations (DTO→UI)             → utils/adapter/     │
│  API Endpoints                             → constants/apiRoutes│
│  Navigation Routes                         → constants/routes   │
│  Theme/Colors                              → constants/unistyles│
│  Reusable Logic (formatting, parsing)      → utils/             │
│  API Client Setup                          → services/api/      │
│  Authentication                            → services/auth/ +   │
│                                             store/useAuthStore  │
│  UI Elements                                → components/        │
│  Page/Screen                                → app/               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚠️ COMMON MISTAKES & HOW TO AVOID

```
MISTAKE 1: Hardcoding API URLs
❌ const url = 'https://api.example.com/cart';
✅ const url = API_ROUTES.CART.GET;

MISTAKE 2: Using `any` type
❌ const data: any = response.data;
✅ const data: CartUI = await request(config, CartResponseSchema);

MISTAKE 3: No validation
❌ const item = response.data.item;
✅ const item = CartItemSchema.parse(response.data.item);

MISTAKE 4: Transform logic in components
❌ {item.basePath && `${CDN}/${item.basePath}${item.extension}`}
✅ {item.imageUrl}  // Already transformed in adapter

MISTAKE 5: Multiple stores for one domain
❌ useCartStore + useCartUIStore + useCartSelectionStore
✅ useCartStore with multiple selectors

MISTAKE 6: Inline API calls
❌ const [data, setData] = useState();
   useEffect(() => axios.get(...).then(...), []);
✅ const { data } = useQuery({...});

MISTAKE 7: No Zod validation
❌ const data = response.data as CartItem;
✅ const data = CartItemSchema.parse(response.data);

MISTAKE 8: Relative imports
❌ import { Button } from '../../../components/ui/Button';
✅ import { Button } from '@/components/ui/Button';
```

---

## 📚 DOCUMENTATION HIERARCHY

```
Project Docs:
├── docs/README.md                    ← START HERE (Overview)
├── docs/ARCHITECTURE.md              ← System design
├── docs/API_HOOKS_REFERENCE.md       ← API patterns
├── docs/ADAPTERS_TYPES_REFERENCE.md  ← Data transformation
├── PROJECT_ANALYSIS.md               ← This file (Comprehensive)
├── README.md                         ← Setup & installation
└── Code Comments                     ← Inline documentation
```

---

## 🚀 GETTING STARTED CHECKLIST

```
For New Developers:
□ Read docs/README.md (5 min)
□ Read docs/ARCHITECTURE.md (15 min)
□ Review Project Structure (10 min)
□ Run `npm install` & `npm start` (5 min)
□ Explore existing features (cart, checkout)
□ Read AGENTS.md for team standards
□ Review sample hook implementation
□ Create first API hook (30 min)
□ Review type system and adapters
□ Read API_HOOKS_REFERENCE.md
□ Practice: Add simple feature
```

---

## 📝 MAINTENANCE & UPDATES

**When to Update This Document:**
- New layers added to architecture
- New major patterns introduced
- Significant changes to naming conventions
- New required tools/libraries
- New blocking rules established

**Who Should Update:**
- Tech Lead / Architect
- Senior Developers

**Frequency:**
- Quarterly review
- Upon major changes

---

> **Last Updated**: 2026-01-22 by Amp Analysis
>
> **Status**: ✅ Complete & Production-Ready
>
> **Questions?** Refer to `docs/` folder or ask team lead.
