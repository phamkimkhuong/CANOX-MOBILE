import { Href, router } from 'expo-router';

/**
 * Navigation Utility to prevent double taps and race conditions
 */

let isNavigating = false;
let lastPushTime = 0;
const PUSH_TIMEOUT = 800; // Reduced from 800ms for faster navigation

export const Navigator = {
    /**
     * Chuyển màn hình an toàn, chống nhấn đúp (Double Tap)
     */
    push: (route: Href | string) => {
        const now = Date.now();

        // Nếu đang trong quá trình chuyển cảnh hoặc nhấn quá nhanh (< 800ms)
        if (isNavigating || (now - lastPushTime < PUSH_TIMEOUT)) {
            return;
        }

        isNavigating = true;
        lastPushTime = now;

        router.push(route as Href);

        // Reset lại lock sau một khoảng thời gian
        setTimeout(() => {
            isNavigating = false;
        }, PUSH_TIMEOUT);
    },

    /**
     * Sử dụng navigate thay vì push cho các màn hình singletion/tab
     * Navigate thông minh hơn trong việc xử lý stack
     */
    navigate: (route: Href | string) => {
        router.navigate(route as Href);
    },

    /**
     * Quay lại màn hình trước
     */
    back: () => {
        router.back();
    }
};
