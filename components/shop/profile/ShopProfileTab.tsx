/**
 * ==============================================
 * SHOP PROFILE TAB - Main Container Component
 * ==============================================
 *
 * Renders shop identity content based on API Spec v1.0.0:
 * - identity: Visual branding
 * - legal: Business verification
 * - brandStory: Widget-based sections (VIDEO_INTRO, RICH_TEXT, etc.)
 * - support: Customer service info
 *
 * @see shopHomeDesign/SHOP_IDENTITY_API_SPEC.md
 */

import type { ShopHeaderUI, ShopProductItemUI } from '@/types/shop';
import type { GalleryGridItem, ShopIdentityResponseData } from '@/types/shop/shopIdentity';
import { createLogger } from '@/utils/logger';
import React, { memo, useCallback } from 'react';
import { Linking, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { StyleSheet } from 'react-native-unistyles';

const log = createLogger('ShopProfileTab');

import { BrandStorySections } from './BrandStorySections';
import { ShopFeaturedProducts } from './ShopFeaturedProducts';
import ShopLegalInfo from './ShopLegalInfo';
import { ShopPlatformGuarantees } from './ShopPlatformGuarantees';
import { ShopProfileHero } from './ShopProfileHero';
import ShopSupportInfo from './ShopSupportInfo';

interface ShopProfileTabProps {
    shop: ShopHeaderUI;
    /** New API Spec identity data */
    identityData: ShopIdentityResponseData | null;
    products?: ShopProductItemUI[];
    onVideoPress?: (url: string) => void;
}

export const ShopProfileTab = memo(({
    shop,
    identityData,
    products = [],
    onVideoPress,
}: ShopProfileTabProps) => {
    const styles = stylesheet;

    // Handle opening URLs
    const handleOpenUrl = useCallback((url: string) => {
        Linking.openURL(url).catch(() => {
            Toast.show({
                type: 'error',
                text1: 'Không thể mở liên kết',
            });
        });
    }, []);

    // Handle video press
    const handleVideoPress = useCallback((url: string) => {
        if (onVideoPress) {
            onVideoPress(url);
        } else {
            // Default: open in browser
            handleOpenUrl(url);
        }
    }, [onVideoPress, handleOpenUrl]);

    // Handle image press (open lightbox or browser)
    const handleImagePress = useCallback((url: string) => {
        // TODO: Implement image lightbox
        log.debug('Open image:', url);
    }, []);

    // Handle gallery item press
    const handleGalleryItemPress = useCallback((item: GalleryGridItem) => {
        if (item.clickAction) {
            const action = item.clickAction;
            switch (action.type) {
                case 'EXTERNAL_WEB':
                    handleOpenUrl(action.payload.url);
                    break;
                case 'VIEW_IMAGE':
                    handleImagePress(action.payload.imageUrl);
                    break;
                case 'INTERNAL_ROUTE':
                    // TODO: Implement internal navigation
                    log.debug('Navigate to:', action.payload.screen, action.payload.params);
                    break;
            }
        } else if (item.originalUrl) {
            handleImagePress(item.originalUrl);
        }
    }, [handleOpenUrl, handleImagePress]);

    // Common footer (Featured Products) for all shop types
    const renderFeaturedProducts = () => (
        products.length > 0 && <ShopFeaturedProducts products={products} />
    );

    // No identity data - show basic template with platform guarantees
    if (!identityData) {
        return (
            <View style={styles.container}>
                <ShopProfileHero
                    shopName={shop.name}
                    videoUrl={null}
                    imageUrl={shop.bannerUrl}
                />
                <ShopPlatformGuarantees shopName={shop.name} />
                {renderFeaturedProducts()}
            </View>
        );
    }

    const { identity, legal, brandStory, support } = identityData;

    // Check if this is an official/mall shop
    const isOfficial = legal?.isOfficial || legal?.isMall;

    return (
        <View style={styles.container}>
            {/* Hero Section - Cover Image & Tagline */}
            <ShopProfileHero
                shopName={identity.shopName}
                videoUrl={null}
                imageUrl={identity.coverMobileUrl || identity.coverDesktopUrl || shop.bannerUrl}
                tagline={identity.tagline}
            />

            {/* Brand Story Sections (Widget-based) */}
            {brandStory && brandStory.sections.length > 0 && (
                <BrandStorySections
                    brandStory={brandStory}
                    onVideoPress={handleVideoPress}
                    onImagePress={handleImagePress}
                    onGalleryItemPress={handleGalleryItemPress}
                />
            )}

            {/* Legal & Company Info (for Official/Mall shops) */}
            {isOfficial && legal && (
                <ShopLegalInfo legal={legal} />
            )}

            {/* Support & Contact Info */}
            {support && (support.hotline || support.supportEmail) && (
                <ShopSupportInfo support={support} />
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
}));

export default ShopProfileTab;
