/**
 * ==============================================
 * STATE VIEW - DUMB UI COMPONENT
 * ==============================================
 * 
 * Purpose: Hiển thị các trạng thái UI (Error, Empty, Offline) 
 * với cấu hình tự động hóa cao.
 * 
 * Design Philosophy:
 * - Dumb component: Chỉ nhận props và render
 * - Simple icons: Tối ưu performance, dễ quản lý theme
 * - Reusable: Dùng được cho mọi màn hình
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { IconSymbol, IconSymbolName } from '../ui/Icon';

export type StateType = 'network' | 'server' | 'not-found' | 'empty' | 'forbidden';

export interface StateViewProps {
    type: StateType;
    title?: string;
    message?: string;
    /** Handler cho action button */
    onAction?: () => void;
    /** Custom label cho action button */
    actionLabel?: string;
    /** Secondary action handler (vd: "Về trang chủ") */
    onSecondaryAction?: () => void;
    /** Secondary action label */
    secondaryActionLabel?: string;
    /** Full screen hay inline */
    fullScreen?: boolean;
    errorCode?: string | number;
    animated?: boolean;
}

// ============================================
// DEFAULT CONFIGURATIONS
// ============================================

interface StateConfig {
    icon: IconSymbolName;
    colorKey: 'error' | 'warning' | 'secondary' | 'info';
    title: string;
    message: string;
    actionLabel: string;
}

const DEFAULT_CONFIG: Record<StateType, StateConfig> = {
    network: {
        icon: 'wifi' as IconSymbolName,
        colorKey: 'error',
        title: 'Mất kết nối mạng',
        message: 'Vui lòng kiểm tra kết nối internet và thử lại.',
        actionLabel: 'Thử lại',
    },
    server: {
        icon: 'cloud-offline-outline' as IconSymbolName,
        colorKey: 'warning',
        title: 'Lỗi hệ thống',
        message: 'Đã có lỗi xảy ra, chúng tôi đang khắc phục. Vui lòng thử lại sau.',
        actionLabel: 'Thử lại',
    },
    'not-found': {
        icon: 'search' as IconSymbolName,
        colorKey: 'secondary',
        title: 'Không tìm thấy',
        message: 'Dữ liệu không tồn tại hoặc đã bị xóa.',
        actionLabel: 'Quay lại',
    },
    empty: {
        icon: 'folder-open-outline' as IconSymbolName,
        colorKey: 'secondary',
        title: 'Chưa có dữ liệu',
        message: 'Danh sách đang trống.',
        actionLabel: 'Tải lại',
    },
    forbidden: {
        icon: 'lock-closed-outline' as IconSymbolName,
        colorKey: 'warning',
        title: 'Không có quyền truy cập',
        message: 'Bạn không có quyền xem nội dung này.',
        actionLabel: 'Quay lại',
    },
};

// ============================================
// COMPONENT
// ============================================

export const StateView: React.FC<StateViewProps> = ({
    type,
    title,
    message,
    onAction,
    actionLabel,
    onSecondaryAction,
    secondaryActionLabel,
    fullScreen = true,
    errorCode,
    animated = true,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('common');

    // Setup default fallback config structure since we use i18n
    const config = {
        icon: DEFAULT_CONFIG[type].icon,
        colorKey: DEFAULT_CONFIG[type].colorKey,
    };

    // Translate with fallback keys
    const translationKey = type === 'not-found' ? 'notFound' : type;
    const defaultTitle = t(`stateView.${translationKey}.title` as any);
    const defaultMessage = t(`stateView.${translationKey}.message` as any);
    const defaultActionLabel = t(`stateView.${translationKey}.actionLabel` as any);

    const iconColor = theme.colors[config.colorKey];

    const content = (
        <View
            style={[styles.container, fullScreen && styles.fullScreen]}
            accessible={true}
            accessibilityRole="alert"
            accessibilityLabel={`${title || defaultTitle}. ${message || defaultMessage}`}
        >
            {/* Icon Container */}
            <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
                <IconSymbol
                    name={config.icon}
                    size={48}
                    color={iconColor}
                />
            </View>

            {/* Title */}
            <Text
                style={styles.title}
                accessibilityRole="header"
            >
                {title || defaultTitle}
            </Text>

            {/* Message */}
            <Text style={styles.message}>
                {message || defaultMessage}
            </Text>

            {/* Error Code (for debugging) */}
            {errorCode && (
                <Text style={styles.errorCode}>
                    {t('stateView.actions.errorCode', { code: String(errorCode) })}
                </Text>
            )}

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
                {/* Primary Action */}
                {onAction && (
                    <TouchableOpacity
                        style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
                        onPress={onAction}
                        accessibilityRole="button"
                        accessibilityHint="Chạm để thử tải lại dữ liệu"
                    >
                        <IconSymbol name="refresh" size={18} color={theme.colors.onPrimary} />
                        <Text style={[styles.primaryButtonText, { color: theme.colors.onPrimary }]}>
                            {actionLabel || defaultActionLabel}
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Secondary Action */}
                {onSecondaryAction && (
                    <TouchableOpacity
                        style={[styles.secondaryButton, { borderColor: theme.colors.secondary }]}
                        onPress={onSecondaryAction}
                        accessibilityRole="button"
                    >
                        <Text style={[styles.secondaryButtonText, { color: theme.colors.typography }]}>
                            {secondaryActionLabel || t('stateView.actions.home')}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    // Wrap with animation if enabled
    if (animated) {
        return (
            <Animated.View
                entering={FadeIn.duration(300)}
                exiting={FadeOut.duration(200)}
                style={fullScreen ? styles.fullScreen : undefined}
            >
                {content}
            </Animated.View>
        );
    }

    return content;
};

const styles = StyleSheet.create((theme) => ({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.margins.xl,
    },
    fullScreen: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    iconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.margins.lg,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.typography,
        textAlign: 'center',
        marginBottom: theme.margins.sm,
    },
    message: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: theme.margins.md,
        marginBottom: theme.margins.lg,
    },
    errorCode: {
        fontSize: 12,
        color: theme.colors.secondary,
        marginBottom: theme.margins.lg,
    },
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.smd,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.margins.smd,
        paddingHorizontal: theme.margins.lg,
        borderRadius: theme.radius.l,
        gap: theme.margins.sm,
    },
    primaryButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    secondaryButton: {
        paddingVertical: theme.margins.smd,
        paddingHorizontal: theme.margins.lg,
        borderRadius: theme.radius.l,
        borderWidth: 1,
    },
    secondaryButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
}));
