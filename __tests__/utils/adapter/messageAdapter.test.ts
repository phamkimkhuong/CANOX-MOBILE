/**
 * Message Adapter Unit Tests
 *
 * Tests: transformMessageUser, transformAttachment, transformMessage,
 *        isMyMessage, isSameUser, getMessagePreview, getBubblePosition,
 *        shouldShowAvatar, shouldShowTime, groupMessagesByDate
 */

import type { Message, MessageDTO } from '@/types/chat/message';
import {
    getBubblePosition,
    getMessagePreview,
    isMyMessage,
    isSameUser,
    shouldShowAvatar,
    shouldShowTime,
    transformAttachment,
    transformMessage,
    transformMessageList,
    transformMessageUser,
} from '@/utils/adapter/chat/messageAdapter';

// ============================================
// Fixtures
// ============================================

const createMessageDTO = (overrides: Partial<MessageDTO> = {}): MessageDTO => ({
    id: 'msg-1',
    conversationId: 'conv-1',
    type: 'TEXT',
    content: 'Hello World',
    user: {
        userId: 'user-1',
        username: 'john',
        fullNameBuyer: 'John Doe',
        shopName: null,
        shopId: null,
        image: 'https://example.com/avatar.jpg',
        logoUrl: null,
        roles: ['BUYER'],
    },
    status: 'SENT',
    sentAt: '2026-04-20T10:00:00Z',
    isEdited: false,
    isDeleted: false,
    deletedType: null,
    attachments: [],
    metadata: null,
    replyToMessage: null,
    reactionsSummary: null,
    reactions: [],
    ...overrides,
});

const createMessage = (overrides: Partial<Message> = {}): Message => ({
    id: 'msg-1',
    conversationId: 'conv-1',
    type: 'TEXT',
    content: 'Hello',
    sender: {
        userId: 'user-1',
        username: 'john',
        displayName: 'John Doe',
        isShop: false,
    },
    status: 'SENT',
    sentAt: '2026-04-20T10:00:00Z',
    isEdited: false,
    isDeleted: false,
    attachments: [],
    reactions: [],
    ...overrides,
});

// ============================================
// transformMessageUser
// ============================================

describe('transformMessageUser', () => {
    it('maps buyer user', () => {
        const result = transformMessageUser({
            userId: 'u1',
            username: 'tester',
            fullNameBuyer: 'Test User',
            shopName: null,
            shopId: null,
            image: 'https://avatar.jpg',
            logoUrl: null,
            roles: ['BUYER'],
        });

        expect(result.userId).toBe('u1');
        expect(result.displayName).toBe('Test User');
        expect(result.isShop).toBe(false);
        expect(result.shopId).toBeUndefined();
    });

    it('maps shop user', () => {
        const result = transformMessageUser({
            userId: 'shop-1',
            username: 'shopuser',
            fullNameBuyer: null,
            shopName: 'My Shop',
            shopId: 'shop-1',
            image: null,
            logoUrl: 'https://logo.jpg',
            roles: ['SHOP'],
        });

        expect(result.isShop).toBe(true);
        expect(result.displayName).toBe('My Shop');
        expect(result.shopId).toBe('shop-1');
    });

    it('returns fallback for null user', () => {
        const result = transformMessageUser(null as unknown as MessageDTO['user']);

        expect(result.userId).toBe('unknown');
        expect(result.displayName).toBe('Người dùng');
        expect(result.isShop).toBe(false);
    });

    it('falls back through name priority chain', () => {
        const result = transformMessageUser({
            userId: 'u1',
            username: 'lastresort',
            fullNameBuyer: null,
            shopName: null,
            shopId: null,
            image: null,
            logoUrl: null,
            roles: [],
        });

        expect(result.displayName).toBe('lastresort');
    });
});

// ============================================
// transformAttachment
// ============================================

