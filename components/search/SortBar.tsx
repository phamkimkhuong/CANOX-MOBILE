/**
 * ==============================================
 * SORT BAR - 4 Sort Options with Price Toggle
 * ==============================================
 * 
 * Features:
 * - 4 tabs: Liên quan | Mới nhất | Bán chạy | Giá
 * - Price tab cycles: None -> ASC -> DESC -> None
 * - Active state styling
 * - Haptic feedback ready
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { PriceSortState, SearchSortField } from '@/types/search-results';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface SortBarProps {
    currentSort: SearchSortField;
    onSortChange: (sort: SearchSortField) => void;
}

interface SortTab {
    id: SearchSortField | 'PRICE';
    labelKey: 'sort.relevance' | 'sort.newest' | 'sort.bestSelling' | 'sort.price';
    isPrice?: boolean;
}

const SORT_TABS: SortTab[] = [
    { id: 'RELEVANCE', labelKey: 'sort.relevance' },
    { id: 'NEWEST', labelKey: 'sort.newest' },
    { id: 'BEST_SELLING', labelKey: 'sort.bestSelling' },
    { id: 'PRICE', labelKey: 'sort.price', isPrice: true },
];

/**
 * Get current price state from sort field
 */
const getPriceState = (sort: SearchSortField): PriceSortState => {
    if (sort === 'PRICE_ASC') return 'ASC';
    if (sort === 'PRICE_DESC') return 'DESC';
    return 'NONE';
};

/**
 * Get next price state (cycle: NONE -> ASC -> DESC -> NONE)
 */
const getNextPriceState = (current: PriceSortState): PriceSortState => {
    switch (current) {
        case 'NONE': return 'ASC';
        case 'ASC': return 'DESC';
        case 'DESC': return 'NONE';
        default: return 'NONE';
    }
};

/**
 * Convert price state to sort field
 */
const priceStateToSortField = (state: PriceSortState): SearchSortField => {
    switch (state) {
        case 'ASC': return 'PRICE_ASC';
        case 'DESC': return 'PRICE_DESC';
        default: return 'RELEVANCE';
    }
};

export const SortBar = React.memo(({ currentSort, onSortChange }: SortBarProps) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('search');

    const priceState = useMemo(() => getPriceState(currentSort), [currentSort]);

    const handleTabPress = useCallback((tab: SortTab) => {
        if (tab.isPrice) {
            // Cycle price state
            const nextState = getNextPriceState(priceState);
            if (nextState === 'NONE') {
                // Return to relevance when cycling back
                onSortChange('RELEVANCE');
            } else {
                onSortChange(priceStateToSortField(nextState));
            }
        } else {
            onSortChange(tab.id as SearchSortField);
        }
    }, [priceState, onSortChange]);

    const isTabActive = useCallback((tab: SortTab): boolean => {
        if (tab.isPrice) {
            return priceState !== 'NONE';
        }
        return currentSort === tab.id;
    }, [currentSort, priceState]);

    const renderPriceIcon = () => {
        if (priceState === 'NONE') {
            return (
                <IconSymbol
                    name="swap-vertical-outline"
                    size={14}
                    color={theme.colors.secondary}
                />
            );
        }
        return (
            <IconSymbol
                name={priceState === 'ASC' ? 'arrow-up' : 'arrow-down'}
                size={14}
                color={theme.colors.primary}
            />
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {SORT_TABS.map((tab) => {
                    const isActive = isTabActive(tab);
                    return (
                        <Pressable
                            key={tab.id}
                            style={({ pressed }) => [
                                styles.tab,
                                isActive && styles.tabActive,
                                pressed && styles.tabPressed,
                            ]}
                            onPress={() => handleTabPress(tab)}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    isActive && styles.tabTextActive,
                                ]}
                            >
                                {t(tab.labelKey)}
                            </Text>
                            {tab.isPrice && renderPriceIcon()}
                        </Pressable>
                    );
                })}
            </ScrollView>
        </View>
    );
});

SortBar.displayName = 'SortBar';

const styles = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderMuted,
    },
    scrollContent: {
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.sm,
        gap: theme.margins.sm,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.sm,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.background,
        gap: 4,
    },
    tabActive: {
        backgroundColor: theme.colors.primarySoft,
    },
    tabPressed: {
        opacity: 0.8,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '500',
        color: theme.colors.typographySecondary,
    },
    tabTextActive: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
}));

export default SortBar;
