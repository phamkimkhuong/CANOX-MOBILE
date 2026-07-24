# TCano - Ứng dụng Thương mại Điện tử

Ứng dụng Mobile Thương mại Điện tử được xây dựng bằng **React Native 0.86** với **Expo SDK 57**, hỗ trợ cả nền tảng **iOS** và **Android**. Bật **New Architecture** (Fabric Renderer + TurboModules).

## 📌 Giới thiệu

Đây là ứng dụng thương mại điện tử hoàn chỉnh dành cho **Buyer** (người mua) với các tính năng chính:
-  Trang chủ với danh mục sản phẩm, Flash Sale, sản phẩm nổi bật, banner quảng cáo
-  Giỏ hàng với hệ thống voucher 2 cấp (Shop + Platform)
-  Tin nhắn/Chat thời gian thực qua WebSocket (STOMP protocol)
-  Thông báo đẩy (Push Notifications via Firebase Cloud Messaging)
-  Quản lý tài khoản người dùng, avatar, hồ sơ
-  Xác thực an toàn (JWT 3-layer refresh, Biometric, Google Sign-In)
-  Quản lý đơn hàng (đặt hàng, theo dõi, hủy, hoàn trả)
-  Đánh giá sản phẩm (viết, chỉnh sửa, upload media)
-  Tìm kiếm thông minh (suggestions, hot keywords, lịch sử)
-  Danh sách yêu thích (Wishlist) với Price Target alerts
-  Flash Sale với countdown timer
-  Trang cửa hàng (Shop page) với danh mục riêng
-  Thanh toán qua PayOS
-  Hệ thống xu/điểm thưởng (Loyalty)
-  Quản lý thẻ ngân hàng
-  Quản lý địa chỉ giao hàng
-  Đa ngôn ngữ (i18n)

## 🛠️ Công nghệ sử dụng

### Core Framework
| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| React Native | 0.86.0 | Framework mobile cross-platform |
| Expo | SDK 57 | Development platform (Managed Workflow) |
| React | 19.2.x | UI Library (React 19 với Compiler) |
| TypeScript | 6.0.3 | Type-safe JavaScript (Strict Mode) |
| New Architecture | Enabled | Fabric Renderer + TurboModules |

### Navigation & Routing
| Thư viện | Phiên bản | Mô tả |
|----------|-----------|-------|
| `expo-router` | 57.x | File-based routing với Typed Routes |
| `@react-navigation/native` | 7.3+ | Navigation core |
| `@react-navigation/bottom-tabs` | 7.18+ | Tab navigation |
| `react-native-screens` | 4.25+ | Native navigation containers |

### State Management
| Thư viện | Phiên bản | Mô tả |
|----------|-----------|-------|
| `zustand` | 5.0+ | Lightweight global state (10 stores) |
| `@tanstack/react-query` | 5.101+ | Server state & caching (82 hooks) |
| `react-native-mmkv` | 4.3+ | Ultra-fast key-value storage (JSI) |
| `expo-secure-store` | 57.x | Secure token storage |

### UI Components & Animations
| Thư viện | Phiên bản | Mô tả |
|----------|-----------|-------|
| `react-native-unistyles` | 3.2+ | Styling với theme support (C++ core) |
| `@shopify/flash-list` | 2.3+ (V2) | High-performance list rendering |
| `react-native-reanimated` | 4.5+ | Worklet-based animations |
| `react-native-gesture-handler` | 2.32+ | Touch gestures |
| `@gorhom/bottom-sheet` | 5.2+ | Bottom sheet modals |
| `expo-image` | 57.x | Optimized image loading & caching |
| `expo-linear-gradient` | 57.x | Gradient backgrounds |
| `expo-blur` | 57.x | Blur effects |
| `react-native-svg` | 15.15+ | SVG rendering |
| `react-native-qrcode-svg` | 6.3+ | QR code generation |

### Forms & Validation
| Thư viện | Phiên bản | Mô tả |
|----------|-----------|-------|
| `react-hook-form` | 7.81+ | Form management |
| `zod` | 4.4+ | Runtime schema validation |
| `@hookform/resolvers` | 5.4+ | Zod integration |

### Networking & Real-time
| Thư viện | Phiên bản | Mô tả |
|----------|-----------|-------|
| `axios` | 1.13+ | HTTP client với interceptors |
| `@stomp/stompjs` | 7.3+ | WebSocket STOMP protocol |
| `sockjs-client` | 1.6+ | WebSocket fallback transport |