describe('transformAttachment', () => {
    it('maps image attachment', () => {
        const result = transformAttachment({
            id: 'att-1',
            type: 'IMAGE',
            fileUrl: 'https://cdn.example.com/img.jpg',
            url: null,
            thumbnailUrl: 'https://cdn.example.com/thumb.jpg',
            fileName: null,
            fileSize: null,
            mimeType: 'image/jpeg',
            width: 800,
            height: 600,
            duration: null,
        });

        expect(result.id).toBe('att-1');
        expect(result.type).toBe('IMAGE');
        expect(result.dimensions).toEqual({ width: 800, height: 600 });
    });

    it('maps file attachment with fileName and size', () => {
        const result = transformAttachment({
            id: 'att-2',
            type: 'FILE',
            fileUrl: 'https://cdn.example.com/doc.pdf',
            url: null,
            thumbnailUrl: null,
            fileName: 'document.pdf',
            fileSize: 1024,
            mimeType: 'application/pdf',
            width: null,
            height: null,
            duration: null,
        });

        expect(result.fileName).toBe('document.pdf');
        expect(result.fileSize).toBe(1024);
    });

    it('falls back to message type when attachment type is missing', () => {
        const result = transformAttachment({
            id: 'att-3',
            type: undefined as unknown as string,
            fileUrl: 'https://cdn.example.com/vid.mp4',
            url: null,
            thumbnailUrl: null,
            fileName: null,
            fileSize: null,
            mimeType: null,
            width: null,
            height: null,
            duration: 30,
        }, 'VIDEO');

        expect(result.type).toBe('VIDEO');
        expect(result.duration).toBe(30);
    });
});

// ============================================
// transformMessage
// ============================================

describe('transformMessage', () => {
    it('transforms basic message', () => {
        const result = transformMessage(createMessageDTO(), 'me');

        expect(result.id).toBe('msg-1');
        expect(result.type).toBe('TEXT');
        expect(result.content).toBe('Hello World');
        expect(result.sender.userId).toBe('user-1');
    });

    it('marks recalled message as deleted', () => {
        const result = transformMessage(createMessageDTO({
            deletedType: 'DELETE_FOR_EVERYONE',
        }), 'me');

        expect(result.isDeleted).toBe(true);
    });

    it('maps reply-to message', () => {
        const result = transformMessage(createMessageDTO({
            replyToMessage: {
                id: 'reply-msg',
                type: 'TEXT',
                content: 'Original message',
                user: {
                    userId: 'u2',
                    username: 'alice',
                    fullNameBuyer: 'Alice',
                    shopName: null,
                    shopId: null,
                    image: null,
                    logoUrl: null,
                    roles: ['BUYER'],
                },
            },
        }), 'me');

        expect(result.replyTo).toBeDefined();
        expect(result.replyTo!.content).toBe('Original message');
        expect(result.replyTo!.senderName).toBe('Alice');
    });

    it('maps reactions with user vote state', () => {
        const result = transformMessage(createMessageDTO({
            reactionsSummary: { '👍': 3, '❤️': 1 },
            reactions: [
                { emoji: '👍', userId: 'me', createdAt: '2026-04-20T10:00:00Z' },
                { emoji: '👍', userId: 'other', createdAt: '2026-04-20T10:01:00Z' },
            ],
        }), 'me');

        expect(result.reactions).toHaveLength(2);
        const thumbs = result.reactions.find(r => r.emoji === '👍');
        expect(thumbs?.hasReacted).toBe(true);
        expect(thumbs?.count).toBe(3);
    });
});

describe('transformMessageList', () => {
    it('transforms array of DTOs', () => {
        const dtos = [
            createMessageDTO({ id: 'msg-1' }),
            createMessageDTO({ id: 'msg-2' }),
        ];

        const result = transformMessageList(dtos, 'me');
        expect(result).toHaveLength(2);
    });
});

// ============================================
// isMyMessage
// ============================================

describe('isMyMessage', () => {
    it('returns true when sender matches', () => {
        expect(isMyMessage(createMessage({ sender: { userId: 'me', username: 'me', displayName: 'Me', isShop: false } }), 'me')).toBe(true);
    });

    it('returns false when sender differs', () => {
        expect(isMyMessage(createMessage(), 'me')).toBe(false);
    });
});

// ============================================
// isSameUser
// ============================================

describe('isSameUser', () => {
    it('returns true for same sender', () => {
        const msg1 = createMessage();
        const msg2 = createMessage();
        expect(isSameUser(msg1, msg2)).toBe(true);
    });

    it('returns false for different senders', () => {
        const msg1 = createMessage();
        const msg2 = createMessage({ sender: { userId: 'other', username: 'x', displayName: 'X', isShop: false } });
        expect(isSameUser(msg1, msg2)).toBe(false);
    });

    it('returns false when either is undefined', () => {
        expect(isSameUser(undefined, createMessage())).toBe(false);
        expect(isSameUser(createMessage(), undefined)).toBe(false);
    });
});

// ============================================
// getMessagePreview
// ============================================

