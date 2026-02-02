import { PointBalanceDTO, UserShopPointDTO } from '@/types/loyalty/dto';
import { PointBalanceUI, PointBatchUI } from '@/types/loyalty/ui';
import { formatDate, formatMessageTime } from '@/utils/date';

/**
 * Transform Point Balance DTO -> UI
 */
export const transformPointBalance = (dto: PointBalanceDTO): PointBalanceUI => {
    const lastUpdatedDate = dto.queriedAt;
    return {
        total: dto.totalAvailable,
        expiringSoon: dto.expiringPoints,
        batchCount: dto.activeBatchCount,
        lastUpdated: `${formatMessageTime(lastUpdatedDate)} ${formatDate(lastUpdatedDate)}`,
    };
};

/**
 * Transform User Shop Point DTO -> UI Batch
 */
export const transformPointBatch = (dto: UserShopPointDTO): PointBatchUI => {
    const isExpiringSoon = dto.daysUntilExpiry <= 7 && dto.status === 'ACTIVE';

    return {
        id: dto.batchId,
        amount: dto.remainingAmount,
        expiryDate: formatDate(dto.expiryAt),
        expiryText: dto.daysUntilExpiry > 0
            ? `Hết hạn sau ${dto.daysUntilExpiry} ngày`
            : 'Đã hết hạn',
        isExpiringSoon,
        status: dto.status,
        source: dto.sourceOrderNumber ? `Đơn hàng #${dto.sourceOrderNumber}` : 'Tích lũy hệ thống',
    };
};
