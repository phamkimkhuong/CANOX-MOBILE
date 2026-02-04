/**
 * Chat Message Adapter
 * Utility functions for processing chat messages.
 */

import {
    Message,
    MessageAttachment,
    MessageDateGroup,
    MessageDTO,
    MessageSender,
} from '@/types/chat/message';
import { formatBytes } from '@/utils/cache';
import {
    formatDateLabel,
    formatMessageTime,
    isWithinTimeThreshold,
} from '@/utils/date';
import { toPublicUrl } from '@/utils/url';

// ============================================
// TRANSFORM FUNCTIONS
// ============================================

/**
 * Transform MessageUserDTO to MessageSender (UI type)
 */
export const transformMessageUser = (user: MessageDTO['user']): MessageSender => {
    if (!user) {
        return {
            userId: 'unknown',
            username: 'unknown',
            displayName: 'Người dùng',
            isShop: false,
        };
    }

    const isShop = (user.roles?.includes('SHOP') ?? false) && !!user.shopId;

    return {
        userId: user.userId,
        username: user.username || 'unknown',
        displayName: user.fullNameBuyer || user.shopName || user.username || 'Người dùng',
        avatar: toPublicUrl(user.image),
        isShop,
        shopId: user.shopId || undefined,
        shopName: user.shopName || undefined,
        shopLogo: toPublicUrl(user.logoUrl),
    };
};

/**
 * Transform AttachmentDTO to MessageAttachment (UI type)
 */
export const transformAttachment = (
    attachment: MessageDTO['attachments'][0]
): MessageAttachment => ({
    id: attachment.id,
    type: (attachment.type as MessageAttachment['type']) || 'IMAGE',
    url: toPublicUrl(attachment.fileUrl || attachment.url) || '',
    thumbnail: toPublicUrl(attachment.thumbnailUrl),
    fileName: attachment.fileName || undefined,
    fileSize: attachment.fileSize || undefined,
    mimeType: attachment.mimeType || undefined,
    dimensions:
        attachment.width && attachment.height
            ? { width: attachment.width, height: attachment.height }
            : undefined,
    duration: attachment.duration || undefined,
});

/**
 * Transform MessageDTO to Message (UI type)
 */
export const transformMessage = (
    dto: MessageDTO,
    currentUserId: string
): Message => {
    const isRecalled = dto.deletedType === 'DELETE_FOR_EVERYONE';
    const isDeleted = isRecalled || dto.isDeleted === true;

    return {
        id: dto.id,
        conversationId: dto.conversationId,
        type: dto.type,
        content: dto.content,
        sender: transformMessageUser(dto.user),
        status: dto.status,
        sentAt: dto.sentAt,
        isEdited: dto.isEdited,
        isDeleted,
        attachments: dto.attachments.map(transformAttachment),
        metadata: dto.metadata || undefined,
        replyTo: dto.replyToMessage
            ? {
                id: dto.replyToMessage.id,
                type: dto.replyToMessage.type,
                content: dto.replyToMessage.content,
                senderName:
                    dto.replyToMessage.user?.fullNameBuyer ||
                    dto.replyToMessage.user?.username ||
                    'Người dùng',
            }
            : undefined,
        reactions: dto.reactionsSummary
            ? Object.entries(dto.reactionsSummary).map(([emoji, count]) => ({
                emoji,
                count,
                hasReacted: dto.reactions.some(
                    (r) => r.emoji === emoji && r.userId === currentUserId
                ),
            }))
            : [],
    };
};

/**
 * Transform list of MessageDTO to Message[]
 */
export const transformMessageList = (
    dtos: MessageDTO[],
    currentUserId: string
): Message[] => dtos.map((dto) => transformMessage(dto, currentUserId));

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if a message is from the current user
 */
export const isMyMessage = (message: Message, currentUserId: string): boolean => {
    return message.sender.userId === currentUserId;
};

/**
 * Check if two messages are from the same user
 */
export const isSameUser = (
    message1: Message | undefined,
    message2: Message | undefined
): boolean => {
    if (!message1 || !message2) return false;
    return message1.sender.userId === message2.sender.userId;
};

/**
 * Check if message is within time threshold of previous message (5 minutes)
 * Used to determine if we should show avatar/time for consecutive messages
 */
export { isWithinTimeThreshold };

