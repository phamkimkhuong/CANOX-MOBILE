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
    imageUrls: string[];
    videoUrls: string[];
    bankAccountId: string;
}
