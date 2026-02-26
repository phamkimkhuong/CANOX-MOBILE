import { Banner, BannerUI } from '@/types/banner';

/**
 * Transform API Banner to UI Banner model
 * Only maps fields that are actually used by the UI components.
 */
export function toBannerUI(banner: Banner, isMobile = true): BannerUI {
    const assetId = isMobile
        ? (banner.imageAssetIdMobile || banner.imageAssetId || banner.imageAssetIdDesktop || '')
        : (banner.imageAssetIdDesktop || banner.imageAssetId || banner.imageAssetIdMobile || '');

    const imageUrl = assetId
        ? `https://api.calatha.com/v1/public/assets/${assetId}`
        : (banner.imagePath ? `https://api.calatha.com/${banner.imagePath}` : '');

    return {
        id: banner.id,
        imageUrl,
        href: banner.href || undefined,
        title: banner.title || undefined,
        aspectRatio: 1,
    };
}

export function toBannerUIList(banners: Banner[], isMobile = true): BannerUI[] {
    return banners
        .map(banner => toBannerUI(banner, isMobile))
        .filter(b => !!b.imageUrl);
}