### Internationalization
| Thư viện | Phiên bản | Mô tả |
|----------|-----------|-------|
| `i18next` | 26.3+ | i18n framework |
| `react-i18next` | 16.5+ | React bindings |
| `expo-localization` | 57.x | Device locale detection |

### Security & Authentication
| Thư viện | Phiên bản | Mô tả |
|----------|-----------|-------|
| `expo-secure-store` | 57.x | Secure token storage |
| `expo-local-authentication` | 57.x | Biometric authentication |
| `@react-native-google-signin/google-signin` | 16.1+ | Google Sign-In |

### Monitoring & Analytics
| Thư viện | Phiên bản | Mô tả |
|----------|-----------|-------|
| `@sentry/react-native` | 8.x | Error tracking & Performance |
| `@react-native-firebase/analytics` | 25.x | User behavior analytics |
| `@react-native-firebase/messaging` | 25.x | Push notifications (FCM) |
| `@react-native-firebase/remote-config` | 25.x | Feature flags & Force update |

### Build & Updates
| Thư viện | Phiên bản | Mô tả |
|----------|-----------|-------|
| `expo-updates` | 57.x | OTA updates (JS-only) |
| `expo-dev-client` | 57.x | Development client |
| EAS Build | - | Cloud builds (dev/preview/prod) |

## 📋 Yêu cầu hệ thống

### Development Environment
- **Node.js**: >= 18.x
- **npm**: >= 9.x
- **Git**: >= 2.x
- **EAS CLI**: >= 16.28.0

### iOS Development
- **macOS**: Monterey (12.0) trở lên
- **Xcode**: 15.0 trở lên
- **iOS Simulator** hoặc thiết bị thật
- **CocoaPods**: >= 1.12

### Android Development
- **Android Studio**: Hedgehog (2023.1.1) trở lên
- **Android SDK**: API Level 23 (Android 6.0) trở lên
- **Target SDK**: API Level 35 (Android 15)
- **Java Development Kit (JDK)**: 17

### Thiết bị hỗ trợ
| Platform | Minimum Version |
|----------|-----------------|
| iOS | 13.0+ |
| Android | 6.0+ (API 23) |

## 🚀 Cài đặt

### 1. Clone Repository
```bash
git clone <repository-url>
cd TCano
```

### 2. Cài đặt Dependencies
```bash
npm install
```

### 3. Cấu hình Environment
```bash
# Tạo file .env.local từ template
cp .env.prod .env.local

# Chỉnh sửa các biến môi trường
# EXPO_PUBLIC_API_URL=https://api.calatha.com
# EXPO_PUBLIC_CDN_BASE_URL=https://your-cdn-url.com
# EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...
# EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...
# EXPO_PUBLIC_SENTRY_DSN=...
```

### 4. Chạy ứng dụng

#### Development Server
```bash
npm start
# hoặc xóa cache
npm run clear
```

#### Android
```bash
# Chạy trên emulator/device đã kết nối
npm run android

# Dev variant trên device cụ thể
npm run a-dev

# Prebuild + chạy dev
npm run a-dev-prebuild
```

#### iOS (macOS only)

Để chạy được trên iOS, bạn cần thực hiện theo các giai đoạn sau:

**Giai đoạn 1: Cài đặt môi trường (Chỉ làm 1 lần)**
1.  **Cài đặt Xcode**: Tải từ App Store (Yêu cầu trống ít nhất 60GB ổ cứng).
2.  **Mở Xcode**: Chấp nhận các điều khoản và đợi cài đặt các "Component" bổ sung.
3.  **Command Line Tools**: Vào `Xcode > Settings > Locations`, đảm bảo đã chọn phiên bản Xcode tại dòng *Command Line Tools*.
4.  **Cài đặt CocoaPods**: Mở Terminal và chạy lệnh:
    ```bash
    sudo gem install cocoapods
    ```

**Giai đoạn 2: Chuẩn bị dự án**
1.  Tại thư mục gốc, cài đặt JS dependencies: `npm install`
2.  Tạo thư mục native ios (nếu chưa có): `npx expo prebuild`
3.  Cài đặt Native dependencies bằng CocoaPods: 
    ```bash
    npx pod-install
    ```

**Giai đoạn 3: Chạy ứng dụng**
*   **Cách 1: Chạy tự động từ Terminal (Dùng hàng ngày)**:
    ```bash
    npm run ios
    ```
