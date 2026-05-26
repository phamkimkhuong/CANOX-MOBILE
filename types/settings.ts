import type { Href } from 'expo-router';

// ============================================
// SETTINGS ITEM TYPES
// ============================================

/**
 * Settings item variant types
 * - link: Navigation với chevron (Hồ sơ, Ngôn ngữ)
 * - toggle: Switch on/off (FaceID, Dark Mode)
 * - info: Hiển thị text bên phải (Cache size, Version)
 * - action: Button với màu đặc biệt (Logout, Delete account)
 */
export type SettingsItemType = 'link' | 'toggle' | 'info' | 'action';

/**
 * Action style for action type items
 */
export type ActionStyle = 'default' | 'danger' | 'primary';

/**
 * Base settings item interface
 */
export interface BaseSettingsItem {
    id: string;
    label: string;
    icon: string;
    /** Conditional visibility function */
    visible?: () => boolean;
}

/**
 * Link type settings item - navigates to a route
 * Uses string type for flexibility with dynamic routes
 */
export interface LinkSettingsItem extends BaseSettingsItem {
    type: 'link';
    route: Href | string;
    subtitle?: string;
}

/**
 * Toggle type settings item - switch on/off
 */
export interface ToggleSettingsItem extends BaseSettingsItem {
    type: 'toggle';
    /** Key in app store for persisting toggle state */
    storeKey: string;
    /** Optional async check before toggle */
    onToggleCheck?: () => Promise<boolean>;
}

/**
 * Info type settings item - displays read-only information
 */
export interface InfoSettingsItem extends BaseSettingsItem {
    type: 'info';
    /** Value to display (can be dynamic) */
    value?: string;
    valueKey?: 'cacheSize' | 'appVersion';
    onPress?: () => void;
}

/**
 * Action type settings item - button with special styling
 */
export interface ActionSettingsItem extends BaseSettingsItem {
    type: 'action';
    actionStyle: ActionStyle;
    onPress?: () => void;
}

/**
 * Union type for all settings items
 */
export type SettingsItem =
    | LinkSettingsItem
    | ToggleSettingsItem
    | InfoSettingsItem
    | ActionSettingsItem;

/**
 * Settings section grouping
 */
export interface SettingsSection {
    id: string;
    title: string;
    items: SettingsItem[];
}

/**
 * Social link item for connected accounts
 */
export interface SocialLinkConfig {
    id: string;
    provider: 'google' | 'facebook' | 'apple';
    label: string;
    connected: boolean;
}

// CACHE TYPES

export interface CacheInfo {
    size: number;
    lastCalculated: Date | null;
}

// SETTINGS STATE

export interface SettingsState {
    darkModeEnabled: boolean;
    notificationsEnabled: boolean;
    language: 'vi' | 'en';
}
