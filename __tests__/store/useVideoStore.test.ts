/**
 * Unit Tests for useVideoStore
 */
import { act } from '@testing-library/react-native';
import { useVideoStore } from '@/store/useVideoStore';

jest.mock('react-native-mmkv', () => {
    return {
        createMMKV: jest.fn(() => ({
            getString: jest.fn(),
            set: jest.fn(),
            remove: jest.fn(),
            clearAll: jest.fn(),
            contains: jest.fn(),
        })),
    };
});

describe('useVideoStore', () => {
    beforeEach(() => {
        act(() => {
            // Restore default state
            useVideoStore.setState({ isMuted: false, volume: 1.0 });
        });
    });

    it('should initialize with sound enabled and max volume', () => {
        const state = useVideoStore.getState();
        expect(state.isMuted).toBe(false);
        expect(state.volume).toBe(1.0);
    });

    it('should set muted state properly', () => {
        act(() => {
            useVideoStore.getState().setIsMuted(true);
        });
        expect(useVideoStore.getState().isMuted).toBe(true);
    });

    it('should set volume properly', () => {
        act(() => {
            useVideoStore.getState().setVolume(0.5);
        });
        expect(useVideoStore.getState().volume).toBe(0.5);
    });
});
