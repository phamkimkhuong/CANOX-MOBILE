import type { ReturnMediaItem, ReturnReasonCode, ReturnRequestDraft } from '@/types/order/return';
import { create } from 'zustand';

interface ReturnRequestDraftState {
    drafts: Record<string, ReturnRequestDraft>;
    setReasonCode: (orderId: string, reasonCode: ReturnReasonCode | null) => void;
    setBankAccountId: (orderId: string, bankAccountId: string | null) => void;
    setDescription: (orderId: string, description: string) => void;
    setMediaItems: (orderId: string, mediaItems: ReturnMediaItem[]) => void;
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

    clearDraft: (orderId) => set((state) => {
        const nextDrafts = { ...state.drafts };
        delete nextDrafts[orderId];
        return { drafts: nextDrafts };
    }),
}));
