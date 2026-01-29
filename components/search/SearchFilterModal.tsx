/**
 * ==============================================
 * SEARCH FILTER MODAL - Advanced Filters
 * ==============================================
 * 
 * Features:
 * - Price range input
 * - Rating filter
 * - Reset & Apply actions
 * - Slide up animation
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { AdvancedFilters } from '@/types/search-results';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface SearchFilterModalProps {
    visible: boolean;
    onClose: () => void;
    onApply: (filters: AdvancedFilters) => void;
    initialFilters: AdvancedFilters;
}

const RATING_OPTIONS = [5, 4, 3, 2, 1];

const PRICE_PRESETS = [
    { label: '0 - 100k', min: 0, max: 100000 },
    { label: '100k - 300k', min: 100000, max: 300000 },
    { label: '300k - 500k', min: 300000, max: 500000 },
];

export const SearchFilterModal = React.memo(({
    visible,
    onClose,
    onApply,
    initialFilters,
}: SearchFilterModalProps) => {
    const { theme } = useUnistyles();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation('search');

    // Local state for form
    const [minPrice, setMinPrice] = useState(
        initialFilters.minPrice?.toString() ?? ''
    );
    const [maxPrice, setMaxPrice] = useState(
        initialFilters.maxPrice?.toString() ?? ''
    );
    const [minRating, setMinRating] = useState(
        initialFilters.minRating ?? 0
    );

    // Reset form to initial values
    const handleReset = useCallback(() => {
        setMinPrice('');
        setMaxPrice('');
        setMinRating(0);
    }, []);

    // Apply filters
    const handleApply = useCallback(() => {
        const filters: AdvancedFilters = {};

        const parsedMin = parseInt(minPrice, 10);
        const parsedMax = parseInt(maxPrice, 10);

        if (!isNaN(parsedMin) && parsedMin > 0) {
            filters.minPrice = parsedMin;
        }
        if (!isNaN(parsedMax) && parsedMax > 0) {
            filters.maxPrice = parsedMax;
        }
        if (minRating > 0) {
            filters.minRating = minRating;
        }

        onApply(filters);
        onClose();
    }, [minPrice, maxPrice, minRating, onApply, onClose]);

    // Format number input
    const formatPriceInput = (text: string): string => {
        // Remove non-numeric characters
        return text.replace(/[^0-9]/g, '');
    };

    const hasFilters = minPrice || maxPrice || minRating > 0;

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Backdrop */}
                <Pressable style={styles.backdrop} onPress={onClose} />

                {/* Modal Content */}
                <View style={[styles.modalContent, { paddingBottom: insets.bottom + 16 }]}>
                    {/* Header */}
                    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                        <Text style={styles.headerTitle}>{t('filterModal.title')}</Text>
                        <Pressable
                            style={({ pressed }) => [
                                styles.resetButton,
                                !hasFilters && styles.resetButtonDisabled,
                                pressed && styles.buttonPressed,
                            ]}
                            onPress={handleReset}
                            disabled={!hasFilters}
                        >
                            <Text style={[
                                styles.resetButtonText,
                                !hasFilters && styles.resetButtonTextDisabled,
                            ]}>
                                {t('filterModal.reset')}
                            </Text>
                        </Pressable>
                    </View>

                    {/* Price Range Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('filterModal.priceRange')}</Text>

                        {/* Presets */}
                        <View style={styles.presetsRow}>
                            {PRICE_PRESETS.map((preset) => (
                                <Pressable
                                    key={preset.label}
                                    style={({ pressed }) => [
                                        styles.presetChip,
                                        minPrice === preset.min.toString() &&
                                        maxPrice === preset.max.toString() &&
                                        styles.presetChipActive,
                                        pressed && styles.buttonPressed,
                                    ]}
                                    onPress={() => {
                                        const isActive = minPrice === preset.min.toString() &&
                                            maxPrice === preset.max.toString();
                                        if (isActive) {
                                            setMinPrice('');
                                            setMaxPrice('');
                                        } else {
                                            setMinPrice(preset.min.toString());
                                            setMaxPrice(preset.max.toString());
                                        }
                                    }}
                                >
                                    <Text style={[
                                        styles.presetChipText,
                                        minPrice === preset.min.toString() &&
                                        maxPrice === preset.max.toString() &&
                                        styles.presetChipTextActive,
                                    ]}>
                                        {preset.label}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

                        <View style={styles.priceInputRow}>
                            <View style={styles.priceInputWrapper}>
                                <Text style={styles.inputLabel}>{t('filterModal.priceMin')}</Text>
                                <TextInput
                                    style={styles.priceInput}
                                    value={minPrice}
                                    onChangeText={(text) => setMinPrice(formatPriceInput(text))}
                                    placeholder="0"
                                    placeholderTextColor={theme.colors.secondary}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={styles.priceDivider}>
                                <Text style={styles.priceDividerText}>-</Text>
                            </View>
                            <View style={styles.priceInputWrapper}>
                                <Text style={styles.inputLabel}>{t('filterModal.priceMax')}</Text>
                                <TextInput
                                    style={styles.priceInput}
                                    value={maxPrice}
                                    onChangeText={(text) => setMaxPrice(formatPriceInput(text))}
                                    placeholder="∞"
                                    placeholderTextColor={theme.colors.secondary}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Rating Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('filterModal.rating')}</Text>
                        <View style={styles.ratingOptions}>
                            {RATING_OPTIONS.map((rating) => (
                                <Pressable
                                    key={rating}
                                    style={({ pressed }) => [
                                        styles.ratingOption,
                                        minRating === rating && styles.ratingOptionActive,
                                        pressed && styles.buttonPressed,
                                    ]}
                                    onPress={() => setMinRating(minRating === rating ? 0 : rating)}
                                >
                                    <IconSymbol
                                        name="star"
                                        size={14}
                                        color={minRating === rating ? theme.colors.primary : '#facc15'}
                                    />
                                    <Text style={[
                                        styles.ratingOptionText,
                                        minRating === rating && styles.ratingOptionTextActive,
                                    ]}>
                                        {t('filterModal.ratingFrom', { rating })}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {/* Apply Button */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.applyButton,
                            pressed && styles.buttonPressed,
                        ]}
                        onPress={handleApply}
                    >
                        <Text style={styles.applyButtonText}>
                            {t('filterModal.apply')}
                        </Text>
                    </Pressable>

                    {/* Content Handle (moved to bottom) */}
                    <View style={styles.handle} />
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
});

SearchFilterModal.displayName = 'SearchFilterModal';

const styles = StyleSheet.create((theme) => ({
    overlay: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalContent: {
        backgroundColor: theme.colors.surface,
        borderBottomLeftRadius: theme.radius.xl,
        borderBottomRightRadius: theme.radius.xl,
        paddingBottom: theme.margins.md,
        paddingHorizontal: theme.margins.md,
        maxHeight: '80%',
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: theme.colors.borderMuted,
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: theme.margins.md,
        marginBottom: theme.margins.sm,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.margins.lg,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    resetButton: {
        paddingHorizontal: theme.margins.smd,
        paddingVertical: theme.margins.sm,
    },
    resetButtonDisabled: {
        opacity: 0.5,
    },
    resetButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    resetButtonTextDisabled: {
        color: theme.colors.secondary,
    },
    buttonPressed: {
        opacity: 0.7,
    },
    section: {
        marginBottom: theme.margins.lg,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.typography,
        marginBottom: theme.margins.smd,
    },
    presetsRow: {
        flexDirection: 'row',
        gap: theme.margins.sm,
        marginBottom: theme.margins.md,
    },
    presetChip: {
        paddingHorizontal: theme.margins.smd,
        paddingVertical: theme.margins.sm,
        borderRadius: theme.radius.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.background,
    },
    presetChipActive: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primarySubtle,
    },
    presetChipText: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
    },
    presetChipTextActive: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    priceInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
    },
    priceInputWrapper: {
        flex: 1,
    },
    inputLabel: {
        fontSize: 12,
        color: theme.colors.secondary,
        marginBottom: 4,
    },
    priceInput: {
        height: 44,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.m,
        paddingHorizontal: theme.margins.smd,
        fontSize: 15,
        color: theme.colors.typography,
        backgroundColor: theme.colors.background,
    },
    priceDivider: {
        paddingTop: 18,
    },
    priceDividerText: {
        fontSize: 16,
        color: theme.colors.secondary,
    },
    ratingOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.margins.sm,
    },
    ratingOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.smd,
        paddingVertical: theme.margins.sm,
        borderRadius: theme.radius.full,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        gap: 4,
    },
    ratingOptionActive: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primarySubtle,
    },
    ratingOptionText: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
    },
    ratingOptionTextActive: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    applyButton: {
        height: 50,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.m,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: theme.margins.md,
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.onPrimary,
    },
}));

export default SearchFilterModal;
