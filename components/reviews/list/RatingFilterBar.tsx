/**
 * ==============================================
 * RATING FILTER BAR - Horizontal Rating Filters
 * ==============================================
 * Chip filter bar for filtering reviews by rating
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { RatingFilter } from '@/types/review';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface RatingFilterBarProps {
    /** Currently selected filter */
    activeFilter: RatingFilter;
    /** Callback when filter changes */
    onFilterChange: (filter: RatingFilter) => void;
    /** Review counts per rating (optional) */
    counts?: Record<RatingFilter, number>;
}

interface FilterOption {
    value: RatingFilter;
    label: string;
    icon?: string;
}

const FILTER_OPTIONS: FilterOption[] = [
    { value: 'all', label: 'Tất cả' },
    { value: 5, label: '5 sao', icon: 'star.fill' },
    { value: 4, label: '4 sao', icon: 'star.fill' },
    { value: 3, label: '3 sao', icon: 'star.fill' },
    { value: 2, label: '2 sao', icon: 'star.fill' },
    { value: 1, label: '1 sao', icon: 'star.fill' },
];

/**
 * RatingFilterBar - Horizontal scrollable filter chips
 */
export const RatingFilterBar: React.FC<RatingFilterBarProps> = ({
    activeFilter,
    onFilterChange,
    counts,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {FILTER_OPTIONS.map((option) => {
                    const isActive = activeFilter === option.value;
                    const count = counts?.[option.value];

                    return (
                        <Pressable
                            key={option.value}
                            style={[
                                styles.chip,
                                isActive && styles.chipActive,
                            ]}
                            onPress={() => onFilterChange(option.value)}
                        >
                            {option.icon && (
                                <IconSymbol
                                    name={option.icon}
                                    size={12}
                                    color={isActive ? '#FFFFFF' : '#FFB800'}
                                />
                            )}
                            <Text
                                style={[
                                    styles.chipLabel,
                                    isActive && styles.chipLabelActive,
                                ]}
                            >
                                {option.label}
                            </Text>
                            {count !== undefined && count > 0 && (
                                <Text
                                    style={[
                                        styles.chipCount,
                                        isActive && styles.chipCountActive,
                                    ]}
                                >
                                    ({count})
                                </Text>
                            )}
                        </Pressable>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    scrollContent: {
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.smd,
        gap: theme.margins.sm,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.smd,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: 4,
    },
    chipActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    chipLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: theme.colors.typography,
    },
    chipLabelActive: {
        color: '#FFFFFF',
    },
    chipCount: {
        fontSize: 12,
        color: theme.colors.secondary,
    },
    chipCountActive: {
        color: 'rgba(255, 255, 255, 0.8)',
    },
}));

export default RatingFilterBar;
