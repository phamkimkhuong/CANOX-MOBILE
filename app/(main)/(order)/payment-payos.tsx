import { PaymentCountdown } from '@/components/checkout/PaymentCountdown';
import { IconSymbol } from '@/components/ui/Icon';
import { ROUTES, orderRoutes } from '@/constants/routes';
import { useOrderDetail } from '@/hooks/api/order/useOrderDetail';
import { Alert } from '@/utils/AlertHelper';
import { Navigator } from '@/utils/navigation';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Toast from 'react-native-toast-message';
import { StyleSheet, UnistylesRuntime, useUnistyles } from 'react-native-unistyles';

interface PayOSInfo {
    paymentMethod: string;
    depositId: string;
    paymentLink: string;
    qrCode: string;
    accountNumber: string;
    accountName: string;
    orderCode: string;
    amount: number;
    currency: string;
    description: string;
    expiredAt: number;
}

// Internal Copy Button component with visual feedback
const CopyButton = ({ text, label }: { text: string; label: string }) => {
    const { theme } = useUnistyles();
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        await Clipboard.setStringAsync(text);
        setCopied(true);

        Toast.show({
            type: 'success',
            text1: 'Đã sao chép thành công',
            text2: `${label}: ${text}`,
            position: 'top',
        });

        setTimeout(() => setCopied(false), 2000);
    }, [text, label]);

    return (
        <Pressable
            onPress={handleCopy}
            style={({ pressed }) => [
                stylesheet.copyButton,
                pressed && { opacity: 0.7 }
            ]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
            <IconSymbol
                name={copied ? 'check' : 'content-copy'}
                size={14}
                color={copied ? theme.colors.success : theme.colors.primary}
            />
            <Text style={[
                stylesheet.copyText,
                { color: copied ? theme.colors.success : theme.colors.primary }
            ]}>
                {copied ? 'Đã sao chép' : 'Sao chép'}
            </Text>
        </Pressable>
    );
};

