import type { ReturnMediaItem, ReturnReasonCode, ReturnRequestDraft } from '@/types/order/return';
import { create } from 'zustand';

interface ReturnRequestDraftState {
    drafts: Record<string, ReturnRequestDraft>;
    setReasonCode: (orderId: string, reasonCode: ReturnReasonCode | null) => void;
    setBankAccountId: (orderId: string, bankAccountId: string | null) => void;
    setDescription: (orderId: string, description: string) => void;
    setMediaItems: (orderId: string, mediaItems: ReturnMediaItem[]) => void;
    appendMediaItems: (orderId: string, mediaItems: ReturnMediaItem[]) => void;
    updateMediaItem: (
        orderId: string,
        mediaId: string,
        patch: Partial<ReturnMediaItem>
    ) => void;
    removeMediaItem: (orderId: string, mediaId: string) => void;
    clearDraft: (orderId: string) => void;
}

const getOrCreateDraft = (
    drafts: Record<string, ReturnRequestDraft>,
    orderId: string
): ReturnRequestDraft => {
    return drafts[orderId] ?? {
        reasonCode: null,
        bankAccountId: null,
        description: '',
        mediaItems: [],
    };
};

export const useReturnRequestDraftStore = create<ReturnRequestDraftState>((set) => ({
    drafts: {},

    setReasonCode: (orderId, reasonCode) => set((state) => ({
        drafts: {
            ...state.drafts,
            [orderId]: {
                ...getOrCreateDraft(state.drafts, orderId),
                reasonCode,
            },
        },
    })),

    setBankAccountId: (orderId, bankAccountId) => set((state) => ({
        drafts: {
            ...state.drafts,
            [orderId]: {
                ...getOrCreateDraft(state.drafts, orderId),
                bankAccountId,
            },
        },
    })),

    setDescription: (orderId, description) => set((state) => ({
        drafts: {
            ...state.drafts,
            [orderId]: {
                ...getOrCreateDraft(state.drafts, orderId),
                description,
            },
        },
    })),

    setMediaItems: (orderId, mediaItems) => set((state) => ({
        drafts: {
            ...state.drafts,
            [orderId]: {
                ...getOrCreateDraft(state.drafts, orderId),
                mediaItems,
            },
        },
    })),

    appendMediaItems: (orderId, mediaItems) => set((state) => {
        const draft = getOrCreateDraft(state.drafts, orderId);
        return {
            drafts: {
                ...state.drafts,
                [orderId]: {
                    ...draft,
                    mediaItems: [...draft.mediaItems, ...mediaItems],
                },
            },
        };
    }),

    updateMediaItem: (orderId, mediaId, patch) => set((state) => {
        const draft = getOrCreateDraft(state.drafts, orderId);
        const hasItem = draft.mediaItems.some((item) => item.id === mediaId);
        if (!hasItem) {
            return state;
        }

        return {
            drafts: {
                ...state.drafts,
                [orderId]: {
                    ...draft,
                    mediaItems: draft.mediaItems.map((item) => (
                        item.id === mediaId
                            ? { ...item, ...patch }
                            : item
                    )),
                },
            },
        };
    }),

    removeMediaItem: (orderId, mediaId) => set((state) => {
        const draft = getOrCreateDraft(state.drafts, orderId);
        return {
            drafts: {
                ...state.drafts,
                [orderId]: {
                    ...draft,
                    mediaItems: draft.mediaItems.filter((item) => item.id !== mediaId),
                },
            },
        };
    }),

    clearDraft: (orderId) => set((state) => {
        const nextDrafts = { ...state.drafts };
        delete nextDrafts[orderId];
        return { drafts: nextDrafts };
    }),
}));
