/**
 * ==============================================
 * HOT KEYWORDS - Trending Searches
 * ==============================================
 * 
 * Displays trending/hot search keywords with:
 * - Ranked list (1-10)
 * - Fire icon for top 3
 * - Loading skeleton
 */

import { IconSymbol } from '@/components/ui/Icon';
import { useHotKeywords } from '@/hooks/api/search';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface HotKeywordsProps {
    onSelect: (keyword: string) => void;
    limit?: number;
}

/**
 * Skeleton loading component
 */
const HotKeywordsSkeleton = React.memo(() => {
    const { theme } = useUnistyles();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={[styles.skeletonTitle, { backgroundColor: theme.colors.borderMuted }]} />
            </View>
            <View style={styles.list}>
                {Array.from({ length: 5 }).map((_, index) => (
                    <View key={index} style={styles.itemRow}>
                        <View style={[styles.skeletonRank, { backgroundColor: theme.colors.borderMuted }]} />
                        <View
                            style={[
                                styles.skeletonKeyword,
                                {
                                    backgroundColor: theme.colors.borderMuted,
                                    width: 100 + Math.random() * 80,
                                },
                            ]}
                        />
                    </View>
                ))}
            </View>
        </View>
    );
});

HotKeywordsSkeleton.displayName = 'HotKeywordsSkeleton';

/**
 * Single hot keyword item
 */
const HotKeywordItem = React.memo(({
    rank,
    keyword,
    isHot,
    onPress,
}: {
    rank: number;
    keyword: string;
    isHot: boolean;
    onPress: () => void;
}) => {
    const { theme } = useUnistyles();

    const getRankColor = (rankNum: number): string => {
        switch (rankNum) {
            case 1:
                return theme.colors.error; // Gold/Red for #1
            case 2:
                return theme.colors.primary; // Primary for #2
            case 3:
                return theme.colors.secondary; // Secondary for #3
            default:
                return theme.colors.typographySecondary;
        }
    };

    return (
        <Pressable
            style={({ pressed }) => [
                styles.itemRow,
                pressed && styles.itemPressed,
            ]}
            onPress={onPress}
        >
            {/* Rank Number */}
            <View style={styles.rankContainer}>
                <Text style={[styles.rankText, { color: getRankColor(rank) }]}>
                    {rank}
                </Text>
            </View>

            {/* Keyword */}
            <Text style={styles.keywordText} numberOfLines={1}>
                {keyword}
            </Text>

            {/* Fire icon for hot items */}
            {isHot && (
                <IconSymbol
                    name="flame"
                    size={16}
                    color={theme.colors.error}
                    style={styles.fireIcon}
                />
            )}
        </Pressable>
    );
});

HotKeywordItem.displayName = 'HotKeywordItem';

/**
 * Hot Keywords Component
 */
export const HotKeywords = React.memo(({ onSelect, limit = 10 }: HotKeywordsProps) => {
    const { t } = useTranslation('search');
    const { data: keywords, isLoading, isError } = useHotKeywords({ limit });

    const handleSelect = useCallback((keyword: string) => {
        onSelect(keyword);
    }, [onSelect]);

    // Loading state
    if (isLoading) {
        return <HotKeywordsSkeleton />;
    }

    // Error or no data
    if (isError || !keywords || keywords.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>{t('hot.title')}</Text>
            </View>

            {/* Keywords List */}
            <View style={styles.list}>
                {keywords.map((item) => (
                    <HotKeywordItem
                        key={item.id}
                        rank={item.rank}
                        keyword={item.keyword}
                        isHot={item.isHot}
                        onPress={() => handleSelect(item.keyword)}
                    />
                ))}
            </View>
        </View>
    );
});

HotKeywords.displayName = 'HotKeywords';

const styles = StyleSheet.create((theme) => ({
    container: {
        paddingVertical: theme.margins.md,
    },
    header: {
        paddingHorizontal: theme.margins.md,
        marginBottom: theme.margins.sm,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    list: {
        paddingHorizontal: theme.margins.md,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.margins.smd,
        paddingHorizontal: theme.margins.sm,
        borderRadius: theme.radius.s,
    },
    itemPressed: {
        backgroundColor: theme.colors.backgroundSurface,
    },
    rankContainer: {
        width: 24,
        alignItems: 'center',
    },
    rankText: {
        fontSize: 14,
        fontWeight: '700',
    },
    keywordText: {
        flex: 1,
        fontSize: 14,
        color: theme.colors.typography,
        marginLeft: theme.margins.sm,
    },
    fireIcon: {
        marginLeft: theme.margins.sm,
    },
    // Skeleton styles
    skeletonTitle: {
        width: 100,
        height: 16,
        borderRadius: theme.radius.s,
    },
    skeletonRank: {
        width: 16,
        height: 16,
        borderRadius: theme.radius.s,
    },
    skeletonKeyword: {
        height: 14,
        borderRadius: theme.radius.s,
        marginLeft: theme.margins.sm,
    },
}));

export default HotKeywords;
