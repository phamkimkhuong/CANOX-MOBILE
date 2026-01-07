/**
 * FeaturedVoucher - Thẻ voucher nổi bật (AI Pick)
 * 
 * Thiết kế đặc biệt với:
 * - Gradient border
 * - AI Pick badge
 * - Layout ngang với logo brand
 */

import { VOUCHER_STRINGS } from '@/constants/i18n/vi/voucher';
import type { FeaturedVoucherProps } from '@/types/voucher';
import { Image } from 'expo-image';
import React, { memo, useCallback, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { IconSymbol } from '../ui/Icon';


const IMAGE_PLACEHOLDER = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

export const FeaturedVoucher = memo<FeaturedVoucherProps>(({
    voucher,
    onCollect,
}) => {
    const { theme } = useUnistyles();

    const handleCollect = useCallback(() => {
        onCollect?.(voucher.id);
    }, [voucher.id, onCollect]);

    // Format expiry for featured voucher
    const expiryDisplay = useMemo(() => {
        if (voucher.isExpiringSoon) {
            return (
                <Text style={styles.expiryUrgent}>
                    {voucher.expiryText}
                </Text>
            );
        }
        return (
            <Text style={styles.expiry}>
                {voucher.expiryText}
            </Text>
        );
    }, [voucher.isExpiringSoon, voucher.expiryText]);

    return (
        <View style={styles.wrapper}>
            {/* Gradient Border Effect */}
            <View style={styles.gradientBorder}>
                <View style={styles.container}>
                    {/* Background Blur Effect */}
                    <View style={styles.blurEffect} />

                    {/* Header */}
                    <View style={styles.header}>
                        <IconSymbol
                            name="sparkles"
                            size={18}
                            color="#8b5cf6"
                        />
                        <Text style={styles.headerTitle}>
                            {VOUCHER_STRINGS.featured.title}
                        </Text>
                        <View style={styles.aiPickBadge}>
                            <Text style={styles.aiPickText}>
                                {VOUCHER_STRINGS.featured.aiPick}
                            </Text>
                        </View>
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        {/* Brand Section */}
                        <View style={styles.brandSection}>
                            <View style={styles.brandLogoWrapper}>
                                <Image
                                    source={{ uri: voucher.brandLogo ?? '' }}
                                    style={styles.brandLogo}
                                    contentFit="cover"
                                    placeholder={IMAGE_PLACEHOLDER}
                                    cachePolicy="memory-disk"
                                />
                            </View>
                            <Text style={styles.brandName} numberOfLines={1}>
                                {voucher.brandName ?? 'Brand'}
                            </Text>
                        </View>

                        {/* Info Section */}
                        <View style={styles.infoSection}>
                            <Text style={styles.title}>{voucher.title}</Text>
                            <Text style={styles.subtitle} numberOfLines={1}>
                                {voucher.subtitle}
                            </Text>
                            <View style={styles.expiryRow}>
                                <IconSymbol
                                    name="schedule"
                                    size={12}
                                    color={theme.colors.secondary}
                                />
                                {expiryDisplay}
                            </View>
                        </View>

                        {/* Action Section */}
                        <View style={styles.actionSection}>
                            <Pressable
                                style={styles.collectButton}
                                onPress={handleCollect}
                            >
                                <Text style={styles.collectButtonText}>
                                    {VOUCHER_STRINGS.actions.collect}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
});

FeaturedVoucher.displayName = 'FeaturedVoucher';

const styles = StyleSheet.create((theme) => ({
    wrapper: {
        marginHorizontal: theme.margins.md,
        marginBottom: theme.margins.md,
    },
    gradientBorder: {
        borderRadius: 20,
        padding: 1,
        backgroundColor: '#8b5cf6', // Simplified - can use LinearGradient for full effect
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 4,
    },
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: 19,
        padding: theme.margins.md,
        position: 'relative',
        overflow: 'hidden',
    },
    blurEffect: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 128,
        height: 128,
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        borderRadius: 64,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.margins.smd,
        gap: 6,
    },
    headerTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.typography,
        flex: 1,
    },
    aiPickBadge: {
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: theme.radius.full,
    },
    aiPickText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#8b5cf6',
    },

    // Content
    content: {
        flexDirection: 'row',
        alignItems: 'stretch',
        gap: 12,
    },

    // Brand Section
    brandSection: {
        width: 70,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(139, 92, 246, 0.08)',
        borderRadius: theme.radius.m,
        padding: 8,
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.15)',
    },
    brandLogoWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
        marginBottom: 4,
    },
    brandLogo: {
        width: '100%',
        height: '100%',
    },
    brandName: {
        fontSize: 9,
        fontWeight: '700',
        color: '#8b5cf6',
        textAlign: 'center',
    },

    // Info Section
    infoSection: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.typography,
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        marginBottom: 8,
    },
    expiryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    expiry: {
        fontSize: 10,
        color: theme.colors.secondary,
    },
    expiryUrgent: {
        fontSize: 10,
        color: '#ef4444',
        fontWeight: '600',
    },

    // Action Section
    actionSection: {
        justifyContent: 'center',
    },
    collectButton: {
        backgroundColor: '#8b5cf6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: theme.radius.m,
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
    },
    collectButtonText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '700',
    },
}));

export default FeaturedVoucher;

