import { CartItem } from '@/components/cart/CartItem';
import { productRoutes } from '@/constants/routes';
import { useCartStore } from '@/store/useCartStore';
import { useUserAddressStore } from '@/store/useUserAddressStore';
import type { CartItemUI } from '@/types/cart';
import { Navigator } from '@/utils/navigation';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

// Mock dependencies
jest.mock('expo-image', () => {
    const { View } = require('react-native');
    return {
        Image: (props: any) => <View testID="mock-expo-image" {...props} />
    };
});

jest.mock('@/utils/navigation', () => ({
    Navigator: {
        push: jest.fn(),
    }
}));

jest.mock('@/components/ui/Icon', () => {
    const { View } = require('react-native');
    return {
        IconSymbol: (props: any) => <View testID={`icon-${props.name}`} {...props} />
    };
});

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, params?: any) => {
            if (key === 'item.unsupportedRegion') return `Unsupported: ${params?.location}`;
            return key;
        }
    }),
    initReactI18next: {
        type: '3rdParty',
        init: jest.fn(),
    }
}));

const mockItemDetails: CartItemUI = {
    id: 'cart-item-1',
    productId: 'product-1',
    productName: 'Test Product',
    imageUrl: 'https://example.com/image.png',
    unitPrice: 100000,
    originalPrice: 150000,
    quantity: 2,
    maxQuantity: 10,
    variantId: 'variant-1',
    variantAttributes: 'Color: Red',
    isOutOfStock: false,
    availableRegions: ['VIETNAM', 'INTERNATIONAL']
} as CartItemUI;

describe('CartItem', () => {
    const mockOnToggleSelect = jest.fn();
    const mockOnQuantityChange = jest.fn();
    const mockOnVariantPress = jest.fn();
    const mockOnFindSimilar = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        useCartStore.setState({
            selectedItemIds: new Set(),
        });

        useUserAddressStore.setState({
            selectedAddressId: null,
            addresses: []
        });
    });

    const defaultProps = {
        item: mockItemDetails,
        onToggleSelect: mockOnToggleSelect,
        onQuantityChange: mockOnQuantityChange,
        onVariantPress: mockOnVariantPress,
        onFindSimilar: mockOnFindSimilar,
    };

    it('renders correctly with basic product details', () => {
        render(<CartItem {...defaultProps} />);

        // Assert text exists
        expect(screen.getByText('Test Product')).toBeTruthy();
        expect(screen.getByText('Color: Red')).toBeTruthy();
        expect(screen.getByTestId('mock-expo-image')).toBeTruthy();
    });

    it('calls onToggleSelect when checkbox is pressed', () => {
        render(<CartItem {...defaultProps} />);

        const checkbox = screen.getByRole('checkbox');
        fireEvent.press(checkbox);

        expect(mockOnToggleSelect).toHaveBeenCalledWith('cart-item-1');
    });

    it('shows Out of Stock overlay and Find Similar button when item is out of stock', () => {
        const outOfStockItem = { ...mockItemDetails, isOutOfStock: true };
        render(<CartItem {...defaultProps} item={outOfStockItem} />);

        // Check for out of stock text
        expect(screen.getByText('item.outOfStock')).toBeTruthy();

        // Find similar button should exist instead of quantity stepper
        const findSimilarBtn = screen.getByRole('button', { name: 'item.findSimilar' });
        expect(findSimilarBtn).toBeTruthy();

        fireEvent.press(findSimilarBtn);
        expect(mockOnFindSimilar).toHaveBeenCalledWith('cart-item-1');
    });

    it('handles region restriction and disables interactions', () => {
        useUserAddressStore.setState({
            selectedAddressId: 'addr-1',
            addresses: [{
                id: 'addr-1',
                recipientName: 'John Doe',
                phone: '123',
                provinceName: 'New York',
                districtName: 'City',
                wardName: 'Ward',
                streetAddress: 'Street',
                label: 'home',
                isDefault: true,
                isInternational: true,
                countryName: 'USA',
            } as any],
        });

        const restrictedItem = { ...mockItemDetails, availableRegions: ['VIETNAM'] };

        render(<CartItem {...defaultProps} item={restrictedItem} />);

        expect(screen.getByText('Unsupported: New York')).toBeTruthy();

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox.props.accessibilityState.disabled).toBe(true);
    });

    it('calls Navigator.push when product image or text is pressed', () => {
        render(<CartItem {...defaultProps} />);

        const productName = screen.getByText('Test Product');
        fireEvent.press(productName);

        expect(Navigator.push).toHaveBeenCalledWith(productRoutes.detail('product-1'));
    });

    it('displays discount badge when promotion is active', () => {
        const itemWithPromo = {
            ...mockItemDetails,
            promotion: {
                campaignId: 'camp-1',
                campaignType: 'FLASH_SALE',
                discountPercent: 20,
                secondsRemaining: 3600,
                stockRemaining: 5
            }
        };

        render(<CartItem {...defaultProps} item={itemWithPromo} />);

        expect(screen.getByText('-20%')).toBeTruthy();
        expect(screen.getByText('🏷️ FLASH SALE')).toBeTruthy();
    });
});
