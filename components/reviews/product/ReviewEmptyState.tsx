/**
 * ==============================================
 * REVIEW EMPTY STATE
 * ==============================================
 * Empty state component for when no reviews match the filter
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { ReviewEmptyStateConfig } from '@/types/review/productReview';
import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ReviewEmptyStateProps {
    config: ReviewEmptyStateConfig;
}

// ============================================
// MAIN COMPONENT
// ============================================

export const ReviewEmptyState = memo<ReviewEmptyStateProps>(({ config }) => {
    const { theme } = useUnistyles();

    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.iconContainer,
                    config.isPositive && styles.iconContainerPositive
                ]}
            >
                <IconSymbol
                    name={config.icon}
                    size={48}
                    color={config.isPositive ? theme.colors.success : theme.colors.secondary}
                />
            </View>
            <Text style={[styles.title, config.isPositive && styles.titlePositive]}>
                {config.title}
            </Text>
            <Text style={styles.subtitle}>{config.subtitle}</Text>
        </View>
    );
});

ReviewEmptyState.displayName = 'ReviewEmptyState';

const styles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.margins.xl,
        minHeight: 300,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.margins.md,
    },
    iconContainerPositive: {
        backgroundColor: theme.colors.successSoft,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.typography,
        marginBottom: theme.margins.sm,
        textAlign: 'center',
    },
    titlePositive: {
        color: theme.colors.success,
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
}));
