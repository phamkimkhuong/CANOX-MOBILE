/**
 * ==============================================
 * QUICK TAG CHIPS - Suggestion Chips List
 * ==============================================
 * Shows relevant quick tags based on rating
 */

import { getReviewTagsForRating } from '@/utils/adapter/review/reviewAdapter';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { QuickTagChip } from './QuickTagChip';

interface QuickTagChipsProps {
    /** Current rating (1-5) */
    rating: number;
    /** Currently selected tag IDs */
    selectedTags: string[];
    /** Callback when tag is toggled */
    onTagToggle: (tagId: string, tagLabel: string) => void;
}

/**
 * QuickTagChips - List of suggestion chips based on rating
 */
export const QuickTagChips: React.FC<QuickTagChipsProps> = ({
    rating,
    selectedTags,
    onTagToggle,
}) => {
    const styles = stylesheet;
    const { t } = useTranslation(['myReviews']);

    // Get tags for current rating
    const availableTags = useMemo(() => {
        return getReviewTagsForRating(rating);
    }, [rating]);

    // Don't render if no rating selected
    if (rating === 0 || availableTags.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.hint}>{t('form.tagHint')}</Text>
            <View style={styles.chipsContainer}>
                {availableTags.map((tag) => (
                    <QuickTagChip
                        key={tag.id}
                        label={tag.label}
                        category={tag.category}
                        selected={selectedTags.includes(tag.id)}
                        onPress={() => onTagToggle(tag.id, tag.label)}
                    />
                ))}
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        gap: theme.margins.sm,
    },
    hint: {
        fontSize: 13,
        fontWeight: '400',
        color: theme.colors.typographySecondary,
        marginBottom: 4,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.margins.sm,
    },
}));

export default QuickTagChips;
