/**
 * ==============================================
 * CANCEL ORDER SCREEN - Màn hình Huỷ đơn hàng
 * ==============================================
 * Route: /(main)/(order)/cancel/[id]
 * 
 * Features:
 * - Order summary preview
 * - Reason selector with validation
 * - Refund policy card (dynamic based on payment method)
 * - Voucher warning
 * - Confirm alert before submit
 */

import {
    CancelReasonSelector,
    OrderSummarySnippet,
    RefundPolicyCard,
} from '@/components/orders/cancel';
import { IconSymbol } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import { useCancelOrder } from '@/hooks/api/order/useCancelOrder';
import { useOrderDetail } from '@/hooks/api/order/useOrderDetail';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import type { CancelReasonCode } from '@/types/order/cancel';
import { MIN_OTHER_REASON_LENGTH } from '@/types/order/cancelReasons';
import { Alert as CustomAlertHelper } from '@/utils/AlertHelper';
import { logger } from '@/utils/logger';
import { Navigator } from '@/utils/navigation';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export default function CancelOrderScreen() {
    // Unlock navigation when screen gains focus
    useNavigationUnlockOnFocus();

    const { id: orderId, fromDetail } = useLocalSearchParams<{

        id: string;
        fromDetail?: string;
    }>();
    const { theme } = useUnistyles();
    const { t } = useTranslation(['order', 'common']);
    const styles = stylesheet;
    const { bottom } = useSafeAreaInsets();

    // === STATE ===
    const [selectedReason, setSelectedReason] = useState<CancelReasonCode | null>(null);
    const [otherReasonText, setOtherReasonText] = useState('');
    const [showOtherError, setShowOtherError] = useState(false);

    // === DATA FETCHING ===
    const { data: orderData, isLoading: isLoadingOrder } = useOrderDetail(orderId);
    const order = orderData?.ui;
    const rawOrder = orderData?.raw;

    // === MUTATION ===
    const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder({
        onSuccess: () => {
            Toast.show({
                type: 'success',
                text1: t('common:status.success'),
                text2: t('cancel.success'),
            });
            if (fromDetail === 'true') {
                Navigator.replace(`${ROUTES.ORDERS.LIST}?tab=cancelled`);
            } else {
                Navigator.back();
            }
        },
    });

    // === COMPUTED ===
    const hasVoucher = useMemo(() => {
        if (!rawOrder) return false;
        // Check if order has any discount (voucher applied)
        return (
            (rawOrder.pricing?.totalDiscount ?? 0) > 0 ||
            !!rawOrder.pricing?.appliedVoucherCodes
        );
    }, [rawOrder]);

    // Get the final reason text to send to API
    const getFinalReasonText = useCallback((): string | null => {
        if (!selectedReason) return null;

        if (selectedReason === 'OTHER') {
            return otherReasonText.trim();
        }
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        return t(`cancel.reasons.${selectedReason}` as any);
    }, [selectedReason, otherReasonText, t]);

    // === VALIDATION ===
    const validateForm = useCallback((): boolean => {
        // 1. Must select a reason
        if (!selectedReason) {
            Toast.show({
                type: 'error',
                text1: t('cancel.selectReason'),
            });
            return false;
        }

        // 2. If "OTHER" selected, must enter detail text
        if (selectedReason === 'OTHER') {
            const trimmedText = otherReasonText.trim();
            if (trimmedText.length < MIN_OTHER_REASON_LENGTH) {
                setShowOtherError(true);
                Toast.show({
                    type: 'error',
                    text1: t('cancel.otherReasonError'),
                    text2: t('cancel.otherReasonMinChars', { count: MIN_OTHER_REASON_LENGTH }),
                });
                return false;
            }
        }

        return true;
    }, [selectedReason, otherReasonText, t]);

    // === HANDLERS ===
    const handleBack = useCallback(() => {
        Navigator.back();
    }, []);

    const handleReasonChange = useCallback((code: CancelReasonCode) => {
        setSelectedReason(code);
        setShowOtherError(false);
    }, []);

    const handleOtherTextChange = useCallback((text: string) => {
        setOtherReasonText(text);
        if (text.trim().length >= MIN_OTHER_REASON_LENGTH) {
            setShowOtherError(false);
        }
    }, []);

    const handleSubmit = useCallback(() => {
        if (!orderId || !validateForm()) return;

        const reasonText = getFinalReasonText();
        if (!reasonText) return;

        // Confirm alert before submitting
        const confirmMessage = hasVoucher
            ? t('cancel.confirmMessageVoucher')
            : t('cancel.confirmMessage');

        CustomAlertHelper.show({
            title: t('cancel.confirmTitle'),
            message: confirmMessage,
            type: 'warning',
            confirmText: t('actions.cancel'),
            cancelText: t('common:actions.no'),
            onConfirm: () => {
                logger.api.info('Submitting cancel order:', orderId, reasonText);
                cancelOrder({
                    orderId,
                    reason: reasonText,
                });
            },
        });
    }, [orderId, validateForm, getFinalReasonText, hasVoucher, cancelOrder, t]);

    // === RENDER: Loading ===
    if (isLoadingOrder) {
        return (
            <View style={styles.container}>
                <Header onBack={handleBack} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>{t('cancel.loading')}</Text>
                </View>
            </View>
        );
    }

    // === RENDER: Error ===
    if (!order || !rawOrder) {
        return (
            <View style={styles.container}>
                <Header onBack={handleBack} />
                <View style={styles.errorContainer}>
                    <IconSymbol
                        name="error-outline"
                        size={48}
                        color={theme.colors.error}
                    />
                    <Text style={styles.errorTitle}>{t('cancel.notFound')}</Text>
                    <Text style={styles.errorMessage}>
                        {t('cancel.notFoundDetail')}
                    </Text>
                </View>
            </View>
        );
    }

    // === RENDER: Main ===
    return (
        <View style={styles.container}>
            <Header onBack={handleBack} />

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Order Summary */}
                    <OrderSummarySnippet
                        items={order.items}
                        grandTotal={order.grandTotal}
                        currency={order.currency}
                        orderNumber={order.orderNumber}
                        status={order.status}
                        shopName={order.shopName}
                    />

                    {/* Spacer */}
                    <View style={styles.spacer} />

                    {/* Reason Selector */}
                    <CancelReasonSelector
                        selectedReason={selectedReason}
                        onReasonChange={handleReasonChange}
                        otherReasonText={otherReasonText}
                        onOtherTextChange={handleOtherTextChange}
                        showOtherError={showOtherError}
                    />

                    {/* Spacer */}
                    <View style={styles.spacer} />

                    {/* Refund Policy Card */}
                    <RefundPolicyCard
                        paymentMethod={rawOrder.payment.method}
                        status={rawOrder.status}
                        hasVoucher={hasVoucher}
                    />
                </ScrollView>

                {/* Footer with Submit Button */}
                <View style={[styles.footer, { paddingBottom: bottom || 16 }]}>
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            (!selectedReason || isCancelling) && styles.submitButtonDisabled,
                        ]}
                        onPress={handleSubmit}
                        activeOpacity={0.7}
                        disabled={!selectedReason || isCancelling}
                        accessibilityLabel={t('cancel.submit')}
                        accessibilityRole="button"
                    >
                        {isCancelling ? (
                            <ActivityIndicator size="small" color={theme.colors.onPrimary} />
                        ) : (
                            <>
                                <Text style={styles.submitButtonText}>{t('cancel.submit')}</Text>
                                <IconSymbol
                                    name="send"
                                    size={18}
                                    color={theme.colors.onPrimary}
                                />
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

// === HEADER COMPONENT ===
interface HeaderProps {
    onBack: () => void;
}

const Header: React.FC<HeaderProps> = ({ onBack }) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation(['order', 'common']);
    const styles = stylesheet;
    const { top } = useSafeAreaInsets();

    return (
        <View style={[styles.header, { paddingTop: top + 8 }]}>
            <TouchableOpacity
                style={styles.headerBackButton}
                onPress={onBack}
                activeOpacity={0.7}
                accessibilityLabel={t('common:actions.back')}
                accessibilityRole="button"
            >
                <IconSymbol
                    name="arrow-back"
                    size={24}
                    color={theme.colors.typography}
                />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('cancel.title')}</Text>
            <View style={styles.headerSpacer} />
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: theme.margins.xl,
    },
    spacer: {
        height: theme.margins.sm,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.smd,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerBackButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: -theme.margins.sm,
    },
    headerTitle: {
        flex: 1,
        fontSize: 17,
        fontWeight: '700',
        color: theme.colors.typography,
        textAlign: 'center',
    },
    headerSpacer: {
        width: 40,
    },

    // Loading
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: theme.margins.md,
    },
    loadingText: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
    },

    // Error
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.margins.xl,
        gap: theme.margins.smd,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.typography,
        marginTop: theme.margins.sm,
    },
    errorMessage: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
    },

    // Footer
    footer: {
        paddingTop: theme.margins.smd,
        paddingHorizontal: theme.margins.md,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.primary,
        gap: theme.margins.sm,
    },
    submitButtonDisabled: {
        backgroundColor: theme.colors.secondary,
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.onPrimary,
    },
}));
