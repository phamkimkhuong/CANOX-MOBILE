/**
 * ==============================================
 * SHOP PROFILE TAB - Main Container Component
 * ==============================================
 *
 * Renders shop brand profile from real API:
 * - aboutUs: Shop description / brand story
 * - videoIntro: Video introduction
 * - gallery: Media gallery
 * - companyName, registrationNumber, foundedYear: Legal info
 *
 * Endpoint: GET /api/v1/public/shops/{shopId}/brand-profile
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { ShopBrandProfileUI, ShopGalleryItem, ShopHeaderUI, ShopProductItemUI } from '@/types/shop';
import { Navigator } from '@/utils/navigation';
import React, { memo, useCallback } from 'react';
import { Linking, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { ShopFeaturedProducts } from './ShopFeaturedProducts';
import { ShopGallery } from './ShopGallery';
import { ShopPlatformGuarantees } from './ShopPlatformGuarantees';
import { ShopProfileHero } from './ShopProfileHero';

interface ShopProfileTabProps {
    shop: ShopHeaderUI;
    /** Brand profile data from API */
    brandProfile: ShopBrandProfileUI | null;
    products?: ShopProductItemUI[];
    onVideoPress?: (url: string) => void;
}

export const ShopProfileTab = memo(({
    shop,
    brandProfile,
    products = [],
    onVideoPress,
}: ShopProfileTabProps) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    // Handle video press
    const handleVideoPress = useCallback((url: string) => {
        if (onVideoPress) {
            onVideoPress(url);
        } else {
            Linking.openURL(url).catch(() => {
                Toast.show({ type: 'error', text1: 'Không thể mở liên kết' });
            });
        }
    }, [onVideoPress]);

    // Handle gallery item press → open gallery viewer
    const handleGalleryItemPress = useCallback((item: ShopGalleryItem) => {
        if (item.type === 'image' && brandProfile?.gallery) {
            const imageUrls = brandProfile.gallery
                .filter(g => g.type === 'image')
                .map(g => g.url);
            const initialIndex = imageUrls.indexOf(item.url);
            if (initialIndex !== -1) {
                Navigator.push({
                    pathname: '/common/gallery',
                    params: {
                        images: JSON.stringify(imageUrls),
                        initialIndex: initialIndex.toString(),
                    },
                });
            }
        }
    }, [brandProfile?.gallery]);

    // Convert brand gallery → ShopGalleryItem for the existing ShopGallery component
    const galleryItems: ShopGalleryItem[] = (brandProfile?.gallery ?? []).map(g => ({
        id: g.id,
        type: g.type,
        url: g.url,
        caption: g.title ?? undefined,
    }));

    // Compute years of operation
    const yearsInOperation = brandProfile?.foundedYear
        ? new Date().getFullYear() - brandProfile.foundedYear
        : null;

    const renderFeaturedProducts = () => (
        products.length > 0 && <ShopFeaturedProducts products={products} />
    );

    return (
        <View style={styles.container}>
            {/* Hero Section */}
            <ShopProfileHero
                shopName={shop.name}
                videoUrl={brandProfile?.videoIntroUrl}
                imageUrl={shop.bannerUrl}
                onVideoPress={brandProfile?.videoIntroUrl
                    ? () => handleVideoPress(brandProfile.videoIntroUrl!)
                    : undefined}
            />

            {/* About Us */}
            {brandProfile?.aboutUs && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <IconSymbol name="info-outline" size={18} color={theme.colors.primary} />
                        <Text style={styles.sectionTitle}>Giới thiệu</Text>
                    </View>
                    <Text style={styles.aboutText}>{brandProfile.aboutUs}</Text>
                </View>
            )}

            {/* Gallery */}
            {galleryItems.length > 0 && (
                <ShopGallery
                    items={galleryItems}
                    title="Hình ảnh"
                    onItemPress={handleGalleryItemPress}
                />
            )}

            {/* Company / Legal Info */}
            {brandProfile?.companyName && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <IconSymbol name="business" size={18} color={theme.colors.primary} />
                        <Text style={styles.sectionTitle}>Thông tin doanh nghiệp</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Tên công ty</Text>
                        <Text style={styles.infoValue}>{brandProfile.companyName}</Text>
                    </View>
                    {brandProfile.registrationNumber && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Số ĐKKD</Text>
                            <Text style={styles.infoValue}>{brandProfile.registrationNumber}</Text>
                        </View>
                    )}
                    {yearsInOperation != null && yearsInOperation > 0 && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Thâm niên</Text>
                            <Text style={styles.infoValue}>
                                {yearsInOperation} năm (từ {brandProfile.foundedYear})
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {/* Platform Guarantees (always shown) */}
            <ShopPlatformGuarantees shopName={shop.name} />

            {/* Featured Products */}
            {renderFeaturedProducts()}
        </View>
    );
});

ShopProfileTab.displayName = 'ShopProfileTab';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.md,
        gap: theme.margins.md,
    },
    section: {
        backgroundColor: theme.colors.surface,
        borderRadius: 24,
        padding: theme.margins.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.xs,
        marginBottom: theme.margins.sm,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.typography,
        letterSpacing: -0.5,
    },
    aboutText: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
        lineHeight: 20,
    },
    infoRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderMuted,
    },
    infoLabel: {
        width: 100,
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.typographySecondary,
    },
    infoValue: {
        flex: 1,
        fontSize: 13,
        color: theme.colors.typography,
        fontWeight: '700',
    },
}));

export default ShopProfileTab;
