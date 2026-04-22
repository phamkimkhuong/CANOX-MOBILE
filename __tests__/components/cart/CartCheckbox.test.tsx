import { CartCheckbox } from '@/components/cart/CartCheckbox';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

// Mock IconSymbol
jest.mock('@/components/ui/Icon', () => ({
    IconSymbol: ({ name }: { name: string }) => {
        const { View } = require('react-native');
        return <View testID={`icon-${name}`} />;
    }
}));

describe('CartCheckbox UI Component', () => {
    it('render chính xác trạng thái chưa chọn mặc định (unchecked)', () => {
        const onToggleMock = jest.fn();
        const { getByRole, queryByTestId } = render(
            <CartCheckbox checked={false} onToggle={onToggleMock} testID="cart-checkbox" />
        );

        const checkbox = getByRole('checkbox');
        expect(checkbox.props.accessibilityState.checked).toBe(false);
        // Không hiện icon check
        expect(queryByTestId('icon-check')).toBeNull();
    });

    it('render chính xác trạng thái đã chọn (checked_mode_boolean)', () => {
        const onToggleMock = jest.fn();
        const { getByRole, getByTestId } = render(
            <CartCheckbox checked={true} onToggle={onToggleMock} testID="cart-checkbox" />
        );

        const checkbox = getByRole('checkbox');
        expect(checkbox.props.accessibilityState.checked).toBe(true);
        // Có hiện icon check
        expect(getByTestId('icon-check')).toBeTruthy();
    });

    it('render chính xác trạng thái bán phần (indeterminate mode state)', () => {
        const onToggleMock = jest.fn();
        const { getByRole, queryByTestId } = render(
            <CartCheckbox state="indeterminate" onToggle={onToggleMock} testID="cart-checkbox" />
        );

        const checkbox = getByRole('checkbox');
        expect(checkbox.props.accessibilityState.checked).toBe(false);

        // Không hiện icon check
        expect(queryByTestId('icon-check')).toBeNull();
    });

    it('gọi hàm onToggle khi nhấn', () => {
        const onToggleMock = jest.fn();
        const { getByTestId } = render(
            <CartCheckbox checked={false} onToggle={onToggleMock} testID="cart-checkbox" />
        );

        fireEvent.press(getByTestId('cart-checkbox'));
        expect(onToggleMock).toHaveBeenCalledTimes(1);
    });

    it('không gọi hàm onToggle khi bị disabled', () => {
        const onToggleMock = jest.fn();
        const { getByTestId, getByRole } = render(
            <CartCheckbox disabled={true} onToggle={onToggleMock} testID="cart-checkbox" />
        );

        const checkbox = getByRole('checkbox');
        expect(checkbox.props.accessibilityState.disabled).toBe(true);

        fireEvent.press(getByTestId('cart-checkbox'));
        expect(onToggleMock).not.toHaveBeenCalled();
    });
});
