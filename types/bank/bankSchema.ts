import { z } from 'zod';
import { ResponseDefaultSchema } from '../responseSchema';

// ============================================
// BANK CORE SCHEMAS
// ============================================

export const UserBankAccountSchema = z.object({
    bankAccountId: z.string().catch(''),
    userId: z.string().catch(''),
    accountType: z.enum(['SHOP', 'BUYER', 'ADMIN']).catch('BUYER'),
    bankAccountNumber: z.string().catch(''),
    bankName: z.string().catch(''),
    bankAccountHolder: z.string().catch(''),
    branch: z.string().nullish(),
    default: z.boolean().nullish().transform(val => !!val),
    deleted: z.boolean().nullish().catch(false).transform(val => !!val),
    createdDate: z.string().nullish().catch(new Date().toISOString()),
});

export const BankInitVerificationSchema = z.object({
    verificationId: z.string(),
    timeoutSeconds: z.number().default(60),
});

/**
 * Schema cho form thêm ngân hàng
 */
export const AddBankFormSchema = z.object({
    bankAccountNumber: z.string()
        .min(6, 'bank:validation.accountMin')
        .regex(/^[0-9]+$/, 'bank:validation.accountNumbersOnly'),
    bankAccountHolder: z.string()
        .min(2, 'bank:validation.holderMin')
        .regex(/^[A-Z\s]+$/, 'bank:validation.holderUppercase'),
});

export type AddBankFormData = z.infer<typeof AddBankFormSchema>;

// ============================================
// API RESPONSE SCHEMAS
// ============================================

export const BankAccountResponseSchema = ResponseDefaultSchema.extend({
    data: UserBankAccountSchema,
});

export const BankAccountListResponseSchema = ResponseDefaultSchema.extend({
    data: z.array(UserBankAccountSchema),
});

export const BankInitVerificationResponseSchema = ResponseDefaultSchema.extend({
    data: BankInitVerificationSchema,
});

export const SupportedBankListResponseSchema = ResponseDefaultSchema.extend({
    data: z.array(z.object({
        shortName: z.string().catch(''),
        fullName: z.string().catch(''),
        code: z.string().catch(''),
    })),
});