*   **Cách 2: Chạy trực tiếp từ Xcode (Khi cần cấu hình sâu hoặc debug lỗi Native)**:
    1. Mở file workspace: `open ios/tcano.xcworkspace`
    2. Trong giao diện Xcode, chọn thiết bị giả lập (Simulator) và nhấn nút **Play (Run)** ở góc trên bên trái.

## 📁 Cấu trúc dự án

```
TCano/
├── app/                        # Routes (file-based routing) — ~57 screens
│   ├── (auth)/                # Authentication screens (login, register, OTP, forgot/reset password)
│   ├── (main)/                # Main screens (non-tab)
│   │   ├── (order)/          # Checkout, payment, order management, returns
│   │   ├── (shop)/           # Product detail, shop page, vouchers
│   │   ├── (user)/           # Profile, settings, reviews, loyalty, bank cards
│   │   ├── address/          # Address CRUD
│   │   ├── cart/             # Shopping cart
│   │   ├── category/         # Category browsing
│   │   ├── chat/             # Chat conversations
│   │   ├── flash-sale/       # Flash sale page
│   │   ├── search/           # Search & results
│   │   └── common/           # Shared screens (gallery)
│   ├── (tabs)/                # Tab-based screens
│   │   ├── index.tsx         # Home
│   │   ├── wishlist.tsx      # Wishlist
│   │   ├── video.tsx         # Video (hidden)
│   │   ├── notify.tsx        # Notifications
│   │   └── me.tsx            # Profile/Me
│   └── _layout.tsx            # Root layout (providers, Sentry, auth guard)
├── components/                # UI components — 26 feature folders + UI library
│   ├── ui/                   # Base UI atoms (Icon, QuantityStepper, Feedback, Navigation)
│   ├── product/              # Product cards, gallery, variants
│   ├── cart/                 # Cart items, totals
│   ├── checkout/             # Checkout preview, voucher selection
│   ├── chat/                 # Chat messages, conversation list
│   ├── order/                # Order detail, tracking
│   ├── shop/                 # Shop page components
│   ├── reviews/              # Review components
│   ├── search/               # Search suggestions, history
│   ├── flash-sale/           # Countdown, slots
│   ├── wishlist/             # Wishlist components
│   ├── loyalty/              # Loyalty/coins
│   ├── notifications/        # Notification items
│   ├── address/              # Address cards
│   ├── bank/                 # Bank cards
│   ├── profile/              # Profile components
│   ├── settings/             # Settings components
│   ├── home/                 # Home screen sections
│   ├── categories/           # Category grid
│   ├── voucher/              # Voucher cards
│   ├── video/                # Video player
│   ├── popup/                # Intro popup
│   └── common/               # Crash fallback, Force update, Maintenance
├── constants/                 # App constants & config
│   ├── i18n/                 # Translation files
│   ├── unistyles.ts          # Theme configuration (colors, spacing, fonts)
│   ├── routes.ts             # Route definitions
│   ├── apiRoutes.ts          # API endpoint paths
│   ├── errorCodes.ts         # Error code translations
│   └── settings.ts           # App settings
├── hooks/                     # Custom React hooks
│   ├── api/                  # API hooks (82 hooks across 14 domains)
│   │   ├── cart/            # Cart hooks
│   │   ├── chat/            # Chat hooks
│   │   ├── checkout/        # Checkout hooks
│   │   ├── order/           # Order hooks
│   │   ├── product/         # Product hooks
│   │   ├── review/          # Review hooks
│   │   ├── search/          # Search hooks
│   │   ├── wishlist/        # Wishlist hooks (14 hooks)
│   │   ├── campaign/        # Flash sale hooks
│   │   ├── loyalty/         # Loyalty hooks
│   │   ├── notification/    # Notification hooks
│   │   ├── profile/         # Profile hooks
│   │   └── bank/            # Bank hooks
│   ├── useAuthGuard.ts       # Auth guard
│   ├── usePushNotifications.ts # FCM push notifications
│   ├── useWebSocket.ts       # WebSocket connection
│   ├── useOTAUpdate.ts       # OTA update checker
│   └── useTokenRefresh.ts    # Token refresh on foreground
├── services/                  # Service layer
│   ├── api/                  # Axios client, QueryClient, API mocks
│   ├── auth/                 # Token manager (3-layer strategy)
│   ├── storage/              # Storage utilities
│   ├── websocket/            # WebSocket manager
│   └── updateChecker/        # Version check service
├── store/                     # Zustand stores (10 stores)
│   ├── useAuthStore.ts       # Auth session
│   ├── useCheckoutStore.ts   # Checkout flow
│   ├── useCartStore.ts       # Cart selections
│   ├── useAppStore.ts        # App state (system, language, update)
│   └── ...                   # Loading, Chat, Video, Wishlist, Address, Return
├── types/                     # TypeScript definitions & Zod schemas
│   ├── [feature].ts          # UI types
│   └── [feature]/            # DTO types + Zod schemas
├── utils/                     # Utility functions
│   ├── adapter/              # DTO → UI transformers (21+ adapters)
│   ├── validation/           # Validation helpers
│   ├── media/                # Media utilities
│   ├── logger.ts             # Scoped logger
│   ├── format.ts             # Number/currency formatting
│   ├── date.ts               # Date utilities
│   └── url.ts                # URL helpers
├── contexts/                  # React contexts
├── plugins/                   # Custom Expo config plugins
├── __tests__/                 # Test suites (54 files)
│   ├── api-contract/         # API contract tests (MSW)
│   ├── utils/adapter/        # Adapter unit tests
│   ├── store/                # Store tests
│   ├── hooks/                # Hook tests
│   ├── components/           # Component tests
│   └── screens/              # Screen tests
└── assets/                    # Images, fonts, icons
```

