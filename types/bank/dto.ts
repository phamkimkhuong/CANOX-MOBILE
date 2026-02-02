/**
 * ==============================================
 * BANK DTO TYPES - API Response Structures
 * ==============================================
 */

export type BankAccountType = 'SHOP' | 'BUYER' | 'ADMIN';

export interface BankResponseDTO {
    name: string;      // e.g. "VCB"
    fullname: string;  // e.g. "Vietcombank"
}

export interface UserBankAccountDTO {
    bankAccountId: string;
    userId: string;
    accountType: BankAccountType;
    bankAccountNumber: string;
    bankName: string;
    bankAccountHolder: string;
    branch?: string | null;
    default: boolean;
    deleted: boolean;
    createdDate?: string | null;
}

export interface BankAccountInitVerificationDTO {
    verificationId: string;
    timeoutSeconds: number;
}
