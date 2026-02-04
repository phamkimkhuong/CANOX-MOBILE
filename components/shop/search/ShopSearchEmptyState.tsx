/**
 * ==============================================
 * SHOP SEARCH EMPTY STATE - No Results in Shop Search
 * ==============================================
 * 
 * Different from global search empty state:
 * - No recommendations from other shops
 * - Shows "View other products in this shop" action
 */

import { IconSymbol } from '@/components/ui/Icon';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ShopSearchEmptyStateProps {
    keyword?: string;
    categoryName?: string;
    onViewAllProducts?: () => void;
    onBack?: () => void;
}

export const ShopSearchEmptyState = React.memo(({
    keyword: _keyword,
    categoryName: _categoryName,
    onViewAllProducts,
    onBack,
}: ShopSearchEmptyStateProps) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('search');

    const getMessage = () => {
        return t('shop.emptyProductNotFound', 'Không tìm thấy sản phẩm phù hợp');
    };

    return (
        <View style={styles.container}>
            <View style={styles.iconWrapper}>
                <IconSymbol
                    name="cube-outline"
                    size={64}
                    color={theme.colors.secondary}
                />
            </View>

            <Text style={styles.message}>
                {getMessage()}
            </Text>

            <Text style={styles.hint}>
                {t('shop.emptyHint', 'Thử tìm với từ khóa khác hoặc xem các sản phẩm khác của shop')}
            </Text>

            <View style={styles.actions}>
                {onViewAllProducts && (
                    <Pressable
                        style={({ pressed }) => [
                            styles.primaryButton,
                            pressed && styles.buttonPressed,
                        ]}
                        onPress={onViewAllProducts}
                    >
                        <IconSymbol
                            name="storefront-outline"
                            size={18}
                            color={theme.colors.onPrimary}
                        />
                        <Text style={styles.primaryButtonText}>
                            {t('shop.viewAllProducts', 'Xem sản phẩm của shop')}
                        </Text>
                    </Pressable>
                )}

                {onBack && (
                    <Pressable
                        style={({ pressed }) => [
                            styles.secondaryButton,
                            pressed && styles.buttonPressed,
                        ]}
                        onPress={onBack}
                    >
                        <Text style={styles.secondaryButtonText}>
                            {t('shop.backToShop', 'Quay lại shop')}
                        </Text>
                    </Pressable>
                )}
            </View>
        </View>
    );
});

ShopSearchEmptyState.displayName = 'ShopSearchEmptyState';

const styles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.margins.xl,
        paddingVertical: theme.margins.xl * 2,
    },
    iconWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.margins.lg,
    },
    message: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.typography,
        textAlign: 'center',
        marginBottom: theme.margins.sm,
    },
    hint: {
        fontSize: 14,
        color: theme.colors.secondary,
        textAlign: 'center',
        marginBottom: theme.margins.xl,
        lineHeight: 20,
    },
    actions: {
        gap: theme.margins.sm,
        width: '100%',
        maxWidth: 280,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.margins.sm,
        backgroundColor: theme.colors.newPrimary,
        paddingVertical: theme.margins.smd,
        paddingHorizontal: theme.margins.lg,
        borderRadius: theme.radius.m,
    },
    primaryButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.onPrimary,
    },
    secondaryButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.margins.sm,
        paddingHorizontal: theme.margins.lg,
        borderRadius: theme.radius.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    secondaryButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.typography,
    },
    buttonPressed: {
        opacity: 0.7,
    },
}));

export default ShopSearchEmptyState;
