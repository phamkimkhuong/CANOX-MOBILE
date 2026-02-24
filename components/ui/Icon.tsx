import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleProp, TextStyle } from 'react-native';
import Animated from 'react-native-reanimated';

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

/**
 * IconSymbol - Lớp trừu tượng thống nhất cho icon trên cả iOS và Android
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
    share: { ios: 'arrow-redo', android: 'arrow-redo' },
    more: { ios: 'ellipsis-horizontal', android: 'ellipsis-vertical' },
    back: { ios: 'chevron-back', android: 'arrow-back' },
    forward: { ios: 'chevron-forward', android: 'arrow-forward' },

    // === Tab Bar Icons ===
    home: { ios: 'home-outline', android: 'home-outline' },
    'home-filled': { ios: 'home', android: 'home' },
    cart: { ios: 'cart-outline', android: 'cart-outline' },
    'cart-filled': { ios: 'cart', android: 'cart' },
    bag: { ios: 'bag-outline', android: 'bag-outline' },
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
    copy: { ios: 'copy-outline', android: 'copy-outline' },
    headset: { ios: 'headset-outline', android: 'headset-outline' },
    'verified-user': { ios: 'shield-checkmark-outline', android: 'shield-checkmark-outline' },
    'checkmark-done': { ios: 'checkmark-done', android: 'checkmark-done' },
    'checkmark-done-outline': { ios: 'checkmark-done-outline', android: 'checkmark-done-outline' },

    // === E-commerce Icons ===
    favorite: { ios: 'heart', android: 'heart' },
    'favorite-outline': { ios: 'heart-outline', android: 'heart-outline' },
    star: { ios: 'star', android: 'star' },
    'star-filled': { ios: 'star', android: 'star' },
    'star-outline': { ios: 'star-outline', android: 'star-outline' },
    'star-fill': { ios: 'star', android: 'star' },
    shipping: { ios: 'car-outline', android: 'car-outline' },
    'truck-fast': { ios: 'car-sport', android: 'car-sport' },
    'truck-step': { ios: 'car-sport-outline', android: 'car-sport-outline' },
    receipt: { ios: 'receipt-outline', android: 'receipt-outline' },
    store: { ios: 'storefront-outline', android: 'storefront-outline' },
    ticket: { ios: 'ticket-outline', android: 'ticket-outline' },
    gift: { ios: 'gift-outline', android: 'gift-outline' },
    tag: { ios: 'pricetag-outline', android: 'pricetag-outline' },
    note: { ios: 'document-text-outline', android: 'document-text-outline' },
    'note-filled': { ios: 'document-text', android: 'document-text' },
    card: { ios: 'card-outline', android: 'card-outline' },
    wallet: { ios: 'wallet-outline', android: 'wallet-outline' },
    cash: { ios: 'cash-outline', android: 'cash-outline' },

    // === UI & Utility Icons ===
    'chevron-right': { ios: 'chevron-forward', android: 'chevron-forward' },
    'chevron-left': { ios: 'chevron-back', android: 'chevron-back' },
    'chevron-up': { ios: 'chevron-up', android: 'chevron-up' },
    'chevron-down': { ios: 'chevron-down', android: 'chevron-down' },
    'arrow-back': { ios: 'chevron-back', android: 'arrow-back' },
    'arrow-forward': { ios: 'arrow-forward', android: 'arrow-forward' },
    login: { ios: 'log-in-outline', android: 'log-in-outline' },
    lock: { ios: 'lock-closed-outline', android: 'lock-closed-outline' },
    key: { ios: 'key-outline', android: 'key-outline' },
    mail: { ios: 'mail-outline', android: 'mail-outline' },
    phone: { ios: 'call-outline', android: 'call-outline' },
    info: { ios: 'information-circle-outline', android: 'information-circle-outline' },
    flash: { ios: 'flash-outline', android: 'flash-outline' },
    smartphone: { ios: 'phone-portrait-outline', android: 'phone-portrait-outline' },
    shirt: { ios: 'shirt-outline', android: 'shirt-outline' },
    globe: { ios: 'globe-outline', android: 'globe-outline' },
    flame: { ios: 'flame-outline', android: 'flame-outline' },
    shield: { ios: 'shield-outline', android: 'shield-outline' },
    bank: { ios: 'card-outline', android: 'card-outline' },
    percent: { ios: 'pricetag-outline', android: 'pricetag-outline' },
    radio: { ios: 'radio-button-on', android: 'radio-button-on' },
    'radio-off': { ios: 'radio-button-off', android: 'radio-button-off' },
    checkbox: { ios: 'checkbox', android: 'checkbox' },
    'checkbox-outline': { ios: 'checkbox-outline', android: 'checkbox-outline' },
    chat: { ios: 'chatbubble-outline', android: 'chatbubble-outline' },
    'chat-filled': { ios: 'chatbubble', android: 'chatbubble' },
    'chat-dots': { ios: 'chatbubble-ellipses-outline', android: 'chatbubble-ellipses-outline' },
    happy: { ios: 'happy-outline', android: 'happy-outline' },
    visibility: { ios: 'eye-outline', android: 'eye-outline' },
    'visibility-off': { ios: 'eye-off-outline', android: 'eye-off-outline' },

    // === Aliases for Legacy/Material Compatibility ===
    bolt: { ios: 'flash-outline', android: 'flash-outline' },
    'local-shipping': { ios: 'car-outline', android: 'car-outline' },
    'confirmation-number': { ios: 'ticket-outline', android: 'ticket-outline' },
    checkroom: { ios: 'shirt-outline', android: 'shirt-outline' },
    'local-grocery-store': { ios: 'cart-outline', android: 'cart-outline' },
    'monetization-on': { ios: 'cash-outline', android: 'cash-outline' },
    public: { ios: 'globe-outline', android: 'globe-outline' },
    'chat-bubble': { ios: 'chatbubble-outline', android: 'chatbubble-outline' },
    'chat-bubble-outline': { ios: 'chatbubble-outline', android: 'chatbubble-outline' },
    'favorite-border': { ios: 'heart-outline', android: 'heart-outline' },
    'star-border': { ios: 'star-outline', android: 'star-outline' },
    'error-outline': { ios: 'close-circle-outline', android: 'close-circle-outline' },
    'info-outline': { ios: 'information-circle-outline', android: 'information-circle-outline' },
    'lock-reset': { ios: 'key-outline', android: 'key-outline' },
    'alert-circle-outline': { ios: 'alert-circle-outline', android: 'alert-circle-outline' },
    history: { ios: 'time-outline', android: 'time-outline' },
    'receipt-long': { ios: 'receipt-outline', android: 'receipt-outline' },
    'shopping-bag': { ios: 'bag-handle-outline', android: 'bag-handle-outline' },
    'attach-file': { ios: 'attach-outline', android: 'attach-outline' },
    'push-pin': { ios: 'pin-outline', android: 'pin-outline' },
    'done-all': { ios: 'checkmark-done-outline', android: 'checkmark-done-outline' },
    schedule: { ios: 'time-outline', android: 'time-outline' },
    'local-fire-department': { ios: 'flame', android: 'flame' },
    'local-mall': { ios: 'bag-outline', android: 'bag-outline' },
    'smart-toy': { ios: 'construct-outline', android: 'construct-outline' },
    campaign: { ios: 'megaphone-outline', android: 'megaphone-outline' },
    storefront: { ios: 'storefront-outline', android: 'storefront-outline' },
    'rate-review': { ios: 'chatbubble-ellipses-outline', android: 'chatbubble-ellipses-outline' },
    'shopping-cart': { ios: 'cart-outline', android: 'cart-outline' },
    'credit-card': { ios: 'card-outline', android: 'card-outline' },
    badge: { ios: 'person-circle-outline', android: 'person-circle-outline' },
    fingerprint: { ios: 'finger-print', android: 'finger-print' },
    link: { ios: 'link', android: 'link' },
    language: { ios: 'language', android: 'language' },
    'delete-sweep': { ios: 'trash-outline', android: 'trash-outline' },
    policy: { ios: 'shield-checkmark-outline', android: 'shield-checkmark-outline' },
    description: { ios: 'document-text-outline', android: 'document-text-outline' },
    'delete-forever': { ios: 'trash-bin-outline', android: 'trash-bin-outline' },

    // === Status & Error Icons ===
    'check-circle': { ios: 'checkmark-circle', android: 'checkmark-circle' },
    'checkmark-circle-outline': { ios: 'checkmark-circle-outline', android: 'checkmark-circle-outline' },
    error: { ios: 'close-circle', android: 'close-circle' },
    'close-circle': { ios: 'close-circle-outline', android: 'close-circle-outline' },
    warning: { ios: 'warning', android: 'warning' },
    'alert-circle': { ios: 'alert-circle-outline', android: 'alert-circle-outline' },

    // === Extended Functional Icons ===
    tune: { ios: 'options-outline', android: 'options-outline' },
    pin: { ios: 'pin-outline', android: 'pin-outline' },
    delete: { ios: 'trash-outline', android: 'trash-outline' },
    time: { ios: 'time-outline', android: 'time-outline' },
    calendar: { ios: 'calendar-outline', android: 'calendar-outline' },
    attach: { ios: 'attach-outline', android: 'attach-outline' },
    image: { ios: 'image-outline', android: 'image-outline' },
    camera: { ios: 'camera-outline', android: 'camera-outline' },
    settings: { ios: 'settings-outline', android: 'settings-outline' },
    megaphone: { ios: 'megaphone-outline', android: 'megaphone-outline' },
    airplane: { ios: 'airplane-outline', android: 'airplane-outline' },
    video: { ios: 'videocam-outline', android: 'videocam-outline' },
    cube: { ios: 'cube-outline', android: 'cube-outline' },
    play: { ios: 'play', android: 'play' },
    'play-fill': { ios: 'play', android: 'play' },
    'play-circle': { ios: 'play-circle', android: 'play-circle' },
    location: { ios: 'location-sharp', android: 'location-sharp' },
    'location-outline': { ios: 'location-outline', android: 'location-outline' },
    sparkles: { ios: 'sparkles-outline', android: 'sparkles-outline' },
    edit: { ios: 'create-outline', android: 'create-outline' },
    gender: { ios: 'male-female-outline', android: 'male-female-outline' },
    transgender: { ios: 'transgender-outline', android: 'transgender-outline' },
    'location-on': { ios: 'location-outline', android: 'location-outline' },
    'content-copy': { ios: 'copy-outline', android: 'copy-outline' },
    'account-balance-wallet': { ios: 'wallet-outline', android: 'wallet-outline' },
    'flight-takeoff': { ios: 'airplane-outline', android: 'airplane-outline' },
    'flight-land': { ios: 'airplane-outline', android: 'airplane-outline' },
    'keyboard-arrow-down': { ios: 'chevron-down-outline', android: 'chevron-down-outline' },
    'keyboard-arrow-right': { ios: 'chevron-forward-outline', android: 'chevron-forward-outline' },
    'account-balance': { ios: 'business-outline', android: 'business-outline' },
    'edit-square': { ios: 'create-outline', android: 'create-outline' },
    'home-pin': { ios: 'home-outline', android: 'home-outline' },
    work: { ios: 'briefcase-outline', android: 'briefcase-outline' },
    'work-outline': { ios: 'briefcase-outline', android: 'briefcase-outline' },
    'auto-awesome': { ios: 'sparkles-outline', android: 'sparkles-outline' },
    'sentiment-satisfied': { ios: 'happy-outline', android: 'happy-outline' },
    'photo-camera': { ios: 'camera-outline', android: 'camera-outline' },
    'camera-alt': { ios: 'camera-outline', android: 'camera-outline' },
    'calendar-month': { ios: 'calendar-outline', android: 'calendar-outline' },
    'calendar-today': { ios: 'calendar-outline', android: 'calendar-outline' },
    'arrow-left': { ios: 'chevron-back', android: 'arrow-back' },
    'headset-mic': { ios: 'headset-outline', android: 'headset-outline' },
    'notifications-none': { ios: 'notifications-outline', android: 'notifications-outline' },
    'more-vert': { ios: 'ellipsis-vertical', android: 'ellipsis-vertical' },
    'more-horiz': { ios: 'ellipsis-horizontal', android: 'ellipsis-horizontal' },
    'add-circle': { ios: 'add-circle', android: 'add-circle' },
    'verified': { ios: 'checkmark-circle', android: 'checkmark-circle' },

    // === Wishlist Icons ===
    explore: { ios: 'compass-outline', android: 'compass-outline' },
    celebration: { ios: 'sparkles', android: 'sparkles' },
    fire: { ios: 'flame', android: 'flame' },
    'add-circle-outline': { ios: 'add-circle-outline', android: 'add-circle-outline' },
    bookmark: { ios: 'bookmark', android: 'bookmark' },
    'bookmark-outline': { ios: 'bookmark-outline', android: 'bookmark-outline' },
    trophy: { ios: 'trophy', android: 'trophy' },
    flag: { ios: 'flag-outline', android: 'flag-outline' },
    collections: { ios: 'albums-outline', android: 'albums-outline' },

    // === SF Symbols Aliases (for cross-platform compatibility) ===
    shippingbox: { ios: 'cube', android: 'cube' },
    'star.fill': { ios: 'star', android: 'star' },
    'chevron.right': { ios: 'chevron-forward', android: 'chevron-forward' },
    'chevron.left': { ios: 'chevron-back', android: 'chevron-back' },
    coin: { ios: 'cash-outline', android: 'cash-outline' },
    'checkmark.circle': { ios: 'checkmark-circle', android: 'checkmark-circle' },
    'arrow.clockwise': { ios: 'refresh', android: 'refresh' },
    'speaker.wave.2.fill': { ios: 'volume-high', android: 'volume-high' },
    'speaker.slash.fill': { ios: 'volume-mute', android: 'volume-mute' },
    'heart.fill': { ios: 'heart', android: 'heart' },
    'play.fill': { ios: 'play', android: 'play' },
    'exclamationmark.triangle.fill': { ios: 'warning', android: 'warning' },
    'cart.badge.minus': { ios: 'cart-outline', android: 'cart-outline' },

    // === Error State Icons (for StateView/DataGuard) ===
    wifi: { ios: 'wifi', android: 'wifi' },
    'wifi-off': { ios: 'cloud-offline-outline', android: 'cloud-offline-outline' },
    'wifi-exclamationmark': { ios: 'alert-circle-outline', android: 'alert-circle-outline' },
    'cloud-offline-outline': { ios: 'cloud-offline-outline', android: 'cloud-offline-outline' },
    'folder-open-outline': { ios: 'folder-open-outline', android: 'folder-open-outline' },
    refresh: { ios: 'refresh', android: 'refresh' },
    reload: { ios: 'refresh', android: 'refresh' },
    undo: { ios: 'arrow-undo-outline', android: 'arrow-undo-outline' },
    // === Material Icons Compatibility (Add missing ones) ===
    'workspace-premium': { ios: 'ribbon-outline', android: 'ribbon-outline' },
    autorenew: { ios: 'sync-outline', android: 'sync-outline' },
    security: { ios: 'shield-checkmark-outline', android: 'shield-checkmark-outline' },
    'support-agent': { ios: 'headset-outline', android: 'headset-outline' },
    'price-check': { ios: 'checkmark-circle-outline', android: 'checkmark-circle-outline' },
    speed: { ios: 'speedometer-outline', android: 'speedometer-outline' },
    straighten: { ios: 'resize-outline', android: 'resize-outline' },
    payments: { ios: 'cash-outline', android: 'cash-outline' },
    'checkmark-circle-fill': { ios: 'checkmark-circle', android: 'checkmark-circle' },
    'camera-fill': { ios: 'camera', android: 'camera' },
    'videocam-fill': { ios: 'videocam', android: 'videocam' },
    circle: { ios: 'ellipse-outline', android: 'ellipse-outline' },

    // === Legal & Compliance Icons ===
    gavel: { ios: 'hammer-outline', android: 'hammer-outline' },
    article: { ios: 'newspaper-outline', android: 'newspaper-outline' },
    'settings-backup-restore': { ios: 'arrow-undo-outline', android: 'arrow-undo-outline' },
    ban: { ios: 'ban-outline', android: 'ban-outline' },
    build: { ios: 'construct-outline', android: 'construct-outline' },
    'verified-shield': { ios: 'shield-checkmark-outline', android: 'shield-checkmark-outline' },
};

interface IconSymbolProps {
    name: IconSymbolName;
    size?: number;
    color?: string;
    style?: StyleProp<TextStyle>;
    animatedStyle?: StyleProp<TextStyle>;
}

/**
 * IconSymbol Component
 */
export const IconSymbol = ({ name, size = 24, color = '#000', style, animatedStyle }: IconSymbolProps) => {
    const mappedIcon = ICON_MAP[name as string];

    let iconName: keyof typeof Ionicons.glyphMap;

    if (mappedIcon) {
        // Icon có mapping -> chọn theo platform
        iconName = Platform.OS === 'ios' ? mappedIcon.ios : mappedIcon.android;
    } else {
        // Không có trong map -> dùng trực tiếp (phải là valid Ionicons name)
        iconName = name as keyof typeof Ionicons.glyphMap;
    }

    if (animatedStyle) {
        return <AnimatedIonicons name={iconName} size={size} color={color} style={[style, animatedStyle]} />;
    }

    return <Ionicons name={iconName} size={size} color={color} style={style} />;
};

// Legacy export for backward compatibility
export const Icon = IconSymbol;
