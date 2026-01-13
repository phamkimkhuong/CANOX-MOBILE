import { ShippingAddress } from '@/types/address';
import { create } from 'zustand';

export type AddressSuccessType = 'add' | 'update' | 'delete' | null;

interface UserAddressState {
    addresses: ShippingAddress[];
    selectedAddressId: string | null;
    isLoaded: boolean;
    pendingSuccessMessage: AddressSuccessType;

    // Actions
    setAddresses: (addresses: ShippingAddress[]) => void;
    setSelectedAddressId: (id: string | null) => void;
    setPendingSuccessMessage: (type: AddressSuccessType) => void;
    clearPendingSuccessMessage: () => void;
    clear: () => void;
}

export const useUserAddressStore = create<UserAddressState>((set) => ({
    addresses: [],
    selectedAddressId: null,
    isLoaded: false,
    pendingSuccessMessage: null,

    setAddresses: (addresses) => {
        set((state) => {
            // If we don't have a selected address yet, try to find the default one
            let newSelectedId = state.selectedAddressId;
            if (!newSelectedId || !addresses.find(a => a.id === newSelectedId)) {
                const defaultAddr = addresses.find(a => a.isDefault);
                newSelectedId = defaultAddr?.id || addresses[0]?.id || null;
            }

            return {
                addresses: addresses,
                selectedAddressId: newSelectedId,
                isLoaded: true,
            };
        });
    },

    setSelectedAddressId: (id) => set({ selectedAddressId: id }),

    setPendingSuccessMessage: (type) => set({ pendingSuccessMessage: type }),

    clearPendingSuccessMessage: () => set({ pendingSuccessMessage: null }),

    clear: () => set({ addresses: [], selectedAddressId: null, isLoaded: false, pendingSuccessMessage: null }),
}));

/**
 * SELECTORS
 */
export const useSelectedAddress = () => {
    const { addresses, selectedAddressId } = useUserAddressStore();
    return addresses.find(a => a.id === selectedAddressId) || null;
};
