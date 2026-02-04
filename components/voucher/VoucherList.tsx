/**
 * VoucherList - Danh sách voucher với FlashList
 * 
 * Features:
 * - High performance với FlashList
 * - Empty state
 * - Loading state
 * - Pull to refresh
 */

import { VOUCHER_STRINGS } from '@/constants/i18n/vi/voucher';
import type { VoucherUI } from '@/types/voucher';
import { FlashList } from '@shopify/flash-list';
import React, { memo, useCallback, useMemo } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { IconSymbol } from '../ui/Icon';

import { VoucherCard } from './VoucherCard';

interface VoucherListProps {
    /** Danh sách voucher */
    vouchers: VoucherUI[];
    isLoading?: boolean;
    onCollect?: (id: string) => void;
    /** Callback khi use voucher */
    onUse?: (id: string) => void;
    /** Callback khi set reminder */
    onReminder?: (id: string) => void;
    /** Callback khi view conditions */
    onViewConditions?: (id: string) => void;
    ListHeaderComponent?: React.ReactElement;
    contentContainerStyle?: object;
}

/**
 * Empty State Component
 */
const EmptyState = memo(() => {
    const { theme } = useUnistyles();

    return (
        <View style={emptyStyles.container}>
            <IconSymbol
                name="confirmation-number"
                size={64}
                color={theme.colors.secondary}
            />
            <Text style={emptyStyles.title}>
                {VOUCHER_STRINGS.list.empty}
            </Text>
            <Text style={emptyStyles.description}>
                {VOUCHER_STRINGS.list.emptyDescription}
            </Text>
        </View>
    );
});

EmptyState.displayName = 'EmptyState';

const emptyStyles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.margins.xxl,
        paddingHorizontal: theme.margins.lg,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.typography,
        marginTop: theme.margins.md,
    },
    description: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
        marginTop: theme.margins.sm,
    },
}));

/**
 * Loading State Component
 */
const LoadingState = memo(() => {
    const { theme } = useUnistyles();

    return (
        <View style={loadingStyles.container}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={loadingStyles.text}>
                {VOUCHER_STRINGS.list.loading}
            </Text>
        </View>
    );
});

LoadingState.displayName = 'LoadingState';

const loadingStyles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.margins.xxl,
    },
    text: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        marginTop: theme.margins.md,
    },
}));

/**
 * VoucherList Component
 */
export const VoucherList = memo<VoucherListProps>(({
    vouchers,
    isLoading = false,
    onCollect,
    onUse,
    onReminder,
    onViewConditions,
    ListHeaderComponent,
    contentContainerStyle,
}) => {
    const { theme } = useUnistyles();

    // Render item
    const renderItem = useCallback(({ item }: { item: VoucherUI }) => (
        <View style={styles.itemContainer}>
            <VoucherCard
                voucher={item}
                onCollect={onCollect}
                onUse={onUse}
                onReminder={onReminder}
                onViewConditions={onViewConditions}
                backgroundColor={theme.colors.background}
            />
        </View>
    ), [onCollect, onUse, onReminder, onViewConditions, theme.colors.background]);

    // Key extractor
    const keyExtractor = useCallback((item: VoucherUI) => item.id, []);

    // Item separator
    const ItemSeparator = useCallback(() => (
        <View style={styles.separator} />
    ), []);

    // Merged content container style
    const mergedContentStyle = useMemo(() => ({
        paddingHorizontal: 16,
        paddingBottom: 100, // Safe area for bottom bar
        ...contentContainerStyle,
    }), [contentContainerStyle]);

    // Loading state
    if (isLoading && vouchers.length === 0) {
        return <LoadingState />;
    }


    return (
        <FlashList
            data={vouchers}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ItemSeparatorComponent={ItemSeparator}
            ListHeaderComponent={ListHeaderComponent}
            ListEmptyComponent={<EmptyState />}
            contentContainerStyle={mergedContentStyle}
            showsVerticalScrollIndicator={false}
        />
    );
});

VoucherList.displayName = 'VoucherList';

const styles = StyleSheet.create((_theme) => ({
    itemContainer: {
        // Ensure proper width for FlashList estimation
    },
    separator: {
        height: 12,
    },
}));

export default VoucherList;

