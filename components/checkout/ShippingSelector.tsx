/**
 * ShippingSelector Component
 * 
 * Displays selected shipping method with option to change.
 * Shows:
 * - Method name (Nhanh, Hỏa tốc, etc.)
 * - Estimated delivery
 * - Shipping fee
 * - Tap to open bottom sheet for selection
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { ShippingMethod } from '@/types/checkout';
import React, { useCallback, useState } from 'react';
import { Modal, Pressable, Text, TouchableWithoutFeedback, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ShippingSelectorProps {
    methods: ShippingMethod[];
    selectedMethodId: string | null;
    isLoading: boolean;
    onSelect: (methodId: string) => void;
}

export const ShippingSelector: React.FC<ShippingSelectorProps> = ({
    methods,
    selectedMethodId,
    isLoading,
    onSelect,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const [isModalVisible, setIsModalVisible] = useState(false);

    const selectedMethod = methods.find((m) => m.id === selectedMethodId);

    const handleSelect = useCallback((methodId: string) => {
        onSelect(methodId);
        setIsModalVisible(false);
    }, [onSelect]);

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    // Loading state
    if (isLoading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingRow}>
                    <View style={styles.loadingIcon}>
                        <IconSymbol
                            name="shipping"
                            size={20}
                            color={theme.colors.typographySecondary}
                        />
                    </View>
                    <View style={styles.loadingContent}>
                        <View style={styles.loadingText} />
                        <View style={[styles.loadingText, styles.loadingTextSmall]} />
                    </View>
                </View>
            </View>
        );
    }

    // No methods available
    if (methods.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.errorRow}>
                    <IconSymbol
                        name="remove-circle-outline"
                        size={22}
                        color={theme.colors.error}
                    />
                    <Text style={styles.errorText}>
                        Không hỗ trợ giao đến địa chỉ này
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <>
            {/* Selector Button */}
            <Pressable
                style={({ pressed }) => [
                    styles.container,
                    pressed && styles.containerPressed,
                ]}
                onPress={() => setIsModalVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Chọn phương thức vận chuyển"
            >
                <View style={styles.mainRow}>
                    {/* Modern icon with colored background */}
                    <View style={styles.iconWrapper}>
                        <IconSymbol
                            name="shipping"
                            size={20}
                            color={theme.colors.primary}
                        />
                    </View>

                    <View style={styles.infoContainer}>
                        {selectedMethod ? (
                            <>
                                <View style={styles.methodRow}>
                                    <Text style={styles.methodName}>
                                        {selectedMethod.name}
                                    </Text>
                                    <Text style={styles.price}>
                                        {formatPrice(selectedMethod.fee)}
                                    </Text>
                                </View>
                                <Text style={styles.description}>
                                    {selectedMethod.description}
                                </Text>
                            </>
                        ) : (
                            <Text style={styles.placeholder}>
                                Chọn phương thức vận chuyển
                            </Text>
                        )}
                    </View>

                    <IconSymbol
                        name="chevron-right"
                        size={20}
                        color={theme.colors.typographySecondary}
                    />
                </View>
            </Pressable>

            {/* Bottom Sheet Modal */}
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
                                            name="shipping"
                                            size={22}
                                            color={theme.colors.primary}
                                        />
                                        <Text style={styles.modalTitle}>
                                            Phương thức vận chuyển
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
                                {methods.map((method) => {
                                    const isSelected = method.id === selectedMethodId;
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
                                            <View style={styles.optionIcon}>
                                                <IconSymbol
                                                    name={method.type === 'express' ? 'shipping-fast' : 'shipping'}
                                                    size={22}
                                                    color={method.type === 'express' ? '#F59E0B' : theme.colors.primary}
                                                />
                                            </View>

                                            <View style={styles.optionInfo}>
                                                <View style={styles.optionRow}>
                                                    <View style={styles.optionNameRow}>
                                                        <Text
                                                            style={[
                                                                styles.optionName,
                                                                isSelected && styles.optionNameSelected,
                                                            ]}
                                                        >
                                                            {method.name}
                                                        </Text>
                                                        {method.fee === 0 && (
                                                            <View style={styles.freeBadge}>
                                                                <Text style={styles.freeBadgeText}>Miễn phí</Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                    <Text style={[
                                                        styles.optionPrice,
                                                        method.fee === 0 && styles.optionPriceFree,
                                                    ]}>
                                                        {formatPrice(method.fee)}
                                                    </Text>
                                                </View>
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

                                {/* Bottom spacing */}
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
        paddingVertical: theme.margins.smd,
        paddingHorizontal: theme.margins.md,
    },

    containerPressed: {
        backgroundColor: theme.colors.background,
    },

    mainRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    // Modern icon wrapper with colored background
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: `${theme.colors.primary}12`,
        justifyContent: 'center',
        alignItems: 'center',
    },

    infoContainer: {
        flex: 1,
        marginLeft: theme.margins.smd,
        marginRight: theme.margins.sm,
    },

    methodRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    methodName: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
    },

    price: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.error,
    },

    description: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        marginTop: 2,
    },

    placeholder: {
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: '500',
    },

    // Loading state
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    loadingIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },

    loadingContent: {
        flex: 1,
        marginLeft: theme.margins.smd,
    },

    loadingText: {
        height: 14,
        width: '60%',
        backgroundColor: theme.colors.background,
        borderRadius: 4,
    },

    loadingTextSmall: {
        height: 12,
        width: '40%',
        marginTop: 6,
    },

    // Error state
    errorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${theme.colors.error}10`,
        paddingVertical: theme.margins.sm,
        paddingHorizontal: theme.margins.smd,
        borderRadius: theme.radius.m,
    },

    errorText: {
        fontSize: 13,
        color: theme.colors.error,
        marginLeft: theme.margins.sm,
        fontWeight: '500',
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
        maxHeight: '75%',
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

    optionIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: `${theme.colors.primary}10`,
        justifyContent: 'center',
        alignItems: 'center',
    },

    optionInfo: {
        flex: 1,
    },

    optionRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },

    optionNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 6,
        flex: 1,
        marginRight: theme.margins.sm,
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

    freeBadge: {
        backgroundColor: '#10B98120',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },

    freeBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#10B981',
    },

    optionPrice: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.error,
    },

    optionPriceFree: {
        color: '#10B981',
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

export default ShippingSelector;
