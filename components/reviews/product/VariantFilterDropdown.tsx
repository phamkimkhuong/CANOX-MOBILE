/**
 * ==============================================
 * VARIANT FILTER DROPDOWN
 * ==============================================
 * Dropdown to filter reviews by product variant
 * (e.g., "Màu Đỏ - Size L")
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { VariantFilterOptionUI } from '@/types/review/productReview';
import React, { memo, useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

// ============================================
// TYPES
// ============================================

interface VariantFilterDropdownProps {
    options: VariantFilterOptionUI[];
    selectedVariantId: string | null;
    onSelect: (variantId: string | null) => void;
}

// ============================================
// MAIN COMPONENT
// ============================================

export const VariantFilterDropdown = memo<VariantFilterDropdownProps>(({
    options,
    selectedVariantId,
    onSelect,
}) => {
    const { theme } = useUnistyles();
    const [isOpen, setIsOpen] = useState(false);

    // Find selected option label
    const selectedOption = options.find((opt) => opt.variantId === selectedVariantId);
    const displayLabel = selectedOption?.label || 'Tất cả phân loại';

    const handleOpen = useCallback(() => {
        setIsOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setIsOpen(false);
    }, []);

    const handleSelect = useCallback((variantId: string | null) => {
        onSelect(variantId);
        setIsOpen(false);
    }, [onSelect]);

    // Don't render if no variant options
    if (options.length === 0) {
        return null;
    }

    return (
        <>
            {/* Trigger Button */}
            <Pressable style={styles.trigger} onPress={handleOpen}>
                <IconSymbol name="tag" size={14} color={theme.colors.secondary} />
                <Text
                    style={[
                        styles.triggerText,
                        selectedVariantId && styles.triggerTextActive
                    ]}
                    numberOfLines={1}
                >
                    {displayLabel}
                </Text>
                <IconSymbol name="chevron-down" size={16} color={theme.colors.secondary} />
            </Pressable>

            {/* Dropdown Modal */}
            <Modal
                visible={isOpen}
                transparent
                animationType="fade"
                onRequestClose={handleClose}
            >
                <Pressable style={styles.overlay} onPress={handleClose}>
                    <View style={styles.dropdown}>
                        {/* Header */}
                        <View style={styles.dropdownHeader}>
                            <Text style={styles.dropdownTitle}>Lọc theo phân loại</Text>
                            <Pressable onPress={handleClose}>
                                <IconSymbol name="close" size={24} color={theme.colors.typography} />
                            </Pressable>
                        </View>

                        {/* Options List */}
                        <ScrollView
                            style={styles.optionsList}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* All option */}
                            <Pressable
                                style={[
                                    styles.option,
                                    !selectedVariantId && styles.optionActive,
                                ]}
                                onPress={() => handleSelect(null)}
                            >
                                <Text
                                    style={[
                                        styles.optionLabel,
                                        !selectedVariantId && styles.optionLabelActive,
                                    ]}
                                >
                                    Tất cả phân loại
                                </Text>
                                {!selectedVariantId && (
                                    <IconSymbol
                                        name="checkmark"
                                        size={18}
                                        color={theme.colors.primary}
                                    />
                                )}
                            </Pressable>

                            {/* Variant options */}
                            {options.map((option) => {
                                const isSelected = selectedVariantId === option.variantId;

                                return (
                                    <Pressable
                                        key={option.variantId}
                                        style={[
                                            styles.option,
                                            isSelected && styles.optionActive,
                                        ]}
                                        onPress={() => handleSelect(option.variantId)}
                                    >
                                        <View style={styles.optionContent}>
                                            <Text
                                                style={[
                                                    styles.optionLabel,
                                                    isSelected && styles.optionLabelActive,
                                                ]}
                                                numberOfLines={1}
                                            >
                                                {option.label}
                                            </Text>
                                            <Text style={styles.optionCount}>
                                                {option.formattedCount}
                                            </Text>
                                        </View>
                                        {isSelected && (
                                            <IconSymbol
                                                name="checkmark"
                                                size={18}
                                                color={theme.colors.primary}
                                            />
                                        )}
                                    </Pressable>
                                );
                            })}
                        </ScrollView>
                    </View>
                </Pressable>
            </Modal>
        </>
    );
});

VariantFilterDropdown.displayName = 'VariantFilterDropdown';

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create((theme) => ({
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: theme.colors.background,
        borderRadius: theme.radius.full,
        borderWidth: 1,
        borderColor: theme.colors.border,
        maxWidth: 180,
    },
    triggerText: {
        flex: 1,
        fontSize: 12,
        color: theme.colors.typographySecondary,
    },
    triggerTextActive: {
        color: theme.colors.primary,
        fontWeight: '500',
    },

    // Modal Overlay
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    dropdown: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: theme.radius.xl,
        borderTopRightRadius: theme.radius.xl,
        maxHeight: '60%',
    },
    dropdownHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.smd,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    dropdownTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.typography,
    },

    // Options
    optionsList: {
        paddingVertical: theme.margins.sm,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.smd,
    },
    optionActive: {
        backgroundColor: theme.colors.primarySoft,
    },
    optionContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    optionLabel: {
        fontSize: 14,
        color: theme.colors.typography,
    },
    optionLabelActive: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    optionCount: {
        fontSize: 12,
        color: theme.colors.secondary,
    },
}));
