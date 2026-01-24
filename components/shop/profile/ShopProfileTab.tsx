/**
 * ==============================================
 * SHOP PROFILE TAB - Main Container Component
 * ==============================================
 *
 * Renders different layouts based on shop profile type:
 * - 'brand': Full profile with video, gallery, certifications
 * - 'verified': Business verification info + platform guarantees
 * - 'new': Platform guarantees only (onboarding template)
 */

import type { ShopHeaderUI, ShopProfileUI } from '@/types/shop';
import React, { memo } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ShopBrandStory } from './ShopBrandStory';
import { ShopBusinessInfo } from './ShopBusinessInfo';
import { ShopCommitments } from './ShopCommitments';
import { ShopGallery } from './ShopGallery';
import { ShopPlatformGuarantees } from './ShopPlatformGuarantees';
import { ShopProfileHero } from './ShopProfileHero';
import { ShopTrustBadges } from './ShopTrustBadges';

interface ShopProfileTabProps {
    shop: ShopHeaderUI;
    profile: ShopProfileUI | null;
    onVideoPress?: () => void;
}

export const ShopProfileTab = memo(({
    shop,
    profile,
    onVideoPress,
}: ShopProfileTabProps) => {
    const styles = stylesheet;

    // No profile data - show new shop template
    if (!profile || profile.type === 'new') {
        return (
            <View style={styles.container}>
                <ShopProfileHero
                    shopName={shop.name}
                    videoUrl={null}
                    imageUrl={null}
                />
                <ShopPlatformGuarantees shopName={shop.name} />
            </View>
        );
    }

    // Verified shop - show business info + guarantees
    if (profile.type === 'verified') {
        return (
            <View style={styles.container}>
                <ShopProfileHero
                    shopName={shop.name}
                    videoUrl={profile.heroVideoUrl}
                    imageUrl={profile.heroImageUrl}
                    tagline={profile.tagline}
                    onVideoPress={onVideoPress}
                />

                {profile.businessInfo && (
                    <ShopBusinessInfo info={profile.businessInfo} />
                )}

                {profile.trustBadges.length > 0 && (
                    <ShopTrustBadges badges={profile.trustBadges} />
                )}

                {profile.commitments.length > 0 && (
                    <ShopCommitments commitments={profile.commitments} />
                )}

                <ShopPlatformGuarantees shopName={shop.name} />
            </View>
        );
    }

    // Brand shop - full profile
    return (
        <View style={styles.container}>
            {/* Hero Section */}
            <ShopProfileHero
                shopName={shop.name}
                videoUrl={profile.heroVideoUrl}
                imageUrl={profile.heroImageUrl}
                tagline={profile.tagline}
                onVideoPress={onVideoPress}
            />

            {/* Brand Story */}
            {profile.brandStory && (
                <ShopBrandStory
                    story={profile.brandStory}
                    foundedYear={profile.foundedYear}
                />
            )}

            {/* Trust Badges */}
            {profile.trustBadges.length > 0 && (
                <ShopTrustBadges badges={profile.trustBadges} />
            )}

            {/* Gallery */}
            {profile.gallery.length > 0 && (
                <ShopGallery items={profile.gallery} />
            )}

            {/* Commitments */}
            {profile.commitments.length > 0 && (
                <ShopCommitments commitments={profile.commitments} />
            )}
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