/**
 * Get date key from ISO string (YYYY-MM-DD)
 */
export const getDateKey = (isoString: string): string => {
    return isoString.split('T')[0];
};

/**
 * Format date for display in separator
 * Returns: "Hôm nay", "Hôm qua", or "DD/MM/YYYY"
 */
export { formatDateLabel, formatMessageTime };

/**
 * Format time for message status with AM/PM
 */
export const formatMessageTimeAMPM = (isoString: string): string => {
    const date = new Date(isoString);
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    return `${hours}:${minutes} ${ampm}`;
};

// ============================================
// GROUPING FUNCTIONS
// ============================================

/**
 * Group messages by date for rendering with separators
 * Input: Messages sorted by sentAt DESC (newest first)
 * Output: Groups sorted by date DESC, messages within group sorted ASC
 */
export const groupMessagesByDate = (messages: Message[]): MessageDateGroup[] => {
    const groups: Map<string, Message[]> = new Map();

    // Group by date
    for (const message of messages) {
        const dateKey = getDateKey(message.sentAt);
        const existing = groups.get(dateKey) || [];
        existing.push(message);
        groups.set(dateKey, existing);
    }

    // Convert to array and sort
    const result: MessageDateGroup[] = [];

    // Sort date keys descending (newest first)
    const sortedDateKeys = Array.from(groups.keys()).sort((a, b) => b.localeCompare(a));

    for (const dateKey of sortedDateKeys) {
        const messages = groups.get(dateKey) || [];
        // Messages within group already in DESC order from API
        result.push({
            date: dateKey,
            label: formatDateLabel(dateKey),
            messages,
        });
    }

    return result;
};

// ============================================
// BUBBLE STYLING HELPERS
// ============================================

export type BubblePosition = 'single' | 'first' | 'middle' | 'last';

/**
 * Determine bubble position for styling (rounded corners)
 * Based on consecutive messages from same user
 */
export const getBubblePosition = (
    messages: Message[],
    index: number,
    _currentUserId: string
): BubblePosition => {
    const current = messages[index];
    const prev = messages[index - 1];
    const next = messages[index + 1];

    const sameSenderAsPrev =
        isSameUser(prev, current) && isWithinTimeThreshold(prev?.sentAt, current.sentAt);
    const sameSenderAsNext =
        isSameUser(current, next) && isWithinTimeThreshold(current.sentAt, next?.sentAt);

    if (!sameSenderAsPrev && !sameSenderAsNext) return 'single';
    if (!sameSenderAsPrev && sameSenderAsNext) return 'first';
    if (sameSenderAsPrev && sameSenderAsNext) return 'middle';
    return 'last';
};

/**
 * Determine if avatar should be shown for this message
 * Only show for last message in a consecutive group from other user
 */
export const shouldShowAvatar = (
    messages: Message[],
    index: number,
    currentUserId: string
): boolean => {
    const message = messages[index];
    if (isMyMessage(message, currentUserId)) return false;

    const position = getBubblePosition(messages, index, currentUserId);
    return position === 'single' || position === 'last';
};

/**
 * Determine if time should be shown for this message
 * Only show for last message in a consecutive group
 */
export const shouldShowTime = (
    messages: Message[],
    index: number,
    currentUserId: string
): boolean => {
    const position = getBubblePosition(messages, index, currentUserId);
    return position === 'single' || position === 'last';
};

// ============================================
// CONTENT HELPERS
// ============================================

/**
 * Get preview text for different message types
 */
export const getMessagePreview = (message: Message): string => {
    switch (message.type) {
        case 'TEXT':
            return message.content;
        case 'IMAGE':
            return '📷 Hình ảnh';
        case 'VIDEO':
            return '🎬 Video';
        case 'FILE':
            return '📎 Tệp đính kèm';
        case 'AUDIO':
            return '🎵 Tin nhắn thoại';
        case 'STICKER':
            return '😀 Sticker';
        case 'PRODUCT_CARD':
            return '🛒 Sản phẩm';
        case 'ORDER_CARD':
            return '📦 Đơn hàng';
        case 'VOUCHER_CARD':
            return '🎫 Voucher';
        case 'LOCATION':
            return '📍 Vị trí';
        case 'SYSTEM':
            return message.content;
        default:
            return message.content;
    }
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
    return formatBytes(bytes);
};
