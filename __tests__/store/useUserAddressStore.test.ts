/**
 * Unit Tests for useUserAddressStore
 */
import { act } from '@testing-library/react-native';
import { useUserAddressStore } from '@/store/useUserAddressStore';
import type { ShippingAddress } from '@/types/address';

// Helper to create valid ShippingAddress mocks
const createMockAddress = (id: string, isDefault: boolean): ShippingAddress => ({
    id,
    recipientName: `Person ${id}`,
    phone: `090000000${id}`,
    streetAddress: `${id} Main St`,
    wardName: 'Ward A',
    provinceName: 'City A',
    districtName: 'District A',
    countryName: 'Vietnam',
    label: 'home',
    isDefault,
    isInternational: false,
});

describe('useUserAddressStore', () => {
    beforeEach(() => {
        act(() => {
            useUserAddressStore.getState().clear();
        });
    });

    it('should initialize with empty state', () => {
        const state = useUserAddressStore.getState();
        expect(state.addresses).toEqual([]);
        expect(state.selectedAddressId).toBeNull();
        expect(state.isLoaded).toBe(false);
        expect(state.pendingSuccessMessage).toBeNull();
    });

    it('should smartly select default address if no selection exists', () => {
        const mockAddresses: ShippingAddress[] = [
            createMockAddress('1', false),
            createMockAddress('2', true), // Default
        ];

        act(() => {
            useUserAddressStore.getState().setAddresses(mockAddresses);
        });

        const state = useUserAddressStore.getState();
        expect(state.isLoaded).toBe(true);
        expect(state.addresses).toEqual(mockAddresses);
        expect(state.selectedAddressId).toBe('2'); // Picked default
    });

    it('should fallback to first address if no default exists', () => {
        const mockAddresses: ShippingAddress[] = [
            createMockAddress('1', false),
            createMockAddress('2', false),
        ];

        act(() => {
            useUserAddressStore.getState().setAddresses(mockAddresses);
        });

        expect(useUserAddressStore.getState().selectedAddressId).toBe('1');
    });

    it('should retain existing selection if valid', () => {
        const mockAddresses: ShippingAddress[] = [
            createMockAddress('1', false),
            createMockAddress('2', true),
        ];

        act(() => {
            useUserAddressStore.getState().setSelectedAddressId('1');
            useUserAddressStore.getState().setAddresses(mockAddresses);
        });

        expect(useUserAddressStore.getState().selectedAddressId).toBe('1');
    });

    it('should fallback if selected address is no longer in the list', () => {
        const mockAddresses: ShippingAddress[] = [
            createMockAddress('2', true),
        ];

        act(() => {
            useUserAddressStore.getState().setSelectedAddressId('1'); // Select non-existent
            useUserAddressStore.getState().setAddresses(mockAddresses);
        });

        // Should auto-select the default ('2') since '1' is gone
        expect(useUserAddressStore.getState().selectedAddressId).toBe('2');
    });

    it('should handle pending success messages', () => {
        act(() => {
            useUserAddressStore.getState().setPendingSuccessMessage('add');
        });
        expect(useUserAddressStore.getState().pendingSuccessMessage).toBe('add');

        act(() => {
            useUserAddressStore.getState().clearPendingSuccessMessage();
        });
        expect(useUserAddressStore.getState().pendingSuccessMessage).toBeNull();
    });
});
