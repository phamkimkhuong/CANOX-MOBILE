/**
 * ==============================================
 * CANCEL REASONS - Danh sách lý do huỷ đơn
 * ==============================================
 * Hardcode cho MVP, sau này có thể fetch từ API
 */

import type { CancelReasonOption } from '@/types/order/cancel';

/**
 * Danh sách lý do huỷ đơn chuẩn E-commerce
 * label sẽ được gửi trực tiếp lên API
 */
export const CANCEL_REASONS: CancelReasonOption[] = [
    {
        code: 'CHANGE_ADDRESS',
        label: 'Muốn thay đổi địa chỉ giao hàng',
        requiresDetail: false,
    },
    {
        code: 'CHANGE_PRODUCT',
        label: 'Muốn thay đổi sản phẩm (Màu/Size)',
        requiresDetail: false,
    },
    {
        code: 'FOUND_CHEAPER',
        label: 'Tìm thấy nơi khác rẻ hơn',
        requiresDetail: false,
    },
    {
        code: 'DELIVERY_TOO_LONG',
        label: 'Thời gian giao hàng quá lâu',
        requiresDetail: false,
    },
    {
        code: 'DONT_WANT',
        label: 'Đổi ý, không muốn mua nữa',
        requiresDetail: false,
    },
    {
        code: 'OTHER',
        label: 'Lý do khác',
        requiresDetail: true,
    },
];

/**
 * Refund Policy Messages
 * Hiển thị dựa trên paymentMethod
 */
export const REFUND_MESSAGES = {
    /** COD - Chưa thanh toán */
    COD: 'Đơn hàng chưa thanh toán. Huỷ đơn sẽ không phát sinh phí.',

    /** Đã thanh toán trước (PAYOS, STRIPE, BANK_TRANSFER) */
    PREPAID: 'Tiền thanh toán sẽ được hoàn về Ví/Thẻ của bạn trong vòng 24h - 7 ngày làm việc tuỳ ngân hàng.',

    /** Cảnh báo về voucher */
    VOUCHER_WARNING: 'Mã giảm giá bạn đã dùng sẽ không được hoàn lại sau khi huỷ.',
} as const;

/**
 * Minimum characters for "OTHER" reason detail
 */
export const MIN_OTHER_REASON_LENGTH = 10;
