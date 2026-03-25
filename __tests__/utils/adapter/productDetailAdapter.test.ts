jest.mock('@/utils/url', () => ({
  toPublicUrl: jest.fn((path?: string | null) => (path ? `public:${path}` : 'public:placeholder')),
  toSizedImageUrl: jest.fn((path?: string | null, _extension?: string | null, size?: string) => {
    if (!path) return undefined;
    return `sized:${path.replace('*', size ?? 'orig')}`;
  }),
}));

import type { ProductDetailResponse } from '@/types/product/productDetail';
import { transformShop } from '@/utils/adapter/product/productDetailAdapter';
import { toPublicUrl, toSizedImageUrl } from '@/utils/url';

const mockedToPublicUrl = jest.mocked(toPublicUrl);
const mockedToSizedImageUrl = jest.mocked(toSizedImageUrl);

const createShop = (
  overrides: Partial<NonNullable<ProductDetailResponse['shop']>> = {}
): NonNullable<ProductDetailResponse['shop']> => ({
  shopId: 'shop-1',
  userId: 'user-1',
  shopName: 'Hoa Sen Nam',
  description: 'Shop description',
  logoUrl: null,
  logoPath: 'public/shops/logos/2026/03/819768087662526464_*.jpg',
  bannerPath: null,
  verifyBy: null,
  username: 'hoasennam',
  rating: 4.9,
  responseRate: 98,
  responseTime: 'Trong vài phút',
  followerCount: 1200,
  productCount: 42,
  location: null,
  shop_location: 'Thành phố Hồ Chí Minh',
  lastOnline: null,
  ...overrides,
});

describe('productDetailAdapter.transformShop', () => {
  beforeEach(() => {
    mockedToPublicUrl.mockClear();
    mockedToSizedImageUrl.mockClear();
  });

  it('builds shop logo from wildcard logoPath using thumb size', () => {
    const shop = createShop();

    const result = transformShop(shop);

    expect(mockedToSizedImageUrl).toHaveBeenCalledWith(
      'public/shops/logos/2026/03/819768087662526464_*.jpg',
      null,
      'thumb'
    );
    expect(result.avatar).toBe(
      'sized:public/shops/logos/2026/03/819768087662526464_thumb.jpg'
    );
    expect(result.logoUrl).toBe(
      'sized:public/shops/logos/2026/03/819768087662526464_thumb.jpg'
    );
  });

  it('falls back to public logoUrl when sized conversion returns undefined', () => {
    mockedToSizedImageUrl.mockReturnValueOnce(undefined);

    const shop = createShop({
      logoPath: null,
      logoUrl: 'public/shops/logos/2026/03/logo.jpg',
    });

    const result = transformShop(shop);

    expect(mockedToSizedImageUrl).toHaveBeenCalledWith(
      'public/shops/logos/2026/03/logo.jpg',
      null,
      'thumb'
    );
    expect(mockedToPublicUrl).toHaveBeenCalledWith('public/shops/logos/2026/03/logo.jpg');
    expect(result.avatar).toBe('public:public/shops/logos/2026/03/logo.jpg');
    expect(result.logoUrl).toBe('public:public/shops/logos/2026/03/logo.jpg');
  });
});
