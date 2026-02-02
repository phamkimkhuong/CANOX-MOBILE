import { IconSymbol } from '@/components/ui/Icon';
import { UserBankAccountUI } from '@/types/bank/ui';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInRight, Layout } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface BankCardItemProps {
    card: UserBankAccountUI;
    onPress?: (card: UserBankAccountUI) => void;
    onSetDefault?: (card: UserBankAccountUI) => void;
    onDelete?: (card: UserBankAccountUI) => void;
    index?: number;
}

/**
 * BankCardItem - Premium Liquid Glass Card Design
 */
export const BankCardItem: React.FC<BankCardItemProps> = memo(({
    card,
    onPress,
    onSetDefault,
    onDelete,
    index = 0
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    // Simulate card color based on bank name if no specific color is provided
    const cardGradient = card.isDefault
        ? ['rgba(79, 70, 229, 0.8)', 'rgba(99, 102, 241, 0.4)'] // Indigo/Blue for default
        : ['rgba(30, 41, 59, 0.7)', 'rgba(15, 23, 42, 0.5)'];  // Slate for others

    return (
        <Animated.View
            entering={FadeInRight.delay(index * 100).duration(500)}
            layout={Layout.springify()}
            style={styles.container}
        >
            <Pressable
                onPress={() => onPress?.(card)}
                style={({ pressed }) => [
                    styles.cardWrapper,
                    pressed && styles.pressed
                ]}
            >
                <LinearGradient
                    colors={cardGradient as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    <BlurView intensity={20} tint="light" style={styles.blurContent}>
                        {/* Header: Bank Name & Options */}
                        <View style={styles.header}>
                            <View style={styles.bankInfo}>
                                <View style={styles.logoContainer}>
                                    <IconSymbol name="account-balance" size={20} color="#FFF" />
                                </View>
                                <Text style={styles.bankName}>{card.bankDisplayName}</Text>
                            </View>

                            <Pressable
                                style={styles.moreBtn}
                                onPress={() => onSetDefault?.(card)} // Simplified for now
                            >
                                <IconSymbol name="more-horiz" size={24} color="rgba(255, 255, 255, 0.8)" />
                            </Pressable>
                        </View>

                        {/* Card Number */}
                        <View style={styles.numberContainer}>
                            <Text style={styles.cardNumber}>{card.formattedInfo}</Text>
                        </View>

                        {/* Footer: Holder & Badge */}
                        <View style={styles.footer}>
                            <View>
                                <Text style={styles.holderLabel}>CHỦ TÀI KHOẢN</Text>
                                <Text style={styles.holderName}>{card.accountHolder.toUpperCase()}</Text>
                            </View>

                            {card.isDefault && (
                                <View style={styles.defaultBadge}>
                                    <BlurView intensity={30} tint="light" style={styles.badgeBlur}>
                                        <Text style={styles.defaultText}>MẶC ĐỊNH</Text>
                                    </BlurView>
                                </View>
                            )}
                        </View>
                    </BlurView>
                </LinearGradient>

                {/* Decorative Elements - Specular Highlights */}
                <View style={styles.highlight} />
            </Pressable>
        </Animated.View>
    );
});

BankCardItem.displayName = 'BankCardItem';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        width: '100%',
        marginBottom: theme.margins.md,
    },
    cardWrapper: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
    },
    pressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.9,
    },
    gradient: {
        width: '100%',
        minHeight: 180,
    },
    blurContent: {
        flex: 1,
        padding: 20,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bankInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logoContainer: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    bankName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
        letterSpacing: 0.5,
    },
    moreBtn: {
        padding: 4,
    },
    numberContainer: {
        marginVertical: 20,
    },
    cardNumber: {
        fontSize: 22,
        fontWeight: '600',
        color: '#FFF',
        letterSpacing: 2,
        fontFamily: 'monospace', // Use monospace for numbers
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    holderLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.6)',
        marginBottom: 4,
    },
    holderName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFF',
        letterSpacing: 1,
    },
    defaultBadge: {
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    badgeBlur: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    defaultText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#FFF',
    },
    highlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
}));
