/**
 * Conversation Adapter Unit Tests
 *
 * Tests: findPartnerParticipant, findCurrentUserParticipant, resolveAvatarUrl,
 *        isPartnerOnline, toConversationPartner, toLastMessage, toConversationUI,
 *        toConversationListUI
 */

import type { ConversationDTO, ParticipantDTO } from '@/types/chat/conversationDTO';
import {
    findCurrentUserParticipant,
    findPartnerParticipant,
    isPartnerOnline,
    resolveAvatarUrl,
    toConversationListUI,
    toConversationPartner,
    toConversationUI,
    toLastMessage,
} from '@/utils/adapter/chat/conversationAdapter';

// ============================================
// Fixtures
// ============================================

const createParticipant = (overrides: Partial<ParticipantDTO> = {}): ParticipantDTO => ({
    id: 'p-1',
    user: {
        userId: 'user-1',
        username: 'john',
        fullNameBuyer: 'John Doe',
        shopName: null,
        shopId: null,
        image: 'https://example.com/avatar.jpg',
        logoUrl: null,
    },
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    isOnline: true,
    ...overrides,
});

const createConversationDTO = (overrides: Partial<ConversationDTO> = {}): ConversationDTO => ({
    id: 'conv-1',
    name: '',
    avatarUrl: null,
    conversationType: 'BUYER_TO_SHOP',
    status: 'ACTIVE',
    participants: [
        createParticipant({ user: { userId: 'me', username: 'me', fullNameBuyer: 'Me', shopName: null, shopId: null, image: null, logoUrl: null } }),
        createParticipant({
            user: { userId: 'shop-1', username: 'shop', fullNameBuyer: null, shopName: 'Cool Shop', shopId: 'shop-1', image: null, logoUrl: 'https://cdn.example.com/logo.jpg' },
            isOnline: true,
        }),
    ],
    unreadCount: null,
    isPinned: null,
    isMuted: null,
    lastMessagePreview: 'Hello!',
    lastMessageId: 'msg-1',
    lastMessageAt: '2026-04-20T10:00:00Z',
    lastModifiedBy: 'me',
    lastModifiedDate: '2026-04-20T10:00:00Z',
    createdBy: 'shop-1',
    ...overrides,
});

const CURRENT_USER_ID = 'me';

// ============================================
// findPartnerParticipant
// ============================================

describe('findPartnerParticipant', () => {
    it('finds partner (not current user)', () => {
        const dto = createConversationDTO();
        const partner = findPartnerParticipant(dto.participants, CURRENT_USER_ID);

        expect(partner).not.toBeNull();
        expect(partner!.user.userId).toBe('shop-1');
    });

    it('returns null when only current user in participants', () => {
        const dto = createConversationDTO({
            participants: [createParticipant({ user: { userId: 'me', username: 'me', fullNameBuyer: 'Me', shopName: null, shopId: null, image: null, logoUrl: null } })],
        });

        expect(findPartnerParticipant(dto.participants, CURRENT_USER_ID)).toBeNull();
    });
});

// ============================================
// findCurrentUserParticipant
// ============================================

describe('findCurrentUserParticipant', () => {
    it('finds current user participant', () => {
        const dto = createConversationDTO();
        const me = findCurrentUserParticipant(dto.participants, CURRENT_USER_ID);

        expect(me).not.toBeNull();
        expect(me!.user.userId).toBe('me');
    });

    it('returns null for empty participants', () => {
        expect(findCurrentUserParticipant([], 'me')).toBeNull();
    });

    it('returns null for empty userId', () => {
        const dto = createConversationDTO();
        expect(findCurrentUserParticipant(dto.participants, '')).toBeNull();
    });
});

// ============================================
// resolveAvatarUrl
// ============================================

describe('resolveAvatarUrl', () => {
    it('prioritizes conversation-level avatarUrl', () => {
        const dto = createConversationDTO({ avatarUrl: 'https://conversation-avatar.jpg' });
        const partner = createParticipant({ user: { ...createParticipant().user, logoUrl: 'https://logo.jpg' } });

        expect(resolveAvatarUrl(dto, partner)).toBe('https://conversation-avatar.jpg');
    });

    it('falls back to partner logoUrl', () => {
        const dto = createConversationDTO({ avatarUrl: null });
        const partner = createParticipant({
            user: { ...createParticipant().user, logoUrl: 'https://logo.jpg', image: null },
        });

        expect(resolveAvatarUrl(dto, partner)).toBe('https://logo.jpg');
    });

    it('falls back to partner image', () => {
        const dto = createConversationDTO({ avatarUrl: null });
        const partner = createParticipant({
            user: { ...createParticipant().user, logoUrl: null, image: 'https://avatar.jpg' },
        });

        expect(resolveAvatarUrl(dto, partner)).toBe('https://avatar.jpg');
    });

    it('returns undefined when no avatar available', () => {
        const dto = createConversationDTO({ avatarUrl: null });
        const partner = createParticipant({
            user: { ...createParticipant().user, logoUrl: null, image: null },
        });

        expect(resolveAvatarUrl(dto, partner)).toBeUndefined();
    });

    it('returns undefined when partner is null', () => {
        const dto = createConversationDTO({ avatarUrl: null });
        expect(resolveAvatarUrl(dto, null)).toBeUndefined();
    });
});

// ============================================
// isPartnerOnline
// ============================================

describe('isPartnerOnline', () => {
    it('returns true when partner is online', () => {
        expect(isPartnerOnline(createParticipant({ isOnline: true }))).toBe(true);
    });

    it('returns false when partner is offline', () => {
        expect(isPartnerOnline(createParticipant({ isOnline: false }))).toBe(false);
    });

    it('returns false for null partner', () => {
        expect(isPartnerOnline(null)).toBe(false);
    });
});

