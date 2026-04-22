/**
 * Unit Tests for useLoadingStore
 * Focuses on reference counting and overlay visibility logic.
 */
import { act } from '@testing-library/react-native';
import { useLoadingStore, showGlobalLoading, hideGlobalLoading, forceHideGlobalLoading } from '@/store/useLoadingStore';

describe('useLoadingStore', () => {
    beforeEach(() => {
        act(() => {
            useLoadingStore.getState().forceHide();
        });
    });

    it('should initialize hidden', () => {
        const state = useLoadingStore.getState();
        expect(state.isLoading).toBe(false);
        expect(state._loadingCount).toBe(0);
        expect(state.message).toBeNull();
    });

    it('should show loading and increment count', () => {
        act(() => {
            showGlobalLoading('Syncing...');
        });

        let state = useLoadingStore.getState();
        expect(state.isLoading).toBe(true);
        expect(state._loadingCount).toBe(1);
        expect(state.message).toBe('Syncing...');

        act(() => {
            showGlobalLoading('Preparing...');
        });

        state = useLoadingStore.getState();
        expect(state.isLoading).toBe(true);
        expect(state._loadingCount).toBe(2);
        // It updates the message to the latest one
        expect(state.message).toBe('Preparing...');
    });

    it('should hide only when count reaches zero', () => {
        act(() => {
            showGlobalLoading('Task 1');
            showGlobalLoading();
        });

        expect(useLoadingStore.getState()._loadingCount).toBe(2);

        act(() => {
            hideGlobalLoading(); // _loadingCount = 1
        });
        
        let state = useLoadingStore.getState();
        expect(state.isLoading).toBe(true);
        // The message persists until count is 0
        
        act(() => {
            hideGlobalLoading(); // _loadingCount = 0
        });

        state = useLoadingStore.getState();
        expect(state.isLoading).toBe(false);
        expect(state.message).toBeNull();
    });

    it('should not throw or go negative if hide is called too many times', () => {
        act(() => {
            hideGlobalLoading();
            hideGlobalLoading();
        });

        const state = useLoadingStore.getState();
        expect(state._loadingCount).toBe(0);
        expect(state.isLoading).toBe(false);
    });

    it('should force hide immediately regardless of count', () => {
        act(() => {
            showGlobalLoading();
            showGlobalLoading();
            showGlobalLoading();
        });

        expect(useLoadingStore.getState()._loadingCount).toBe(3);

        act(() => {
            forceHideGlobalLoading();
        });

        const state = useLoadingStore.getState();
        expect(state._loadingCount).toBe(0);
        expect(state.isLoading).toBe(false);
        expect(state.message).toBeNull();
    });
});
