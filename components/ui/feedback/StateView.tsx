import { IconSymbol } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import { Navigator } from '@/utils/navigation';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export type StateViewType = 'error' | 'empty' | 'offline' | 'not-found' | 'forbidden';

interface StateViewProps {
    type: StateViewType;
    title?: string;
    message?: string;
    onRetry?: () => void;
    onBack?: () => void;
    customIcon?: string;
    primaryActionLabel?: string;
}

/**
 * StateView - Unified Feedback UI for the whole App
 * Senior Architecture: Dumb Component for handling all non-success states.
 */
export const StateView: React.FC<StateViewProps> = ({
    type,
    title,
    message,
    onRetry,
    onBack,
    customIcon,
    primaryActionLabel,
}) => {
    const { theme } = useUnistyles();

    // Configuration Factory based on Type
    const config = {
        'not-found': {
            icon: 'search-off',
            defaultTitle: 'Không tìm thấy kết quả',
            defaultMessage: 'Dữ liệu này không tồn tại hoặc đã bị xóa khỏi hệ thống.',
            buttonLabel: 'Quay lại',
            action: onBack || (() => Navigator.back()),
        },
        'forbidden': {
            icon: 'lock-outline',
            defaultTitle: 'Truy cập bị từ chối',
            defaultMessage: 'Bạn không có quyền xem thông tin này.',
            buttonLabel: 'Về trang chủ',
            action: onBack || (() => Navigator.replace(ROUTES.TABS.HOME)),
        },
        'offline': {
            icon: 'wifi-off',
            defaultTitle: 'Mất kết nối Internet',
            defaultMessage: 'Vui lòng kiểm tra lại kết nối mạng của bạn.',
            buttonLabel: 'Thử lại',
            action: onRetry,
        },
        'empty': {
            icon: 'inbox',
            defaultTitle: 'Danh sách trống',
            defaultMessage: 'Hiện chưa có dữ liệu nào ở đây.',
            buttonLabel: 'Khám phá ngay',
            action: onBack,
        },
        'error': {
            icon: 'error-outline',
            defaultTitle: 'Đã xảy ra lỗi',
            defaultMessage: 'Hệ thống gặp sự cố ngoài ý muốn. Vui lòng thử lại sau.',
            buttonLabel: 'Thử lại',
            action: onRetry,
        }
    }[type];

    const handleAction = config.action;
    const iconName = customIcon || config.icon;

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconWrapper}>
                    <IconSymbol name={iconName as any} size={72} color={theme.colors.secondary} />
                    <View style={styles.iconBg} />
                </View>

                <Text style={styles.title}>{title || config.defaultTitle}</Text>
                <Text style={styles.message}>{message || config.defaultMessage}</Text>

                {handleAction && (
                    <Pressable
                        onPress={handleAction}
                        style={({ pressed }) => [
                            styles.primaryButton,
                            pressed && styles.buttonPressed
                        ]}
                    >
                        <Text style={styles.buttonText}>
                            {primaryActionLabel || config.buttonLabel}
                        </Text>
                    </Pressable>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.margins.xl,
    },
    content: {
        alignItems: 'center',
        width: '100%',
    },
    iconWrapper: {
        marginBottom: theme.margins.xl,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconBg: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.surface,
        zIndex: -1,
        ...theme.shadows.small,
        opacity: 0.5,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.typography,
        textAlign: 'center',
        marginBottom: theme.margins.sm,
    },
    message: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: theme.margins.xxl,
        paddingHorizontal: theme.margins.lg,
    },
    primaryButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.margins.xxl,
        paddingVertical: theme.margins.md,
        borderRadius: theme.radius.m,
        minWidth: 160,
        alignItems: 'center',
    },
    buttonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    buttonText: {
        color: theme.colors.onPrimary,
        fontSize: 15,
        fontWeight: '600',
    },
}));
