import { Banner, BannerUI } from '@/types/banner';
import { toPublicUrl, toSizedImageUrl } from '@/utils/url';

/**
 * Transform API Banner to UI Banner model
 * Only maps fields that are actually used by the UI components.
 */
export function toBannerUI(banner: Banner, isMobile = true): BannerUI {
    const rawPath = isMobile
        ? (banner.imagePathMobile || banner.imagePath || banner.imagePathDesktop)
        : (banner.imagePathDesktop || banner.imagePath || banner.imagePathMobile);

    let imageUrl = '';

    if (rawPath) {
        imageUrl = toSizedImageUrl(rawPath, null, 'orig') || toPublicUrl(rawPath);
    } else {
        const assetId = isMobile
            ? (banner.imageAssetIdMobile || banner.imageAssetId || banner.imageAssetIdDesktop || '')
            : (banner.imageAssetIdDesktop || banner.imageAssetId || banner.imageAssetIdMobile || '');

        imageUrl = assetId ? toPublicUrl(`public/assets/${assetId}`) : '';
    }

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
