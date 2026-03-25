import { z } from 'zod';
import { ResponseDefaultSchema } from '../responseSchema';

// ============================================
// ENUMS - API Values
// ============================================

/**
 * Conversation type enum from API
 * Buyer app only shows: BUYER_TO_SHOP, BUYER_TO_PLATFORM
 */
export const ConversationType = {
    BUYER_TO_SHOP: 'BUYER_TO_SHOP',
    BUYER_TO_PLATFORM: 'BUYER_TO_PLATFORM',
    SHOP_TO_PLATFORM: 'SHOP_TO_PLATFORM',
    GROUP: 'GROUP',
    BUYER_TO_BUYER: 'BUYER_TO_BUYER',
    SYSTEM: 'SYSTEM',
    USER_TO_USER: 'USER_TO_USER',
} as const;

export type ConversationType = (typeof ConversationType)[keyof typeof ConversationType];

/**
 * Conversation status enum from API
 */
export const ConversationStatus = {
    ACTIVE: 'ACTIVE',
    WAITING_FOR_STAFF: 'WAITING_FOR_STAFF',
    ARCHIVED: 'ARCHIVED',
    BLOCKED: 'BLOCKED',
    DELETED: 'DELETED',
    SUSPENDED: 'SUSPENDED',
} as const;

export type ConversationStatus = (typeof ConversationStatus)[keyof typeof ConversationStatus];

/**
 * Participant role enum from API
 */
export const ParticipantRole = {
    ADMIN: 'ADMIN',
    MEMBER: 'MEMBER',
} as const;

export type ParticipantRole = (typeof ParticipantRole)[keyof typeof ParticipantRole];

// ============================================
// DTO INTERFACES - Raw API Response Types
// ============================================

/**
 * User info nested in participant
 */
export interface UserDTO {
    userId: string;
    username: string;
    image?: string | null;
    fullNameBuyer?: string | null;
    shopId?: string | null;
    shopName?: string | null;
    logoUrl?: string | null;
}

/**
 * Participant in a conversation
 */
export interface ParticipantDTO {
    id: string;
    user: UserDTO;
    unreadCount: number;
    isMuted: boolean;
    isPinned: boolean;
    isOnline?: boolean | null;
}

/**
 * Single conversation from API
 */
export interface ConversationDTO {
    id: string;
    conversationType: ConversationType;
    name: string;
    avatarUrl?: string | null;
    status: ConversationStatus;
    lastMessageId?: string | null;
    lastMessageAt?: string | null;
    lastMessagePreview?: string | null;
    unreadCount?: number | null;
    isMuted?: boolean | null;
    isPinned?: boolean | null;
    participants: ParticipantDTO[];
    createdBy: string;
    lastModifiedBy: string;
    lastModifiedDate: string;
}

/**
 * Paginated response data
 */
export interface ConversationPageDTO {
    content: ConversationDTO[];
    page: number;
    totalElements: number;
    hasNext: boolean;
}

/**
 * Full API response wrapper
 */
export interface ConversationListResponse {
    code: number;
    success: boolean;
    message: string;
    data: ConversationPageDTO;
}

// ============================================
// ZOD SCHEMAS - Response Validation
// ============================================

const UserDTOSchema = z.object({
    userId: z.string(),
    username: z.string(),
    image: z.string().nullable().optional(),
    fullNameBuyer: z.string().nullable().optional(),
    shopId: z.string().nullable().optional(),
    shopName: z.string().nullable().optional(),
    logoUrl: z.string().nullable().optional(),
});

const ParticipantDTOSchema = z.object({
    id: z.string(),
    user: UserDTOSchema,
    unreadCount: z.number(),
    isMuted: z.boolean(),
    isPinned: z.boolean(),
    isOnline: z.boolean().nullable().optional(),
});

const ConversationDTOSchema = z.object({
    id: z.string(),
    conversationType: z.enum([
        'BUYER_TO_SHOP',
        'BUYER_TO_PLATFORM',
        'SHOP_TO_PLATFORM',
        'GROUP',
        'BUYER_TO_BUYER',
        'SYSTEM',
        'USER_TO_USER',
    ]),
    name: z.string(),
    avatarUrl: z.string().nullable().optional(),
    status: z.enum(['ACTIVE', 'WAITING_FOR_STAFF', 'ARCHIVED', 'BLOCKED', 'DELETED', 'SUSPENDED']),
    lastMessageId: z.string().nullable().optional(),
    lastMessageAt: z.string().nullable().optional(),
    lastMessagePreview: z.string().nullable().optional(),
    unreadCount: z.number().nullable().optional(),
    isMuted: z.boolean().nullable().optional(),
    isPinned: z.boolean().nullable().optional(),
    participants: z.array(ParticipantDTOSchema),
    createdBy: z.string().optional().default('system'),
    lastModifiedBy: z.string().optional().default('system'),
    lastModifiedDate: z.string().optional().default(''),
});

const ConversationPageDTOSchema = z.object({
    content: z.array(ConversationDTOSchema),
    page: z.number(),
    totalElements: z.number(),
    hasNext: z.boolean(),
});

/**
 * Schema to validate full API response
 */
export const ConversationListResponseSchema = ResponseDefaultSchema.extend({
    code: z.number(),
    success: z.boolean(),
    message: z.string(),
    data: ConversationPageDTOSchema,
});

/**
 * Query params for GET /api/v1/chat/conversations
 */
export interface ConversationListParams {
    page?: number;
    size?: number;
    sort?: string[];
    conversationType?: ConversationType;
    status?: ConversationStatus;
}

/**
 * Request params for PIN/MUTE conversation
 */
export interface ConversationActionParams {
    isPinned?: boolean;
    isMuted?: boolean;
}

/**
 * Response for single conversation actions (PIN, MUTE, etc.)
 */
export interface ConversationActionResponse {
    code: number;
    success: boolean;
    message: string;
    data: ConversationDTO;
}

/**
 * Schema for single conversation action response
 */
export const ConversationActionResponseSchema = ResponseDefaultSchema.extend({
    code: z.number(),
    success: z.boolean(),
    message: z.string(),
    data: ConversationDTOSchema,
});

// ============================================
// CREATE CONVERSATION TYPES
// ============================================

/**
 * Request body for POST /api/v1/chat/conversations
 * Create new conversation or get existing one
 */
export interface CreateConversationRequest {
    conversationType: ConversationType;
    participantIds: string[];
    name: string;
    avatarUrl?: string | null;
}

/**
 * Response for create conversation
 */
export interface CreateConversationResponse {
    code: number;
    success: boolean;
    message: string;
    data: ConversationDTO;
}

/**
 * Schema for create conversation response
 */
export const CreateConversationResponseSchema = ResponseDefaultSchema.extend({
    code: z.number(),
    success: z.boolean(),
    message: z.string(),
    data: ConversationDTOSchema,
});

/**
 * Schema for unread message count badge.
 * Used by buyer app tab/header badge and API contract tests.
 */
export const UnreadMessageCountResponseSchema = ResponseDefaultSchema.extend({
    data: z.number(),
});

export type UnreadMessageCountResponse = z.infer<typeof UnreadMessageCountResponseSchema>;

