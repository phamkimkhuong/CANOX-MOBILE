import { IconSymbol } from '@/components/ui/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface FlashSaleProgressBarProps {
    totalStock: number;
    soldCount: number;
    stockRemaining: number;
    isSoldOut: boolean;
    variant?: 'default' | 'liquid';
}

/**
 * FlashSaleProgressBar - Smart Psychology-driven Progress Bar
 */
export const FlashSaleProgressBar = memo(({
    totalStock,
    soldCount,
    stockRemaining,
    isSoldOut,
    variant: _variant = 'liquid'
}: FlashSaleProgressBarProps) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation(['home']);
    const styles = stylesheet;

    const percentage = totalStock > 0 ? Math.min(Math.round((soldCount / totalStock) * 100), 100) : 0;

    // Scarcity Triggers
    const isUrgent = (percentage >= 90 || stockRemaining < 5) && !isSoldOut;
    const hasLowStock = stockRemaining < 30 && !isSoldOut;

    // 1. Progress Animation
    const fillStyle = useAnimatedStyle(() => ({
        width: withSpring(`${Math.max(percentage, 12)}%`, { damping: 15, stiffness: 100 }),
    }), [percentage]);

    // 2. Urgent Pulse Animation
    const pulseStyle = useAnimatedStyle(() => {
        if (!isUrgent) return { opacity: 1 };
        return {
            opacity: withRepeat(
                withSequence(
                    withTiming(0.7, { duration: 400 }),
                    withTiming(1, { duration: 400 })
                ),
                -1,
                true
            ),
        };
    }, [isUrgent]);

    // 3. Smart Label Logic
    const statusLabel = useMemo(() => {
        if (isSoldOut) return t('home:flashSale.soldOut');

        // High Urgency / Scarcity (< 30 items)
        if (hasLowStock) {
            const messages = [
                t('home:flashSale.urgentStock'),
                t('home:flashSale.onlyLeft', { count: stockRemaining })
            ];
            // Randomly pick one (stable per item if we used an ID, but stable for this render cycle)
            const seed = Math.floor(stockRemaining % messages.length);
            return messages[seed];
        }

        // Case 2: Buzzing State (11% - 89%)
        if (percentage >= 11 && percentage <= 89) {
            if (soldCount > 10) {
                return `${t('home:flashSale.sold')} ${soldCount}`;
            }
            return t('home:flashSale.sellingFast');
        }

        // Case 3: Just Launched (0% - 10%)
        return t('home:flashSale.sellingFast');
    }, [isSoldOut, hasLowStock, percentage, soldCount, stockRemaining, t]);

    return (
        <View style={[
            styles.container,
            isUrgent && styles.containerUrgent,
            isSoldOut && styles.containerSoldOut
        ]}>
            {/* Background Fill */}
            <Animated.View style={[styles.fillWrapper, fillStyle, pulseStyle]}>
                <LinearGradient
                    colors={isSoldOut
                        ? [theme.colors.secondaryLight, theme.colors.border]
                        : (isUrgent ? [theme.colors.warning, theme.colors.newPrimary] : [theme.colors.accent, theme.colors.newPrimary])
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientFill}
                />
                {!isSoldOut && <View style={styles.shine} />}
            </Animated.View>

            {/* Label Layer */}
            <View style={styles.labelContainer}>
                {isUrgent && (
                    <IconSymbol
                        name="flame.fill"
                        size={10}
                        color={theme.colors.onPrimary}
                    />
                )}
                <Text style={styles.labelText}>
                    {statusLabel}
                </Text>
            </View>

            {/* Top Inner Highlight Line */}
            <View style={styles.topStroke} />
        </View>
    );
});

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        height: 18,
        backgroundColor: theme.colors.activeSoft,
        borderRadius: theme.radius.full,
        overflow: 'hidden',
        position: 'relative',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.activeLight,
    },
    containerUrgent: {
        backgroundColor: theme.colors.warningSubtle,
        borderColor: theme.colors.warningLight,
    },
    containerSoldOut: {
        backgroundColor: theme.colors.secondaryLight,
        borderColor: theme.colors.borderMuted,
    },
    fillWrapper: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        borderRadius: theme.radius.full,
        overflow: 'hidden',
    },
    gradientFill: {
        flex: 1,
    },
    shine: {
        position: 'absolute',
        top: 2,
        left: 0,
        right: 0,
        height: '40%',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: theme.radius.full,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.margins.xs,
        paddingHorizontal: theme.margins.sm,
        zIndex: 2,
    },
    labelText: {
        fontSize: theme.fontSizes.xs,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.onPrimary,
        textShadowColor: 'rgba(0, 0, 0, 0.25)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    topStroke: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        zIndex: 3,
    },
}));
