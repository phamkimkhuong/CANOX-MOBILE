/**
 * ==============================================
 * RETURN REQUEST REASONS
 * ==============================================
 * Buyer-facing return/refund reasons using backend reasonCode directly.
 */

import type { ReturnReasonOption } from '@/types/order/return';

export const RETURN_REASONS: ReturnReasonOption[] = [
    {
        code: 'MISSING_PARTS',
        payloadLabel: 'Thiếu hàng',
    },
    {
        code: 'WRONG_ITEM',
        payloadLabel: 'Gửi sai hàng',
    },
    {
        code: 'DAMAGED_IN_SHIPPING',
        payloadLabel: 'Bể vỡ/Hư hỏng',
    },
    {
        code: 'DEFECTIVE_ITEM',
        payloadLabel: 'Lỗi/Không hoạt động',
    },
    {
        code: 'NOT_AS_DESCRIBED',
        payloadLabel: 'Khác với mô tả',
    },
    {
        code: 'QUALITY_ISSUE',
        payloadLabel: 'Đã qua sử dụng',
    },
    {
        code: 'FAKE_COUNTERFEIT',
        payloadLabel: 'Hàng giả/nhái',
    },
];
