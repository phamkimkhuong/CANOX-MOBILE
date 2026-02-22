/**
 * LoyaltyEmptyState - Hiển thị khi user chưa có xu tích lũy
 */

import { IconSymbol } from '@/components/ui/Icon';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface LoyaltyEmptyStateProps {
    onShopNow: () => void;
}

export const LoyaltyEmptyState: React.FC<LoyaltyEmptyStateProps> = memo(({ onShopNow }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { t } = useTranslation('loyalty');

    return (
        <Animated.View
            entering={FadeInDown.duration(400).delay(200)}
            style={styles.emptyContainer}
        >
            <View style={styles.emptyIconWrapper}>
                <IconSymbol name="cash" size={56} color={theme.colors.secondary} />
            </View>
            <Text style={styles.emptyTitle}>{t('emptyState.title')}</Text>
            <Text style={styles.emptyMessage}>
                {t('emptyState.message')}
            </Text>
            <Pressable style={styles.emptyButton} onPress={onShopNow}>
                <IconSymbol name="bag" size={18} color="#fff" />
                <Text style={styles.emptyButtonText}>{t('emptyState.shopNowBtn')}</Text>
            </Pressable>
        </Animated.View>
    );
});

LoyaltyEmptyState.displayName = 'LoyaltyEmptyState';

const stylesheet = StyleSheet.create((theme) => ({
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 48,
        paddingHorizontal: 32,
        marginTop: theme.margins.md,
    },
    emptyIconWrapper: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: theme.colors.secondaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.typography,
        marginBottom: 8,
    },
    emptyMessage: {
        fontSize: 14,
        color: theme.colors.secondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: theme.colors.newPrimary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 14,
    },
    emptyButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
}));
