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
import { formatShippingAddress } from '@/utils/adapter/addressAdapter';
import { formatPhoneNumber } from '@/utils/format';
import React, { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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

export const AddressCard: React.FC<AddressCardProps> = memo(({
    address,
    mode,
    selectedId,
    onPress,
    onEdit,
}) => {
    const { t } = useTranslation(['address']);
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const labels: Record<AddressLabel, { text: string; icon: string }> = useMemo(() => ({
        home: { text: t('address:form.label.home'), icon: 'home' },
        work: { text: t('address:form.label.work'), icon: 'work' },
        other: { text: t('address:form.label.other'), icon: 'location-outline' },
    }), [t]);

    const isSelected = mode === 'selection' && selectedId === address.id;
    const labelConfig = labels[address.label];

    // Format full address string
    const fullAddress = useMemo(() => formatShippingAddress(address), [address]);

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
                        color={isSelected ? theme.colors.newPrimary : theme.colors.secondary}
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
                                    ? theme.colors.typography
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
                            <Text style={styles.badgeTextDefault}>{t('address:list.defaultBadge')}</Text>
                        </View>
                    )}
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{labelConfig.text}</Text>
                    </View>
                </View>
            </View>

            {/* Right: Edit Button */}
            {onEdit && mode !== 'management' && (
                <Pressable
                    onPress={handleEdit}
                    style={({ pressed }) => [
                        styles.editButton,
                        pressed && styles.editButtonPressed
                    ]}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel="Sửa địa chỉ"
                >
                    <Text style={styles.editButtonText}>{t('address:form.actions.submitUpdate')}</Text>
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
        borderColor: theme.colors.typography,
        borderWidth: 0.7,
        backgroundColor: theme.colors.surface,
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
        backgroundColor: theme.colors.secondarySoft,
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
        backgroundColor: theme.colors.backgroundNewSurface,
        borderColor: theme.colors.border,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '500',
        color: theme.colors.typographySecondary,
    },
    badgeTextDefault: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.typography,
    },

    editButton: {
        paddingHorizontal: theme.margins.md,
        paddingVertical: 6,
        borderRadius: theme.radius.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-start',
        minWidth: 60,
    },
    editButtonPressed: {
        backgroundColor: theme.colors.backgroundNewSurface || 'rgba(0,0,0,0.05)',
        borderColor: theme.colors.secondary,
    },
    editButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.typography,
    },
}));
