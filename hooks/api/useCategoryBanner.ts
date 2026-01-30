/**
 * ==============================================
 * CATEGORY BANNER HOOK
 * ==============================================
 *
 * Hook để fetch banner cho Category Page sử dụng
 * API: GET /api/v1/homepage/banners/active
 *
 * Tham số quan trọng:
 * - categoryId: ID danh mục để targeting
 * - displayLocation: CATEGORY_PAGE_TOP (banner đầu trang)
 * - device: MOBILE
 *
 * @example
 * const { banners, isLoading } = useCategoryBanner('cat-123');
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { apiClient } from '@/services/api/client';
import type { Banner, BannerUI, GetActiveBannersParams } from '@/types/banner';
import { toBannerUI } from '@/utils/adapter/bannerAdapter';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

// ============================================
// CONSTANTS
// ============================================

const BANNER_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const BANNER_CACHE_TIME = 10 * 60 * 1000; // 10 minutes

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Fetch active banners with filters
 */
async function fetchActiveBanners(params: GetActiveBannersParams): Promise<Banner[]> {
    const queryParams: Record<string, string> = {};

    if (params.locale) queryParams.locale = params.locale;
    if (params.device) queryParams.device = params.device;
    if (params.displayLocation) queryParams.displayLocation = params.displayLocation;
    if (params.categoryId) queryParams.categoryId = params.categoryId;
    if (params.position !== undefined) queryParams.position = String(params.position);

    const response = await apiClient.get<{ data: Banner[] }>(API_ROUTES.BANNERS.ACTIVE, {
        params: queryParams,
    });

    // API returns { status, data: Banner[] }
    return response.data.data || [];
}

// ============================================
// HOOKS
// ============================================

/**
 * Hook để lấy banner cho Category Page
 *
 * @param categoryId - ID của category đang hiển thị
 * @param enabled - Có enable query không (default: true nếu có categoryId)
 *
 * @returns
 * - banners: Danh sách BannerUI đã transform sẵn cho UI
 * - isLoading: Đang loading
 * - error: Lỗi nếu có
 * - refetch: Function để refetch
 */
export function useCategoryBanner(categoryId: string | null | undefined, enabled = true) {
    const { i18n } = useTranslation();
    const currentLanguage = i18n.language;

    const query = useQuery({
        queryKey: ['category-banner', categoryId, currentLanguage],
        queryFn: () =>
            fetchActiveBanners({
                categoryId: categoryId!,
                displayLocation: 'CATEGORY_PAGE_TOP',
                device: 'MOBILE',
                locale: currentLanguage,
            }),
        enabled: enabled && !!categoryId,
        staleTime: BANNER_STALE_TIME,
        gcTime: BANNER_CACHE_TIME,
        // Không retry nhiều lần cho banner (không critical)
        retry: 1,
        // Giữ data cũ khi refetch
        placeholderData: (prev) => prev,
    });

    // Transform to UI-ready data
    const banners: BannerUI[] = (query.data || []).map((b) => toBannerUI(b, true));

    // Chỉ lấy banner đầu tiên (primary banner)
    const primaryBanner = banners.length > 0 ? banners[0] : null;

    return {
        /** All banners for this category */
        banners,
        /** Primary banner (first one) - thường dùng nhất */
        primaryBanner,
        /** Loading state */
        isLoading: query.isLoading,
        /** Fetching state (including background refetch) */
        isFetching: query.isFetching,
        /** Error if any */
        error: query.error,
        /** Refetch function */
        refetch: query.refetch,
    };
}

/**
 * Hook để lấy banner sidebar cho Category Page
 * (Nếu cần banner ở sidebar)
 */
export function useCategorySidebarBanner(categoryId: string | null | undefined) {
    const { i18n } = useTranslation();
    const currentLanguage = i18n.language;

    const query = useQuery({
        queryKey: ['category-sidebar-banner', categoryId, currentLanguage],
        queryFn: () =>
            fetchActiveBanners({
                categoryId: categoryId!,
                displayLocation: 'CATEGORY_PAGE_SIDEBAR',
                device: 'MOBILE',
                locale: currentLanguage,
            }),
        enabled: !!categoryId,
        staleTime: BANNER_STALE_TIME,
        gcTime: BANNER_CACHE_TIME,
        retry: 1,
    });

    const banners: BannerUI[] = (query.data || []).map((b) => toBannerUI(b, true));

    return {
        banners,
        isLoading: query.isLoading,
        error: query.error,
    };
}