## 🎨 Design System

Ứng dụng sử dụng **Unistyles 3.x** (C++ core) với theme configuration tập trung:

```typescript
// constants/unistyles.ts
const lightTheme = {
    colors: {
        primary: '#0088cc',       // Blue — primary brand
        buttonActive: '#ef4444',  // Red — CTA buttons
        accent: '#ff7a00',        // Orange — promotions, urgency
        background: '#f6f6f6',    // Light gray background
        surface: '#ffffff',       // White surface
        success: '#22c55e',
        error: '#ef4444',
        warning: '#f97316',
        info: '#0ea5e9',
        // Liquid Glass tokens
        surfaceGlass: 'rgba(255, 255, 255, 0.70)',
        borderGlass: 'rgba(255, 255, 255, 0.4)',
        vibrantRed: '#E31B23',
        // ... and many more semantic variants
    },
    margins: { xs: 4, sm: 8, smd: 12, md: 16, lg: 24, xl: 32, xxl: 48 },
    radius: { s: 4, m: 8, l: 16, xl: 24, full: 999 },
    fontSizes: { xs: 10, sm: 12, md: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 28, '4xl': 32 },
    fontWeights: { regular: '400', medium: '500', semibold: '600', bold: '700' },
    shadows: { small: { ... }, medium: { ... }, large: { ... } },
}
```

### Responsive Font Scaling
- Base width: 375 (iPhone 11/12/13/14 standard)
- Scale range: 0.9 (min) — 1.15 (max)
- Sử dụng `createScaledFontSize(size, screenWidth)` trong StyleSheet

## 📝 Scripts

| Script | Mô tả |
|--------|-------|
| `npm start` | Khởi động Expo development server |
| `npm run clear` | Xóa cache và khởi động lại |
| `npm run android` | Build và chạy trên Android |
| `npm run a-dev` | Chạy dev variant trên Android device |
| `npm run ios` | Build và chạy trên iOS (macOS only) |
| `npm run lint` | Kiểm tra linting (ESLint) |
| `npm run type-check` | Kiểm tra TypeScript types |
| `npm run test` | Chạy toàn bộ test suite |
| `npm run test:adapter` | Test adapters |
| `npm run test:store` | Test Zustand stores |
| `npm run test:hook` | Test custom hooks |
| `npm run test:component` | Test components |
| `npm run test:screen` | Test screens |
| `npm run test:api` | Test API contracts (MSW) |
| `npm run build-dev` | EAS Build — Development |
| `npm run build-preview` | EAS Build — Preview (APK) |
| `npm run build-prod` | EAS Build — Production |
| `npm run prebuild` | Generate native projects (clean) |

## 🏗️ Build Variants

| Variant | Bundle ID | Mục đích |
|---------|-----------|----------|
| **Development** | `com.cano.tcano.dev` | Dev build với Expo Dev Client |
| **Preview** | `com.cano.tcano.preview` | Internal testing (APK) |
| **Production** | `com.cano.tcano` | Store release |

## 📄 License

Private - All Rights Reserved

---

© 2026 TCano TMDT. Phát triển bởi đội ngũ Mobile Development.
