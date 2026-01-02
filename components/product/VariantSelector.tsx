import { PRODUCT_STRINGS } from '@/constants/i18n/vi/product';
import type { ProductOptionUI, SelectedOptions } from '@/types/product/productDetail';
import { formatCurrency } from '@/utils/adapter/productDetailAdapter';
import { Image } from 'expo-image';
import React, { memo, useCallback, useMemo } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { IconSymbol } from '../ui/Icon';

const IMAGE_PLACEHOLDER = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

interface VariantSelectorRowProps {
    options: ProductOptionUI[];
    selectedOptions: SelectedOptions;
    selectionSummary: string;
    onPress: () => void;
}

interface VariantBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    options: OptionWithAvailability[];
    selectedOptions: SelectedOptions;
    onSelectOption: (optionName: string, valueName: string) => void;
    currentPrice?: number;
    originalPrice?: number;
    currentStock?: number;
    selectedImage?: string;
    onConfirm: () => void;
}

interface OptionWithAvailability extends ProductOptionUI {
    values: Array<{
        id: string;
        name: string;
        displayOrder?: number;
        image?: string | null;
        isSelected: boolean;
        isAvailable: boolean;
    }>;
}

interface OptionValueButtonProps {
    value: {
        id: string;
        name: string;
        image?: string | null;
        isSelected: boolean;
        isAvailable: boolean;
    };
    onPress: () => void;
}

// ============================================
// VARIANT SELECTOR ROW - Memoized
// ============================================

/**
 */
export const VariantSelectorRow = memo<VariantSelectorRowProps>(({
    options,
    selectedOptions,
    selectionSummary,
    onPress,
}) => {
    const { theme } = useUnistyles();

    const displayText = selectionSummary || PRODUCT_STRINGS.variant.placeholder;
    const hasSelection = selectionSummary.length > 0;

    return (
        <Pressable style={rowStyles.container} onPress={onPress}>
            <View style={rowStyles.content}>
                <Text style={rowStyles.label}>{PRODUCT_STRINGS.variant.label}</Text>
                <View style={rowStyles.valueContainer}>
                    <Text
                        style={[
                            rowStyles.value,
                            !hasSelection && rowStyles.placeholder,
                        ]}
                        numberOfLines={1}
                    >
                        {displayText}
                    </Text>
                    <IconSymbol
                        name="chevron-right"
                        size={20}
                        color={theme.colors.secondary}
                    />
                </View>
            </View>
        </Pressable>
    );
});

VariantSelectorRow.displayName = 'VariantSelectorRow';

const rowStyles = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        paddingVertical: theme.margins.smd,
        paddingHorizontal: theme.margins.md,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: theme.colors.border,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    label: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        flex: 1,
        justifyContent: 'flex-end',
    },
    value: {
        fontSize: 14,
        color: theme.colors.typography,
        fontWeight: '500',
        maxWidth: 200,
    },
    placeholder: {
        color: theme.colors.secondary,
        fontWeight: '400',
    },
}));

// ============================================
// OPTION VALUE BUTTON - Memoized
// ============================================

/**
 */
const OptionValueButton = memo<OptionValueButtonProps>(({
    value,
    onPress,
}) => {
    const { theme } = useUnistyles();

    const hasImage = !!value.image;

    return (
        <Pressable
            style={[
                valueStyles.container,
                value.isSelected && valueStyles.selected,
                !value.isAvailable && valueStyles.disabled,
            ]}
            onPress={onPress}
            disabled={!value.isAvailable}
        >
            {hasImage && (
                <Image
                    source={{ uri: value.image ?? undefined }}
                    style={valueStyles.image}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    recyclingKey={value.id}
                />
            )}
            <Text
                style={[
                    valueStyles.text,
                    value.isSelected && valueStyles.textSelected,
                    !value.isAvailable && valueStyles.textDisabled,
                ]}
            >
                {value.name}
            </Text>
            {value.isSelected && (
                <View style={valueStyles.checkmark}>
                    <IconSymbol name="check" size={12} color={theme.colors.surface} />
                </View>
            )}
        </Pressable>
    );
});

OptionValueButton.displayName = 'OptionValueButton';

const valueStyles = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: theme.radius.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        position: 'relative',
    },
    selected: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primaryMuted,
    },
    disabled: {
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.background,
        opacity: 0.5,
    },
    image: {
        width: 32,
        height: 32,
        borderRadius: 4,
    },
    text: {
        fontSize: 14,
        color: theme.colors.typography,
    },
    textSelected: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    textDisabled: {
        color: theme.colors.secondary,
    },
    checkmark: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 16,
        height: 16,
        borderTopLeftRadius: 8,
        borderBottomRightRadius: theme.radius.m,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
}));

// ============================================
// VARIANT BOTTOM SHEET - Memoized
// ============================================

/**
 */
