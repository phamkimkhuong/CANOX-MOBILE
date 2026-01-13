/**
 * ==============================================
 * WISHLIST EMPTY STATE - Empty placeholders
 * ==============================================
 * Beautiful empty states for wishlist screens
 */

import { IconSymbol, IconSymbolName } from '@/components/ui/Icon';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface EmptyStateProps {
    icon: IconSymbolName;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

/**
 * Generic empty state component
 */
export const WishlistEmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    actionLabel,
    onAction,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <IconSymbol
                    name={icon}
                    size={48}
                    color={theme.colors.primary}
                />
            </View>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>

            {actionLabel && onAction && (
                <Pressable
                    style={({ pressed }) => [
                        styles.actionButton,
                        pressed && styles.actionButtonPressed,
                    ]}
                    onPress={onAction}
                >
                    <Text style={styles.actionText}>{actionLabel}</Text>
                </Pressable>
            )}
        </View>
    );
};

/**
 * Empty state for "My Collections" tab
 */
export const EmptyMyWishlists: React.FC<{ onCreateNew?: () => void }> = ({
    onCreateNew,
}) => (
    <WishlistEmptyState
        icon="favorite-border"
        title="Chưa có bộ sưu tập nào"
        description="Tạo bộ sưu tập để lưu những sản phẩm yêu thích và theo dõi giá!"
        actionLabel="Tạo bộ sưu tập mới"
        onAction={onCreateNew}
    />
);

/**
 * Empty state for "Price Alerts" tab
 */
export const EmptyPriceAlerts: React.FC<{ onExplore?: () => void }> = ({
    onExplore,
}) => (
    <WishlistEmptyState
        icon="notifications"
        title="Chưa có sản phẩm đạt giá"
        description="Thêm giá mong muốn vào sản phẩm để nhận thông báo khi giá giảm!"
        actionLabel="Khám phá sản phẩm"
        onAction={onExplore}
    />
);

/**
 * Empty state for "Discover" tab
 */
export const EmptyDiscover: React.FC = () => (
    <WishlistEmptyState
        icon="explore"
        title="Không tìm thấy bộ sưu tập"
        description="Hãy thử tìm kiếm với từ khóa khác"
    />
);

/**
 * Empty state for wishlist detail (no items)
 */
export const EmptyWishlistItems: React.FC<{ onAddProduct?: () => void }> = ({
    onAddProduct,
}) => (
    <WishlistEmptyState
        icon="add-circle-outline"
        title="Bộ sưu tập trống"
        description="Thêm sản phẩm yêu thích vào bộ sưu tập này!"
        actionLabel="Thêm sản phẩm"
        onAction={onAddProduct}
    />
);

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.margins.xl,
        paddingVertical: theme.margins.xxl,
    },
    iconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: theme.colors.primaryMuted,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.margins.lg,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.typography,
        textAlign: 'center',
        marginBottom: theme.margins.sm,
    },
    description: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: theme.margins.lg,
    },
    actionButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.margins.lg,
        paddingVertical: theme.margins.smd,
        borderRadius: theme.radius.xl,
        ...theme.shadows.small,
    },
    actionButtonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    actionText: {
        color: theme.colors.onPrimary,
        fontSize: 14,
        fontWeight: '600',
    },
}));
