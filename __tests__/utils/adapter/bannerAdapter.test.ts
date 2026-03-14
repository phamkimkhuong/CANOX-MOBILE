import type { Banner } from '@/types/banner';
import { toBannerUI, toBannerUIList } from '@/utils/adapter/bannerAdapter';

const createBanner = (overrides: Partial<Banner> = {}): Banner => ({
  id: 'banner-1',
  title: 'Promo',
  href: '/promo',
  imageAssetId: 'asset-default',
  imageAssetIdMobile: 'asset-mobile',
  imageAssetIdDesktop: 'asset-desktop',
  imagePath: null,
  ...overrides,
});

describe('bannerAdapter', () => {
  it('uses mobile asset priority for mobile banners', () => {
    const banner = createBanner();
    const result = toBannerUI(banner, true);

    expect(result.imageUrl).toBe('https://api.calatha.com/v1/public/assets/asset-mobile');
    expect(result.id).toBe('banner-1');
    expect(result.href).toBe('/promo');
  });

  it('falls back to imagePath when no asset id exists and filters empty banners in list', () => {
    const withPath = createBanner({
      id: 'with-path',
      imageAssetId: null,
      imageAssetIdMobile: null,
      imageAssetIdDesktop: null,
      imagePath: 'images/banner.png',
    });
    const empty = createBanner({
      id: 'empty',
      imageAssetId: null,
      imageAssetIdMobile: null,
      imageAssetIdDesktop: null,
      imagePath: null,
    });

    const single = toBannerUI(withPath);
    const list = toBannerUIList([withPath, empty]);

    expect(single.imageUrl).toBe('https://api.calatha.com/images/banner.png');
    expect(list).toHaveLength(1);
    expect(list[0]?.id).toBe('with-path');
  });
});
