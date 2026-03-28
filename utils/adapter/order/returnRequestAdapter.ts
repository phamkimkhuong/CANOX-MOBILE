import type { CreateReturnRequestPayload } from '@/types/order/request';
import {
    getReturnReasonPayloadLabel,
    type ReturnMediaItem,
    type ReturnReasonCode,
} from '@/types/order/return';

interface ToCreateReturnRequestPayloadParams {
    reasonCode: ReturnReasonCode;
    bankAccountId: string;
    description?: string | null;
    mediaItems?: ReturnMediaItem[];
}

export const toCreateReturnRequestPayload = (
    params: ToCreateReturnRequestPayloadParams
): CreateReturnRequestPayload => {
    const mediaItems = params.mediaItems ?? [];
    const successfulMediaItems = mediaItems.filter(
        (item) => item.uploadStatus === 'success' && !!item.assetId
    );

    return {
        reasonCode: params.reasonCode,
        reason: getReturnReasonPayloadLabel(params.reasonCode),
        description: (params.description ?? '').trim(),
        imageAssetIds: successfulMediaItems
            .filter((item) => item.type === 'IMAGE')
            .map((item) => item.assetId!),
        videoAssetIds: successfulMediaItems
            .filter((item) => item.type === 'VIDEO')
            .map((item) => item.assetId!),
        bankAccountId: params.bankAccountId,
    };
};
