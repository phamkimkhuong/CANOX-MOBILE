import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { act, fireEvent, render } from '@testing-library/react-native';
import React from 'react';

// Mock IconSymbol để tránh lỗi load vector icons trong môi trường test
jest.mock('@/components/ui/Icon', () => ({
    IconSymbol: ({ name }: { name: string }) => {
        const { View } = require('react-native');
        return <View testID={`icon-${name}`} />;
    }
}));

describe('QuantityStepper UI Component', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    it('render chính xác giá trị ban đầu', () => {
        const { getByText } = render(
            <QuantityStepper value={5} onValueChange={jest.fn()} />
        );
        expect(getByText('5')).toBeTruthy();
    });

    it('xử lý Tăng số lượng và gọi debounce chính xác', () => {
        const onValueChangeMock = jest.fn();
        const onImmediateChangeMock = jest.fn();

        const { getByLabelText, getByText } = render(
            <QuantityStepper
                value={1}
                onValueChange={onValueChangeMock}
                onImmediateChange={onImmediateChangeMock}
                debounceMs={500}
            />
        );

        const incrementBtn = getByLabelText('Tăng số lượng');

        fireEvent.press(incrementBtn);
        expect(onImmediateChangeMock).toHaveBeenCalledWith(2);
        expect(getByText('2')).toBeTruthy();
        expect(onValueChangeMock).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(500);
        });
        expect(onValueChangeMock).toHaveBeenCalledWith(2);
        expect(onValueChangeMock).toHaveBeenCalledTimes(1);
    });

    it('xử lý Giảm số lượng chính xác', () => {
        const onValueChangeMock = jest.fn();
        const { getByLabelText, getByText } = render(
            <QuantityStepper value={3} min={1} onValueChange={onValueChangeMock} />
        );

        const decrementBtn = getByLabelText('Giảm số lượng');
        fireEvent.press(decrementBtn);

        expect(getByText('2')).toBeTruthy();

        act(() => {
            jest.runAllTimers();
        });

        expect(onValueChangeMock).toHaveBeenCalledWith(2);
    });

    it('chặn hoàn toàn khi chạm giới hạn MIN', () => {
        const onValueChangeMock = jest.fn();
        const { getByLabelText } = render(
            <QuantityStepper value={1} min={1} onValueChange={onValueChangeMock} />
        );

        const decrementBtn = getByLabelText('Giảm số lượng');

        fireEvent.press(decrementBtn);

        act(() => {
            jest.runAllTimers();
        });
        expect(onValueChangeMock).not.toHaveBeenCalled();
    });

    it('chặn hoàn toàn khi chạm giới hạn MAX', () => {
        const onValueChangeMock = jest.fn();
        const { getByLabelText } = render(
            <QuantityStepper value={10} max={10} onValueChange={onValueChangeMock} />
        );

        const incrementBtn = getByLabelText('Tăng số lượng');

        fireEvent.press(incrementBtn);

        act(() => {
            jest.runAllTimers();
        });

        expect(onValueChangeMock).not.toHaveBeenCalled();
    });

    it('vô hiệu hóa hoàn toàn khi disabled=true', () => {
        const onValueChangeMock = jest.fn();
        const { getByLabelText } = render(
            <QuantityStepper value={5} disabled={true} onValueChange={onValueChangeMock} />
        );

        const incrementBtn = getByLabelText('Tăng số lượng');
        const decrementBtn = getByLabelText('Giảm số lượng');

        // Bấm 2 nút liên tục
        fireEvent.press(incrementBtn);
        fireEvent.press(decrementBtn);

        act(() => {
            jest.runAllTimers();
        });

        expect(onValueChangeMock).not.toHaveBeenCalled();
    });
});
