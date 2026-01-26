/**
 * ==============================================
 * SEARCH SUGGESTIONS - Autocomplete Results
 * ==============================================
 * 
 * Displays autocomplete suggestions with:
 * - Highlighted matching text
 * - Search icon for each suggestion
 * - Loading indicator
 * - Keyboard-friendly (keyboard persists on tap)
 */

import { IconSymbol } from '@/components/ui/Icon';
import { useSearchSuggestions } from '@/hooks/api/search';
import { SearchSuggestionUI } from '@/types/search';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    Text,
    View,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface SearchSuggestionsProps {
    query: string;
    onSelect: (suggestion: SearchSuggestionUI) => void;
}

/**
 * Highlighted text component
 * Renders text with matching parts highlighted
 */
const HighlightedText = React.memo(({
    text,
    highlightedText,
}: {
    text: string;
    highlightedText?: string;
}) => {
    const { theme } = useUnistyles();

    if (!highlightedText) {
        return <Text style={styles.suggestionText}>{text}</Text>;
    }

    // Split into parts: bold (matched) and regular (not matched)
    const parts: { text: string; isHighlight: boolean }[] = [];
    let currentIndex = 0;
    const lowerText = text.toLowerCase();
    const lowerHighlight = highlightedText.toLowerCase();

    // Find all occurrences of the highlight text
    let searchIndex = lowerText.indexOf(lowerHighlight);

    while (searchIndex !== -1) {
        // Add non-highlighted part before match
        if (searchIndex > currentIndex) {
            parts.push({
                text: text.slice(currentIndex, searchIndex),
                isHighlight: false,
            });
        }

        // Add highlighted part
        parts.push({
            text: text.slice(searchIndex, searchIndex + highlightedText.length),
            isHighlight: true,
        });

        currentIndex = searchIndex + highlightedText.length;
        searchIndex = lowerText.indexOf(lowerHighlight, currentIndex);
    }

    // Add remaining text
    if (currentIndex < text.length) {
        parts.push({
            text: text.slice(currentIndex),
            isHighlight: false,
        });
    }

    return (
        <Text style={styles.suggestionText}>
            {parts.map((part, index) => (
                <Text
                    key={index}
                    style={part.isHighlight ? styles.highlightedText : undefined}
                >
                    {part.text}
                </Text>
            ))}
        </Text>
    );
});

HighlightedText.displayName = 'HighlightedText';

/**
 * Single suggestion item
 */
const SuggestionItem = React.memo(({
    suggestion,
    onPress,
}: {
    suggestion: SearchSuggestionUI;
    onPress: () => void;
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('search');

    return (
        <Pressable
            style={({ pressed }) => [
                styles.suggestionItem,
                pressed && styles.suggestionPressed,
            ]}
            onPress={onPress}
        >
            <IconSymbol
                name="search"
                size={18}
                color={theme.colors.secondary}
                style={styles.suggestionIcon}
            />
            <View style={styles.suggestionContent}>
                <HighlightedText
                    text={suggestion.keyword}
                    highlightedText={suggestion.highlightedText}
                />
                {suggestion.categoryName && (
                    <Text style={styles.categoryText} numberOfLines={1}>
                        {t('suggestions.searchIn')} {suggestion.categoryName}
                    </Text>
                )}
            </View>
            {/* Arrow to fill in suggestion */}
            <Pressable
                style={({ pressed }) => [
                    styles.fillButton,
                    pressed && styles.fillButtonPressed,
                ]}
                hitSlop={8}
            >
                <IconSymbol
                    name="arrow-forward"
                    size={16}
                    color={theme.colors.secondary}
                    style={styles.fillIcon}
                />
            </Pressable>
        </Pressable>
    );
});


SuggestionItem.displayName = 'SuggestionItem';

/**
 * Loading state
 */
const LoadingIndicator = React.memo(() => {
    const { theme } = useUnistyles();

    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
    );
});

LoadingIndicator.displayName = 'LoadingIndicator';

/**
 * Empty state when no suggestions found
 */
const EmptyState = React.memo(({ query }: { query: string }) => {
    const { t } = useTranslation('search');
    const { theme } = useUnistyles();

    return (
        <View style={styles.emptyContainer}>
            <IconSymbol
                name="search-outline"
                size={48}
                color={theme.colors.secondary}
            />
            <Text style={styles.emptyText}>
                {t('suggestions.noResults', { query })}
            </Text>
        </View>
    );
});

EmptyState.displayName = 'EmptyState';

/**
 * Search Suggestions Component
 */
export const SearchSuggestions = React.memo(({
    query,
    onSelect,
}: SearchSuggestionsProps) => {
    const { data: suggestions, isLoading, isFetching } = useSearchSuggestions({ query });

    const handleSelect = useCallback((suggestion: SearchSuggestionUI) => {
        onSelect(suggestion);
    }, [onSelect]);

    const renderItem = useCallback(({ item }: { item: SearchSuggestionUI }) => (
        <SuggestionItem
            suggestion={item}
            onPress={() => handleSelect(item)}
        />
    ), [handleSelect]);

    const keyExtractor = useCallback((item: SearchSuggestionUI) => item.id, []);

    // Initial loading (no cached data)
    if (isLoading && !suggestions) {
        return <LoadingIndicator />;
    }

    // No suggestions found
    if (!isLoading && (!suggestions || suggestions.length === 0) && query.length >= 2) {
        return <EmptyState query={query} />;
    }

    // Don't render anything if query is too short
    if (query.length < 2 || !suggestions) {
        return null;
    }

    return (
        <View style={styles.container}>
            {/* Show subtle loading indicator when fetching new suggestions */}
            {isFetching && (
                <View style={styles.fetchingIndicator}>
                    <ActivityIndicator size="small" color="rgba(0,0,0,0.2)" />
                </View>
            )}

            <FlatList
                data={suggestions}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
});

SearchSuggestions.displayName = 'SearchSuggestions';

const styles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
    },
    listContent: {
        paddingVertical: theme.margins.sm,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.margins.smd,
        paddingHorizontal: theme.margins.md,
    },
    suggestionPressed: {
        backgroundColor: theme.colors.backgroundSurface,
    },
    suggestionIcon: {
        marginRight: theme.margins.smd,
    },
    suggestionContent: {
        flex: 1,
    },
    suggestionText: {
        fontSize: 15,
        color: theme.colors.typography,
    },
    highlightedText: {
        fontWeight: '700',
    },
    categoryText: {
        fontSize: 12,
        color: theme.colors.secondary,
        marginTop: 2,
    },
    fillButton: {
        padding: 8,
    },
    fillButtonPressed: {
        opacity: 0.6,
    },
    fillIcon: {
        transform: [{ rotate: '-45deg' }],
    },
    // Loading state
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: theme.margins.xl,
    },
    fetchingIndicator: {
        position: 'absolute',
        top: 8,
        right: 16,
        zIndex: 1,
    },
    // Empty state
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.margins.xl,
        paddingTop: theme.margins.xl,
    },
    emptyText: {
        fontSize: 14,
        color: theme.colors.secondary,
        textAlign: 'center',
        marginTop: theme.margins.md,
    },
}));

export default SearchSuggestions;
