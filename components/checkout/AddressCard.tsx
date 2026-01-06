/**
 * AddressCard Component
 * 
 * Displays the delivery address with premium styling.
 * Features:
 * - Primary-colored background (primaryMuted)
 * - Circular icon with primaryLight background
 * - "Default" badge when address is default
 * - Tap to edit address
 * - Empty state when no address
 */

import { IconSymbol } from '@/components/ui/Icon';
import { ROUTES, href } from '@/constants/routes';
import type { ShippingAddress } from '@/types/address';
import { formatShippingAddress } from '@/utils/adapter/addressAdapter';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface AddressCardProps {
    address: ShippingAddress | null;
    onPress?: () => void;
}

/**
 * AddressCard - Premium styled address display component
 * 
 * Used in Checkout screen to show delivery address.
 * Applies Cart-style design with primaryMuted background.
 */
export const AddressCard: React.FC<AddressCardProps> = ({ address, onPress }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const router = useRouter();

    /**
     * Handle card press - navigate to address selection or call custom handler
     */
    const handlePress = () => {
        if (onPress) {
            onPress();
        } else {
            router.push(href(ROUTES.ADDRESS.LIST));
        }
    };

    return (
        <Pressable
            onPress={handlePress}
            style={({ pressed }) => [
                styles.container,
                pressed && styles.containerPressed,
            ]}
            accessibilityLabel={address ? 'Thay đổi địa chỉ giao hàng' : 'Thêm địa chỉ giao hàng'}
            accessibilityRole="button"
        >
            {/* Location Icon with circular background */}
            <View style={styles.iconWrapper}>
                <IconSymbol
                    name="location-on"
                    size={18}
                    color={theme.colors.primary}
                />
            </View>

            {/* Address Content */}
            <View style={styles.contentContainer}>
                {address ? (
                    <>
                        {/* Title row with optional default badge */}
                        <View style={styles.titleRow}>
                            <Text style={styles.title}>
                                Giao tới: {address.recipientName}
                            </Text>
                            {address.isDefault && (
                                <View style={styles.defaultBadge}>
                                    <Text style={styles.defaultBadgeText}>Mặc định</Text>
                                </View>
                            )}
                        </View>

                        {/* Phone number */}
                        <Text style={styles.phone}>{address.phone}</Text>

                        {/* Full address */}
                        <Text style={styles.addressText} numberOfLines={1}>
                            {formatShippingAddress(address)}
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

            {/* Chevron arrow */}
            <IconSymbol
                name="chevron-right"
                size={20}
                color={theme.colors.typographySecondary}
            />
        </Pressable>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.sm,
        backgroundColor: theme.colors.primaryMuted,
        gap: theme.margins.smd,
    },

    containerPressed: {
        backgroundColor: theme.colors.primarySubtle,
    },

    iconWrapper: {
        width: 32,
        height: 32,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },

    contentContainer: {
        flex: 1,
    },

    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
    },

    title: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.typography,
    },

    defaultBadge: {
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: theme.radius.s,
    },

    defaultBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: theme.colors.primary,
        textTransform: 'uppercase',
    },

    phone: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        marginTop: 2,
    },

    addressText: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        marginTop: 2,
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
