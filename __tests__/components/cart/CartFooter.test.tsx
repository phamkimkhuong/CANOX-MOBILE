import { CartFooter } from '@/components/cart/CartFooter';
import type { CartCalculationResult } from '@/types/cart';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { ActivityIndicator } from 'react-native';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, params?: any) => {
            if (key === 'footer.checkoutWithCount') return `Checkout (${params?.count})`;
            if (key === 'footer.savings') return `Savings: ${params?.amount}`;
            return key;
        }
    }),
    initReactI18next: {
        type: '3rdParty',
        init: jest.fn(),
    }
}));

describe('CartFooter', () => {
    const defaultCalculation: CartCalculationResult = {
        totalAmount: 150000,
        subtotal: 170000,
        shopVoucherDiscount: 10000,
        platformVoucherDiscount: 10000,
        hasOutOfStockItems: false,
        totalSavings: 20000,
        selectedCount: 2,
        isCalculating: false,
    };

    const mockOnToggleSelectAll = jest.fn();
    const mockOnCheckout = jest.fn();
    const mockOnDeleteSelected = jest.fn();
    const mockOnMoveToWishlist = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const defaultProps = {
        selectAllState: 'unchecked' as const,
        calculation: defaultCalculation,
        onToggleSelectAll: mockOnToggleSelectAll,
        onCheckout: mockOnCheckout,
        onDeleteSelected: mockOnDeleteSelected,
        onMoveToWishlist: mockOnMoveToWishlist,
    };

    it('renders checkout state correctly when there are selected items', () => {
        render(<CartFooter {...defaultProps} />);

        // Should render select all
        expect(screen.getByText('footer.selectAll')).toBeTruthy();

        expect(screen.getByText(/Savings:/)).toBeTruthy();

        // Should render checkout button with count
        expect(screen.getByText('Checkout (2)')).toBeTruthy();

        // Checkout button is enabled
        const checkoutBtn = screen.getByRole('button', { name: 'Checkout (2)' });
        expect(checkoutBtn.props.accessibilityState?.disabled).toBeFalsy();
    });

    it('disables checkout button when no items are selected', () => {
        const noSelectionCalc = { ...defaultCalculation, selectedCount: 0 };
        render(<CartFooter {...defaultProps} calculation={noSelectionCalc} />);

        const checkoutBtn = screen.getByRole('button');
        expect(checkoutBtn.props.accessibilityState?.disabled).toBe(true);
        expect(screen.getByText('footer.checkout')).toBeTruthy(); // default translation when no selection
    });

    it('shows calculating indicator when isCalculating is true', () => {
        const calculatingCalc = { ...defaultCalculation, isCalculating: true };
        render(<CartFooter {...defaultProps} calculation={calculatingCalc} />);

        expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeTruthy();
    });

    it('calls onToggleSelectAll when select all is pressed', () => {
        render(<CartFooter {...defaultProps} />);

        // Press the checkbox or text. The checkbox has role="checkbox"
        const checkbox = screen.getByRole('checkbox');
        fireEvent.press(checkbox);

        expect(mockOnToggleSelectAll).toHaveBeenCalledTimes(1);
    });

    it('calls onCheckout when checkout button is pressed', () => {
        render(<CartFooter {...defaultProps} />);

        const checkoutBtn = screen.getByRole('button', { name: 'Checkout (2)' });
        fireEvent.press(checkoutBtn);

        expect(mockOnCheckout).toHaveBeenCalledTimes(1);
    });

    it('renders edit mode correctly with selected items', () => {
        render(<CartFooter {...defaultProps} isEditMode={true} />);

        // Should render Move to wishlist and Delete selected buttons
        expect(screen.getByText('footer.moveToWishlist')).toBeTruthy();
        expect(screen.getByText('footer.deleteSelected')).toBeTruthy();

        const deleteText = screen.getByText('footer.deleteSelected');
        fireEvent.press(deleteText);
        expect(mockOnDeleteSelected).toHaveBeenCalledTimes(1);

        const wishlistText = screen.getByText('footer.moveToWishlist');
        fireEvent.press(wishlistText);
        expect(mockOnMoveToWishlist).toHaveBeenCalledTimes(1);
    });

    it('disables edit mode buttons when no items are selected', () => {
        const noSelectionCalc = { ...defaultCalculation, selectedCount: 0 };
        render(<CartFooter {...defaultProps} isEditMode={true} calculation={noSelectionCalc} />);

        const deleteText = screen.getByText('footer.deleteSelected');

        // Use a more robust approach: fire event, it shouldn't trigger
        fireEvent.press(deleteText);
        expect(mockOnDeleteSelected).not.toHaveBeenCalled();
    });
});
