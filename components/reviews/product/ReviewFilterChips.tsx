/**
 * ==============================================
 * REVIEW FILTER CHIPS
 * ==============================================
 * Horizontal scrollable filter chips for:
 * - All, 5 Star, 4 Star, 3 Star, 2 Star, 1 Star
 * - With Media, With Response
 */

import { IconSymbol } from '@/components/ui/Icon';
import type {
    ProductReviewFilterType,
    ProductReviewStatisticsUI,
} from '@/types/review/productReview';
import { formatReviewCount } from '@/utils/adapter/review/productReviewAdapter';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ReviewFilterChipsProps {
    activeFilter: ProductReviewFilterType;
    onFilterChange: (filter: ProductReviewFilterType) => void;
    statistics: ProductReviewStatisticsUI | null;
}

interface FilterOption {
    value: ProductReviewFilterType;
    label: string;
    icon?: string;
    getCount?: (stats: ProductReviewStatisticsUI) => number;
}

// ============================================
// FILTER OPTIONS CONFIG
// ============================================

const FILTER_OPTIONS: FilterOption[] = [
    {
        value: 'all',
        label: 'Tất cả',
        getCount: (stats) => stats.totalReviews,
    },
    {
        value: 'with-media',
        label: 'Có hình ảnh',
        icon: 'camera',
        getCount: (stats) => stats.mediaReviewCount,
    },
    {
        value: 'with-response',
        label: 'Có phản hồi',
        icon: 'chat-dots',
        getCount: (stats) => stats.responseReviewCount,
    },
];

const STAR_VALUES = [5, 4, 3, 2, 1] as const;

// ============================================
// SUB-COMPONENTS
// ============================================

interface ChipProps {
    option: FilterOption;
    isActive: boolean;
    count?: number;
    onPress: () => void;
}

const FilterChip = memo<ChipProps>(({ option, isActive, count, onPress }) => {
    const { theme } = useUnistyles();

    return (
        <Pressable
            style={[chipStyles.container, isActive && chipStyles.containerActive]}
            onPress={onPress}
        >
            {option.icon && (
                <IconSymbol
                    name={option.icon}
                    size={12}
                    color={
                        isActive
                            ? theme.colors.newPrimary
                            : option.icon === 'star'
                                ? '#FFB800'
                                : theme.colors.secondary
                    }
                />
            )}
            <Text style={[chipStyles.label, isActive && chipStyles.labelActive]}>
                {option.label}
            </Text>
            {count !== undefined && count > 0 && (
                <Text style={[chipStyles.count, isActive && chipStyles.countActive]}>
                    ({formatReviewCount(count)})
                </Text>
            )}
        </Pressable>
    );
});

FilterChip.displayName = 'FilterChip';

const chipStyles = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: theme.colors.background,
        borderRadius: theme.radius.full,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    containerActive: {
        backgroundColor: theme.colors.activeSoft,
        borderColor: theme.colors.newPrimary,
    },
    label: {
        fontSize: 12,
        fontWeight: '500',
        color: theme.colors.typographySecondary,
    },
    labelActive: {
        color: theme.colors.newPrimary,
        fontWeight: '600',
    },
    count: {
        fontSize: 11,
        color: theme.colors.secondary,
    },
    countActive: {
        color: theme.colors.newPrimary,
    },
}));

// ============================================
// MAIN COMPONENT
// ============================================

