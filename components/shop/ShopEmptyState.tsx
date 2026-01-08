/**
 * ==============================================
 * SHOP EMPTY STATE - No Products/Results View
 * ==============================================
 * 
 * Displayed when:
 * - Shop has no products
 * - Search returns no results
 * - Filter returns no matches
 */

import { IconSymbol } from '@/components/ui/Icon';
import React from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

type EmptyStateType = 'no-products' | 'no-search-results' | 'error';

interface ShopEmptyStateProps {
    /** Type of empty state to display */
    type?: EmptyStateType;
    /** Custom message override */
    message?: string;
    /** Custom sub-message override */
    subMessage?: string;
}

const EMPTY_STATE_CONFIG: Record<
    EmptyStateType,
    {
        icon: 'shopping-bag' | 'search' | 'error';
        message: string;
        subMessage: string;
    }
> = {
    'no-products': {
        icon: 'shopping-bag',
        message: 'Chưa có sản phẩm',
        subMessage: 'Shop này chưa có sản phẩm nào',
    },
    'no-search-results': {
        icon: 'search',
        message: 'Không tìm thấy sản phẩm',
        subMessage: 'Thử tìm kiếm với từ khóa khác',
    },
    'error': {
        icon: 'error',
        message: 'Đã xảy ra lỗi',
        subMessage: 'Không thể tải sản phẩm, vui lòng thử lại',
    },
};

/**
 * ShopEmptyState - Empty state display for shop products
 */
export const ShopEmptyState: React.FC<ShopEmptyStateProps> = ({
    type = 'no-products',
    message,
    subMessage,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const config = EMPTY_STATE_CONFIG[type];
    const displayMessage = message ?? config.message;
    const displaySubMessage = subMessage ?? config.subMessage;

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <IconSymbol
                    name={config.icon}
                    size={48}
                    color={theme.colors.secondary}
                />
            </View>
            <Text style={styles.message}>{displayMessage}</Text>
            <Text style={styles.subMessage}>{displaySubMessage}</Text>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.margins.xxl * 2,
        paddingHorizontal: theme.margins.lg,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.backgroundSurface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.margins.md,
    },
    message: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.typography,
        textAlign: 'center',
        marginBottom: theme.margins.sm,
    },
    subMessage: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
    },
}));

export default ShopEmptyState;
