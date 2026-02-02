import { UserBankAccountDTO } from '@/types/bank/dto';
import { BankSupportedUI, UserBankAccountUI } from '@/types/bank/ui';

/**
 * Transform Map<String, String> from API -> BankSupportedUI
 * Raw data: { "name": "VCB", "fullname": "Ngân hàng TMCP Ngoại thương" }
 */
export const transformSupportedBank = (raw: Record<string, string>): BankSupportedUI => {
    return {
        id: raw.code || raw.name || '',
        shortName: raw.shortName || raw.name || '',
        fullName: raw.fullName || raw.fullname || '',
        // Logo can be constructed or mapped later
    };
};

/**
 * Transform UserBankAccountDTO -> UI
 */
export const transformUserBankAccount = (dto: UserBankAccountDTO): UserBankAccountUI => {
    // Mask account number: e.g. "0987123456" -> "****3456"
    const maskedNumber = dto.bankAccountNumber.length > 4
        ? `****${dto.bankAccountNumber.slice(-4)}`
        : dto.bankAccountNumber;

    return {
        id: dto.bankAccountId,
        accountNumber: dto.bankAccountNumber,
        accountHolder: dto.bankAccountHolder,
        bankName: dto.bankName,
        bankDisplayName: dto.bankName, // Could be mapped to full name if we have the list
        branch: dto.branch || undefined,
        isDefault: dto.default,
        formattedInfo: `${dto.bankName} - ${maskedNumber}`,
        maskedNumber,
    };
};
