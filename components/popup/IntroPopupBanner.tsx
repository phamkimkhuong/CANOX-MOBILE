/**
 * ==============================================
 * INTRO POPUP BANNER COMPONENT
 * ==============================================
 */

import { Image } from 'expo-image';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dimensions,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';

import type { BannerUI } from '@/types/banner';
import { IconSymbol } from '../ui/Icon';

// ============================================
// CONSTANTS
// ============================================

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/** Banner width = 85% screen width */
const BANNER_WIDTH = SCREEN_WIDTH * 0.85;

/** Banner aspect ratio (thường là 1:1 hoặc 4:3 cho popup) */
const BANNER_ASPECT_RATIO = 1; // 1:1 square

/** Banner height calculated from aspect ratio */
const BANNER_HEIGHT = BANNER_WIDTH / BANNER_ASPECT_RATIO;

/** Animation duration in ms */
const ANIMATION_DURATION = 300;

// ============================================
// PROPS
// ============================================

export interface IntroPopupBannerProps {
    /** Banner data để hiển thị */
    banner: BannerUI;

    /** Callback khi đóng popup */
    onDismiss: () => void;

    /** Callback khi chọn "Không hiện lại hôm nay" */
    onSkipToday: () => void;

    /** Callback khi tap vào banner để navigate */
    onNavigate?: (href: string) => void;

    /** Có visible không */
    visible?: boolean;
}

// ============================================
// COMPONENT
// ============================================

export const IntroPopupBanner = memo(function IntroPopupBanner({
    banner,
    onDismiss,
    onSkipToday,
    onNavigate,
    visible = true,
}: IntroPopupBannerProps) {
    const { t } = useTranslation('common');

    // State for checkbox
    const [skipChecked, setSkipChecked] = useState(false);

    // Animation values
    const overlayOpacity = useSharedValue(0);
    const bannerScale = useSharedValue(0.9);

    // Animate in on mount
    useEffect(() => {
        if (visible) {
            overlayOpacity.value = withTiming(1, {
                duration: ANIMATION_DURATION,
                easing: Easing.out(Easing.cubic),
            });
            bannerScale.value = withTiming(1, {
                duration: ANIMATION_DURATION,
                easing: Easing.out(Easing.back(1.1)),
            });
        }
    }, [visible, overlayOpacity, bannerScale]);

    // Animated styles
    const overlayStyle = useAnimatedStyle(() => ({
        opacity: overlayOpacity.value,
    }));

    const bannerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: bannerScale.value }],
    }));

    // Handle close (with animation)
    const handleClose = useCallback(() => {
        overlayOpacity.value = withTiming(0, {
            duration: ANIMATION_DURATION / 2,
            easing: Easing.in(Easing.cubic),
        });
        bannerScale.value = withTiming(0.9, {
            duration: ANIMATION_DURATION / 2,
            easing: Easing.in(Easing.cubic),
        });

        // Delay actual dismiss to allow animation
        setTimeout(() => {
            if (skipChecked) {
                onSkipToday();
            } else {
                onDismiss();
            }
        }, ANIMATION_DURATION / 2);
    }, [overlayOpacity, bannerScale, skipChecked, onSkipToday, onDismiss]);

    // Handle tap on banner (navigate)
    const handleBannerPress = useCallback(() => {
        if (banner.href && onNavigate) {
            onNavigate(banner.href);
        }
        // Always close after tap
        handleClose();
    }, [banner.href, onNavigate, handleClose]);

    // Handle overlay tap (close)
    const handleOverlayPress = useCallback(() => {
        handleClose();
    }, [handleClose]);

    // Toggle checkbox
    const toggleSkipCheckbox = useCallback(() => {
        setSkipChecked((prev) => !prev);
    }, []);

    if (!banner.imageUrl) {
        return null;
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={handleClose}
        >
            {/* Overlay (tap to close) */}
            <Animated.View style={[styles.overlay, overlayStyle]}>
                <Pressable style={styles.overlayTouchable} onPress={handleOverlayPress}>
                    {/* Empty pressable for overlay tap */}
                </Pressable>

                {/* Banner Container */}
                <Animated.View style={[styles.bannerContainer, bannerStyle]}>
                    {/* Close Button */}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={handleClose}
                        hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
                        activeOpacity={0.7}
                    >
                        <View style={styles.closeButtonInner}>
                            <IconSymbol name="close" size={18} color="#fff" />
                        </View>
                    </TouchableOpacity>

                    {/* Banner Image (main tap area) */}
                    <Pressable
                        onPress={handleBannerPress}
                        style={styles.bannerPressable}
                    >
                        <Image
                            source={{ uri: banner.imageUrl }}
                            style={styles.bannerImage}
                            contentFit="cover"
                            transition={200}
                            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
                        />
                    </Pressable>

                    {/* Skip Today Checkbox */}
                    <TouchableOpacity
                        style={styles.skipContainer}
                        onPress={toggleSkipCheckbox}
                        activeOpacity={0.7}
                    >
                        <View
                            style={[
                                styles.checkbox,
                                skipChecked && styles.checkboxChecked,
                            ]}
                        >
                            {skipChecked && (
                                <Text style={styles.checkmark}>✓</Text>
                            )}
                        </View>
                        <Text style={styles.skipText}>
                            {t('popup.skipToday', { defaultValue: 'Không hiện lại hôm nay' })}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
});

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayTouchable: {
        ...StyleSheet.absoluteFill,
    },
    bannerContainer: {
        width: BANNER_WIDTH,
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: -12,
        right: -12,
        zIndex: 10,
    },
    closeButtonInner: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    bannerPressable: {
        width: BANNER_WIDTH,
        height: BANNER_HEIGHT,
        borderRadius: 16,
        overflow: 'hidden',
        // Subtle shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    skipContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.6)',
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    checkboxChecked: {
        backgroundColor: '#10B981',
        borderColor: '#10B981',
    },
    checkmark: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    skipText: {
        color: 'rgba(255, 255, 255, 0.85)',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default IntroPopupBanner;
