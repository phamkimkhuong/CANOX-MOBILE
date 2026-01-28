/**
 * ==============================================
 * STAR RATING INPUT - 5 Sao Input
 * ==============================================
 * Interactive star rating with animation
 */

import { IconSymbol } from '@/components/ui/Icon';
import { getReviewRatingLabel } from '@/utils/adapter/review/reviewAdapter';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface StarRatingInputProps {
    /** Current rating value (1-5) */
    value: number;
    /** Callback when rating changes */
    onChange: (rating: number) => void;
    /** Star size */
    size?: number;
    /** Read only mode */
    readonly?: boolean;
    /** Show rating label text */
    showLabel?: boolean;
    /** Error state */
    hasError?: boolean;
}

const STAR_COUNT = 5;

/**
 * Star - Simple star without animation for better performance
 */
const Star: React.FC<{
    index: number;
    filled: boolean;
    size: number;
    onPress: () => void;
    readonly: boolean;
}> = ({ filled, size, onPress, readonly }) => {
    const { theme } = useUnistyles();

    return (
        <Pressable
            onPress={onPress}
            disabled={readonly}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
            <IconSymbol
                name={filled ? 'star-fill' : 'star-outline'}
                size={size}
                color={filled ? theme.colors.warning : theme.colors.secondary}
            />
        </Pressable>
    );
};

/**
 * StarRatingInput - 5 star rating input
 */
export const StarRatingInput: React.FC<StarRatingInputProps> = ({
    value,
    onChange,
    size = 36,
    readonly = false,
    showLabel = true,
    hasError = false,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { t } = useTranslation(['myReviews']);

    const handleStarPress = useCallback(
        (index: number) => {
            onChange(index + 1);
        },
        [onChange]
    );

    const ratingLabelKey = getReviewRatingLabel(value);

    return (
        <View style={styles.container}>
            {/* Stars Row */}
            <View style={styles.starsContainer}>
                {Array.from({ length: STAR_COUNT }).map((_, index) => (
                    <Star
                        key={index}
                        index={index}
                        filled={index < value}
                        size={size}
                        onPress={() => handleStarPress(index)}
                        readonly={readonly}
                    />
                ))}
            </View>

            {/* Rating Label */}
            {showLabel && (
                <Text
                    style={[
                        styles.label,
                        value > 0 && styles.labelActive,
                        hasError && styles.labelError,
                    ]}
                >
                    {value > 0 ? t(ratingLabelKey as any) : t('ratingLabels.none')}
                </Text>
            )}

            {/* Error Message */}
            {hasError && value === 0 && (
                <Text style={styles.errorText}>{t('toast.error')}: {t('ratingLabels.none')}</Text>
            )}
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        alignItems: 'center',
        gap: theme.margins.sm,
    },
    starsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
    },
    label: {
        fontSize: 14,
        fontWeight: '400',
        color: theme.colors.typographySecondary,
    },
    labelActive: {
        color: theme.colors.typography,
        fontWeight: '500',
    },
    labelError: {
        color: theme.colors.error,
    },
    errorText: {
        fontSize: 12,
        color: theme.colors.error,
        marginTop: theme.margins.sm / 2,
    },
}));

export default StarRatingInput;
