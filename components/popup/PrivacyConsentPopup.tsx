import { IconSymbol } from '@/components/ui/Icon';
import { usePrivacyConsent } from '@/hooks/usePrivacyConsent';
import React, { useState } from 'react';
import { Modal, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

/**
 * PrivacyConsentPopup - A premium modal component to handle GDPR/Apple Privacy consent.
 * This should be shown on the first launch or through settings.
 */
export const PrivacyConsentPopup: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
    const { theme } = useUnistyles();
    const { acceptPrivacy } = usePrivacyConsent();

    // Local state for toggles
    const [crashEnabled, setCrashEnabled] = useState(true);
    const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

    const handleSave = async () => {
        await acceptPrivacy(crashEnabled, analyticsEnabled);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Header with Icon */}
                    <View style={styles.header}>
                        <View style={styles.iconCircle}>
                            <IconSymbol name="policy" size={32} color={theme.colors.vibrantRed} />
                        </View>
                        <Text style={styles.title}>Quyền riêng tư & Dữ liệu</Text>
                        <Text style={styles.description}>
                            Để cải thiện app và sửa lỗi nhanh hơn, chúng tôi muốn thu thập dữ liệu kỹ thuật ẩn danh. Bạn có thể thay đổi lựa chọn bất cứ lúc nào trong Cài đặt.
                        </Text>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Crash Reporting Toggle */}
                        <View style={styles.optionRow}>
                            <View style={styles.optionTextContainer}>
                                <View style={styles.optionHeader}>
                                    <IconSymbol name="bug-outline" size={20} color={theme.colors.typography} />
                                    <Text style={styles.optionLabel}>Báo cáo lỗi & crash</Text>
                                </View>
                                <Text style={styles.optionSubtext}>
                                    Gửi thông tin kỹ thuật (stack trace, thiết bị) để sửa lỗi nhanh hơn. Không thu thập thông tin cá nhân.
                                </Text>
                            </View>
                            <Switch
                                value={crashEnabled}
                                onValueChange={setCrashEnabled}
                                trackColor={{ false: theme.colors.border, true: theme.colors.vibrantRed }}
                                thumbColor={theme.colors.surface}
                            />
                        </View>

                        {/* Analytics Toggle */}
                        <View style={styles.optionRow}>
                            <View style={styles.optionTextContainer}>
                                <View style={styles.optionHeader}>
                                    <IconSymbol name="analytics-outline" size={20} color={theme.colors.typography} />
                                    <Text style={styles.optionLabel}>Thống kê sử dụng</Text>
                                </View>
                                <Text style={styles.optionSubtext}>
                                    Ghi nhận hành vi (xem sản phẩm, thêm giỏ hàng) để tối ưu trải nghiệm và cá nhân hóa khuyến mãi.
                                </Text>
                            </View>
                            <Switch
                                value={analyticsEnabled}
                                onValueChange={setAnalyticsEnabled}
                                trackColor={{ false: theme.colors.border, true: theme.colors.vibrantRed }}
                                thumbColor={theme.colors.surface}
                            />
                        </View>

                        <View style={styles.footerInfo}>
                            <Text style={styles.footerText}>
                                Bằng cách tiếp tục, bạn đồng ý với{' '}
                                <Text style={styles.linkText}>Chính sách quyền riêng tư</Text> của CanoX.
                            </Text>
                        </View>
                    </ScrollView>

                    {/* Action Button */}
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.saveButtonText}>Lưu lựa chọn</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create((theme) => ({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.margins.lg,
    },
    modalContainer: {
        width: '100%',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.xl,
        padding: theme.margins.lg,
        maxHeight: '80%',
        ...theme.shadows.large,
    },
    header: {
        alignItems: 'center',
        marginBottom: theme.margins.lg,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: theme.colors.redSoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.margins.md,
    },
    title: {
        fontSize: theme.fontSizes.xl,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.typography,
        marginBottom: theme.margins.sm,
        textAlign: 'center',
    },
    description: {
        fontSize: theme.fontSizes.md,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    content: {
        marginBottom: theme.margins.lg,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: theme.margins.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderMuted,
    },
    optionTextContainer: {
        flex: 1,
        paddingRight: theme.margins.md,
    },
    optionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    optionLabel: {
        fontSize: theme.fontSizes.md,
        fontWeight: theme.fontWeights.semibold,
        color: theme.colors.typography,
    },
    optionSubtext: {
        fontSize: theme.fontSizes.sm,
        color: theme.colors.typographySecondary,
        lineHeight: 18,
    },
    footerInfo: {
        marginTop: theme.margins.lg,
        alignItems: 'center',
    },
    footerText: {
        fontSize: theme.fontSizes.xs,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
    },
    linkText: {
        color: theme.colors.vibrantRed,
        fontWeight: theme.fontWeights.medium,
        textDecorationLine: 'underline',
    },
    saveButton: {
        backgroundColor: theme.colors.vibrantRed,
        borderRadius: theme.radius.m,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.small,
    },
    saveButtonText: {
        color: theme.colors.onPrimary,
        fontSize: theme.fontSizes.base,
        fontWeight: theme.fontWeights.bold,
    },
}));
