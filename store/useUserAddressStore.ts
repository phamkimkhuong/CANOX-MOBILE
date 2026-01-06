import { ShippingAddress } from '@/types/address';
import { create } from 'zustand';

interface UserAddressState {
    addresses: ShippingAddress[];
    selectedAddressId: string | null;
    isLoaded: boolean;

    // Actions
    setAddresses: (addresses: ShippingAddress[]) => void;
    setSelectedAddressId: (id: string | null) => void;
    clear: () => void;
}

export const useUserAddressStore = create<UserAddressState>((set) => ({
    addresses: [],
    selectedAddressId: null,
    isLoaded: false,

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

    clear: () => set({ addresses: [], selectedAddressId: null, isLoaded: false }),
}));

/**
 * SELECTORS
 */
export const useSelectedAddress = () => {
    const { addresses, selectedAddressId } = useUserAddressStore();
    return addresses.find(a => a.id === selectedAddressId) || null;
};
