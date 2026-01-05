/**
 * Chat Message Types
 * Types for chat messages in detail view.
 *
 * @see conversationDTO.ts - API DTO types for conversations
 * @see utils/chat/messageHelpers.ts - Helper functions
 */

import { z } from 'zod';
import { ResponseDefaultSchema } from '../responseSchema';

// ============================================
// ENUMS - API Values
// ============================================

/**
 * Message type enum from API
 */
export const MessageType = {
    TEXT: 'TEXT',
    IMAGE: 'IMAGE',
    VIDEO: 'VIDEO',
    FILE: 'FILE',
    AUDIO: 'AUDIO',
    STICKER: 'STICKER',
    PRODUCT_CARD: 'PRODUCT_CARD',
    ORDER_CARD: 'ORDER_CARD',
    VOUCHER_CARD: 'VOUCHER_CARD',
    LOCATION: 'LOCATION',
    SYSTEM: 'SYSTEM',
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

/**
 * Message status enum from API
 */
export const MessageStatus = {
    PENDING: 'PENDING',
    SENT: 'SENT',
    DELIVERED: 'DELIVERED',
    READ: 'READ',
    FAILED: 'FAILED',
} as const;

export type MessageStatus = (typeof MessageStatus)[keyof typeof MessageStatus];

// ============================================
// DTO INTERFACES - Raw API Response Types
// ============================================

/**
 * User info in message
 */
export interface MessageUserDTO {
    userId: string;
    username: string;
    email: string;
    image?: string | null;
    roles: string[];
    fullNameBuyer?: string | null;
    fullNameEmployee?: string | null;
    shopId?: string | null;
    shopName?: string | null;
    logoUrl?: string | null;
}

/**
 * Attachment in message
 */
export interface AttachmentDTO {
    id: string;
    type: 'IMAGE' | 'VIDEO' | 'FILE' | 'AUDIO';
    url: string;
    thumbnailUrl?: string | null;
    fileName?: string | null;
    fileSize?: number | null;
    mimeType?: string | null;
    width?: number | null;
    height?: number | null;
    duration?: number | null; // For audio/video
}

/**
 * Reaction on message
 */
export interface ReactionDTO {
    userId: string;
    emoji: string;
    createdAt: string;
}

/**
 * Reply to message (nested)
 */
export interface ReplyToMessageDTO {
    id: string;
    type: MessageType;
    content: string;
    user: MessageUserDTO;
}

/**
 * Single message from API
 * GET /api/v1/chat/messages/conversation/{conversationId}
 */
export interface MessageDTO {
    id: string;
    conversationId: string;
    user: MessageUserDTO;
    type: MessageType;
    content: string;
    status: MessageStatus;
    replyToMessageId?: string | null;
    replyToMessage?: ReplyToMessageDTO | null;
    attachments: AttachmentDTO[];
    reactions: ReactionDTO[];
    reactionsSummary?: Record<string, number> | null;
    metadata?: string | null;
    isDeleted?: boolean | null;
    deletedType?: string | null;
    deletedBy?: string | null;
    deletedAt?: string | null;
    isEdited: boolean;
    sentAt: string;
    deliveredAt?: string | null;
    readAt?: string | null;
    editedAt?: string | null;
    createdBy: string;
    createdDate: string;
    lastModifiedBy: string;
    lastModifiedDate: string;
    deleted: boolean;
    version: number;
}

/**
 * Paginated response data
 */
export interface MessagePageDTO {
    content: MessageDTO[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    previousPage: number;
    nextPage: number;
    empty: boolean;
    first: boolean;
    last: boolean;
}

/**
 * Full API response wrapper
 */
export interface MessageListResponse {
    code: number;
    success: boolean;
    message: string;
    data: MessagePageDTO;
}

// ============================================
// UI TYPES - For Components
// ============================================

/**
 * Message sender - UI representation
 */
export interface MessageSender {
    userId: string;
    username: string;
    displayName: string;
    avatar?: string;
    isShop: boolean;
    shopId?: string;
    shopName?: string;
    shopLogo?: string;
}

/**
 * Attachment - UI representation
 */
export interface MessageAttachment {
    id: string;
    type: 'IMAGE' | 'VIDEO' | 'FILE' | 'AUDIO';
    url: string;
    thumbnail?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    dimensions?: { width: number; height: number };
    duration?: number;
}

/**
 * Message - UI representation for rendering
 */
export interface Message {
    id: string;
    conversationId: string;
    type: MessageType;
    content: string;
    sender: MessageSender;
    status: MessageStatus;
    sentAt: string;
    isEdited: boolean;
    isDeleted: boolean;
    // Attachments
    attachments: MessageAttachment[];
    // Reply
    replyTo?: {
        id: string;
        type: MessageType;
        content: string;
        senderName: string;
    };
    // Reactions
    reactions: {
        emoji: string;
        count: number;
        hasReacted: boolean;
    }[];
}

/**
 * Message group by date for UI rendering
 */
export interface MessageDateGroup {
    date: string; // ISO date string (YYYY-MM-DD)
    label: string; // "Hôm nay", "Hôm qua", "20/10/2025"
    messages: Message[];
}

// ============================================
// ZOD SCHEMAS - Response Validation
// ============================================

const MessageUserDTOSchema = z.object({
    userId: z.string(),
    username: z.string(),
    email: z.string(),
    image: z.string().nullable().optional(),
    roles: z.array(z.string()),
    fullNameBuyer: z.string().nullable().optional(),
    fullNameEmployee: z.string().nullable().optional(),
    shopId: z.string().nullable().optional(),
    shopName: z.string().nullable().optional(),
    logoUrl: z.string().nullable().optional(),
});

const AttachmentDTOSchema = z.object({
    id: z.string(),
    type: z.enum(['IMAGE', 'VIDEO', 'FILE', 'AUDIO']),
    url: z.string(),
    thumbnailUrl: z.string().nullable().optional(),
    fileName: z.string().nullable().optional(),
    fileSize: z.number().nullable().optional(),
    mimeType: z.string().nullable().optional(),
    width: z.number().nullable().optional(),
    height: z.number().nullable().optional(),
    duration: z.number().nullable().optional(),
});

const ReactionDTOSchema = z.object({
    userId: z.string(),
    emoji: z.string(),
    createdAt: z.string(),
});

const ReplyToMessageDTOSchema = z.object({
    id: z.string(),
    type: z.enum([
        'TEXT', 'IMAGE', 'VIDEO', 'FILE', 'AUDIO', 'STICKER',
        'PRODUCT_CARD', 'ORDER_CARD', 'VOUCHER_CARD', 'LOCATION', 'SYSTEM',
    ]),
    content: z.string(),
    user: MessageUserDTOSchema,
});

const MessageDTOSchema = z.object({
    id: z.string(),
    conversationId: z.string(),
    user: MessageUserDTOSchema,
    type: z.enum([
        'TEXT', 'IMAGE', 'VIDEO', 'FILE', 'AUDIO', 'STICKER',
        'PRODUCT_CARD', 'ORDER_CARD', 'VOUCHER_CARD', 'LOCATION', 'SYSTEM',
    ]),
    content: z.string(),
    status: z.enum(['PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED']),
    replyToMessageId: z.string().nullable().optional(),
    replyToMessage: ReplyToMessageDTOSchema.nullable().optional(),
    attachments: z.array(AttachmentDTOSchema),
    reactions: z.array(ReactionDTOSchema),
    reactionsSummary: z.record(z.string(), z.number()).nullable().optional(),
    metadata: z.string().nullable().optional(),
    isDeleted: z.boolean().nullable().optional(),
    deletedType: z.string().nullable().optional(),
    deletedBy: z.string().nullable().optional(),
    deletedAt: z.string().nullable().optional(),
    isEdited: z.boolean(),
    sentAt: z.string(),
    deliveredAt: z.string().nullable().optional(),
    readAt: z.string().nullable().optional(),
    editedAt: z.string().nullable().optional(),
    createdBy: z.string(),
    createdDate: z.string(),
    lastModifiedBy: z.string(),
    lastModifiedDate: z.string(),
    deleted: z.boolean(),
    version: z.number(),
});

const MessagePageDTOSchema = z.object({
    content: z.array(MessageDTOSchema),
    page: z.number(),
    size: z.number(),
    totalElements: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrevious: z.boolean(),
    previousPage: z.number(),
    nextPage: z.number(),
    empty: z.boolean(),
    first: z.boolean(),
    last: z.boolean(),
});

/**
 * Schema to validate full API response for message list
 * Extends ResponseDefaultSchema with MessagePageDTO data
 */
export const MessageListResponseSchema = ResponseDefaultSchema.extend({
    message: z.string(),
    data: MessagePageDTOSchema,
});

// ============================================
// MESSAGE STATUS CONFIG - For UI
// ============================================

export interface MessageStatusConfig {
    icon: string;
    color: 'primary' | 'secondary' | 'error' | 'success';
    label: string;
}

export const MESSAGE_STATUS_CONFIG: Record<MessageStatus, MessageStatusConfig> = {
    PENDING: { icon: 'schedule', color: 'secondary', label: 'Đang gửi' },
    SENT: { icon: 'check', color: 'secondary', label: 'Đã gửi' },
    DELIVERED: { icon: 'done-all', color: 'secondary', label: 'Đã nhận' },
    READ: { icon: 'done-all', color: 'primary', label: 'Đã xem' },
    FAILED: { icon: 'error-outline', color: 'error', label: 'Gửi thất bại' },
};

// ============================================
// SEND MESSAGE TYPES
/**
 * Attachment request payload for sending message
 * Different from AttachmentDTO (response)
 */
export interface AttachmentRequest {
    fileUrl: string;
    fileName: string;
    fileSize?: number;
    mimeType?: string;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
    duration?: number; // For audio/video
}

/**
 * Payload for sending a new message
 * POST /api/v1/chat/messages
 */
export interface SendMessagePayload {
    conversationId: string;
    type: MessageType;
    content: string;
    replyToMessageId?: string;
    metadata?: string;
    clientMessageId?: string; // For idempotency / tracking
    attachments?: AttachmentRequest[];
}

/**
 * Response for send message
 */
export interface SendMessageResponse {
    code: number;
    success: boolean;
    message: string;
    data: MessageDTO;
}

/**
 * Schema for send message response
 * Extends ResponseDefaultSchema with MessageDTO data
 */
export const SendMessageResponseSchema = ResponseDefaultSchema.extend({
    message: z.string(),
    data: MessageDTOSchema,
});

// ============================================
// MARK AS READ TYPES
// ============================================

/**
 * Payload for marking messages as read
 * POST /api/v1/chat/messages/conversation/{conversationId}/read
 */
export interface MarkAsReadPayload {
    messageIds?: string[];
    lastReadMessageId?: string;
}

/**
 * Response for mark as read
 */
export interface MarkAsReadResponse {
    code: number;
    success: boolean;
    message?: string;
    data?: Record<string, unknown> | null;
}

/**
 * Schema for mark as read response
 * Extends ResponseDefaultSchema - data can be null/undefined/empty object
 */
export const MarkAsReadResponseSchema = ResponseDefaultSchema.extend({
    message: z.string().optional(),
    data: z.object({}).nullable().optional(),
});
