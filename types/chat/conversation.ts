/**
 * Chat UI Types
 * Types used by components for rendering conversations.
 * These are the OUTPUT of the adapter transformation.
 *
 * @see conversationDTO.ts - API DTO types (input)
 * @see utils/adapter/conversationAdapter.ts - DTO → UI transform
 */

import { MessageType } from "./message";

/**
 * Chat filter types for UI tabs
 */
export const ChatFilter = {
    ALL: 'ALL',
    UNREAD: 'UNREAD',
    SHOP: 'SHOP',
    SUPPORT: 'SUPPORT',
} as const;

export type ChatFilter = (typeof ChatFilter)[keyof typeof ChatFilter];

/**
 * Partner type for UI display
 */
export type PartnerType = 'SHOP' | 'SYSTEM' | 'AI' | 'PROMO';

/**
 * Conversation partner - UI representation
 */
export interface ConversationPartner {
    id: string;
    name: string;
    avatar?: string;
    isOnline: boolean;
    isVerified?: boolean;
    responseRate?: number;
    type: PartnerType;
}

/**
 * Last message in conversation - UI representation
 */
export interface LastMessage {
    id: string;
    content: string;
    type: MessageType;
    senderId: string;
    createdAt: string;
    isRead: boolean;
}

/**
 * Conversation - UI representation for rendering
 */
export interface Conversation {
    id: string;
    partner: ConversationPartner;
    lastMessage: LastMessage;
    unreadCount: number;
    isPinned?: boolean;
    isMuted?: boolean;
    /** Conversation type from API - used for client-side filtering */
    conversationType: 'BUYER_TO_SHOP' | 'BUYER_TO_PLATFORM';
}

/**
 * Filter tab configuration for ChatHeader
 */
export interface ChatFilterTab {
    key: ChatFilter;
    label: string;
}

export const CHAT_FILTER_TABS: ChatFilterTab[] = [
    { key: ChatFilter.ALL, label: 'Tất cả' },
    { key: ChatFilter.UNREAD, label: 'Chưa đọc' },
    { key: ChatFilter.SHOP, label: 'Từ Shop' },
    { key: ChatFilter.SUPPORT, label: 'Hỗ trợ' },
];

/**
 * Partner type icon/color configuration for ConversationItem
 */
export interface PartnerTypeConfig {
    icon: string;
    backgroundColor: string;
    iconColor: string;
}

export const PARTNER_TYPE_CONFIG: Record<PartnerType, PartnerTypeConfig> = {
    SHOP: {
        icon: 'store',
        backgroundColor: '#dbeafe',
        iconColor: '#2563eb',
    },
    SYSTEM: {
        icon: 'bag',
        backgroundColor: '#ffedd5',
        iconColor: '#ea580c',
    },
    AI: {
        icon: 'smart-toy',
        backgroundColor: '#dbeafe',
        iconColor: '#2563eb',
    },
    PROMO: {
        icon: 'megaphone',
        backgroundColor: '#fce7f3',
        iconColor: '#db2777',
    },
};

/**
 * Swipe action types for ConversationItem
 */
export type SwipeAction = 'delete' | 'mute' | 'pin';
