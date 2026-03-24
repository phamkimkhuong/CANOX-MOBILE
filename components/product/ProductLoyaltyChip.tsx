import type { ShopLoyaltyPolicyUI } from '@/types/loyalty/ui';
import React, { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { IconSymbol } from '../ui/Icon';
import { ProductLoyaltyPolicySheet } from './ProductLoyaltyPolicySheet';

interface ProductLoyaltyChipProps {
    policy?: ShopLoyaltyPolicyUI | null;
}

export const ProductLoyaltyChip = memo<ProductLoyaltyChipProps>(({ policy }) => {
    const { theme } = useUnistyles();
    const { t, i18n } = useTranslation(['loyalty']);
    const [visible, setVisible] = useState(false);

    const numberFormatter = useMemo(() => new Intl.NumberFormat(
        i18n.language.startsWith('vi') ? 'vi-VN' : 'en-US'
    ), [i18n.language]);

    const formattedPoints = useMemo(() => {
        if (!policy || policy.rewardValue <= 0) return null;
        return numberFormatter.format(policy.rewardValue);
    }, [numberFormatter, policy]);

    const chipText = useMemo(() => {
        if (!formattedPoints) return t('loyalty:pdp.chipGeneric');
        return t('loyalty:pdp.chipEarn', { points: formattedPoints });
    }, [formattedPoints, t]);

    if (!policy?.isEnabled) return null;

    return (
        <>
            <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [
                    styles.chip,
                    pressed && styles.chipPressed,
                ]}
                onPress={() => setVisible(true)}
                android_ripple={{ color: theme.colors.warningLight }}
            >
                <IconSymbol name="coin" size={12} color={theme.colors.warning} />
                <Text style={styles.text} numberOfLines={1}>
                    {chipText}
                </Text>
            </Pressable>

            <ProductLoyaltyPolicySheet
                visible={visible}
                onClose={() => setVisible(false)}
                policy={policy}
            />
        </>
    );
});

ProductLoyaltyChip.displayName = 'ProductLoyaltyChip';

const styles = StyleSheet.create((theme) => ({
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-start',
        maxWidth: '100%',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: theme.colors.warning,
        backgroundColor: theme.colors.warningLight,
    },
    chipPressed: {
        opacity: 0.85,
    },
    text: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.warning,
        flexShrink: 1,
    },
}));
