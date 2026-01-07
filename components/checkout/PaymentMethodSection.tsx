/**
 * PaymentMethodSection Component
 * 
 * Allows user to select payment method.
 * Options: COD, Bank Transfer, E-Wallet, Credit Card
 * Opens bottom sheet for selection.
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { PaymentMethodType } from '@/types/checkout';
import React, { useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TouchableWithoutFeedback, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface PaymentMethodSectionProps {
    selectedMethod: PaymentMethodType;
    onSelect: (method: PaymentMethodType) => void;
}

// Payment method configurations with modern icons
const PAYMENT_METHODS: Array<{
    id: PaymentMethodType;
    name: string;
    description: string;
    icon: any; // Using IconSymbolName from Icon.tsx or any for simplicity
    iconColor: string;
}> = [
        {
            id: 'cod',
            name: 'Thanh toán khi nhận hàng',
            description: 'Thanh toán bằng tiền mặt khi nhận hàng',
            icon: 'cash',
            iconColor: '#10B981',
        },
        {
            id: 'bank_transfer',
            name: 'Chuyển khoản ngân hàng',
            description: 'Chuyển khoản qua tài khoản ngân hàng',
            icon: 'bank',
            iconColor: '#3B82F6',
        },
        // {
        //     id: 'e_wallet',
        //     name: 'Ví điện tử',
        //     description: 'MoMo, ZaloPay, VNPay...',
        //     icon: 'wallet',
        //     iconColor: '#A855F7',
        // },
        // {
        //     id: 'credit_card',
        //     name: 'Thẻ tín dụng / Ghi nợ',
        //     description: 'Visa, Mastercard, JCB',
        //     icon: 'card',
        //     iconColor: '#F59E0B',
        // },
    ];

export const PaymentMethodSection: React.FC<PaymentMethodSectionProps> = ({
    selectedMethod,
    onSelect,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const [isModalVisible, setIsModalVisible] = useState(false);

    const selectedConfig = PAYMENT_METHODS.find((m) => m.id === selectedMethod);

    const handleSelect = useCallback(
        (methodId: PaymentMethodType) => {
            onSelect(methodId);
            setIsModalVisible(false);
        },
        [onSelect]
    );

    return (
        <>
            {/* Section Container*/}
            <Pressable
                style={({ pressed }) => [
                    styles.container,
                    pressed && styles.containerPressed
                ]}
                onPress={() => setIsModalVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Chọn phương thức thanh toán"
            >
                {/* Section Title */}
                <View style={styles.titleRow}>
                    <View style={styles.titleIcon}>
                        <IconSymbol
                            name="receipt"
                            size={18}
                            color={theme.colors.primary}
                        />
                    </View>
                    <Text style={styles.title}>Phương thức thanh toán</Text>
                </View>

                {/* Selected Method */}
                <View style={styles.selectedRow}>
                    {selectedConfig && (
                        <>
                            <View style={[styles.selectedMethodIcon, { backgroundColor: `${selectedConfig.iconColor}12` }]}>
                                <IconSymbol
                                    name={selectedConfig.icon}
                                    size={22}
                                    color={selectedConfig.iconColor}
                                />
                            </View>
                            <View style={styles.methodInfo}>
                                <Text style={styles.methodName}>
                                    {selectedConfig.name}
                                </Text>
                            </View>
                            <IconSymbol
                                name="chevron-forward"
                                size={20}
                                color={theme.colors.typographySecondary}
                            />
                        </>
                    )}
                </View>
            </Pressable>

            {/* Selection Modal */}
            <Modal
                visible={isModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                {/* Handle bar */}
                                <View style={styles.handleBar} />

                                {/* Header */}
                                <View style={styles.modalHeader}>
                                    <View style={styles.modalHeaderLeft}>
                                        <IconSymbol
                                            name="wallet"
                                            size={22}
                                            color={theme.colors.primary}
                                        />
                                        <Text style={styles.modalTitle}>
                                            Phương thức thanh toán
                                        </Text>
                                    </View>
                                    <Pressable
                                        onPress={() => setIsModalVisible(false)}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <IconSymbol
                                            name="close"
                                            size={22}
                                            color={theme.colors.typographySecondary}
                                        />
                                    </Pressable>
                                </View>

                                {/* Options */}
                                <ScrollView>
                                    {PAYMENT_METHODS.map((method) => {
                                        const isSelected = method.id === selectedMethod;
                                        return (
                                            <Pressable
                                                key={method.id}
                                                style={({ pressed }) => [
                                                    styles.optionItem,
                                                    isSelected && styles.optionItemSelected,
                                                    pressed && styles.optionItemPressed,
                                                ]}
                                                onPress={() => handleSelect(method.id)}
                                            >
                                                {/* Icon */}
                                                <View
                                                    style={[
                                                        styles.methodIcon,
                                                        { backgroundColor: `${method.iconColor}12` },
                                                    ]}
                                                >
                                                    <IconSymbol
                                                        name={method.icon}
                                                        size={22}
                                                        color={method.iconColor}
                                                    />
                                                </View>

                                                {/* Info */}
                                                <View style={styles.optionInfo}>
                                                    <Text
                                                        style={[
                                                            styles.optionName,
                                                            isSelected && styles.optionNameSelected,
                                                        ]}
                                                    >
                                                        {method.name}
                                                    </Text>
                                                    <Text style={styles.optionDescription}>
                                                        {method.description}
                                                    </Text>
                                                </View>

                                                {/* Checkmark */}
                                                {isSelected && (
                                                    <IconSymbol
                                                        name="check-circle"
                                                        size={22}
                                                        color={theme.colors.primary}
                                                    />
                                                )}
                                            </Pressable>
                                        );
                                    })}
                                </ScrollView>

                                {/* Footer spacing */}
                                <View style={styles.modalFooter} />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        marginBottom: theme.margins.sm,
    },

    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        paddingTop: theme.margins.sm,
        paddingBottom: theme.margins.sm,
        gap: theme.margins.sm,
    },

    titleIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: `${theme.colors.primary}12`,
        justifyContent: 'center',
        alignItems: 'center',
    },

    title: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.typography,
    },

    selectedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.sm,
        gap: theme.margins.sm,
    },

    containerPressed: {
        backgroundColor: theme.colors.background,
        opacity: 0.9,
    },

    selectedMethodIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },

    methodInfo: {
        flex: 1,
    },

    methodName: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.typography,
    },

    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'flex-end',
    },

    modalContent: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '65%',
    },

    handleBar: {
        width: 36,
        height: 4,
        backgroundColor: theme.colors.border,
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: theme.margins.sm,
    },

    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.lg,
        paddingVertical: theme.margins.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },

    modalHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
    },

    modalTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: theme.colors.typography,
    },

    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.margins.md,
        paddingHorizontal: theme.margins.lg,
        gap: theme.margins.smd,
    },

    optionItemSelected: {
        backgroundColor: `${theme.colors.primary}08`,
    },

    optionItemPressed: {
        backgroundColor: theme.colors.background,
    },

    methodIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },

    optionInfo: {
        flex: 1,
    },

    optionName: {
        fontSize: 15,
        fontWeight: '500',
        color: theme.colors.typography,
    },

    optionNameSelected: {
        color: theme.colors.primary,
        fontWeight: '600',
    },

    optionDescription: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
        marginTop: 4,
    },

    modalFooter: {
        height: 34,
    },
}));

export default PaymentMethodSection;
