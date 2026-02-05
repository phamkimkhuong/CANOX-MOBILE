/**
 * ==============================================
 * INTRO POPUP PROVIDER
 * ==============================================
 *
 * Provider để quản lý hiển thị Intro Popup Banner.
 * Đặt ở cấp cao trong component tree để có thể hiển thị
 * popup khi mở app.
 *
 * Features:
 * - Tự động check điều kiện hiển thị popup
 * - Xử lý navigation khi tap vào banner
 * - Tích hợp với PopupFrequency để quản lý tần suất
 *
 * @example
 * // Trong _layout.tsx
 * <IntroPopupProvider>
 *     <Stack />
 * </IntroPopupProvider>
 */

import { IntroPopupBanner } from '@/components/popup';
import { useIntroPopup } from '@/hooks/api/useIntroPopup';
import { Navigator } from '@/utils/navigation';
import { PopupFrequency } from '@/utils/popupFrequency';
import { useSegments } from 'expo-router';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { Linking } from 'react-native';

interface IntroPopupProviderProps {
    children: React.ReactNode;
}

/**
 * Provider quản lý Intro Popup Banner
 */
export const IntroPopupProvider = memo(function IntroPopupProvider({
    children,
}: IntroPopupProviderProps) {
    const segments = useSegments();

    // Detect if came from deep link
    const [isDeepLink, setIsDeepLink] = useState(false);

    // Check for deep link on mount
    useEffect(() => {
        const checkInitialUrl = async () => {
            try {
                const initialUrl = await Linking.getInitialURL();
                if (initialUrl) {
                    // Ignore Expo Dev Client URLs so popup can show during development
                    if (initialUrl.includes('expo-development-client')) {
                        setIsDeepLink(false);
                    } else {
                        setIsDeepLink(true);
                        if (__DEV__) {
                            // console.log('[IntroPopup] Detected real deep link, skipping popup:', initialUrl);
                        }
                    }
                }
            } catch (error) {
                console.warn('[IntroPopup] Error checking initial URL:', error);
            }
        };

        checkInitialUrl();
    }, []);

    // Auto-mark first launch completed after delay
    // This ensures popup won't show on first install, but will show on subsequent opens
    useEffect(() => {
        if (PopupFrequency.isFirstLaunch()) {
            // Wait 5 seconds before marking as completed
            // This gives user time to explore the app before being prompted
            const timer = setTimeout(() => {
                PopupFrequency.markFirstLaunchCompleted();
                if (__DEV__) {
                    // console.log('[IntroPopup] First launch marked as completed');
                }
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, []);

    // Use intro popup hook
    const {
        shouldShow,
        banner,
        dismiss,
        skipToday,
    } = useIntroPopup({
        isDeepLink,
        // Chỉ enable khi đang ở tabs (home)
        enabled: segments[0] === '(tabs)',
    });

    // Handle navigation when tap on banner
    const handleNavigate = useCallback(
        (href: string) => {
            if (!href) return;
            try {
                Navigator.navigate(href);
            } catch (error) {
                console.warn('[IntroPopup] Navigation error:', error);
                // Fallback: try to open as URL
                Linking.openURL(href).catch(() => {
                    console.warn('[IntroPopup] Could not open URL:', href);
                });
            }
        },
        []
    );

    return (
        <>
            {children}

            {/* Intro Popup Banner */}
            {shouldShow && banner && (
                <IntroPopupBanner
                    banner={banner}
                    visible={shouldShow}
                    onDismiss={dismiss}
                    onSkipToday={skipToday}
                    onNavigate={handleNavigate}
                />
            )}
        </>
    );
});

export default IntroPopupProvider;
