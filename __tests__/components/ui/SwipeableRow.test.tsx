import { SwipeableRow } from '@/components/ui/SwipeableRow';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

// Mock IconSymbol
jest.mock('@/components/ui/Icon', () => ({
    IconSymbol: ({ name }: { name: string }) => {
        const { View } = require('react-native');
        return <View testID={`icon-${name}`} />;
    }
}));

describe('SwipeableRow UI Component', () => {
    it('render children content chính xác', () => {
        const { getByText } = render(
            <SwipeableRow>
                <Text>Row Content</Text>
            </SwipeableRow>
        );

        expect(getByText('Row Content')).toBeTruthy();
    });

    it('không render các nút hành động nếu không truyền hàm callback', () => {
        const { queryByLabelText } = render(
            <SwipeableRow>
                <Text>Row Content</Text>
            </SwipeableRow>
        );

        expect(queryByLabelText('Xóa')).toBeNull();
        expect(queryByLabelText('Tìm SP tương tự')).toBeNull();
    });

    it('render nút xóa và gọi onDelete khi được nhấn', () => {
        const onDeleteMock = jest.fn();
        const { getByLabelText } = render(
            <SwipeableRow onDelete={onDeleteMock} deleteLabel="Delete Custom">
                <Text>Row Content</Text>
            </SwipeableRow>
        );

        const deleteButton = getByLabelText('Delete Custom');
        expect(deleteButton).toBeTruthy();

        fireEvent.press(deleteButton);

        // Gọi onDelete ngay lập tức do reanimated mock chạy synchronous callback
        expect(onDeleteMock).toHaveBeenCalledTimes(1);
    });

    it('render nút tìm kiếm và gọi onFindSimilar khi được nhấn', () => {
        const onFindSimilarMock = jest.fn();
        const { getByLabelText } = render(
            <SwipeableRow onFindSimilar={onFindSimilarMock}>
                <Text>Row Content</Text>
            </SwipeableRow>
        );

        const findButton = getByLabelText('Tìm SP tương tự');
        expect(findButton).toBeTruthy();

        fireEvent.press(findButton);
        expect(onFindSimilarMock).toHaveBeenCalledTimes(1);
    });

    it('hỗ trợ vô hiệu hóa swipe', () => {
        const { getByText } = render(
            <SwipeableRow disabled={true} onDelete={jest.fn()}>
                <Text>Row Content</Text>
            </SwipeableRow>
        );

        expect(getByText('Row Content')).toBeTruthy();
    });
});
