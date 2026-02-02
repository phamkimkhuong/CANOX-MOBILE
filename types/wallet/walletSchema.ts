import { z } from 'zod';
import { ResponseDefaultSchema } from '../responseSchema';

// ============================================
// WALLET CORE SCHEMAS
// ============================================

export const WalletResponseSchema = z.object({
    id: z.string(),
    userId: z.string(),
    username: z.string(),
    balance: z.number().default(0),
    temporaryBalance: z.number().default(0),
    totalDeposited: z.number().default(0),
    totalWithdrawn: z.number().default(0),
    status: z.enum(['ACTIVE', 'FROZEN', 'CLOSED']),
    note: z.string().nullish(),
    type: z.enum(['PLATFORM', 'SHOP', 'BUYER']),
    createdDate: z.string(),
    mustChangePassword: z.boolean().default(false),
});

export const WalletTransactionSchema = z.object({
    id: z.string(),
    walletId: z.string(),
    type: z.string(), // Too many enums for strict check if not needed
    status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']),
    amount: z.number(),
    balanceBefore: z.number(),
    balanceAfter: z.number(),
    description: z.string().nullish(),
    referenceId: z.string().nullish(),
    referenceType: z.string().nullish(),
    note: z.string().nullish(),
    createdDate: z.string(),
});

// ============================================
// API RESPONSE SCHEMAS
// ============================================

export const WalletDetailResponseSchema = ResponseDefaultSchema.extend({
    data: WalletResponseSchema,
});

export const WalletListResponseSchema = ResponseDefaultSchema.extend({
    data: z.array(WalletResponseSchema),
});

export const WalletTransactionListResponseSchema = ResponseDefaultSchema.extend({
    data: z.object({
        content: z.array(WalletTransactionSchema),
        page: z.number(),
        size: z.number(),
        totalPages: z.number(),
        totalElements: z.number(),
    }),
});