export const ReviewFilterChips = memo<ReviewFilterChipsProps>(({
    activeFilter,
    onFilterChange,
    statistics,
}) => {
    const { theme } = useUnistyles();
    const [isStarModalOpen, setIsStarModalOpen] = useState(false);

    // Compute counts for each filter
    const countsMap = useMemo(() => {
        if (!statistics) return {};
        const map: Record<string, number> = {};

        // Basic filters
        FILTER_OPTIONS.forEach((option) => {
            if (option.getCount) {
                map[String(option.value)] = option.getCount(statistics);
            }
        });

        // Stars
        STAR_VALUES.forEach(val => {
            map[String(val)] = statistics.ratingDistribution[String(val)] ?? 0;
        });

        return map;
    }, [statistics]);

    const isStarActive = typeof activeFilter === 'number';
    const activeStarLabel = isStarActive ? `${activeFilter} Sao` : 'Số sao';

    const handleFilterPress = useCallback((filter: ProductReviewFilterType) => {
        onFilterChange(filter);
    }, [onFilterChange]);

    const toggleStarModal = useCallback(() => {
        setIsStarModalOpen(prev => !prev);
    }, []);

    const handleStarSelect = useCallback((star: 1 | 2 | 3 | 4 | 5) => {
        onFilterChange(star);
        setIsStarModalOpen(false);
    }, [onFilterChange]);

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* All Option */}
                <FilterChip
                    option={FILTER_OPTIONS[0]}
                    isActive={activeFilter === 'all'}
                    count={countsMap['all']}
                    onPress={() => handleFilterPress('all')}
                />

                {/* Stars Group Option */}
                <Pressable
                    style={[
                        chipStyles.container,
                        isStarActive && chipStyles.containerActive
                    ]}
                    onPress={toggleStarModal}
                >
                    <IconSymbol
                        name="star"
                        size={12}
                        color={isStarActive ? theme.colors.newPrimary : '#FFB800'}
                    />
                    <Text style={[chipStyles.label, isStarActive && chipStyles.labelActive]}>
                        {activeStarLabel}
                    </Text>
                    <IconSymbol
                        name="chevron-down"
                        size={12}
                        color={isStarActive ? theme.colors.newPrimary : theme.colors.secondary}
                    />
                </Pressable>

                {/* Other Options (Media, Response) */}
                {FILTER_OPTIONS.slice(1).map((option) => (
                    <FilterChip
                        key={String(option.value)}
                        option={option}
                        isActive={activeFilter === option.value}
                        count={countsMap[String(option.value)]}
                        onPress={() => handleFilterPress(option.value)}
                    />
                ))}
            </ScrollView>

            {/* Stars Selection Modal */}
            <Modal
                visible={isStarModalOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setIsStarModalOpen(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setIsStarModalOpen(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Lọc theo số sao</Text>
                            <Pressable onPress={() => setIsStarModalOpen(false)}>
                                <IconSymbol name="close" size={24} color={theme.colors.typography} />
                            </Pressable>
                        </View>

                        <View style={styles.starsList}>
                            {STAR_VALUES.map((star) => {
                                const isSelected = activeFilter === star;
                                const count = countsMap[String(star)] || 0;

                                return (
                                    <Pressable
                                        key={star}
                                        style={[
                                            styles.starOption,
                                            isSelected && styles.starOptionActive
                                        ]}
                                        onPress={() => handleStarSelect(star)}
                                    >
                                        <View style={styles.starOptionLeft}>
                                            <IconSymbol name="star" size={16} color="#FFB800" />
                                            <Text style={[
                                                styles.starOptionLabel,
                                                isSelected && styles.starOptionLabelActive
                                            ]}>
                                                {star} Sao
                                            </Text>
                                            <Text style={styles.starOptionCount}>
                                                ({formatReviewCount(count)})
                                            </Text>
                                        </View>
                                        {isSelected && (
                                            <IconSymbol name="checkmark" size={20} color={theme.colors.newPrimary} />
                                        )}
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
});

ReviewFilterChips.displayName = 'ReviewFilterChips';

const styles = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        paddingVertical: theme.margins.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    scrollContent: {
        paddingHorizontal: theme.margins.md,
        gap: 8,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: theme.radius.xl,
        borderTopRightRadius: theme.radius.xl,
        paddingBottom: theme.margins.xl,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    starsList: {
        paddingTop: theme.margins.sm,
    },
    starOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.md,
    },
    starOptionActive: {
        backgroundColor: theme.colors.primarySoft,
    },
    starOptionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    starOptionLabel: {
        fontSize: 15,
        color: theme.colors.typography,
    },
    starOptionLabelActive: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    starOptionCount: {
        fontSize: 13,
        color: theme.colors.secondary,
    },
}));
