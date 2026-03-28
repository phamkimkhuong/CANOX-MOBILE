/**
 * ==============================================
 * ORDER REQUESTS - API Layer
 * ==============================================
 */

import type { ReturnReasonCode } from './return';

/**
 * Create return/refund request payload sent to backend
 */
export interface CreateReturnRequestPayload {
    reasonCode: ReturnReasonCode;
    reason: string;
    description: string;
    imageAssetIds: string[];
    videoAssetIds: string[];
    bankAccountId: string;
}
