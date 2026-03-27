/**
 * ==============================================
 * RETURN REQUEST TYPES
 * ==============================================
 * Return/refund reason codes aligned directly with backend reasonCode
 */

export type ReturnReasonCode =
    | 'MISSING_PARTS'
    | 'WRONG_ITEM'
    | 'DAMAGED_IN_SHIPPING'
    | 'DEFECTIVE_ITEM'
    | 'NOT_AS_DESCRIBED'
    | 'QUALITY_ISSUE'
    | 'FAKE_COUNTERFEIT';

export interface ReturnReasonOption {
    code: ReturnReasonCode;
    payloadLabel: string;
}

/**
 * Canonical label used for request payload `reason`.
 */
export const RETURN_REASON_PAYLOAD_LABELS: Record<ReturnReasonCode, string> = {
    MISSING_PARTS: 'Thiếu hàng',
    WRONG_ITEM: 'Gửi sai hàng',
    DAMAGED_IN_SHIPPING: 'Bể vỡ/Hư hỏng',
    DEFECTIVE_ITEM: 'Lỗi/Không hoạt động',
    NOT_AS_DESCRIBED: 'Khác với mô tả',
    QUALITY_ISSUE: 'Đã qua sử dụng',
    FAKE_COUNTERFEIT: 'Hàng giả/nhái',
};

export const getReturnReasonPayloadLabel = (
    reasonCode: ReturnReasonCode | null | undefined
): string => {
    if (!reasonCode) return '';
    return RETURN_REASON_PAYLOAD_LABELS[reasonCode];
};

export type ReturnMediaType = 'IMAGE' | 'VIDEO';

export type ReturnMediaUploadStatus = 'pending' | 'uploading' | 'success' | 'error';

export interface ReturnMediaItem {
    id: string;
    uri: string;
    type: ReturnMediaType;
    uploadStatus: ReturnMediaUploadStatus;
    progress: number;
    url?: string;
    assetId?: string;
    error?: string;
    fileSize?: number;
    duration?: number;
}

export interface ReturnRequestDraft {
    reasonCode: ReturnReasonCode | null;
    bankAccountId: string | null;
    description: string;
    mediaItems: ReturnMediaItem[];
}

export const RETURN_DESCRIPTION_MAX_LENGTH = 2000;
export const RETURN_MEDIA_LIMITS = {
    MAX_IMAGES: 5,
    MAX_VIDEOS: 2,
} as const;
