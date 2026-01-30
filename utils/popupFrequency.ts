/**
 * ==============================================
 * POPUP FREQUENCY MANAGER
 * ==============================================
 *
 * Quản lý tần suất hiển thị popup để tránh spam user.
 * Sử dụng MMKV để lưu trữ persistent (sync, nhanh hơn AsyncStorage).
 *
 * - Tối đa 1 lần/ngày
 * - Cách nhau ít nhất 4 giờ giữa 2 lần mở app
 * - Tôn trọng khi user chọn "Không hiện lại hôm nay"
 * - Không hiện khi first launch hoặc deep link
 *
 * @example
 * const canShow = PopupFrequency.canShowIntroPopup('campaign-123');
 * if (canShow) {
 *     showPopup();
 *     PopupFrequency.recordPopupShown('campaign-123');
 * }
 */

import { mmkvStorage } from '@/store/storage';

// ============================================
// CONSTANTS
// ============================================

const STORAGE_KEYS = {
    /** Timestamp lần cuối hiện popup */
    LAST_SHOWN: 'popup:intro:lastShown',
    /** ID của campaign đã dismiss (JSON array) */
    DISMISSED_CAMPAIGNS: 'popup:intro:dismissed',
    /** Flag đánh dấu đã bỏ qua hôm nay */
    SKIP_TODAY: 'popup:intro:skipToday',
    /** Timestamp ngày hiện tại (để reset skip) */
    SKIP_DATE: 'popup:intro:skipDate',
    /** Flag first launch */
    FIRST_LAUNCH_COMPLETED: 'app:firstLaunchCompleted',
} as const;

/** Thời gian tối thiểu giữa 2 lần popup (4 giờ) */
const MIN_TIME_BETWEEN_POPUPS_MS = 4 * 60 * 60 * 1000;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Lấy ngày hiện tại dạng YYYY-MM-DD
 */
function getTodayString(): string {
    return new Date().toISOString().split('T')[0];
}

// ============================================
// POPUP FREQUENCY API
// ============================================