describe('getMessagePreview', () => {
    it('returns content for TEXT', () => {
        expect(getMessagePreview(createMessage({ type: 'TEXT', content: 'Hello' }))).toBe('Hello');
    });

    it('returns emoji prefix for IMAGE', () => {
        expect(getMessagePreview(createMessage({ type: 'IMAGE' }))).toBe('📷 Hình ảnh');
    });

    it('returns emoji prefix for VIDEO', () => {
        expect(getMessagePreview(createMessage({ type: 'VIDEO' }))).toBe('🎬 Video');
    });

    it('returns emoji prefix for FILE', () => {
        expect(getMessagePreview(createMessage({ type: 'FILE' }))).toBe('📎 Tệp đính kèm');
    });

    it('returns emoji prefix for AUDIO', () => {
        expect(getMessagePreview(createMessage({ type: 'AUDIO' }))).toBe('🎵 Tin nhắn thoại');
    });

    it('returns emoji prefix for STICKER', () => {
        expect(getMessagePreview(createMessage({ type: 'STICKER' }))).toBe('😀 Sticker');
    });

    it('returns emoji prefix for PRODUCT_CARD', () => {
        expect(getMessagePreview(createMessage({ type: 'PRODUCT_CARD' }))).toBe('🛒 Sản phẩm');
    });

    it('returns emoji prefix for ORDER_CARD', () => {
        expect(getMessagePreview(createMessage({ type: 'ORDER_CARD' }))).toBe('📦 Đơn hàng');
    });

    it('returns emoji prefix for VOUCHER_CARD', () => {
        expect(getMessagePreview(createMessage({ type: 'VOUCHER_CARD' }))).toBe('🎫 Voucher');
    });

    it('returns emoji prefix for LOCATION', () => {
        expect(getMessagePreview(createMessage({ type: 'LOCATION' }))).toBe('📍 Vị trí');
    });

    it('returns content for SYSTEM', () => {
        expect(getMessagePreview(createMessage({ type: 'SYSTEM', content: 'System msg' }))).toBe('System msg');
    });
});

// ============================================
// getBubblePosition
// ============================================

describe('getBubblePosition', () => {
    const now = '2026-04-20T10:00:00Z';
    const soonAfter = '2026-04-20T10:02:00Z'; // Within threshold

    it('returns "single" for isolated message', () => {
        const messages = [
            createMessage({ id: 'a', sender: { userId: 'u1', username: 'u1', displayName: 'U1', isShop: false }, sentAt: now }),
        ];

        expect(getBubblePosition(messages, 0, 'me')).toBe('single');
    });

    it('returns "first" for first of consecutive group', () => {
        const messages = [
            createMessage({ id: 'a', sender: { userId: 'u1', username: 'u1', displayName: 'U1', isShop: false }, sentAt: now }),
            createMessage({ id: 'b', sender: { userId: 'u1', username: 'u1', displayName: 'U1', isShop: false }, sentAt: soonAfter }),
        ];

        expect(getBubblePosition(messages, 0, 'me')).toBe('first');
    });

    it('returns "last" for last of consecutive group', () => {
        const messages = [
            createMessage({ id: 'a', sender: { userId: 'u1', username: 'u1', displayName: 'U1', isShop: false }, sentAt: now }),
            createMessage({ id: 'b', sender: { userId: 'u1', username: 'u1', displayName: 'U1', isShop: false }, sentAt: soonAfter }),
        ];

        expect(getBubblePosition(messages, 1, 'me')).toBe('last');
    });
});

// ============================================
// shouldShowAvatar
// ============================================

describe('shouldShowAvatar', () => {
    it('returns false for own messages', () => {
        const messages = [
            createMessage({ sender: { userId: 'me', username: 'me', displayName: 'Me', isShop: false }, sentAt: '2026-04-20T10:00:00Z' }),
        ];

        expect(shouldShowAvatar(messages, 0, 'me')).toBe(false);
    });

    it('returns true for single message from other user', () => {
        const messages = [
            createMessage({ sender: { userId: 'other', username: 'o', displayName: 'Other', isShop: false }, sentAt: '2026-04-20T10:00:00Z' }),
        ];

        expect(shouldShowAvatar(messages, 0, 'me')).toBe(true);
    });
});

// ============================================
// shouldShowTime
// ============================================

describe('shouldShowTime', () => {
    it('returns true for single message', () => {
        const messages = [
            createMessage({ sentAt: '2026-04-20T10:00:00Z' }),
        ];

        expect(shouldShowTime(messages, 0, 'me')).toBe(true);
    });
});
