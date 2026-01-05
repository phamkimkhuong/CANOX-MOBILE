/**
 * Conversation Adapter
 *
 * Transform Conversation API response (DTO) to UI types.
 * Handles partner extraction, avatar resolution, and user settings.
 *
 * @see types/chat/conversationDTO.ts - API DTO types
 * @see types/chat.ts - UI types
 */

import type { Conversation, ConversationPartner, LastMessage } from '@/types/chat';
import type {
    ConversationDTO,
    ConversationType,
    ParticipantDTO,
} from '@/types/chat/conversationDTO';

const DEFAULT_AVATAR = 'https://via.placeholder.com/48';

/**
 * Map conversationType to UI partner type
 * This determines icon/color in ConversationItem
 */
const CONVERSATION_TYPE_TO_PARTNER_TYPE: Record<ConversationType, ConversationPartner['type']> = {
    BUYER_TO_SHOP: 'SHOP',
    BUYER_TO_PLATFORM: 'SYSTEM',
    SHOP_TO_PLATFORM: 'SYSTEM',
    GROUP: 'SHOP',
    BUYER_TO_BUYER: 'SHOP',
    SYSTEM: 'SYSTEM',
    USER_TO_USER: 'SHOP',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Find the partner participant (not current user) from participants array.
 *
 * Logic:
 * - Filter out participant with userId matching currentUserId
 * - Return the first remaining participant as partner
 *
 * @param participants - Array of participants in conversation
 * @param currentUserId - Current logged-in user's ID
 * @returns Partner participant or null if not found
 */
export const findPartnerParticipant = (
    participants: ParticipantDTO[],
    currentUserId: string
): ParticipantDTO | null => {
    const partner = participants.find((p) => p.user.userId !== currentUserId);
    return partner ?? null;
};

/**
 * Find current user's participant data from participants array.
 * Used to get unreadCount, isMuted, isPinned for current user.
 *
 * @param participants - Array of participants in conversation
 * @param currentUserId - Current logged-in user's ID
 * @returns Current user's participant or null if not found
 */
export const findCurrentUserParticipant = (
    participants: ParticipantDTO[],
    currentUserId: string
): ParticipantDTO | null => {
    if (!participants || participants.length === 0 || !currentUserId) return null;
    const currentUser = participants.find((p) =>
        p.user.userId === currentUserId ||
        p.user.userId.toLowerCase() === currentUserId.toLowerCase()
    );
    return currentUser ?? null;
};

/**
 * Resolve avatar URL with priority:
 * 1. conversation.avatarUrl (if set)
 * 2. partner.user.logoUrl (if shop)
 * 3. partner.user.image (if user)
 * 4. DEFAULT_AVATAR
 *
 * @param dto - Conversation DTO
 * @param partner - Partner participant
 * @returns Resolved avatar URL
 */
export const resolveAvatarUrl = (
    dto: ConversationDTO,
    partner: ParticipantDTO | null
): string => {
    // Priority 1: Conversation-level avatar
    if (dto.avatarUrl) {
        return dto.avatarUrl;
    }

    if (!partner) {
        return DEFAULT_AVATAR;
    }

    // Priority 2: Shop logo (for BUYER_TO_SHOP)
    if (partner.user.logoUrl) {
        return partner.user.logoUrl;
    }

    // Priority 3: User avatar
    if (partner.user.image) {
        return partner.user.image;
    }

    return DEFAULT_AVATAR;
};

/**
 * Check if partner is online based on participant data.
 * Falls back to false if isOnline is null.
 *
 * @param partner - Partner participant
 * @returns Whether partner is online
 */
export const isPartnerOnline = (partner: ParticipantDTO | null): boolean => {
    return partner?.isOnline ?? false;
};

// ============================================
// MAIN TRANSFORM FUNCTIONS
// ============================================

/**
 * Transform partner participant to ConversationPartner UI type.
 *
 * @param dto - Conversation DTO
 * @param partner - Partner participant (extracted)
 * @returns ConversationPartner for UI
 */
export const toConversationPartner = (
    dto: ConversationDTO,
    partner: ParticipantDTO | null
): ConversationPartner => {
    const partnerType = CONVERSATION_TYPE_TO_PARTNER_TYPE[dto.conversationType];

    // Use conversation name or partner's display name
    const displayName = dto.name ||
        partner?.user.shopName ||
        partner?.user.fullNameBuyer ||
        partner?.user.username ||
        'Unknown';

    return {
        id: partner?.user.userId ?? dto.id,
        name: displayName,
        avatar: resolveAvatarUrl(dto, partner),
        isOnline: isPartnerOnline(partner),
        isVerified: false, // API doesn't provide this yet
        responseRate: undefined, // API doesn't provide this yet
        type: partnerType,
    };
};

/**
 * Transform conversation's last message info to LastMessage UI type.
 *
 * Note: API only provides lastMessagePreview (string), not message type.
 * MessageType logic is preserved but defaults to TEXT for now.
 * When BE updates to include message type, just update this function.
 *
 * @param dto - Conversation DTO
 * @param currentUserId - Current user's ID to determine if message is from self
 * @returns LastMessage for UI
 */
export const toLastMessage = (
    dto: ConversationDTO,
    currentUserId: string
): LastMessage => {
    // Determine sender - if lastModifiedBy matches currentUser, it's from us
    // This is a heuristic since API doesn't provide senderId directly
    const isFromCurrentUser = dto.lastModifiedBy === currentUserId;

    return {
        id: dto.lastMessageId ?? dto.id,
        content: dto.lastMessagePreview ?? '',
        type: 'TEXT', // Default to TEXT until BE provides message type
        senderId: isFromCurrentUser ? currentUserId : (dto.createdBy ?? 'unknown'),
        createdAt: dto.lastMessageAt ?? dto.lastModifiedDate,
        isRead: true, // Will be determined by unreadCount
    };
};

/**
 * Transform ConversationDTO to Conversation UI type.
 * Main entry point for the adapter.
 *
 * @param dto - Conversation DTO from API
 * @param currentUserId - Current logged-in user's ID (from useAuthStore)
 * @returns Conversation for UI rendering
 */
export const toConversationUI = (
    dto: ConversationDTO,
    currentUserId: string
): Conversation => {
    // Extract partner and current user from participants
    const partner = findPartnerParticipant(dto.participants, currentUserId);
    const currentUserParticipant = findCurrentUserParticipant(dto.participants, currentUserId);

    // Get user-specific settings from their participant record
    // Rationale: API returns null for settings at root level, individual settings are stored per participant
    const unreadCount = currentUserParticipant?.unreadCount ?? dto.unreadCount ?? 0;
    const isPinned = currentUserParticipant?.isPinned ?? dto.isPinned ?? false;
    const isMuted = currentUserParticipant?.isMuted ?? dto.isMuted ?? false;
    // Build last message with read state
    const lastMessage = toLastMessage(dto, currentUserId);

    // Determine if last message is read (no unread = read)
    lastMessage.isRead = unreadCount === 0;

    return {
        id: dto.id,
        partner: toConversationPartner(dto, partner),
        lastMessage,
        unreadCount,
        isPinned,
        isMuted,
    };
};

/**
 * Transform array of ConversationDTO to array of Conversation UI types.
 * Filters out conversations that shouldn't be shown in buyer app.
 *
 * @param dtos - Array of ConversationDTO from API
 * @param currentUserId - Current logged-in user's ID
 * @returns Array of Conversation for UI rendering
 */
export const toConversationListUI = (
    dtos: ConversationDTO[],
    currentUserId: string
): Conversation[] => {
    // Filter to only show relevant conversation types for buyer app
    const allowedTypes: ConversationType[] = ['BUYER_TO_SHOP', 'BUYER_TO_PLATFORM'];

    return dtos
        .filter((dto) => allowedTypes.includes(dto.conversationType))
        .filter((dto) => dto.status === 'ACTIVE') // Only show active conversations
        .map((dto) => toConversationUI(dto, currentUserId));
};
