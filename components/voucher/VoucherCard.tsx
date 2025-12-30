/**
 * VoucherCard - Component thẻ voucher chính
 * 
 * Layout: FlexRow
 * - Left Section (30%): Icon/Logo + Type Label
 * - Separator: TicketSeparator (răng cưa)
 * - Right Section (70%): Title, Subtitle, Expiry, Progress, Action Button
 * 
 * Features:
 * - Support Dark Mode (backgroundColor prop)
 * - Hover effect (scale)
 * - Badge cho HOT/NEW
 * - Progress bar cho FOMO
 */

import { VOUCHER_STRINGS } from '@/constants/i18n/vi/voucher';
import type { VoucherCardProps } from '@/types/voucher';
import { VOUCHER_TYPE_CONFIG } from '@/types/voucher';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { memo, useCallback, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { TicketSeparator } from './TicketSeparator';
import { UsageProgressBar } from './UsageProgressBar';
import { VoucherBadge } from './VoucherBadge';
import { VoucherStatusButton } from './VoucherStatusButton';

const CARD_HEIGHT = 100;
const LEFT_SECTION_WIDTH = 100;
const IMAGE_PLACEHOLDER = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

/**
 * VoucherCard Component
 */
export const VoucherCard = memo<VoucherCardProps>(({
    voucher,
    onCollect,
    onUse,
    onReminder,
    onViewConditions,
    backgroundColor,
}) => {
    const { theme } = useUnistyles();

    // Get type config for colors
    const typeConfig = useMemo(() => 
        VOUCHER_TYPE_CONFIG[voucher.type] ?? VOUCHER_TYPE_CONFIG.discount,
        [voucher.type]
    );

    // Background color for ticket separator (match parent)
    const bgColor = backgroundColor ?? theme.colors.background;

    // Handle button press based on status
    const handleButtonPress = useCallback(() => {
        switch (voucher.status) {
            case 'collect':
                onCollect?.(voucher.id);
                break;
            case 'use':
                onUse?.(voucher.id);
                break;
            case 'reminder':
                onReminder?.(voucher.id);
                break;
        }
    }, [voucher.status, voucher.id, onCollect, onUse, onReminder]);

    // Handle view conditions
    const handleViewConditions = useCallback(() => {
        onViewConditions?.(voucher.id);
    }, [voucher.id, onViewConditions]);

    // Render left section content based on type
    const renderLeftContent = useMemo(() => {
        // Shop voucher with logo
        if (voucher.brandLogo) {
            return (
                <View style={styles.leftBranded}>
                    <View style={styles.brandLogoContainer}>
                        <Image
                            source={{ uri: voucher.brandLogo }}
                            style={styles.brandLogo}
                            contentFit="cover"
                            placeholder={IMAGE_PLACEHOLDER}
                            cachePolicy="memory-disk"
                        />
                    </View>
                    <Text style={styles.brandName} numberOfLines={2}>
                        {voucher.brandName ?? 'Shop'}
                    </Text>
                </View>
            );
        }

        // Platform voucher with icon
        return (
            <View style={styles.leftIconContent}>
                <MaterialIcons
                    name={typeConfig.icon as keyof typeof MaterialIcons.glyphMap}
                    size={32}
                    color={typeConfig.textColor}
                />
                <Text style={[styles.typeLabel, { color: typeConfig.textColor }]}>
                    {typeConfig.label}
                </Text>
                {voucher.tags.includes('EXTRA') && (
                    <Text style={[styles.extraLabel, { color: typeConfig.textColor }]}>
                        {VOUCHER_STRINGS.badges.extra}
                    </Text>
                )}
            </View>
        );
    }, [voucher.brandLogo, voucher.brandName, voucher.tags, typeConfig]);

    // Show progress bar only when > 50%
    const showProgress = voucher.showProgress && voucher.percentageUsed > 50;

    // Check for special badges
    const hasHotBadge = voucher.tags.includes('HOT');

    return (
        <Pressable
            style={({ pressed }) => [
                styles.container,
                pressed && styles.containerPressed,
            ]}
        >
            {/* HOT Badge */}
            {hasHotBadge && (
                <VoucherBadge variant="hot" position="topRight" />
            )}

            {/* Left Section - Type/Brand */}
            <View
                style={[
                    styles.leftSection,
                    { backgroundColor: voucher.brandLogo ? theme.colors.surface : typeConfig.bgColor },
                ]}
            >
                {renderLeftContent}

                {/* Ticket Separator integrated in left section */}
                <View style={styles.separatorContainer}>
                    <TicketSeparator
                        height={CARD_HEIGHT}
                        backgroundColor={bgColor}
                        lineColor={voucher.brandLogo ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.3)'}
                    />
                </View>
            </View>

            {/* Right Section - Content */}
            <View
                style={[
                    styles.rightSection,
                    voucher.status === 'collected' && styles.rightSectionCollected,
                ]}
            >
                {/* Title */}
                <Text
                    style={[
                        styles.title,
                        voucher.status === 'collected' && styles.titleCollected,
                    ]}
                    numberOfLines={1}
                >
                    {voucher.title}
                </Text>

                {/* Subtitle */}
                <Text style={styles.subtitle} numberOfLines={1}>
                    {voucher.subtitle}
                </Text>

                {/* Bottom Row: Expiry/Progress + Action */}
                <View style={styles.bottomRow}>
                    <View style={styles.bottomLeft}>
                        {/* Progress Bar or Expiry */}
                        {showProgress ? (
                            <UsageProgressBar
                                percentage={voucher.percentageUsed}
                                height={4}
                            />
                        ) : voucher.isExpiringSoon ? (
                            <VoucherBadge variant="expiring" />
                        ) : (
                            <Text style={styles.expiryText}>
                                {voucher.expiryText}
                            </Text>
                        )}

                        {/* Conditions link */}
                        {onViewConditions && (
                            <Pressable onPress={handleViewConditions} hitSlop={8}>
                                <Text style={styles.conditionsLink}>
                                    {VOUCHER_STRINGS.card.conditions}
                                </Text>
                            </Pressable>
                        )}
                    </View>

                    {/* Action Button */}
                    <VoucherStatusButton
                        status={voucher.status}
                        onPress={handleButtonPress}
                    />
                </View>
            </View>
        </Pressable>
    );
});

VoucherCard.displayName = 'VoucherCard';

const styles = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        height: CARD_HEIGHT,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.l,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    containerPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.95,
    },

    // Left Section
    leftSection: {
        width: LEFT_SECTION_WIDTH,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    leftIconContent: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingRight: 8, // Space for separator
    },
    leftBranded: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
        paddingRight: 16,
    },
    typeLabel: {
        fontSize: 11,
        fontWeight: '700',
        marginTop: 4,
        textAlign: 'center',
    },
    extraLabel: {
        fontSize: 9,
        fontWeight: '600',
        marginTop: 2,
        opacity: 0.9,
    },
    brandLogoContainer: {
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
        color: theme.colors.typography,
        textAlign: 'center',
        lineHeight: 11,
    },

    // Separator
    separatorContainer: {
        position: 'absolute',
        right: -8,
        top: 0,
        bottom: 0,
    },

    // Right Section
    rightSection: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
    },
    rightSectionCollected: {
        backgroundColor: theme.colors.background,
        opacity: 0.8,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
        marginBottom: 4,
    },
    titleCollected: {
        color: theme.colors.typographySecondary,
    },
    subtitle: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        marginBottom: 8,
    },

    // Bottom Row
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    bottomLeft: {
        flex: 1,
        marginRight: 8,
        gap: 4,
    },
    expiryText: {
        fontSize: 10,
        color: theme.colors.secondary,
        backgroundColor: theme.colors.background,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: theme.radius.s,
        alignSelf: 'flex-start',
    },
    conditionsLink: {
        fontSize: 10,
        color: theme.colors.info,
    },
}));

export default VoucherCard;

