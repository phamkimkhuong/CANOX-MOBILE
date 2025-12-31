# EBAY - Ứng dụng Thương mại Điện tử

Ứng dụng Mobile Thương mại Điện tử được xây dựng bằng **React Native** với **Expo SDK 54**, hỗ trợ cả nền tảng **iOS** và **Android**.

##  Giới thiệu

Đây là ứng dụng thương mại điện tử hoàn chỉnh với các tính năng chính:
- Trang chủ với danh mục sản phẩm, Flash Sale, sản phẩm nổi bật
-  Giỏ hàng với hệ thống voucher 2 cấp (Shop + Platform)
-  Tin nhắn/Chat thời gian thực qua WebSocket
-  Thông báo đẩy (Push Notifications)
-  Quản lý tài khoản người dùng
-  Xác thực an toàn (JWT, Biometric)

## 🛠️ Công nghệ sử dụng

### Core Framework
| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| React Native | 0.81.5 | Framework mobile cross-platform |
| Expo | 54.0.29 | Development platform |
| React | 19.1.0 | UI Library |
| TypeScript | 5.9.2 | Type-safe JavaScript |

### Navigation & Routing
| Thư viện | Mô tả |
|----------|-------|
| `expo-router` | File-based routing với Typed Routes |
| `@react-navigation/native` | Navigation core |
| `react-native-screens` | Native navigation containers |

### State Management
| Thư viện | Mô tả |
|----------|-------|
| `zustand` | Lightweight global state |
| `@tanstack/react-query` | Server state & caching |
| `react-native-mmkv` | Ultra-fast key-value storage |

### UI Components
| Thư viện | Mô tả |
|----------|-------|
| `react-native-unistyles` | Styling với theme support |
| `@shopify/flash-list` | High-performance list rendering |
| `react-native-reanimated` | Smooth animations |
| `react-native-gesture-handler` | Touch gestures |
| `@gorhom/bottom-sheet` | Bottom sheet modals |
| `expo-image` | Optimized image loading |
| `expo-linear-gradient` | Gradient backgrounds |

### Forms & Validation
| Thư viện | Mô tả |
|----------|-------|
| `react-hook-form` | Form management |
| `zod` | Schema validation |
| `@hookform/resolvers` | Zod integration |

### Networking & Real-time
| Thư viện | Mô tả |
|----------|-------|
| `axios` | HTTP client |
| `@stomp/stompjs` | WebSocket STOMP protocol |
| `sockjs-client` | WebSocket fallback |

### Internationalization
| Thư viện | Mô tả |
|----------|-------|
| `i18next` | i18n framework |
| `react-i18next` | React bindings |
| `expo-localization` | Device locale detection |

### Security
| Thư viện | Mô tả |
|----------|-------|
| `expo-secure-store` | Secure token storage |
| `expo-local-authentication` | Biometric authentication |

## 📋 Yêu cầu hệ thống

### Development Environment
- **Node.js**: >= 18.x
- **npm**: >= 9.x hoặc **yarn**: >= 1.22
- **Git**: >= 2.x

### iOS Development
- **macOS**: Monterey (12.0) trở lên
- **Xcode**: 14.0 trở lên
- **iOS Simulator** hoặc thiết bị thật
- **CocoaPods**: >= 1.12

### Android Development
- **Android Studio**: Hedgehog (2023.1.1) trở lên
- **Android SDK**: API Level 23 (Android 6.0) trở lên
- **Target SDK**: API Level 34 (Android 14)
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
cd EBAY_TMDT_APP_mobi_DEV03
```

### 2. Cài đặt Dependencies
```bash
npm install
```

### 3. Cấu hình Environment
```bash
# Tạo file .env.local từ template
cp .env.local

# Chỉnh sửa các biến môi trường
# EXPO_PUBLIC_API_BASE_URL=https://your-api-url.com
# EXPO_PUBLIC_CDN_BASE_URL=https://your-cdn-url.com
```

### 4. Chạy ứng dụng

#### Development Server
```bash
npm start
```

#### Android
```bash
# Chạy trên emulator/device đã kết nối
npm run android

# Hoặc với device cụ thể
npm run a
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
    1. Mở file workspace: `open ios/ebay.xcworkspace`
    2. Trong giao diện Xcode, chọn thiết bị giả lập (Simulator) và nhấn nút **Play (Run)** ở góc trên bên trái.

## 📁 Cấu trúc dự án

```
EBAY_TMDT_APP_mobi_DEV03/
├── app/                    # Routes (file-based routing)
│   ├── (auth)/            # Authentication screens
│   ├── (main)/            # Main screens (non-tab)
│   ├── (tabs)/            # Tab-based screens
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
│   ├── ui/               # Base UI atoms
│   ├── cart/             # Cart-related components
│   ├── chat/             # Chat components
│   ├── home/             # Home screen components
│   ├── notifications/    # Notification components
│   └── profile/          # Profile components
├── constants/             # App constants & config
│   ├── i18n/             # Translations
│   ├── routes.ts         # Route definitions
│   └── unistyles.ts      # Theme configuration
├── hooks/                 # Custom React hooks
│   └── api/              # API-related hooks
├── services/              # API service layer
├── store/                 # Zustand stores
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
    └── adapter/          # Data transformers
```

## 🎨 Design System

Ứng dụng sử dụng **Unistyles** với theme configuration tập trung:

```typescript
// constants/unistyles.ts
const lightTheme = {
    colors: {
        primary: '#0088cc',
        background: '#eef8ff',
        surface: '#ffffff',
        // ...
    },
    margins: { sm: 8, md: 16, lg: 24, xl: 32 },
    radius: { s: 4, m: 8, l: 16, full: 999 }
}
```

## 📝 Scripts

| Script | Mô tả |
|--------|-------|
| `npm start` | Khởi động Expo development server |
| `npm run android` | Build và chạy trên Android |
| `npm run a` | Chạy trên Android device được kết nối |
| `npm run ios` | Build và chạy trên iOS (macOS only) |
| `npm run web` | Chạy trên web browser |


## 📄 License

Private - All Rights Reserved

---

© 2025 EBAY TMDT. Phát triển bởi đội ngũ Mobile Development.
