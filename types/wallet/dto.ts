/**
 * ==============================================
 * WALLET DTO TYPES - API Response Structures
 * ==============================================
 */

export type WalletStatus = 'ACTIVE' | 'FROZEN' | 'CLOSED';
export type WalletType = 'PLATFORM' | 'SHOP' | 'BUYER';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type TransactionType = 'DEPOSIT' | 'WITHDRAW' | 'PAYMENT' | 'REFUND' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'ADJUSTMENT_INCREASE' | 'ADJUSTMENT_DECREASE';
export type ReferenceType = 'ORDER' | 'PAYMENT' | 'WITHDRAWAL_REQUEST' | 'REFUND' | 'COMMISSION' | 'ADJUSTMENT' | 'TRANSFER' | 'VOUCHER';

export interface WalletResponseDTO {
    id: string;
    userId: string;
    username: string;
    balance: number;
    temporaryBalance: number;
    totalDeposited: number;
    totalWithdrawn: number;
    status: WalletStatus;
    note?: string;
    type: WalletType;
    createdDate: string;
    lastModifiedDate: string;
    mustChangePassword: boolean;
}

export interface WalletTransactionDTO {
    id: string;
    walletId: string;
    type: TransactionType;
    status: TransactionStatus;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    description?: string;
    referenceId?: string;
    referenceType?: ReferenceType;
    note?: string;
    createdDate: string;
}

export interface WalletWithdrawalRequestDTO {
    id: string;
    walletId: string;
    amount: number;
    bankAccountId: string;
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    reason?: string;
    createdDate: string;
}
