/**
 * ==============================================
 * QUICK FILTERS - Horizontal Filter Chips
 * ==============================================
 * 
 * Features:
 * - Horizontal scrollable chips
 * - Toggle on/off with visual feedback
 * - Common e-commerce filters: Freeship, Express, 4 sao+
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { QuickFilterType } from '@/types/search-results';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface QuickFiltersProps {
    activeFilters: QuickFilterType[];
    onFilterToggle: (filter: QuickFilterType) => void;
}

type QuickFilterLabelKey =
    | 'quickFilter.freeship'
    | 'quickFilter.rating4Plus'
    | 'quickFilter.voucher';

interface FilterChip {
    id: QuickFilterType;
    labelKey: QuickFilterLabelKey;
    icon?: string;
    color?: string; // Hex or theme color key
}

const FILTER_CHIPS: FilterChip[] = [
    { id: 'FREESHIP', labelKey: 'quickFilter.freeship', icon: 'car-outline', color: '#22c55e' }, // success (green)
    { id: 'RATING_4PLUS', labelKey: 'quickFilter.rating4Plus', icon: 'star', color: '#FFD700' }, // Gold/Yellow
    { id: 'VOUCHER', labelKey: 'quickFilter.voucher', icon: 'pricetag-outline', color: '#ef4444' }, // error (red)
];

export const QuickFilters = React.memo(({
    activeFilters,
    onFilterToggle,
}: QuickFiltersProps) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('search');

    const isActive = useCallback((filterId: QuickFilterType) => {
        return activeFilters.includes(filterId);
    }, [activeFilters]);

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {FILTER_CHIPS.map((chip) => {
                    const active = isActive(chip.id);
                    const iconColor = active
                        ? theme.colors.primary
                        : (chip.color || theme.colors.secondary);

                    return (
                        <Pressable
                            key={chip.id}
                            style={({ pressed }) => [
                                styles.chip,
                                active && styles.chipActive,
                                pressed && styles.chipPressed,
                            ]}
                            onPress={() => onFilterToggle(chip.id)}
                        >
                            {chip.icon && (
                                <IconSymbol
                                    name={chip.icon as never}
                                    size={14}
                                    color={iconColor}
                                />
                            )}
                            <Text
                                style={[
                                    styles.chipText,
                                    active && styles.chipTextActive,
                                ]}
                            >
                                {t(chip.labelKey)}
                            </Text>
                            {active && (
                                <IconSymbol
                                    name="close-circle"
                                    size={14}
                                    color={theme.colors.primary}
                                />
                            )}
                        </Pressable>
                    );
                })}
            </ScrollView>
        </View>
    );
});

QuickFilters.displayName = 'QuickFilters';

const styles = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        paddingVertical: theme.margins.sm,
    },
    scrollContent: {
        paddingHorizontal: theme.margins.md,
        gap: theme.margins.sm,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.smd,
        paddingVertical: 6,
        borderRadius: theme.radius.full,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        gap: 4,
    },
    chipActive: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primarySubtle,
    },
    chipPressed: {
        opacity: 0.8,
    },
    chipText: {
        fontSize: 12,
        fontWeight: '500',
        color: theme.colors.typographySecondary,
    },
    chipTextActive: {
        color: theme.colors.primary,
    },
}));

export default QuickFilters;
