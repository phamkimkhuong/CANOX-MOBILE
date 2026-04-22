/**
 * Unit Tests for useReturnRequestDraftStore
 */
import { act } from '@testing-library/react-native';
import { useReturnRequestDraftStore } from '@/store/useReturnRequestDraftStore';
import type { ReturnMediaItem } from '@/types/order/return';

describe('useReturnRequestDraftStore', () => {
    const orderId1 = 'order-1';
    const orderId2 = 'order-2';

    beforeEach(() => {
        // Zustand mock takes care of this, but it's good practice for drafts dictionary
        act(() => {
            useReturnRequestDraftStore.setState({ drafts: {} });
        });
    });

    it('should initialize empty', () => {
        expect(useReturnRequestDraftStore.getState().drafts).toEqual({});
    });

    it('should lazy instantiate a draft on setting a property', () => {
        act(() => {
            useReturnRequestDraftStore.getState().setReasonCode(orderId1, 'WRONG_ITEM');
        });

        const drafts = useReturnRequestDraftStore.getState().drafts;
        expect(drafts[orderId1]).toBeDefined();
        expect(drafts[orderId1].reasonCode).toBe('WRONG_ITEM');
        expect(drafts[orderId1].description).toBe('');
        expect(drafts[orderId1].mediaItems).toEqual([]);
        expect(drafts[orderId1].bankAccountId).toBeNull();
    });

    it('should independently manage drafts for different orders', () => {
        act(() => {
            useReturnRequestDraftStore.getState().setDescription(orderId1, 'Broken screen');
            useReturnRequestDraftStore.getState().setDescription(orderId2, 'Wrong size');
        });

        const drafts = useReturnRequestDraftStore.getState().drafts;
        expect(drafts[orderId1].description).toBe('Broken screen');
        expect(drafts[orderId2].description).toBe('Wrong size');
    });

    it('should handle bank account ID', () => {
        act(() => {
            useReturnRequestDraftStore.getState().setBankAccountId(orderId1, 'bank-xyz');
        });
        expect(useReturnRequestDraftStore.getState().drafts[orderId1].bankAccountId).toBe('bank-xyz');
    });

    describe('Media Items Management', () => {
        const mockMediaItem: ReturnMediaItem = { id: 'media-1', uri: 'file://a.jpg', type: 'IMAGE', uploadStatus: 'uploading', progress: 0 };
        
        it('should append media items', () => {
            act(() => {
                useReturnRequestDraftStore.getState().appendMediaItems(orderId1, [mockMediaItem]);
            });

            const items = useReturnRequestDraftStore.getState().drafts[orderId1].mediaItems;
            expect(items.length).toBe(1);
            expect(items[0]).toEqual(mockMediaItem);
        });

        it('should overwrite media items via setMediaItems', () => {
            act(() => {
                useReturnRequestDraftStore.getState().appendMediaItems(orderId1, [mockMediaItem]);
                
                // Now overwrite
                useReturnRequestDraftStore.getState().setMediaItems(orderId1, []);
            });

            expect(useReturnRequestDraftStore.getState().drafts[orderId1].mediaItems).toEqual([]);
        });

        it('should patch a media item nicely', () => {
            act(() => {
                useReturnRequestDraftStore.getState().appendMediaItems(orderId1, [mockMediaItem]);
                
                // Patch the item (e.g., successful upload)
                useReturnRequestDraftStore.getState().updateMediaItem(orderId1, 'media-1', {
                    uploadStatus: 'success',
                    assetId: 'server-asset-1'
                });
            });

            const items = useReturnRequestDraftStore.getState().drafts[orderId1].mediaItems;
            expect(items[0].uploadStatus).toBe('success');
            expect(items[0].assetId).toBe('server-asset-1');
            expect(items[0].type).toBe('IMAGE'); // Rest stays intact
        });

        it('should safely do nothing when patching non-existent item', () => {
            act(() => {
                useReturnRequestDraftStore.getState().appendMediaItems(orderId1, [mockMediaItem]);
                useReturnRequestDraftStore.getState().updateMediaItem(orderId1, 'ghost-media', { uploadStatus: 'error' });
            });
            const items = useReturnRequestDraftStore.getState().drafts[orderId1].mediaItems;
            expect(items.length).toBe(1);
            expect(items[0].uploadStatus).toBe('uploading'); // unchanged
        });

        it('should remove media items by ID', () => {
            const anotherMedia: ReturnMediaItem = { id: 'media-2', uri: 'file://b.jpg', type: 'IMAGE', uploadStatus: 'success', progress: 100 };
            
            act(() => {
                useReturnRequestDraftStore.getState().appendMediaItems(orderId1, [mockMediaItem, anotherMedia]);
                useReturnRequestDraftStore.getState().removeMediaItem(orderId1, 'media-1');
            });

            const items = useReturnRequestDraftStore.getState().drafts[orderId1].mediaItems;
            expect(items.length).toBe(1);
            expect(items[0].id).toBe('media-2');
        });
    });

    it('should clear an entire draft safely without touching others', () => {
        act(() => {
            useReturnRequestDraftStore.getState().setDescription(orderId1, 'Foo');
            useReturnRequestDraftStore.getState().setDescription(orderId2, 'Bar');
            
            useReturnRequestDraftStore.getState().clearDraft(orderId1);
        });

        const drafts = useReturnRequestDraftStore.getState().drafts;
        expect(drafts[orderId1]).toBeUndefined();
        expect(drafts[orderId2].description).toBe('Bar');
    });
});
