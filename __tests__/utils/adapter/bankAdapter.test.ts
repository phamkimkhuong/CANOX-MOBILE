import type { UserBankAccountDTO } from '@/types/bank/dto';
import {
  transformSupportedBank,
  transformUserBankAccount,
} from '@/utils/adapter/bankAdapter';

describe('bankAdapter', () => {
  it('falls back to name/fullname for inconsistent API keys', () => {
    const result = transformSupportedBank({
      name: 'ACB',
      fullname: 'Asia Commercial Bank',
    });

    expect(result.id).toBe('ACB');
    expect(result.shortName).toBe('ACB');
    expect(result.fullName).toBe('Asia Commercial Bank');
  });

  it('maps user bank account DTO and normalizes nullable branch', () => {
    const dto: UserBankAccountDTO = {
      bankAccountId: 'bank-1',
      accountType: 'BUYER',
      bankAccountNumber: '1234567890',
      bankName: 'VCB',
      bankAccountHolder: 'Alice',
      branch: null,
      default: true,
      deleted: false,
    };

    const result = transformUserBankAccount(dto);

    expect(result).toEqual({
      id: 'bank-1',
      accountNumber: '1234567890',
      accountHolder: 'Alice',
      bankName: 'VCB',
      bankDisplayName: 'VCB',
      branch: undefined,
      isDefault: true,
      formattedInfo: 'VCB - 1234567890',
      maskedNumber: '1234567890',
    });
  });
});
