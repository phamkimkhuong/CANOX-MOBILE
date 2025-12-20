import { z } from 'zod';

/**
 * Message type enum - định nghĩa loại tin nhắn
 */
export const MessageType = {
    TEXT: 'TEXT',
    IMAGE: 'IMAGE',
    PRODUCT: 'PRODUCT',
    ORDER: 'ORDER',
    FILE: 'FILE',
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

/**
 * Chat filter types
 */
export const ChatFilter = {
    ALL: 'ALL',
    UNREAD: 'UNREAD',
    SHOP: 'SHOP',
    SUPPORT: 'SUPPORT',
} as const;

export type ChatFilter = (typeof ChatFilter)[keyof typeof ChatFilter];

/**
 * Conversation partner (Shop/System)
 */
export const ConversationPartnerSchema = z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().optional(),
    isOnline: z.boolean(),
    isVerified: z.boolean().optional(),
    responseRate: z.number().min(0).max(100).optional(), // Tỷ lệ phản hồi (%)
    type: z.enum(['SHOP', 'SYSTEM', 'AI', 'PROMO']).default('SHOP'),
});

export type ConversationPartner = z.infer<typeof ConversationPartnerSchema>;

/**
 * Last message in conversation
 */
export const LastMessageSchema = z.object({
    id: z.string(),
    content: z.string(),
    type: z.enum(['TEXT', 'IMAGE', 'PRODUCT', 'ORDER', 'FILE']),
    senderId: z.string(),
    createdAt: z.string(),
    isRead: z.boolean(),
});

export type LastMessage = z.infer<typeof LastMessageSchema>;

/**
 * Conversation (Hội thoại)
 */
export const ConversationSchema = z.object({
    id: z.string(),
    partner: ConversationPartnerSchema,
    lastMessage: LastMessageSchema,
    unreadCount: z.number(),
    isPinned: z.boolean().optional(),
    isMuted: z.boolean().optional(),
});

export type Conversation = z.infer<typeof ConversationSchema>;

/**
 * Paginated response
 */
export const ConversationPageSchema = z.object({
    data: z.array(ConversationSchema),
    nextCursor: z.string().nullable(),
    hasMore: z.boolean(),
});

export type ConversationPage = z.infer<typeof ConversationPageSchema>;

/**
 * Filter tab configuration
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
 * Partner type icon/color configuration
 */
export interface PartnerTypeConfig {
    icon: string;
    backgroundColor: string;
    iconColor: string;
}

export const PARTNER_TYPE_CONFIG: Record<ConversationPartner['type'], PartnerTypeConfig> = {
    SHOP: {
        icon: 'storefront',
        backgroundColor: '#dbeafe', // blue-100
        iconColor: '#2563eb', // blue-600
    },
    SYSTEM: {
        icon: 'local-mall',
        backgroundColor: '#ffedd5', // orange-100
        iconColor: '#ea580c', // orange-600
    },
    AI: {
        icon: 'smart-toy',
        backgroundColor: '#dbeafe', // blue-100
        iconColor: '#2563eb', // blue-600
    },
    PROMO: {
        icon: 'campaign',
        backgroundColor: '#fce7f3', // pink-100
        iconColor: '#db2777', // pink-600
    },
};

/**
 * Swipe action types
 */
export type SwipeAction = 'delete' | 'mute' | 'pin';
