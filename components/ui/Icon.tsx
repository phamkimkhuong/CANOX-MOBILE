import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleProp, TextStyle } from 'react-native';

/**
 * IconSymbol - Lớp trừu tượng thống nhất cho icon trên cả iOS và Android
 * 
 * Từ Expo SDK 50+: Không dùng tiền tố ios-/md- nữa (đã deprecated)
 * Sử dụng tên thống nhất: 'add', 'heart-outline', 'home', etc.
 * 
 * Mapping thông minh:
 * - iOS: Hiển thị SF Symbols-like style từ Ionicons (thanh mảnh, tinh tế)
 * - Android: Có thể map sang style phù hợp Material-like
 */

// Type cho tên icon sử dụng trong app
export type IconSymbolName = keyof typeof ICON_MAP | keyof typeof Ionicons.glyphMap;

// Định nghĩa map icon với platform-specific variants
const ICON_MAP: Record<string, { ios: keyof typeof Ionicons.glyphMap; android: keyof typeof Ionicons.glyphMap }> = {
    // === Navigation Icons ===
    share: {
        ios: 'share-outline',           // Square with arrow (iOS native)
        android: 'share-social-outline' // 3 connected dots (Android pattern)
    },
    more: {
        ios: 'ellipsis-horizontal',     // Horizontal dots (iOS native)
        android: 'ellipsis-vertical'    // Vertical dots (Android pattern)
    },
    back: {
        ios: 'chevron-back',            // Chevron (iOS native)
        android: 'arrow-back'           // Arrow (Android pattern)
    },
    forward: {
        ios: 'chevron-forward',
        android: 'arrow-forward'
    },

    // === Tab Bar Icons ===
    home: { ios: 'home-outline', android: 'home-outline' },
    'home-filled': { ios: 'home', android: 'home' },
    cart: { ios: 'cart-outline', android: 'cart-outline' },
    'cart-filled': { ios: 'cart', android: 'cart' },
    category: { ios: 'grid-outline', android: 'grid-outline' },
    notifications: { ios: 'notifications-outline', android: 'notifications-outline' },
    'notifications-filled': { ios: 'notifications', android: 'notifications' },
    person: { ios: 'person-outline', android: 'person-outline' },
    'person-filled': { ios: 'person', android: 'person' },

    // === Action Icons ===
    search: { ios: 'search-outline', android: 'search-outline' },
    close: { ios: 'close', android: 'close' },
    add: { ios: 'add', android: 'add' },
    remove: { ios: 'remove', android: 'remove' },
    check: { ios: 'checkmark', android: 'checkmark' },

    // === E-commerce Icons ===
    'favorite-border': { ios: 'heart-outline', android: 'heart-outline' },
    favorite: { ios: 'heart', android: 'heart' },
    star: { ios: 'star', android: 'star' },
    'star-border': { ios: 'star-outline', android: 'star-outline' },
    'shopping-cart': { ios: 'cart-outline', android: 'cart-outline' },
    'shopping-bag': { ios: 'bag-outline', android: 'bag-outline' },
    'cart-plus': { ios: 'cart-outline', android: 'cart-outline' }, // Alias for rebuy
    'local-shipping': { ios: 'car-outline', android: 'car-outline' },
    shipping: { ios: 'car-outline', android: 'car-outline' },
    'shipping-fast': { ios: 'car-sport-outline', android: 'car-sport-outline' },
    receipt: { ios: 'receipt-outline', android: 'receipt-outline' },
    store: { ios: 'storefront-outline', android: 'storefront-outline' },
    ticket: { ios: 'ticket-outline', android: 'ticket-outline' },
    note: { ios: 'document-text-outline', android: 'document-text-outline' },
    'note-filled': { ios: 'document-text', android: 'document-text' },
    card: { ios: 'card-outline', android: 'card-outline' },
    'credit-card-outline': { ios: 'card-outline', android: 'card-outline' }, // Alias
    wallet: { ios: 'wallet-outline', android: 'wallet-outline' },

    // === UI Icons ===
    'chevron-right': { ios: 'chevron-forward', android: 'chevron-forward' },
    'chevron-left': { ios: 'chevron-back', android: 'chevron-back' },
    'arrow-back': { ios: 'chevron-back', android: 'arrow-back' },
    'arrow-left': { ios: 'chevron-back', android: 'arrow-back' }, // Alias for arrow-back
    login: { ios: 'log-in-outline', android: 'log-in-outline' },
    'lock-reset': { ios: 'key-outline', android: 'key-outline' },
    lock: { ios: 'lock-closed-outline', android: 'lock-closed-outline' },
    mail: { ios: 'mail-outline', android: 'mail-outline' },
    'info-outline': { ios: 'information-circle-outline', android: 'information-circle-outline' },
    'verified-user': { ios: 'shield-checkmark-outline', android: 'shield-checkmark-outline' },

    // === Category Icons (mapping từ MaterialIcons sang Ionicons) ===
    bolt: { ios: 'flash-outline', android: 'flash-outline' },
    'confirmation-number': { ios: 'ticket-outline', android: 'ticket-outline' },
    smartphone: { ios: 'phone-portrait-outline', android: 'phone-portrait-outline' },
    checkroom: { ios: 'shirt-outline', android: 'shirt-outline' },
    'local-grocery-store': { ios: 'storefront-outline', android: 'storefront-outline' },
    'monetization-on': { ios: 'cash-outline', android: 'cash-outline' },
    public: { ios: 'globe-outline', android: 'globe-outline' },

    // === Notification Icons ===
    'local-fire-department': { ios: 'flame-outline', android: 'flame-outline' },
    shield: { ios: 'shield-outline', android: 'shield-outline' },
    'account-balance-wallet': { ios: 'wallet-outline', android: 'wallet-outline' },
    'account-balance': { ios: 'business-outline', android: 'business-outline' }, // Bank icon
    percent: { ios: 'pricetag-outline', android: 'pricetag-outline' },
    cash: { ios: 'cash-outline', android: 'cash-outline' }, // Cash/money icon

    // === Communication Icons ===
    chat: { ios: 'chatbubble-outline', android: 'chatbubble-outline' },
    'chat-filled': { ios: 'chatbubble', android: 'chatbubble' },
    'chat-bubble': { ios: 'chatbubble-outline', android: 'chatbubble-outline' },
    'chat-bubble-outline': { ios: 'chatbubble-outline', android: 'chatbubble-outline' },
    'chatbubble-ellipses-outline': { ios: 'chatbubble-ellipses-outline', android: 'chatbubble-ellipses-outline' },
    'sentiment-satisfied': { ios: 'happy-outline', android: 'happy-outline' },

    // === Auth/Visibility Icons ===
    visibility: { ios: 'eye-outline', android: 'eye-outline' },
    'visibility-off': { ios: 'eye-off-outline', android: 'eye-off-outline' },
    email: { ios: 'mail-outline', android: 'mail-outline' },

    // === Toast/Status Icons ===
    'check-circle': { ios: 'checkmark-circle', android: 'checkmark-circle' },
    error: { ios: 'close-circle', android: 'close-circle' },
    warning: { ios: 'warning', android: 'warning' },
    info: { ios: 'information-circle', android: 'information-circle' },

    // === Action Icons (Extended) ===
    tune: { ios: 'options-outline', android: 'options-outline' },
    'push-pin': { ios: 'pin-outline', android: 'pin-outline' },
    delete: { ios: 'trash-outline', android: 'trash-outline' },
    'done-all': { ios: 'checkmark-done', android: 'checkmark-done' },
    schedule: { ios: 'time-outline', android: 'time-outline' },
    'attach-file': { ios: 'attach-outline', android: 'attach-outline' },
    image: { ios: 'image-outline', android: 'image-outline' },
    verified: { ios: 'checkmark-circle', android: 'checkmark-circle' },
    'camera-outline': { ios: 'camera-outline', android: 'camera-outline' },
    'photo-camera': { ios: 'camera-outline', android: 'camera-outline' },

    // === Notification Icons (Extended) ===
    'notifications-none': { ios: 'notifications-outline', android: 'notifications-outline' },
    'notifications-off': { ios: 'notifications-off-outline', android: 'notifications-off-outline' },

    // === Partner Type Icons (Chat) ===
    storefront: { ios: 'storefront-outline', android: 'storefront-outline' },
    'local-mall': { ios: 'bag-handle-outline', android: 'bag-handle-outline' },
    'smart-toy': { ios: 'game-controller-outline', android: 'game-controller-outline' },
    campaign: { ios: 'megaphone-outline', android: 'megaphone-outline' },

    // === Voucher Type Icons ===
    'flight-takeoff': { ios: 'airplane-outline', android: 'airplane-outline' },
    videocam: { ios: 'videocam-outline', android: 'videocam-outline' },

    // === Order Status Icons ===
    'clock-outline': { ios: 'time-outline', android: 'time-outline' },
    'credit-card-clock-outline': { ios: 'card-outline', android: 'card-outline' },
    'check-circle-outline': { ios: 'checkmark-circle-outline', android: 'checkmark-circle-outline' },
    'truck-fast-outline': { ios: 'car-sport-outline', android: 'car-sport-outline' },
    'truck-fast': { ios: 'car-sport', android: 'car-sport' },
    'truck-check-outline': { ios: 'car-sport-outline', android: 'car-sport-outline' },
    'truck-alert-outline': { ios: 'warning-outline', android: 'warning-outline' },
    'truck-delivery-outline': { ios: 'car-sport-outline', android: 'car-sport-outline' },
    'package-variant': { ios: 'cube-outline', android: 'cube-outline' },
    'package-variant-closed-check': { ios: 'cube-outline', android: 'cube-outline' },
    'package-variant-closed-minus': { ios: 'cube-outline', android: 'cube-outline' },
    'package-variant-minus': { ios: 'cube-outline', android: 'cube-outline' },
    'package-variant-closed-remove': { ios: 'cube-outline', android: 'cube-outline' },
    'check-all': { ios: 'checkmark-done-outline', android: 'checkmark-done-outline' },
    'close-circle-outline': { ios: 'close-circle-outline', android: 'close-circle-outline' },
    'shopping-outline': { ios: 'bag-outline', android: 'bag-outline' },
    'store-outline': { ios: 'storefront-outline', android: 'storefront-outline' },
    'store-check-outline': { ios: 'storefront-outline', android: 'storefront-outline' },

    // === Brand/Logo Icons ===
    'logo-google': { ios: 'logo-google', android: 'logo-google' },
    'logo-facebook': { ios: 'logo-facebook', android: 'logo-facebook' },
    'logo-apple': { ios: 'logo-apple', android: 'logo-apple' },

    // === Product Detail Icons ===
    play: { ios: 'play', android: 'play' },
    'play-circle': { ios: 'play-circle', android: 'play-circle' },
    'chevron-up': { ios: 'chevron-up', android: 'chevron-up' },
    'chevron-down': { ios: 'chevron-down', android: 'chevron-down' },
    location: { ios: 'location-sharp', android: 'location-sharp' },
    'location-outline': { ios: 'location-outline', android: 'location-outline' },
    'storefront-outline': { ios: 'storefront-outline', android: 'storefront-outline' },
    'image-outline': { ios: 'image-outline', android: 'image-outline' },
    'rate-review': { ios: 'chatbox-ellipses-outline', android: 'chatbox-ellipses-outline' },
    'auto-awesome': { ios: 'sparkles-outline', android: 'sparkles-outline' },
    'location-on': { ios: 'location-outline', android: 'location-outline' },
    'keyboard-arrow-down': { ios: 'chevron-down', android: 'chevron-down' },
    'local-activity': { ios: 'ticket-outline', android: 'ticket-outline' },

    // === Address Icons ===
    'home-pin': { ios: 'home-outline', android: 'home-outline' },
    'location-city': { ios: 'business-outline', android: 'business-outline' },
    'work-outline': { ios: 'briefcase-outline', android: 'briefcase-outline' },
    'edit-square': { ios: 'create-outline', android: 'create-outline' },
    'radio-button-on': { ios: 'radio-button-on', android: 'radio-button-on' },
    'radio-button-off': { ios: 'radio-button-off', android: 'radio-button-off' },
    'checkbox-outline': { ios: 'checkbox-outline', android: 'checkbox-outline' },
    'checkbox': { ios: 'checkbox', android: 'checkbox' },
    call: { ios: 'call-outline', android: 'call-outline' },
    'my-location': { ios: 'navigate-outline', android: 'navigate-outline' },

    // === Profile/Form Icons ===
    phone: { ios: 'call-outline', android: 'call-outline' },
    'phone-outline': { ios: 'call-outline', android: 'call-outline' },
    calendar: { ios: 'calendar-outline', android: 'calendar-outline' },
    'calendar-month': { ios: 'calendar-outline', android: 'calendar-outline' },
    'calendar-outline': { ios: 'calendar-outline', android: 'calendar-outline' },
    camera: { ios: 'camera-outline', android: 'camera-outline' },
    'camera-alt': { ios: 'camera-outline', android: 'camera-outline' },
    edit: { ios: 'create-outline', android: 'create-outline' },
    'edit-outline': { ios: 'create-outline', android: 'create-outline' },
    'person-outline': { ios: 'person-outline', android: 'person-outline' },
    'male-female': { ios: 'male-female-outline', android: 'male-female-outline' },
    transgender: { ios: 'transgender-outline', android: 'transgender-outline' },
};

interface IconSymbolProps {
    name: IconSymbolName;
    size?: number;
    color?: string;
    style?: StyleProp<TextStyle>;
}

/**
 * IconSymbol Component
 */
export const IconSymbol = ({ name, size = 24, color = '#000', style }: IconSymbolProps) => {
    const mappedIcon = ICON_MAP[name as string];

    let iconName: keyof typeof Ionicons.glyphMap;

    if (mappedIcon) {
        // Icon có mapping -> chọn theo platform
        iconName = Platform.OS === 'ios' ? mappedIcon.ios : mappedIcon.android;
    } else {
        // Không có trong map -> dùng trực tiếp (phải là valid Ionicons name)
        iconName = name as keyof typeof Ionicons.glyphMap;
    }

    return <Ionicons name={iconName} size={size} color={color} style={style} />;
};

// Legacy export for backward compatibility
export const Icon = IconSymbol;