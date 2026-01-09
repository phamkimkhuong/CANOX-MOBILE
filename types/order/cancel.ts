/**
 * ==============================================
 * CANCEL ORDER TYPES
 * ==============================================
 * Types cho màn hình Huỷ đơn hàng
 */

/**
 * Mã lý do huỷ đơn (internal use)
 */
export type CancelReasonCode =
    | 'CHANGE_ADDRESS'
    | 'CHANGE_PRODUCT'
    | 'FOUND_CHEAPER'
    | 'DELIVERY_TOO_LONG'
    | 'DONT_WANT'
    | 'OTHER';

/**
 * Cancel Reason Option
 */
export interface CancelReasonOption {
    code: CancelReasonCode;
    label: string;
    requiresDetail: boolean;
}

/**
 * API Payload - chỉ cần reason string
 */
export interface CancelOrderPayload {
    reason: string;
}

/**
 * API Response
 */
export interface CancelOrderResponse {
    code: number;
    success: boolean;
    message: string;
}
