import type { BuyerAddressDTO, ShippingAddress } from '@/types/address';
import {
  formatShippingAddress,
  toBuyerAddressListUI,
  toBuyerAddressUI,
} from '@/utils/adapter/addressAdapter';

const createAddressDTO = (overrides: Partial<BuyerAddressDTO> = {}): BuyerAddressDTO => ({
  addressId: 'addr-1',
  recipientName: 'Alice',
  phone: '0900000000',
  address: {
    country: 'Viet Nam',
    province: 'Ho Chi Minh',
    district: 'District 1',
    ward: 'Ben Nghe',
    detail: '123 Le Loi',
    isInternational: false,
  },
  type: 'HOME',
  isDefault: true,
  createdDate: '2026-01-01',
  lastModifiedDate: '2026-01-02',
  ...overrides,
});

describe('addressAdapter', () => {
  it('maps BuyerAddressDTO to ShippingAddress with type conversion', () => {
    const dto = createAddressDTO();
    const result = toBuyerAddressUI(dto);

    expect(result).toEqual({
      id: 'addr-1',
      recipientName: 'Alice',
      phone: '0900000000',
      streetAddress: '123 Le Loi',
      wardCode: '',
      wardName: 'Ben Nghe',
      districtName: 'District 1',
      provinceCode: '',
      provinceName: 'Ho Chi Minh',
      countryName: 'Viet Nam',
      label: 'home',
      isDefault: true,
      isInternational: false,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-02',
    });
  });

  it('applies safe defaults when optional nested fields are missing', () => {
    const dto = createAddressDTO({
      address: {
        country: 'Viet Nam',
        province: 'Da Nang',
        ward: 'Hai Chau',
        detail: null,
      },
      type: 'OTHER',
    });

    const result = toBuyerAddressUI(dto);

    expect(result.streetAddress).toBe('');
    expect(result.districtName).toBe('');
    expect(result.isInternational).toBe(false);
    expect(result.label).toBe('other');
  });

  it('maps list of DTOs', () => {
    const list = toBuyerAddressListUI([
      createAddressDTO({ addressId: 'a-1' }),
      createAddressDTO({ addressId: 'a-2', type: 'OFFICE' }),
    ]);

    expect(list).toHaveLength(2);
    expect(list[0]?.id).toBe('a-1');
    expect(list[1]?.label).toBe('work');
  });

  it('formats shipping address and removes blank/null-like parts', () => {
    const address: ShippingAddress = {
      id: 'x',
      recipientName: 'Alice',
      phone: '0900000000',
      streetAddress: ' 123 Le Loi ',
      wardName: 'null',
      districtName: 'District 1',
      provinceName: ' undefined ',
      countryName: 'Viet Nam',
      label: 'home',
      isDefault: false,
      isInternational: false,
    };

    expect(formatShippingAddress(address)).toBe('123 Le Loi, District 1');
  });
});
