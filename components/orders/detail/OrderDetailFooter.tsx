/**
 * ==============================================
 * ORDER DETAIL FOOTER - Sticky Footer với Action Buttons
 * ==============================================
 * Dynamic action buttons based on order status:
 * - PENDING: Huỷ đơn, Liên hệ shop
 * - SHIPPED: Theo dõi, Đã nhận hàng
 * - COMPLETED: Mua lại, Đánh giá
 * - CANCELLED: Mua lại
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { OrderStatus, OrderUI } from '@/types/order/order';
import { getOrderActions } from '@/utils/adapter/order/orderActions';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ActionButtonProps {
    label: string;
    icon: string;
    variant: 'primary' | 'secondary' | 'danger';
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
    label,
    icon,
    variant,
    onPress,
    loading = false,
    disabled = false,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const buttonStyle = useMemo(() => {
        switch (variant) {
            case 'primary':
                return styles.buttonPrimary;
            case 'danger':
                return styles.buttonDanger;
            default:
                return styles.buttonSecondary;
        }
    }, [variant, styles]);

    const textStyle = useMemo(() => {
        switch (variant) {
            case 'primary':
                return styles.textPrimary;
            case 'danger':
                return styles.textDanger;
            default:
                return styles.textSecondary;
        }
    }, [variant, styles]);

    const iconColor = useMemo(() => {
        switch (variant) {
            case 'primary':
                return theme.colors.onPrimary;
            case 'danger':
                return theme.colors.error;
            default:
                return theme.colors.typography;
        }
    }, [variant, theme]);

    return (
        <TouchableOpacity
            style={[
                styles.button,
                buttonStyle,
                disabled && styles.buttonDisabled,
            ]}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={disabled || loading}
        >
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={variant === 'primary' ? theme.colors.onPrimary : theme.colors.newPrimary}
                />
            ) : (
                <>
                    <IconSymbol
                        name={icon as keyof typeof IconSymbol}
                        size={18}
                        color={iconColor}
                    />
                    <Text style={[styles.buttonText, textStyle]}>{label}</Text>
                </>
            )}
        </TouchableOpacity>
    );
};

interface OrderDetailFooterProps {
    order?: OrderUI;
    status: OrderStatus;
    canReview: boolean;
    onCancel?: () => void;
    onContactShop?: () => void;
    onTrackOrder?: () => void;
    onConfirmReceived?: () => void;
    onReturn?: () => void;
    onRebuy?: () => void;
    onReview?: () => void;
    onPay?: () => void;
    loadingAction?: 'cancel' | 'confirm' | null;
}

export const OrderDetailFooter: React.FC<OrderDetailFooterProps> = ({
    order,
    status,
    canReview,
    onCancel,
    onContactShop,
    onTrackOrder,
    onConfirmReceived,
    onReturn,
    onRebuy,
    onReview,
    onPay,
    loadingAction = null,
}) => {
    const styles = stylesheet;
    const { t } = useTranslation(['order', 'common']);
    const { bottom } = useSafeAreaInsets();

    // Get available actions based on status or full order
    const actions = useMemo(() => getOrderActions(order || status), [order, status]);

    // Map array actions to buttons
    const buttons = useMemo(() => {
        return actions.map((action) => {
            let onPress = () => { };
            let loading = false;

            switch (action.action) {
                case 'cancel':
                    onPress = onCancel || (() => { });
                    loading = loadingAction === 'cancel';
                    break;
                case 'contact':
                    onPress = onContactShop || (() => { });
                    break;
                case 'track':
                    onPress = onTrackOrder || (() => { });
                    break;
                case 'received':
                    onPress = onConfirmReceived || (() => { });
                    loading = loadingAction === 'confirm';
                    break;
                case 'rebuy':
                    onPress = onRebuy || (() => { });
                    break;
                case 'return':
                    onPress = onReturn || (() => { });
                    break;
                case 'review':
                    onPress = onReview || (() => { });
                    break;
                case 'pay':
                    onPress = onPay || (() => { });
                    break;
            }

            return {
                key: action.action,
                label: t(action.labelKey as any),
                icon: action.icon || '',
                variant: action.type,
                onPress,
                loading,
                // Hide review if already reviewed (though getOrderActions handles this)
                hidden: action.action === 'review' && !canReview,
            };
        }).filter(b => !b.hidden);
    }, [actions, onCancel, onContactShop, onTrackOrder, onConfirmReceived, onRebuy, onReview, loadingAction, canReview, t]);

    // Don't render if no actions
    if (buttons.length === 0) {
        return null;
    }

    return (
        <View style={[styles.container, { paddingBottom: bottom || 16 }]}>
            <View style={styles.buttonRow}>
                {buttons.map((btn) => (
                    <ActionButton
                        key={btn.key}
                        label={btn.label}
                        icon={btn.icon}
                        variant={btn.variant}
                        onPress={btn.onPress}
                        loading={btn.loading}
                    />
                ))}
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        paddingTop: theme.margins.smd,
        paddingHorizontal: theme.margins.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: theme.margins.sm,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: theme.margins.md,
        borderRadius: theme.radius.m,
        gap: 6,
    },
    buttonPrimary: {
        backgroundColor: theme.colors.newPrimary,
    },
    buttonSecondary: {
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    buttonDanger: {
        backgroundColor: theme.colors.errorLight,
        borderWidth: 1,
        borderColor: theme.colors.error,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    textPrimary: {
        color: theme.colors.onPrimary,
    },
    textSecondary: {
        color: theme.colors.typography,
    },
    textDanger: {
        color: theme.colors.error,
    },
}));
