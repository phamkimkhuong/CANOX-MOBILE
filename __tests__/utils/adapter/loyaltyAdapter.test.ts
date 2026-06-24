/**
 * Loyalty Adapter Unit Tests
 *
 * Tests actual exports: transformPointBalance, transformPointBatch,
 * transformPointHistory, transformLoyaltyOverview, transformShopLoyaltyPreview, transformRedeemResult
 */

import type { PointBalanceDTO, UserShopPointDTO, PointHistoryDTO, LoyaltyOverviewDTO, ShopLoyaltyPreviewDTO, PointRedeemResponseDTO } from '@/types/loyalty/dto';
import {
    transformPointBalance,
    transformPointBatch,
    transformPointHistory,
    transformLoyaltyOverview,
    transformShopLoyaltyPreview,
    transformRedeemResult,
} from '@/utils/adapter/loyaltyAdapter';

// ============================================
// transformPointBalance
// ============================================

describe('transformPointBalance', () => {
    const createDTO = (overrides: Partial<PointBalanceDTO> = {}): PointBalanceDTO => ({
        totalAvailable: 1500,
        expiringPoints: 200,
        activeBatchCount: 3,
        queriedAt: '2026-04-20T10:00:00Z',
        ...overrides,
    });

    it('maps total from totalAvailable', () => {
        const result = transformPointBalance(createDTO({ totalAvailable: 2000 }));
        expect(result.total).toBe(2000);
    });

    it('maps expiringSoon from expiringPoints', () => {
        const result = transformPointBalance(createDTO({ expiringPoints: 500 }));
        expect(result.expiringSoon).toBe(500);
    });

    it('maps batchCount from activeBatchCount', () => {
        const result = transformPointBalance(createDTO({ activeBatchCount: 5 }));
        expect(result.batchCount).toBe(5);
    });

    it('formats lastUpdated', () => {
        const result = transformPointBalance(createDTO());
        expect(result.lastUpdated).toBeTruthy();
    });
});

// ============================================
// transformPointBatch
// ============================================

describe('transformPointBatch', () => {
    const createDTO = (overrides: Partial<UserShopPointDTO> = {}): UserShopPointDTO => ({
        batchId: 'batch-1',
        initialAmount: 1000,
        remainingAmount: 800,
        earnedAt: '2026-03-01T00:00:00Z',
        expiryAt: '2026-06-01T00:00:00Z',
        daysUntilExpiry: 40,
        status: 'ACTIVE',
        sourceOrderNumber: 'ORD-001',
        ...overrides,
    });

    it('maps basic fields', () => {
        const result = transformPointBatch(createDTO());

        expect(result.id).toBe('batch-1');
        expect(result.initialAmount).toBe(1000);
        expect(result.amount).toBe(800);
        expect(result.status).toBe('ACTIVE');
    });

    it('formats source with order number', () => {
        const result = transformPointBatch(createDTO({ sourceOrderNumber: 'ORD-123' }));
        expect(result.source).toContain('ORD-123');
    });

    it('returns default source when no order number', () => {
        const result = transformPointBatch(createDTO({ sourceOrderNumber: null as unknown as string }));
        expect(result.source).toBe('Tích lũy hệ thống');
    });

    it('detects expiring soon (≤7 days + ACTIVE)', () => {
        const expiring = transformPointBatch(createDTO({ daysUntilExpiry: 5, status: 'ACTIVE' }));
        const notExpiring = transformPointBatch(createDTO({ daysUntilExpiry: 20, status: 'ACTIVE' }));
        const inactiveExpiring = transformPointBatch(createDTO({ daysUntilExpiry: 3, status: 'EXPIRED' }));

        expect(expiring.isExpiringSoon).toBe(true);
        expect(notExpiring.isExpiringSoon).toBe(false);
        expect(inactiveExpiring.isExpiringSoon).toBe(false);
    });

    it('formats dates', () => {
        const result = transformPointBatch(createDTO());
        expect(result.earnedAt).toBeTruthy();
        expect(result.expiryDate).toBeTruthy();
        expect(result.expiryText).toBeTruthy();
    });
});

// ============================================
// transformPointHistory
// ============================================

