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
 * Participant in a conversation
 */
export interface ParticipantDTO {
    id: string;
    user: UserDTO;
    role: ParticipantRole;
    nickname?: string | null;
    unreadCount: number;
    isMuted: boolean;
    isPinned: boolean;
    isArchived: boolean;
    isActive: boolean;
    lastReadAt?: string | null;
    joinedAt: string;
    leftAt?: string | null;
    addedByUserId?: string | null;
    isOnline?: boolean | null;
    presenceStatus?: string | null;
    lastSeen?: string | null;
    createdBy: string;
    createdDate: string;
    lastModifiedBy: string;
    lastModifiedDate: string;
    deleted: boolean;
    version: number;
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
    totalMessages: number;
    unreadCount?: number | null;
    isMuted?: boolean | null;
    isPinned?: boolean | null;
    isArchived?: boolean | null;
    participants: ParticipantDTO[];
    metadata?: string | null;
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
export interface ConversationPageDTO {
    content: ConversationDTO[];
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
    email: z.string(),
    image: z.string().nullable().optional(),
    roles: z.array(z.string()),
    fullNameBuyer: z.string().nullable().optional(),
    fullNameEmployee: z.string().nullable().optional(),
    shopId: z.string().nullable().optional(),
    shopName: z.string().nullable().optional(),
    logoUrl: z.string().nullable().optional(),
});

const ParticipantDTOSchema = z.object({
    id: z.string(),
    user: UserDTOSchema,
    role: z.string(),
    nickname: z.string().nullable().optional(),
    unreadCount: z.number(),
    isMuted: z.boolean(),
    isPinned: z.boolean(),
    isArchived: z.boolean(),
    isActive: z.boolean(),
    lastReadAt: z.string().nullable().optional(),
    joinedAt: z.string(),
    leftAt: z.string().nullable().optional(),
    addedByUserId: z.string().nullable().optional(),
    isOnline: z.boolean().nullable().optional(),
    presenceStatus: z.string().nullable().optional(),
    lastSeen: z.string().nullable().optional(),
    createdBy: z.string(),
    createdDate: z.string(),
    lastModifiedBy: z.string(),
    lastModifiedDate: z.string(),
    deleted: z.boolean(),
    version: z.number(),
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
    totalMessages: z.number(),
    unreadCount: z.number().nullable().optional(),
    isMuted: z.boolean().nullable().optional(),
    isPinned: z.boolean().nullable().optional(),
    isArchived: z.boolean().nullable().optional(),
    participants: z.array(ParticipantDTOSchema),
    metadata: z.string().nullable().optional(),
    createdBy: z.string(),
    createdDate: z.string(),
    lastModifiedBy: z.string(),
    lastModifiedDate: z.string(),
    deleted: z.boolean(),
    version: z.number(),
});

const ConversationPageDTOSchema = z.object({
    content: z.array(ConversationDTOSchema),
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
 * Schema to validate full API response
 */
export const ConversationListResponseSchema = ResponseDefaultSchema.extend({
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
    message: z.string(),
    data: ConversationDTOSchema,
});

