/**
 * ==============================================
 * RECENT SEARCHES - Search History Display
 * ==============================================
 * 
 * Displays user's recent search history with:
 * - Chip/tag style for quick selection
 * - Clear individual or all history
 * - Maximum 10 items
 */

import { IconSymbol } from '@/components/ui/Icon';
import { useSearchHistory } from '@/hooks/api/search/useSearchHistory';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface RecentSearchesProps {
    onSelect: (keyword: string) => void;
}

/**
 * Recent search item component
 */
const RecentSearchItem = React.memo(({
    keyword,
    onPress,
    onRemove,
}: {
    keyword: string;
    onPress: () => void;
    onRemove: () => void;
}) => {
    const { theme } = useUnistyles();

    return (
        <View style={styles.chipContainer}>
            <Pressable
                style={({ pressed }) => [
                    styles.chip,
                    pressed && styles.chipPressed,
                ]}
                onPress={onPress}
            >
                <IconSymbol
                    name="time-outline"
                    size={14}
                    color={theme.colors.secondary}
                    style={styles.chipIcon}
                />
                <Text style={styles.chipText} numberOfLines={1}>
                    {keyword}
                </Text>
            </Pressable>
            <Pressable
                style={({ pressed }) => [
                    styles.removeButton,
                    pressed && styles.removeButtonPressed,
                ]}
                onPress={onRemove}
                hitSlop={8}
            >
                <IconSymbol
                    name="close"
                    size={14}
                    color={theme.colors.secondary}
                />
            </Pressable>
        </View>
    );
});

RecentSearchItem.displayName = 'RecentSearchItem';

/**
 * Recent Searches Component
 */
export const RecentSearches = React.memo(({ onSelect }: RecentSearchesProps) => {
    const { t } = useTranslation('search');
    const { searches, removeSearch, clearAll } = useSearchHistory();
    const { theme } = useUnistyles();

    const handleSelect = useCallback((keyword: string) => {
        onSelect(keyword);
    }, [onSelect]);

    const handleRemove = useCallback((keyword: string) => {
        removeSearch(keyword);
    }, [removeSearch]);

    const handleClearAll = useCallback(() => {
        clearAll();
    }, [clearAll]);

    // Don't render if no history
    if (searches.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>{t('recent.title')}</Text>
                <Pressable
                    style={({ pressed }) => [
                        styles.clearAllButton,
                        pressed && styles.clearAllPressed,
                    ]}
                    onPress={handleClearAll}
                    hitSlop={8}
                >
                    <Text style={styles.clearAllText}>{t('recent.clearAll')}</Text>
                </Pressable>
            </View>

            {/* Chips Container */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsContent}
                keyboardShouldPersistTaps="handled"
            >
                {searches.map((item) => (
                    <RecentSearchItem
                        key={`recent_${item.keyword}`}
                        keyword={item.keyword}
                        onPress={() => handleSelect(item.keyword)}
                        onRemove={() => handleRemove(item.keyword)}
                    />
                ))}
            </ScrollView>
        </View>
    );
});

RecentSearches.displayName = 'RecentSearches';

const styles = StyleSheet.create((theme) => ({
    container: {
        paddingVertical: theme.margins.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        marginBottom: theme.margins.sm,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    clearAllButton: {
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    clearAllPressed: {
        opacity: 0.6,
    },
    clearAllText: {
        fontSize: 13,
        color: theme.colors.primary,
    },
    chipsContent: {
        paddingHorizontal: theme.margins.md,
        gap: theme.margins.sm,
    },
    chipContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        borderRadius: theme.radius.full,
        borderWidth: 1,
        borderColor: theme.colors.borderMuted,
        overflow: 'hidden',
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingLeft: 12,
        paddingRight: 4,
    },
    chipPressed: {
        backgroundColor: theme.colors.backgroundSurface,
    },
    chipIcon: {
        marginRight: 6,
    },
    chipText: {
        fontSize: 13,
        color: theme.colors.typography,
        maxWidth: 150,
    },
    removeButton: {
        padding: 8,
        paddingLeft: 4,
    },
    removeButtonPressed: {
        opacity: 0.6,
    },
}));

export default RecentSearches;