export const VariantBottomSheet = memo<VariantBottomSheetProps>(({
    visible,
    onClose,
    options,
    selectedOptions,
    onSelectOption,
    currentPrice,
    originalPrice,
    currentStock,
    selectedImage,
    onConfirm,
}) => {
    const { theme } = useUnistyles();
    const insets = useSafeAreaInsets();

    // Memoize formatted price để tránh tính lại mỗi render
    const formattedCurrentPrice = useMemo(() => {
        return currentPrice !== undefined ? formatCurrency(currentPrice) : null;
    }, [currentPrice]);

    const formattedOriginalPrice = useMemo(() => {
        return originalPrice && originalPrice !== currentPrice
            ? formatCurrency(originalPrice)
            : null;
    }, [originalPrice, currentPrice]);

    // Memoize container padding style
    const containerStyle = useMemo(() => [
        sheetStyles.container,
        { paddingBottom: insets.bottom + 16 },
    ], [insets.bottom]);

    // Memoize stop propagation handler
    const handleContainerPress = useCallback((e: { stopPropagation: () => void }) => {
        e.stopPropagation();
    }, []);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <Pressable style={sheetStyles.overlay} onPress={onClose}>
                <Pressable
                    style={containerStyle}
                    onPress={handleContainerPress}
                >
                    {/* Handle indicator */}
                    <View style={sheetStyles.handleContainer}>
                        <View style={sheetStyles.handle} />
                    </View>

                    {/* Header with Image & Price */}
                    <View style={sheetStyles.header}>
                        <Image
                            source={{ uri: selectedImage }}
                            style={sheetStyles.headerImage}
                            contentFit="cover"
                            placeholder={IMAGE_PLACEHOLDER}
                            cachePolicy="memory-disk"
                        />
                        <View style={sheetStyles.headerInfo}>
                            {formattedCurrentPrice && (
                                <View style={sheetStyles.priceRow}>
                                    <Text style={sheetStyles.currentPrice}>
                                        {formattedCurrentPrice}
                                    </Text>
                                    {formattedOriginalPrice && (
                                        <Text style={sheetStyles.originalPrice}>
                                            {formattedOriginalPrice}
                                        </Text>
                                    )}
                                </View>
                            )}
                            {currentStock !== undefined && (
                                <Text style={sheetStyles.stockText}>
                                    {PRODUCT_STRINGS.variant.stock}: {currentStock}
                                </Text>
                            )}
                        </View>
                        <Pressable
                            style={sheetStyles.closeButton}
                            onPress={onClose}
                        >
                            <IconSymbol name="close" size={24} color={theme.colors.typography} />
                        </Pressable>
                    </View>

                    {/* Options */}
                    <ScrollView
                        style={sheetStyles.optionsContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        {options.map((option) => (
                            <View key={option.id} style={sheetStyles.optionGroup}>
                                <Text style={sheetStyles.optionLabel}>{option.name}</Text>
                                <View style={sheetStyles.optionValues}>
                                    {option.values.map((value) => (
                                        <OptionValueButton
                                            key={value.id}
                                            value={value}
                                            onPress={() => onSelectOption(option.name, value.name)}
                                        />
                                    ))}
                                </View>
                            </View>
                        ))}
                    </ScrollView>

                    {/* Confirm Button */}
                    <View style={sheetStyles.footer}>
                        <Pressable style={sheetStyles.confirmButton} onPress={onConfirm}>
                            <Text style={sheetStyles.confirmText}>{PRODUCT_STRINGS.variant.confirm}</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
});

VariantBottomSheet.displayName = 'VariantBottomSheet';

const sheetStyles = StyleSheet.create((theme) => ({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: '80%',
        paddingHorizontal: theme.margins.md,
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: theme.margins.sm,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: theme.colors.secondary,
        borderRadius: 2,
    },
    header: {
        flexDirection: 'row',
        paddingBottom: theme.margins.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        position: 'relative',
    },
    headerImage: {
        width: 100,
        height: 100,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.background,
    },
    headerInfo: {
        flex: 1,
        marginLeft: theme.margins.smd,
        justifyContent: 'flex-end',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
    },
    currentPrice: {
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.error,
    },
    originalPrice: {
        fontSize: 14,
        color: theme.colors.secondary,
        textDecorationLine: 'line-through',
    },
    stockText: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
        marginTop: 4,
    },
    closeButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        padding: 4,
    },
    optionsContainer: {
        marginTop: theme.margins.md,
        maxHeight: 300,
    },
    optionGroup: {
        marginBottom: theme.margins.lg,
    },
    optionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
        marginBottom: theme.margins.sm,
    },
    optionValues: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    footer: {
        paddingVertical: theme.margins.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    confirmButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.m,
        paddingVertical: 14,
        alignItems: 'center',
    },
    confirmText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.surface,
    },
}));

export default {
    VariantSelectorRow,
    VariantBottomSheet,
};
