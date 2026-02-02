/**
 * UI representation of a Bank (from supported list)
 */
export interface BankSupportedUI {
    id: string;        // matches 'name' in API (e.g., "VCB")
    shortName: string; // e.g., "VCB"
    fullName: string;  // e.g., "Vietcombank"
    logoUrl?: string;
}

/**
 * UI representation of a User's Bank Account
 */
export interface UserBankAccountUI {
    id: string;
    accountNumber: string;
    accountHolder: string;
    bankName: string;
    bankDisplayName: string;
    branch?: string;
    isDefault: boolean;
    formattedInfo: string; // e.g., "VCB - ****1234"
    maskedNumber: string;  // e.g., "****1234"
}