export default function PaymentPayOSScreen() {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const router = useRouter();
    const [isExpired, setIsExpired] = useState(false);
    const { id, paymentInfo: paymentInfoRaw } = useLocalSearchParams<{ id?: string, paymentInfo?: string }>();

    const paymentInfo = useMemo<PayOSInfo | null>(() => {
        if (!paymentInfoRaw) return null;
        try {
            return JSON.parse(paymentInfoRaw);
        } catch (e) {
            console.error('Failed to parse paymentInfo', e);
            return null;
        }
    }, [paymentInfoRaw]);

    // Polling logic using useOrderDetail
    const { data: orderResponse } = useOrderDetail(id || null, {
        enabled: !!id,
        // @ts-expect-error: PayOS SDK might have loose types - refetchInterval can be a function in TanStack Query
        refetchInterval: (query: any) => {
            const status = query.state.data?.raw?.status;
            if (status === 'PAID' || status === 'CANCELLED') {
                return false;
            }
            return 3000;
        },
        refetchIntervalInBackground: true,
    });

    // Listen for status changes
    useEffect(() => {
        const status = orderResponse?.raw?.status;
        if (status === 'PAID') {
            router.replace(ROUTES.ORDERS.SUCCESS);
        } else if (status === 'CANCELLED') {
            Alert.show({
                title: 'Thanh toán thất bại',
                message: 'Đơn hàng đã bị hủy hoặc hết hạn thanh toán.',
                type: 'error',
                onConfirm: () => {
                    if (id) {
                        router.replace(orderRoutes.detail(id));
                    } else {
                        Navigator.back();
                    }
                }
            });
        }
    }, [orderResponse?.raw?.status, id, router]);

    const handleOpenBankApp = useCallback(() => {
        if (paymentInfo?.paymentLink) {
            Linking.openURL(paymentInfo.paymentLink);
        }
    }, [paymentInfo?.paymentLink]);

    const handleCancelOrder = useCallback(() => {
        Alert.show({
            title: 'Thanh toán sau?',
            message: 'Bạn có thể tiếp tục thanh toán trong mục Chi tiết đơn hàng.',
            type: 'warning',
            showCancel: true,
            confirmText: 'Đồng ý',
            cancelText: 'Quay lại',
            onConfirm: () => {
                if (id) {
                    router.replace(orderRoutes.detail(id));
                } else {
                    Navigator.back();
                }
            }
        });
    }, [id, router]);

    const handleBack = useCallback(() => {
        if (id) {
            router.replace(orderRoutes.detail(id));
        } else {
            Navigator.back();
        }
    }, [id, router]);

    const handleExpire = useCallback(() => {
        setIsExpired(true);
        Alert.show({
            title: 'Thanh toán hết hạn',
            message: 'Đơn hàng đã hết hạn thanh toán. Vui lòng quay lại chi tiết đơn hàng để đặt lại đơn mới.',
            type: 'error',
            confirmText: 'Xem chi tiết',
            onConfirm: () => {
                if (id) {
                    router.replace(orderRoutes.detail(id));
                } else {
                    Navigator.back();
                }
            }
        });
    }, [id, router]);


    if (!paymentInfo) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.errorText}>Đang tải thông tin thanh toán...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header / Timer Section */}
            <View style={styles.header}>
                <Pressable onPress={handleBack} style={styles.backButton}>
                    <IconSymbol name="back" size={24} color={theme.colors.typography} />
                </Pressable>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Chuyển khoản ngân hàng</Text>
                    <View style={styles.timerRow}>
                        <IconSymbol name="time" size={14} color={theme.colors.warning} />
                        <PaymentCountdown
                            expiredAt={paymentInfo.expiredAt}
                            onExpire={handleExpire}
                            label="Thanh toán trước"
                            containerStyle={{ marginLeft: 4 }}
                            textStyle={styles.timerText}
                        />
                    </View>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Status Section */}
                <View style={styles.statusCard}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                    <Text style={styles.statusText}>Đang chờ thanh toán...</Text>
                </View>

                {/* QR Section */}
                <View style={[styles.qrCard, isExpired && styles.disabledCard]}>
                    <View style={[styles.qrContainer, isExpired && { opacity: 0.3 }]}>
                        <QRCode
                            value={paymentInfo.qrCode}
                            size={200}
                            color="black"
                            backgroundColor="white"
                        />
                    </View>
                    <View style={styles.qrFooter}>
                        <View style={styles.brandLogo}>
                            <Text style={styles.brandText}>VietQR</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.brandLogo}>
                            <Text style={styles.brandText}>Napas247</Text>
                        </View>
                    </View>
                    {isExpired ? (
                        <Text style={styles.expiredHint}>Mã QR đã hết hiệu lực</Text>
                    ) : (
                        <Text style={styles.qrHint}>Quét mã QR để thanh toán nhanh</Text>
                    )}
                </View>

                {/* Info Section */}
                <View style={styles.infoSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Thông tin chuyển khoản</Text>
                        <Text style={styles.sectionSubtitle}>Dùng cho chuyển khoản thủ công</Text>
                    </View>

                    {/* Bank Info */}
                    <View style={styles.infoRow}>
                        <View style={styles.infoLabelContainer}>
                            <Text style={styles.infoLabel}>Ngân hàng</Text>
                        </View>
                        <View style={styles.infoValueContainer}>
                            <View style={styles.bankTag}>
                                <Text style={styles.bankName}>MB Bank</Text>
                            </View>
                            <Text style={styles.accountName}>{paymentInfo.accountName}</Text>
                        </View>
                    </View>

                    {/* Account Number */}
                    <View style={styles.infoRow}>
                        <View style={styles.infoLabelContainer}>
                            <Text style={styles.infoLabel}>Số tài khoản</Text>
                        </View>
                        <View style={[styles.infoValueContainer, styles.rowValueContainer]}>
                            <Text style={styles.valueText}>{paymentInfo.accountNumber}</Text>
                            <CopyButton text={paymentInfo.accountNumber} label="Số tài khoản" />
                        </View>
                    </View>

                    {/* Amount */}
                    <View style={styles.infoRow}>
                        <View style={styles.infoLabelContainer}>
                            <Text style={styles.infoLabel}>Số tiền</Text>
                        </View>
                        <View style={[styles.infoValueContainer, styles.rowValueContainer]}>
                            <Text style={[styles.valueText, styles.amountText]}>
                                {paymentInfo.amount.toLocaleString('vi-VN')} {paymentInfo.currency}
                            </Text>
                            <CopyButton text={paymentInfo.amount.toString()} label="Số tiền" />
                        </View>
                    </View>

                    {/* Content */}
                    <View style={styles.infoRow}>
                        <View style={styles.infoLabelContainer}>
                            <Text style={styles.infoLabel}>Nội dung</Text>
                        </View>
                        <View style={[styles.infoValueContainer, styles.rowValueContainer]}>
                            <Text style={[styles.valueText, styles.descriptionText]}>
                                {paymentInfo.description}
                            </Text>
                            <CopyButton text={paymentInfo.description} label="Nội dung" />
                        </View>
                    </View>
                </View>

                {/* Footer Buttons */}
                <View style={styles.footerActions}>
                    <Pressable
                        style={[styles.primaryButton, isExpired && styles.disabledButton]}
                        onPress={handleOpenBankApp}
                        disabled={isExpired}
                    >
                        <Text style={styles.primaryButtonText}>Mở App Ngân hàng</Text>
                    </Pressable>
                    <Pressable
                        style={styles.secondaryButton}
                        onPress={handleCancelOrder}
                        disabled={isExpired}
                    >
                        <Text style={[styles.secondaryButtonText, isExpired && { opacity: 0.5 }]}>Thanh toán sau</Text>
                    </Pressable>
                </View>

                <View style={styles.bottomSpacing} />
            </ScrollView>
        </View>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: UnistylesRuntime.insets.top,
        paddingBottom: theme.margins.sm,
        paddingHorizontal: theme.margins.md,
        backgroundColor: theme.colors.surface,
    },
    backButton: {
        padding: theme.margins.sm,
    },
    headerContent: {
        flex: 1,
        marginLeft: theme.margins.sm,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    timerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    timerText: {
        fontSize: 13,
        color: theme.colors.warning,
        fontWeight: '600',
        marginLeft: 4,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: theme.margins.md,
    },
    statusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primaryMuted,
        paddingVertical: theme.margins.smd,
        borderRadius: theme.radius.m,
        marginBottom: theme.margins.sm,
    },
    statusText: {
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: '500',
        marginLeft: theme.margins.sm,
    },
    qrCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.l,
        padding: theme.margins.md,
        alignItems: 'center',
        ...theme.shadows.medium,
        marginBottom: theme.margins.md
    },
    qrContainer: {
        padding: theme.margins.md,
        backgroundColor: 'white',
        borderRadius: theme.radius.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    qrFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.margins.sm
    },
    brandLogo: {
        paddingHorizontal: theme.margins.md,
    },
    brandText: {
        fontSize: 16,
        fontWeight: '900',
        color: '#00377B', // VietQR color
    },
    divider: {
        width: 1,
        height: 20,
        backgroundColor: theme.colors.border,
    },
    qrHint: {
        marginTop: theme.margins.sm,
        fontSize: 13,
        color: theme.colors.typographySecondary,
    },
    expiredHint: {
        marginTop: theme.margins.sm,
        fontSize: 13,
        color: theme.colors.error,
        fontWeight: '600',
    },
    disabledCard: {
        opacity: 0.8,
        backgroundColor: theme.colors.backgroundInput,
    },
    disabledButton: {
        backgroundColor: theme.colors.border,
        elevation: 0,
        shadowOpacity: 0,
    },
    infoSection: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.l,
        padding: theme.margins.md,
        marginBottom: theme.margins.md
    },
    sectionHeader: {
        marginBottom: theme.margins.sm
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    sectionSubtitle: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        marginTop: 2,
    },
    infoRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    infoLabelContainer: {
        width: 100,
    },
    infoLabel: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
    },
    infoValueContainer: {
        flex: 1,
        paddingLeft: theme.margins.sm,
    },
    rowValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bankTag: {
        backgroundColor: '#F0F5FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginBottom: 4,
    },
    bankName: {
        fontSize: 12,
        fontWeight: '700',
        color: '#005DCB', // MB Bank blue
    },
    accountName: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    valueText: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    amountText: {
        color: theme.colors.primary,
        fontSize: 18,
    },
    descriptionText: {
        color: theme.colors.error,
        fontSize: 17,
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        backgroundColor: theme.colors.primaryMuted,
        borderRadius: 6,
        gap: 4,
    },
    copyText: {
        fontSize: 13,
        fontWeight: '600',
    },
    footerActions: {
        gap: theme.margins.md,
    },
    primaryButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 14,
        borderRadius: theme.radius.xl,
        alignItems: 'center',
        ...theme.shadows.medium,
    },
    primaryButtonText: {
        color: theme.colors.onPrimary,
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryButton: {
        paddingVertical: 14,
        borderRadius: theme.radius.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    secondaryButtonText: {
        color: theme.colors.typographySecondary,
        fontSize: 16,
        fontWeight: '600',
    },
    errorText: {
        marginTop: theme.margins.md,
        fontSize: 14,
        color: theme.colors.typographySecondary,
    },
    bottomSpacing: {
        height: 40,
    },
}));
