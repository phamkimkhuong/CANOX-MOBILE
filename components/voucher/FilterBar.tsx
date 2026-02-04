/**
 * FilterBar - Thanh lọc voucher theo loại
 * 
 * Features:
 * - Horizontal ScrollView với các chips
 * - Active state rõ ràng (màu primary)
 * - Có thể sticky khi cuộn trang
 */

import type { VoucherFilterTab } from '@/types/voucher';
import { VOUCHER_FILTER_TABS } from '@/types/voucher';
import React, { memo, useCallback, useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface FilterBarProps {
    /** Tab đang active */
    activeTab: string;
    /** Callback khi đổi tab */
    onTabChange: (tabId: string) => void;
    /** Custom tabs (nếu không dùng mặc định) */
    tabs?: VoucherFilterTab[];
}

interface FilterChipProps {
    tab: VoucherFilterTab;
    isActive: boolean;
    onPress: () => void;
}

/**
 * Filter Chip Component
 */
const FilterChip = memo<FilterChipProps>(({ tab, isActive, onPress }) => {
    const { theme } = useUnistyles();

    const containerStyle = useMemo(() => [
        chipStyles.container,
        isActive ? [
            chipStyles.containerActive,
            {
                backgroundColor: theme.colors.primary,
                shadowColor: theme.colors.primary,
            }
        ] : [
            chipStyles.containerInactive,
            {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
            }
        ],
    ], [isActive, theme]);

    const textStyle = useMemo(() => [
        chipStyles.text,
        isActive ? chipStyles.textActive : [
            chipStyles.textInactive,
            { color: theme.colors.typographySecondary }
        ],
    ], [isActive, theme]);

    // Format label with count if available
    const label = useMemo(() => {
        if (tab.count !== undefined && tab.count > 0) {
            return `${tab.label} (${tab.count})`;
        }
        return tab.label;
    }, [tab.label, tab.count]);

    return (
        <Pressable
            style={({ pressed }) => [
                containerStyle,
                pressed && chipStyles.containerPressed,
            ]}
            onPress={onPress}
        >
            <Text style={textStyle}>{label}</Text>
        </Pressable>
    );
});

FilterChip.displayName = 'FilterChip';

const chipStyles = StyleSheet.create((theme) => ({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: theme.radius.full,
        marginRight: 8,
    },
    containerActive: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    containerInactive: {
        borderWidth: 1,
    },
    containerPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    text: {
        fontSize: 12,
        fontWeight: '600',
    },
    textActive: {
        color: '#ffffff',
    },
    textInactive: {
        // Color set dynamically
    },
}));

/**
 * FilterBar Component
 */
export const FilterBar = memo<FilterBarProps>(({
    activeTab,
    onTabChange,
    tabs = VOUCHER_FILTER_TABS,
}) => {

    const handleTabPress = useCallback((tabId: string) => {
        onTabChange(tabId);
    }, [onTabChange]);

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {tabs.map((tab) => (
                    <FilterChip
                        key={tab.id}
                        tab={tab}
                        isActive={activeTab === tab.id}
                        onPress={() => handleTabPress(tab.id)}
                    />
                ))}
            </ScrollView>
        </View>
    );
});

FilterBar.displayName = 'FilterBar';

const styles = StyleSheet.create((theme) => ({
    container: {
        paddingVertical: theme.margins.sm,
    },
    scrollContent: {
        paddingHorizontal: theme.margins.md,
    },
}));

export default FilterBar;