describe('transformPointHistory', () => {
    const createDTO = (overrides: Partial<PointHistoryDTO> = {}): PointHistoryDTO => ({
        currentBalance: 1500,
        totalEarned: 5000,
        totalSpent: 2000,
        totalExpired: 500,
        transactions: {
            content: [
                {
                    transactionDate: '2026-04-15T10:00:00Z',
                    type: 'EARNED',
                    amount: 100,
                    orderId: 'order-1',
                    description: 'Mua hàng',
                },
                {
                    transactionDate: '2026-04-16T10:00:00Z',
                    type: 'SPENT',
                    amount: -50,
                    orderId: 'order-2',
                    description: 'Đổi điểm',
                },
            ],
            empty: false,
            totalPages: 3,
        },
        ...overrides,
    });

    it('maps balance fields', () => {
        const result = transformPointHistory(createDTO());

        expect(result.currentBalance).toBe(1500);
        expect(result.totalEarned).toBe(5000);
        expect(result.totalSpent).toBe(2000);
        expect(result.totalExpired).toBe(500);
    });

    it('transforms transactions', () => {
        const result = transformPointHistory(createDTO());

        expect(result.transactions).toHaveLength(2);
        expect(result.transactions[0].type).toBe('EARNED');
        expect(result.transactions[0].isPositive).toBe(true);
        expect(result.transactions[1].type).toBe('SPENT');
        expect(result.transactions[1].isPositive).toBe(false);
    });

    it('detects REFUNDED as positive', () => {
        const dto = createDTO({
            transactions: {
                content: [{
                    transactionDate: '2026-04-15T10:00:00Z',
                    type: 'REFUNDED',
                    amount: 50,
                    orderId: null,
                    description: 'Hoàn điểm',
                }],
                empty: false,
                totalPages: 1,
            },
        });

        const result = transformPointHistory(dto);
        expect(result.transactions[0].isPositive).toBe(true);
    });

    it('maps hasTransactions from empty flag', () => {
        const nonEmpty = transformPointHistory(createDTO());
        expect(nonEmpty.hasTransactions).toBe(true);

        const empty = transformPointHistory(createDTO({
            transactions: { content: [], empty: true, totalPages: 0 },
        }));
        expect(empty.hasTransactions).toBe(false);
    });

    it('maps totalPages', () => {
        const result = transformPointHistory(createDTO());
        expect(result.totalPages).toBe(3);
    });
});

// ============================================
// transformLoyaltyOverview
// ============================================

describe('transformLoyaltyOverview', () => {
    const createDTO = (overrides: Partial<LoyaltyOverviewDTO> = {}): LoyaltyOverviewDTO => ({
        totalPointsAllShops: 5000,
        totalShopsWithPoints: 3,
        totalExpiringPoints: 500,
        shops: [
            {
                shopId: 'shop-1',
                shopName: 'Shop A',
                shopLogo: 'logo-a.jpg',
                totalPoints: 3000,
                expiringPoints: 200,
                nearestExpiryDate: null,
                nearestExpiryPoints: 0,
                activeBatches: 2,
            },
        ],
        ...overrides,
    });

    it('maps overview totals', () => {
        const result = transformLoyaltyOverview(createDTO());

        expect(result.totalPoints).toBe(5000);
        expect(result.totalCombinedBalance).toBe(5000);
        expect(result.displayBalance).toBe(5000);
        expect(result.displayBalanceKind).toBe('COMBINED');
        expect(result.shopCount).toBe(3);
        expect(result.expiringPoints).toBe(500);
    });

    it('prefers totalCombinedBalance when platform balance contributes to overview', () => {
        const result = transformLoyaltyOverview(createDTO({
            totalPointsAllShops: 5000,
            totalCombinedBalance: 6500,
            platformEnabled: true,
            platformExpiryDays: 30,
        }));

        expect(result.totalPoints).toBe(6500);
        expect(result.totalCombinedBalance).toBe(6500);
        expect(result.displayBalance).toBe(6500);
        expect(result.displayBalanceKind).toBe('COMBINED');
        expect(result.platformEnabled).toBe(true);
        expect(result.platformExpiryDays).toBe(30);
    });

    it('uses platform balance for hero display only when platform balance data exists', () => {
        const result = transformLoyaltyOverview(createDTO({
            totalPointsAllShops: 5000,
            totalCombinedBalance: 6500,
            platformEnabled: true,
            platformPointBalance: {
                balance: 1500,
            },
        }));

        expect(result.platformBalance).toBe(1500);
        expect(result.displayBalance).toBe(1500);
        expect(result.displayBalanceKind).toBe('PLATFORM');
    });

    it('transforms shop summaries', () => {
        const result = transformLoyaltyOverview(createDTO());

        expect(result.shops).toHaveLength(1);
        expect(result.shops[0].shopId).toBe('shop-1');
        expect(result.shops[0].shopName).toBe('Shop A');
        expect(result.shops[0].totalPoints).toBe(3000);
    });

    it('detects hasUrgentPoints when expiryDate is within 15 days', () => {
        const urgentDate = new Date(Date.now() + 10 * 86400000).toISOString(); // 10 days from now
        const result = transformLoyaltyOverview(createDTO({
            shops: [{
                shopId: 'shop-1',
                shopName: 'Shop A',
                shopLogo: 'logo.jpg',
                totalPoints: 1000,
                expiringPoints: 100,
                nearestExpiryDate: urgentDate,
                nearestExpiryPoints: 80,
                activeBatches: 1,
            }],
        }));

        expect(result.hasUrgentPoints).toBe(true);
    });

    it('does not flag hasUrgentPoints when expiry is far', () => {
        const farDate = new Date(Date.now() + 60 * 86400000).toISOString(); // 60 days from now
        const result = transformLoyaltyOverview(createDTO({
            shops: [{
                shopId: 'shop-1',
                shopName: 'Shop A',
                shopLogo: 'logo.jpg',
                totalPoints: 1000,
                expiringPoints: 100,
                nearestExpiryDate: farDate,
                nearestExpiryPoints: 80,
                activeBatches: 1,
            }],
        }));

        expect(result.hasUrgentPoints).toBe(false);
    });

    it('selects the closest nearest expiry candidate using nearestExpiryPoints', () => {
        const soonerDate = new Date(Date.now() + 5 * 86400000).toISOString();
        const laterDate = new Date(Date.now() + 12 * 86400000).toISOString();
        const result = transformLoyaltyOverview(createDTO({
            totalExpiringPoints: 9999,
            shops: [
                {
                    shopId: 'shop-later',
                    shopName: 'Later Shop',
                    shopLogo: 'later.jpg',
                    totalPoints: 5000,
                    expiringPoints: 5000,
                    nearestExpiryDate: laterDate,
                    nearestExpiryPoints: 5000,
                    activeBatches: 1,
                },
                {
                    shopId: 'shop-sooner',
                    shopName: 'Sooner Shop',
                    shopLogo: 'sooner.jpg',
                    totalPoints: 999,
                    expiringPoints: 999,
                    nearestExpiryDate: soonerDate,
                    nearestExpiryPoints: 999,
                    activeBatches: 1,
                },
            ],
        }));

        expect(result.nearestExpiry?.sourceName).toBe('Sooner Shop');
        expect(result.nearestExpiry?.points).toBe(999);
    });

    it('can select platform expiry when it is closer than shop expiry', () => {
        const platformDate = new Date(Date.now() + 3 * 86400000).toISOString();
        const shopDate = new Date(Date.now() + 8 * 86400000).toISOString();
        const result = transformLoyaltyOverview(createDTO({
            platformEnabled: true,
            platformPointBalance: {
                balance: 1200,
                nearestExpiryDate: platformDate,
                nearestExpiryPoints: 300,
            },
            shops: [{
                shopId: 'shop-1',
                shopName: 'Shop A',
                shopLogo: 'logo.jpg',
                totalPoints: 1000,
                expiringPoints: 100,
                nearestExpiryDate: shopDate,
                nearestExpiryPoints: 100,
                activeBatches: 1,
            }],
        }));

        expect(result.nearestExpiry?.sourceType).toBe('PLATFORM');
        expect(result.nearestExpiry?.points).toBe(300);
    });
});

