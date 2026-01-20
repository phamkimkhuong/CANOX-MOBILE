/**
 * ==============================================
 * SEARCH EMPTY STATE - Smart Empty with Suggestions
 * ==============================================
 * 
 * Features:
 * - Friendly message when no results
 * - Suggestions to try different keywords
 * - Option to adjust filters
 * - Can show recommendations (future)
 */

import { IconSymbol } from '@/components/ui/Icon';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface SearchEmptyStateProps {
    keyword: string;
    hasFilters: boolean;
    onTryAgain: () => void;
    onClearFilters?: () => void;
}

export const SearchEmptyState = React.memo(({
    keyword,
    hasFilters,
    onTryAgain,
    onClearFilters,
}: SearchEmptyStateProps) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('search');

    return (
        <View style={styles.container}>
            {/* Illustration */}
            <View style={styles.iconWrapper}>
                <IconSymbol
                    name="search-outline"
                    size={64}
                    color={theme.colors.secondary}
                />
            </View>

            {/* Title */}
            <Text style={styles.title}>{t('empty.title')}</Text>

            {/* Subtitle with keyword */}
            <Text style={styles.subtitle}>
                {t('empty.subtitle', { keyword })}
            </Text>

            {/* Action Buttons */}
            <View style={styles.actions}>
                {/* Try Again Button */}
                <Pressable
                    style={({ pressed }) => [
                        styles.primaryButton,
                        pressed && styles.buttonPressed,
                    ]}
                    onPress={onTryAgain}
                >
                    <IconSymbol
                        name="search"
                        size={18}
                        color={theme.colors.onPrimary}
                    />
                    <Text style={styles.primaryButtonText}>
                        {t('empty.tryAgain')}
                    </Text>
                </Pressable>

                {/* Clear Filters Button (if has filters) */}
                {hasFilters && onClearFilters && (
                    <Pressable
                        style={({ pressed }) => [
                            styles.secondaryButton,
                            pressed && styles.buttonPressed,
                        ]}
                        onPress={onClearFilters}
                    >
                        <IconSymbol
                            name="options-outline"
                            size={18}
                            color={theme.colors.primary}
                        />
                        <Text style={styles.secondaryButtonText}>
                            {t('empty.adjustFilters')}
                        </Text>
                    </Pressable>
                )}
            </View>

            {/* Suggestions Section (Placeholder for future) */}
            <View style={styles.suggestionsSection}>
                <Text style={styles.suggestionsTitle}>
                    {t('empty.suggestion')}
                </Text>
                {/* Future: Render recommended products here */}
            </View>
        </View>
    );
});

SearchEmptyState.displayName = 'SearchEmptyState';

const styles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: theme.margins.xl,
        paddingTop: theme.margins.md,
    },
    iconWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.margins.lg,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.typography,
        marginBottom: theme.margins.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.secondary,
        textAlign: 'center',
        marginBottom: theme.margins.lg,
        lineHeight: 20,
    },
    actions: {
        flexDirection: 'row',
        gap: theme.margins.smd,
        marginBottom: theme.margins.xl,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.lg,
        paddingVertical: theme.margins.smd,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.full,
        gap: theme.margins.sm,
    },
    primaryButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.onPrimary,
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.lg,
        paddingVertical: theme.margins.smd,
        backgroundColor: theme.colors.primarySubtle,
        borderRadius: theme.radius.full,
        gap: theme.margins.sm,
    },
    secondaryButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    buttonPressed: {
        opacity: 0.8,
    },
    suggestionsSection: {
        width: '100%',
        paddingTop: theme.margins.lg,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderMuted,
    },
    suggestionsTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.typography,
        marginBottom: theme.margins.md,
    },
}));

export default SearchEmptyState;
