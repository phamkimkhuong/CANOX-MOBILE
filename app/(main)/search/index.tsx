/**
 * ==============================================
 * SEARCH SCREEN - Search Entry Point
 * ==============================================
 * Zero State (Idle) - Shows recent searches + hot keywords
 * Typing State - Shows autocomplete suggestions
 * 
 * Features:
 * - Auto-focus on mount
 * - Keyboard persists during interactions
 * - Search history persistence
 * - Track search analytics
 */

import {
    HotKeywords,
    RecentSearches,
    SearchHeader,
    SearchHeaderRef,
    SearchSuggestions,
} from '@/components/search';
import { searchRoutes } from '@/constants/routes';
import { useTrackSearch } from '@/hooks/api/search';
import { useSearchHistory } from '@/hooks/api/search/useSearchHistory';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import { SearchSuggestionUI } from '@/types/search';
import { Navigator } from '@/utils/navigation';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

type SearchState = 'idle' | 'typing';

/**
 * Search Screen Component
 */
export default function SearchScreen() {
    // Unlock navigation when screen gains focus (for faster subsequent navigations)
    useNavigationUnlockOnFocus();

    const insets = useSafeAreaInsets();

    const headerRef = useRef<SearchHeaderRef>(null);
    const params = useLocalSearchParams<{ q?: string }>();

    // State
    const [query, setQuery] = useState(params.q ?? '');
    const [searchState, setSearchState] = useState<SearchState>(params.q ? 'typing' : 'idle');

    // Hooks
    const { addSearch } = useSearchHistory();
    const { mutate: trackSearch } = useTrackSearch();

    /**
     * Determine search state based on query
     */
    const updateSearchState = useCallback((text: string) => {
        setQuery(text);
        setSearchState(text.length > 0 ? 'typing' : 'idle');
    }, []);

    /**
     * Execute search and navigate to results
     */
    const executeSearch = useCallback((keyword: string) => {
        if (!keyword.trim()) return;

        const trimmedKeyword = keyword.trim();

        // Track the search
        trackSearch({ keyword: trimmedKeyword, source: 'SUBMIT' });

        // Add to history
        addSearch(trimmedKeyword);

        // Dismiss keyboard
        Keyboard.dismiss();
        Navigator.push(searchRoutes.results({ q: trimmedKeyword }));
    }, [trackSearch, addSearch]);

    /**
     * Handle search submission from keyboard
     */
    const handleSubmit = useCallback((text: string) => {
        executeSearch(text);
    }, [executeSearch]);

    /**
     * Handle selecting a recent search
     */
    const handleRecentSelect = useCallback((keyword: string) => {
        setQuery(keyword);
        executeSearch(keyword);
    }, [executeSearch]);

    /**
     * Handle selecting a hot keyword
     */
    const handleHotKeywordSelect = useCallback((keyword: string) => {
        setQuery(keyword);
        executeSearch(keyword);
    }, [executeSearch]);

    /**
     * Handle selecting an autocomplete suggestion
     */
    const handleSuggestionSelect = useCallback((suggestion: SearchSuggestionUI) => {
        setQuery(suggestion.keyword);
        executeSearch(suggestion.keyword);
    }, [executeSearch]);

    /**
     * Handle back navigation
     */
    const handleBack = useCallback(() => {
        Keyboard.dismiss();
        Navigator.back();
    }, []);

    const isTyping = searchState === 'typing';

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={0}
        >
            {/* Search Header */}
            <SearchHeader
                ref={headerRef}
                value={query}
                onChangeText={updateSearchState}
                onSubmit={handleSubmit}
                onBack={handleBack}
                autoFocus
            />

            {/* Content Area */}
            <View style={styles.content}>
                {isTyping ? (
                    /* Typing State - Show Suggestions */
                    <SearchSuggestions
                        query={query}
                        onSelect={handleSuggestionSelect}
                    />
                ) : (
                    /* Zero State - Show Recent + Hot */
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={[
                            styles.scrollContent,
                            { paddingBottom: insets.bottom + 16 },
                        ]}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <RecentSearches onSelect={handleRecentSelect} />
                        <HotKeywords onSelect={handleHotKeywordSelect} />
                    </ScrollView>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    content: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
}));