// ============================================
// transformShopLoyaltyPreview
// ============================================

describe('transformShopLoyaltyPreview', () => {
    const createDTO = (overrides: Partial<ShopLoyaltyPreviewDTO> = {}): ShopLoyaltyPreviewDTO => ({
        enabled: true,
        ruleType: 'PERCENT',
        ruleValue: 5,
        expiryDays: 90,
        maxPointPerOrder: 1000,
        maxDiscountPercent: 20,
        ...overrides,
    });

    it('maps all fields including injected shop metadata', () => {
        const result = transformShopLoyaltyPreview(
            createDTO(),
            'shop-123',
            'My Shop',
            'logo.jpg'
        );

        expect(result.shopId).toBe('shop-123');
        expect(result.shopName).toBe('My Shop');
        expect(result.shopLogo).toBe('logo.jpg');
        expect(result.isEnabled).toBe(true);
        expect(result.ruleType).toBe('PERCENT');
        expect(result.rewardValue).toBe(5);
        expect(result.expiryDays).toBe(90);
        expect(result.maxPointPerOrder).toBe(1000);
        expect(result.maxDiscountPercent).toBe(20);
    });

    it('handles nullable and undefined fields gracefully', () => {
        const result = transformShopLoyaltyPreview(
            createDTO({
                ruleType: null,
                ruleValue: null,
                expiryDays: null,
                maxPointPerOrder: null,
                maxDiscountPercent: null,
            }),
            'shop-123',
            'My Shop',
            'logo.jpg'
        );

        expect(result.ruleType).toBe('');
        expect(result.rewardValue).toBe(0);
        expect(result.expiryDays).toBe(0);
        expect(result.maxPointPerOrder).toBe(0);
        expect(result.maxDiscountPercent).toBe(0);
    });
});

// ============================================
// transformRedeemResult
// ============================================

describe('transformRedeemResult', () => {
    it('maps redeem result', () => {
        const dto: PointRedeemResponseDTO = {
            orderId: 'order-123',
            redeemedPoints: 500,
            remainingPoints: 1000,
        };

        const result = transformRedeemResult(dto);

        expect(result.orderId).toBe('order-123');
        expect(result.redeemed).toBe(500);
        expect(result.remaining).toBe(1000);
    });
});