export const PopupFrequency = {
    /**
     * Kiểm tra xem có thể hiện intro popup không (SYNC)
     *
     * @param campaignId - ID của campaign đang xét
     * @param isDeepLink - Có phải đến từ deep link không
     * @returns true nếu có thể hiện popup
     */
    canShowIntroPopup(
        campaignId?: string,
        isDeepLink = false
    ): boolean {
        try {
            // Rule 1: Không hiện nếu đến từ deep link
            if (isDeepLink) {
                return false;
            }

            // Rule 2: Không hiện nếu chưa hoàn thành first launch
            const firstLaunchCompleted = mmkvStorage.getBoolean(
                STORAGE_KEYS.FIRST_LAUNCH_COMPLETED
            );
            if (!firstLaunchCompleted) {
                return false;
            }

            // Rule 3: Kiểm tra user đã chọn "Không hiện lại hôm nay"
            const skipDate = mmkvStorage.getString(STORAGE_KEYS.SKIP_DATE);
            const skipToday = mmkvStorage.getBoolean(STORAGE_KEYS.SKIP_TODAY);
            const today = getTodayString();

            if (skipDate === today && skipToday === true) {
                return false;
            }

            // Reset skip flag nếu sang ngày mới
            if (skipDate !== today) {
                mmkvStorage.remove(STORAGE_KEYS.SKIP_TODAY);
                mmkvStorage.set(STORAGE_KEYS.SKIP_DATE, today);
            }

            // Rule 4: Kiểm tra thời gian từ lần hiện cuối
            const lastShown = mmkvStorage.getNumber(STORAGE_KEYS.LAST_SHOWN);
            if (lastShown) {
                const timeSinceLastShown = Date.now() - lastShown;

                if (timeSinceLastShown < MIN_TIME_BETWEEN_POPUPS_MS) {
                    return false;
                }
            }

            // Rule 5: Kiểm tra campaign đã bị dismiss chưa
            if (campaignId) {
                const dismissedStr = mmkvStorage.getString(
                    STORAGE_KEYS.DISMISSED_CAMPAIGNS
                );
                if (dismissedStr) {
                    try {
                        const dismissed: string[] = JSON.parse(dismissedStr);
                        if (dismissed.includes(campaignId)) {
                            return false;
                        }
                    } catch {
                        // Invalid JSON, ignore
                    }
                }
            }

            return true;
        } catch (error) {
            console.warn('[PopupFrequency] Error checking canShowIntroPopup:', error);
            // Fail-safe: Không hiện popup nếu có lỗi
            return false;
        }
    },

    /**
     * Ghi nhận đã hiện popup (SYNC)
     *
     * @param campaignId - ID campaign đã hiện (optional)
     */
    recordPopupShown(campaignId?: string): void {
        try {
            mmkvStorage.set(STORAGE_KEYS.LAST_SHOWN, Date.now());

            // Log cho debug
            if (__DEV__) {
                console.log('[PopupFrequency] Recorded popup shown:', campaignId);
            }
        } catch (error) {
            console.warn('[PopupFrequency] Error recording popup shown:', error);
        }
    },

    /**
     * Ghi nhận user dismiss popup (không muốn xem campaign này) (SYNC)
     *
     * @param campaignId - ID campaign bị dismiss
     */
    recordCampaignDismissed(campaignId: string): void {
        try {
            const dismissedStr = mmkvStorage.getString(
                STORAGE_KEYS.DISMISSED_CAMPAIGNS
            );
            let dismissed: string[] = [];

            if (dismissedStr) {
                try {
                    dismissed = JSON.parse(dismissedStr);
                } catch {
                    dismissed = [];
                }
            }

            if (!dismissed.includes(campaignId)) {
                dismissed.push(campaignId);
                // Giữ tối đa 50 campaigns để tránh storage bloat
                const trimmed = dismissed.slice(-50);
                mmkvStorage.set(
                    STORAGE_KEYS.DISMISSED_CAMPAIGNS,
                    JSON.stringify(trimmed)
                );
            }

            if (__DEV__) {
                console.log('[PopupFrequency] Recorded campaign dismissed:', campaignId);
            }
        } catch (error) {
            console.warn('[PopupFrequency] Error recording dismiss:', error);
        }
    },

    /**
     * Ghi nhận user chọn "Không hiện lại hôm nay" (SYNC)
     */
    setSkipToday(): void {
        try {
            const today = getTodayString();
            mmkvStorage.set(STORAGE_KEYS.SKIP_DATE, today);
            mmkvStorage.set(STORAGE_KEYS.SKIP_TODAY, true);

            if (__DEV__) {
                console.log('[PopupFrequency] User chose to skip popups today');
            }
        } catch (error) {
            console.warn('[PopupFrequency] Error setting skip today:', error);
        }
    },

    /**
     * Đánh dấu first launch đã hoàn thành (SYNC)
     * Gọi sau khi user hoàn thành onboarding
     */
    markFirstLaunchCompleted(): void {
        try {
            mmkvStorage.set(STORAGE_KEYS.FIRST_LAUNCH_COMPLETED, true);
        } catch (error) {
            console.warn('[PopupFrequency] Error marking first launch:', error);
        }
    },

    /**
     * Kiểm tra xem đây có phải first launch không (SYNC)
     */
    isFirstLaunch(): boolean {
        try {
            const completed = mmkvStorage.getBoolean(
                STORAGE_KEYS.FIRST_LAUNCH_COMPLETED
            );
            return !completed;
        } catch (error) {
            return true; // Fail-safe: Coi như first launch
        }
    },

    /**
     * Reset tất cả state (for debugging) (SYNC)
     */
    resetAll(): void {
        try {
            mmkvStorage.remove(STORAGE_KEYS.LAST_SHOWN);
            mmkvStorage.remove(STORAGE_KEYS.DISMISSED_CAMPAIGNS);
            mmkvStorage.remove(STORAGE_KEYS.SKIP_TODAY);
            mmkvStorage.remove(STORAGE_KEYS.SKIP_DATE);

            if (__DEV__) {
                console.log('[PopupFrequency] Reset all popup frequency data');
            }
        } catch (error) {
            console.warn('[PopupFrequency] Error resetting:', error);
        }
    },
};

export default PopupFrequency;
