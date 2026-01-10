/**
 * ShopHeader - Molecule component for shop section header
 * 
 * Features:
 * - Shop checkbox (controlled, 3-state)
 * - Shop name with icon
 * - Mall badge (if applicable)
 * - Edit button (for bulk actions)
 * 
 * @example
 * <ShopHeader 
 *   shopName="Tech Store" 
 *   checkboxState="indeterminate"
 *   isMall={true}
 *   onToggleSelect={() => toggleShop(shopId)}
 *   onNavigateToShop={() => router.push(`/shop/${shopId}`)}
 * />
 */

import type { CheckboxState } from '@/types/cart';
import { Image } from 'expo-image';
import React, { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { IconSymbol } from '../ui/Icon';
import { CartCheckbox } from './CartCheckbox';

interface ShopHeaderProps {
    shopName: string;
    shopLogoUrl?: string | null;
    /** Checkbox state (3-state support) */
    checkboxState: CheckboxState;
    /** Is this a Mall shop? */
    isMall?: boolean;
    /** Toggle shop selection */
    onToggleSelect: () => void;
    /** Navigate to shop detail */
    onNavigateToShop?: () => void;
    /** Prefetch shop data on press in (Hybrid Pattern) */
    onShopPressIn?: () => void;
    /** Edit button pressed */
    onEditPress?: () => void;
    /** Is currently in edit mode */
    isEditMode?: boolean;
}

// ============================================
// COMPONENT
// ============================================

export const ShopHeader: React.FC<ShopHeaderProps> = memo(({
    shopName,
    shopLogoUrl,
    checkboxState,
    isMall = false,
    onToggleSelect,
    onNavigateToShop,
    onShopPressIn,
    onEditPress,
    isEditMode = false,
}) => {
    const { theme } = useUnistyles();

    return (
        <View style={styles.container}>
            {/* Checkbox */}
            <CartCheckbox
                state={checkboxState}
                onToggle={onToggleSelect}
            />

            {/* Shop Info */}
            <Pressable
                onPress={onNavigateToShop}
                onPressIn={onShopPressIn}
                style={styles.shopInfo}
                accessibilityLabel={`Xem shop ${shopName}`}
                accessibilityRole="button"
            >
                {shopLogoUrl ? (
                    <Image
                        source={{ uri: shopLogoUrl }}
                        style={styles.shopLogo}
                        contentFit="cover"
                        transition={200}
                    />
                ) : (
                    <IconSymbol
                        name="storefront"
                        size={20}
                        color={theme.colors.typography}
                    />
                )}
                <Text style={styles.shopName} numberOfLines={1}>
                    {shopName}
                </Text>

                {/* Mall Badge */}
                {isMall && (
                    <View style={styles.mallBadge}>
                        <Text style={styles.mallText}>Mall</Text>
                    </View>
                )}

                {/* Navigate Arrow */}
                {onNavigateToShop && (
                    <IconSymbol
                        name="chevron-right"
                        size={16}
                        color={theme.colors.secondary}
                    />
                )}
            </Pressable>

            {/* Edit Button */}
            {onEditPress && (
                <Pressable
                    onPress={onEditPress}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel={isEditMode ? 'Xong' : 'Sửa'}
                    accessibilityRole="button"
                >
                    <Text style={styles.editText}>
                        {isEditMode ? 'Xong' : 'Sửa'}
                    </Text>
                </Pressable>
            )}
        </View>
    );
});

ShopHeader.displayName = 'ShopHeader';

const styles = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.smd,
        paddingVertical: theme.margins.smd,
        gap: theme.margins.smd,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    shopInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    shopLogo: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.background,
    },
    shopName: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
        flex: 1,
    },
    mallBadge: {
        backgroundColor: theme.colors.error,
        borderRadius: theme.radius.s,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    mallText: {
        fontSize: 10,
        fontWeight: '700',
        color: theme.colors.onPrimary,
    },
    editText: {
        fontSize: 13,
        fontWeight: '500',
        color: theme.colors.typographySecondary,
    },
}));
