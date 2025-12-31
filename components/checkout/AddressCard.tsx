/**
 * AddressCard Component
 * 
 * Displays the delivery address with airmail-style decoration.
 * Features:
 * - Red/blue diagonal stripes border (airmail style)
 * - Map pin icon
 * - Tap to edit address
 * - Empty state when no address
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { DeliveryAddress } from '@/types/checkout';
import { formatFullAddress } from '@/types/checkout';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface AddressCardProps {
    address: DeliveryAddress | null;
    onPress?: () => void;
}

export const AddressCard: React.FC<AddressCardProps> = ({ address, onPress }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const router = useRouter();

    const handlePress = () => {
        if (onPress) {
            onPress();
        } else {
            // Default: navigate to address selection
            router.push('/(main)/address/list' as never);
        }
    };

    return (
        <View style={styles.container}>
            {/* Airmail Stripe Top */}
            <View style={styles.airmailStripe}>
                {Array.from({ length: 20 }).map((_, index) => (
                    <View
                        key={`stripe-${index}`}
                        style={[
                            styles.stripeBlock,
                            { backgroundColor: index % 2 === 0 ? theme.colors.error : theme.colors.primary },
                        ]}
                    />
                ))}
            </View>

            {/* Content */}
            <Pressable
                style={({ pressed }) => [
                    styles.content,
                    pressed && styles.contentPressed,
                ]}
                onPress={handlePress}
                accessibilityRole="button"
                accessibilityLabel={address ? 'Thay đổi địa chỉ giao hàng' : 'Thêm địa chỉ giao hàng'}
            >
                {/* Location Icon with modern wrapper */}
                <View style={styles.iconContainer}>
                    <IconSymbol
                        name="location"
                        size={22}
                        color={theme.colors.error}
                    />
                </View>

                {/* Address Info */}
                <View style={styles.infoContainer}>
                    {address ? (
                        <>
                            {/* Label */}
                            <Text style={styles.label}>Địa Chỉ Nhận Hàng</Text>

                            {/* Name + Phone */}
                            <View style={styles.nameRow}>
                                <Text style={styles.name} numberOfLines={1}>
                                    {address.recipientName}
                                </Text>
                                <View style={styles.divider} />
                                <Text style={styles.phone}>{address.phoneNumber}</Text>
                            </View>

                            {/* Full Address */}
                            <Text style={styles.address} numberOfLines={2}>
                                {formatFullAddress(address)}
                            </Text>
                        </>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <IconSymbol
                                name="add-circle-outline"
                                size={20}
                                color={theme.colors.primary}
                            />
                            <Text style={styles.emptyText}>
                                Thêm địa chỉ giao hàng
                            </Text>
                        </View>
                    )}
                </View>

                {/* Arrow */}
                <IconSymbol
                    name="chevron-right"
                    size={20}
                    color={theme.colors.typographySecondary}
                />
            </Pressable>

            {/* Airmail Stripe Bottom */}
            <View style={styles.airmailStripe}>
                {Array.from({ length: 20 }).map((_, index) => (
                    <View
                        key={`stripe-bottom-${index}`}
                        style={[
                            styles.stripeBlock,
                            { backgroundColor: index % 2 === 0 ? theme.colors.error : theme.colors.primary },
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        overflow: 'hidden',
    },

    airmailStripe: {
        flexDirection: 'row',
        height: 4,
    },

    stripeBlock: {
        flex: 1,
        height: 4,
        transform: [{ skewX: '-20deg' }],
        marginHorizontal: -1,
    },

    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.margins.lg,
        paddingHorizontal: theme.margins.md,
    },

    contentPressed: {
        backgroundColor: theme.colors.background,
    },

    iconContainer: {
        width: 32,
        alignItems: 'center',
    },

    infoContainer: {
        flex: 1,
        marginLeft: theme.margins.sm,
        marginRight: theme.margins.sm,
    },

    label: {
        fontSize: 12,
        fontWeight: '500',
        color: theme.colors.typographySecondary,
        marginBottom: 4,
    },

    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },

    name: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
        flexShrink: 1,
    },

    divider: {
        width: 1,
        height: 14,
        backgroundColor: theme.colors.border,
        marginHorizontal: theme.margins.sm,
    },

    phone: {
        fontSize: 14,
        color: theme.colors.typography,
    },

    address: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
        lineHeight: 18,
    },

    emptyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
    },

    emptyText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.primary,
    },
}));

export default AddressCard;
