/**
 * AddressCard - Hiển thị một địa chỉ trong danh sách
 * 
 * Features:
 * - Mode: selection (có radio button) / management (có swipe-to-delete)
 * - Edit button hiển thị ở cả 2 mode khi onEdit được truyền
 * - Badge hiển thị: Mặc định, Nhà riêng, Văn phòng
 * - Visual feedback khi được chọn
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { AddressLabel, AddressListMode, ShippingAddress } from '@/types/address';
import { formatPhoneNumber } from '@/utils/format';
import React, { memo, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

// ============================================
// TYPES
// ============================================

interface AddressCardProps {
    address: ShippingAddress;
    mode: AddressListMode;
    /** Selected address ID (for selection mode) */
    selectedId?: string | null;
    onPress?: (address: ShippingAddress) => void;
    onEdit?: (address: ShippingAddress) => void;
}

const LABEL_CONFIG: Record<AddressLabel, { text: string; icon: string }> = {
    home: { text: 'Nhà riêng', icon: 'home-pin' },
    work: { text: 'Văn phòng', icon: 'work-outline' },
    other: { text: 'Khác', icon: 'location-outline' },
};

// ============================================
// COMPONENT
// ============================================

export const AddressCard: React.FC<AddressCardProps> = memo(({
    address,
    mode,
    selectedId,
    onPress,
    onEdit,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const isSelected = mode === 'selection' && selectedId === address.id;
    const labelConfig = LABEL_CONFIG[address.label];

    // Format full address string
    const fullAddress = [
        address.streetAddress,
        address.wardName,
        address.provinceName,
    ]
        .filter(Boolean)
        .join(', ');

    const handlePress = useCallback(() => {
        onPress?.(address);
    }, [address, onPress]);

    const handleEdit = useCallback(() => {
        onEdit?.(address);
    }, [address, onEdit]);

    return (
        <Pressable
            onPress={handlePress}
            style={({ pressed }) => [
                styles.container,
                isSelected && styles.containerSelected,
                pressed && styles.containerPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Địa chỉ của ${address.recipientName}`}
            accessibilityState={{ selected: isSelected }}
        >
            {/* Left: Icon or Radio Button */}
            <View style={styles.leftColumn}>
                {mode === 'selection' ? (
                    <IconSymbol
                        name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                        size={24}
                        color={isSelected ? theme.colors.primary : theme.colors.secondary}
                    />
                ) : (
                    <View
                        style={[
                            styles.iconContainer,
                            address.isDefault && styles.iconContainerDefault,
                        ]}
                    >
                        <IconSymbol
                            name={labelConfig.icon as never}
                            size={20}
                            color={
                                address.isDefault
                                    ? theme.colors.primary
                                    : theme.colors.secondary
                            }
                        />
                    </View>
                )}
            </View>

            {/* Center: Content */}
            <View style={styles.content}>
                {/* Name & Phone */}
                <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>
                        {address.recipientName}
                    </Text>
                    <View style={styles.divider} />
                    <Text style={styles.phone}>
                        {formatPhoneNumber(address.phone)}
                    </Text>
                </View>

                {/* Full Address */}
                <Text style={styles.address} numberOfLines={2}>
                    {fullAddress}
                </Text>

                {/* Badges */}
                <View style={styles.badgeRow}>
                    {address.isDefault && (
                        <View style={[styles.badge, styles.badgeDefault]}>
                            <Text style={styles.badgeTextDefault}>Mặc định</Text>
                        </View>
                    )}
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{labelConfig.text}</Text>
                    </View>
                </View>
            </View>

            {/* Right: Edit Button */}
            {onEdit && (
                <Pressable
                    onPress={handleEdit}
                    style={styles.editButton}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Sửa địa chỉ"
                >
                    <IconSymbol
                        name="edit-square"
                        size={20}
                        color={theme.colors.primary}
                    />
                </Pressable>
            )}
        </Pressable>
    );
});

AddressCard.displayName = 'AddressCard';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.l,
        padding: theme.margins.md,
        gap: theme.margins.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    containerSelected: {
        borderColor: theme.colors.primary,
        borderWidth: 1.5,
        backgroundColor: theme.colors.primaryMuted,
    },
    containerPressed: {
        opacity: 0.7,
    },

    leftColumn: {
        paddingTop: 2,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.backgroundSurface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainerDefault: {
        backgroundColor: theme.colors.primaryLight,
    },

    content: {
        flex: 1,
        gap: theme.margins.sm,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
    },
    name: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.typography,
        flexShrink: 1,
    },
    divider: {
        width: 1,
        height: 14,
        backgroundColor: theme.colors.border,
    },
    phone: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
        fontWeight: '500',
    },
    address: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
        lineHeight: 18,
    },

    badgeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.margins.sm,
        marginTop: 4,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: theme.radius.s,
        backgroundColor: theme.colors.backgroundSurface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    badgeDefault: {
        backgroundColor: theme.colors.primaryLight,
        borderColor: theme.colors.primarySoft,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '500',
        color: theme.colors.typographySecondary,
    },
    badgeTextDefault: {
        fontSize: 11,
        fontWeight: '500',
        color: theme.colors.primary,
    },

    editButton: {
        padding: theme.margins.sm,
        marginRight: -theme.margins.sm,
        marginTop: -theme.margins.sm,
    },
}));
