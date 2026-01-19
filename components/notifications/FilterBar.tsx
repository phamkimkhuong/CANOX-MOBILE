import { IconSymbol, IconSymbolName } from '@/components/ui/Icon';
import { FILTER_TABS, NotificationFilter } from '@/types/notification';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

/**
 * FilterBar - Thanh filter cho màn hình thông báo
 * 
 * Hiển thị các chip filter (All, Order, Promo, System, etc.)
 * với icon và trạng thái active/inactive.
 */
interface FilterBarProps {
    activeFilter: NotificationFilter;
    onFilterChange: (filter: NotificationFilter) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ activeFilter, onFilterChange }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { t } = useTranslation('notification');

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {FILTER_TABS.map((tab) => {
                    const isActive = activeFilter === tab.key;
                    return (
                        <TouchableOpacity
                            key={tab.key}
                            style={[styles.chip, isActive && styles.chipActive]}
                            onPress={() => onFilterChange(tab.key)}
                            activeOpacity={0.7}
                        >
                            {tab.icon ? (
                                <IconSymbol
                                    name={tab.icon as IconSymbolName}
                                    size={18}
                                    color={isActive ? theme.colors.primary : theme.colors.typographySecondary}
                                />
                            ) : null}
                            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                                {t(`filters.${tab.key.toLowerCase()}` as any)}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        paddingTop: theme.margins.sm,
        paddingBottom: theme.margins.smd,
        shadowColor: theme.colors.typography,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    scrollContent: {
        paddingHorizontal: theme.margins.md,
        gap: theme.margins.smd,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 36,
        paddingHorizontal: theme.margins.md,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.primaryMuted,
        gap: theme.margins.sm,
    },
    chipActive: {
        backgroundColor: theme.colors.primaryLight,
        borderWidth: 1,
        borderColor: theme.colors.primarySoft,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.typographySecondary,
    },
    chipTextActive: {
        fontWeight: '600',
        color: theme.colors.primary,
    },
}));