// ============================================
// toConversationPartner
// ============================================

describe('toConversationPartner', () => {
    it('maps partner type from conversationType', () => {
        const dto = createConversationDTO({ conversationType: 'BUYER_TO_SHOP' });
        const partner = findPartnerParticipant(dto.participants, CURRENT_USER_ID);
        const result = toConversationPartner(dto, partner);

        expect(result.type).toBe('SHOP');
    });

    it('maps SYSTEM type for platform conversations', () => {
        const dto = createConversationDTO({ conversationType: 'BUYER_TO_PLATFORM' });
        const partner = findPartnerParticipant(dto.participants, CURRENT_USER_ID);
        const result = toConversationPartner(dto, partner);

        expect(result.type).toBe('SYSTEM');
    });

    it('uses conversation name when available', () => {
        const dto = createConversationDTO({ name: 'Custom Name' });
        const partner = findPartnerParticipant(dto.participants, CURRENT_USER_ID);
        const result = toConversationPartner(dto, partner);

        expect(result.name).toBe('Custom Name');
    });

    it('falls back to shopName when no conversation name', () => {
        const dto = createConversationDTO({ name: '' });
        const partner = findPartnerParticipant(dto.participants, CURRENT_USER_ID);
        const result = toConversationPartner(dto, partner);

        expect(result.name).toBe('Cool Shop');
    });
});

// ============================================
// toLastMessage
// ============================================

describe('toLastMessage', () => {
    it('maps preview content', () => {
        const dto = createConversationDTO({ lastMessagePreview: 'Hello!' });
        const result = toLastMessage(dto, CURRENT_USER_ID);

        expect(result.content).toBe('Hello!');
        expect(result.type).toBe('TEXT');
    });

    it('detects message from current user', () => {
        const dto = createConversationDTO({ lastModifiedBy: 'me' });
        const result = toLastMessage(dto, CURRENT_USER_ID);

        expect(result.senderId).toBe('me');
    });

    it('detects message from other user', () => {
        const dto = createConversationDTO({ lastModifiedBy: 'shop-1', createdBy: 'shop-1' });
        const result = toLastMessage(dto, CURRENT_USER_ID);

        expect(result.senderId).toBe('shop-1');
    });

    it('handles null preview', () => {
        const dto = createConversationDTO({ lastMessagePreview: null });
        const result = toLastMessage(dto, CURRENT_USER_ID);

        expect(result.content).toBe('');
    });
});

// ============================================
// toConversationUI (main entry point)
// ============================================

describe('toConversationUI', () => {
    it('transforms full DTO to UI model', () => {
        const dto = createConversationDTO();
        const result = toConversationUI(dto, CURRENT_USER_ID);

        expect(result.id).toBe('conv-1');
        expect(result.partner.name).toBe('Cool Shop');
        expect(result.lastMessage.content).toBe('Hello!');
        expect(result.conversationType).toBe('BUYER_TO_SHOP');
    });

    it('reads unreadCount from current user participant', () => {
        const dto = createConversationDTO();
        // Set unread on current user's participant
        dto.participants[0].unreadCount = 5;

        const result = toConversationUI(dto, CURRENT_USER_ID);
        expect(result.unreadCount).toBe(5);
        expect(result.lastMessage.isRead).toBe(false);
    });

    it('marks lastMessage as read when unreadCount is 0', () => {
        const dto = createConversationDTO();
        dto.participants[0].unreadCount = 0;

        const result = toConversationUI(dto, CURRENT_USER_ID);
        expect(result.lastMessage.isRead).toBe(true);
    });

    it('reads isPinned/isMuted from participant', () => {
        const dto = createConversationDTO();
        dto.participants[0].isPinned = true;
        dto.participants[0].isMuted = true;

        const result = toConversationUI(dto, CURRENT_USER_ID);
        expect(result.isPinned).toBe(true);
        expect(result.isMuted).toBe(true);
    });

    it('extracts shopId from partner', () => {
        const result = toConversationUI(createConversationDTO(), CURRENT_USER_ID);
        expect(result.shopId).toBe('shop-1');
    });
});

// ============================================
// toConversationListUI (filter + transform)
// ============================================

describe('toConversationListUI', () => {
    it('filters to only allowed types', () => {
        const dtos = [
            createConversationDTO({ id: 'buyer-shop', conversationType: 'BUYER_TO_SHOP', status: 'ACTIVE' }),
            createConversationDTO({ id: 'buyer-platform', conversationType: 'BUYER_TO_PLATFORM', status: 'ACTIVE' }),
            createConversationDTO({ id: 'group', conversationType: 'GROUP', status: 'ACTIVE' }),
            createConversationDTO({ id: 'system', conversationType: 'SYSTEM', status: 'ACTIVE' }),
        ];

        const result = toConversationListUI(dtos, CURRENT_USER_ID);

        expect(result).toHaveLength(2);
        expect(result.map(c => c.id)).toContain('buyer-shop');
        expect(result.map(c => c.id)).toContain('buyer-platform');
    });

    it('filters out non-ACTIVE conversations', () => {
        const dtos = [
            createConversationDTO({ id: 'active', status: 'ACTIVE' }),
            createConversationDTO({ id: 'deleted', status: 'DELETED' }),
        ];

        const result = toConversationListUI(dtos, CURRENT_USER_ID);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('active');
    });

    it('handles empty input', () => {
        expect(toConversationListUI([], CURRENT_USER_ID)).toEqual([]);
    });
});
