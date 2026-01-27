/**
 * ==============================================
 * REVIEW LIST SKELETON
 * ==============================================
 * Loading skeleton for the reviews list
 */

import React, { memo } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

// ============================================
// TYPES
// ============================================

interface ReviewListSkeletonProps {
    count?: number;
}

// ============================================
// SUB-COMPONENTS
// ============================================

const SkeletonCard = memo(() => {
    return (
        <View style={cardStyles.container}>
            {/* User Row */}
            <View style={cardStyles.userRow}>
                <View style={cardStyles.avatar} />
                <View style={cardStyles.userInfo}>
                    <View style={cardStyles.userName} />
                    <View style={cardStyles.stars} />
                </View>
                <View style={cardStyles.date} />
            </View>

            {/* Variant */}
            <View style={cardStyles.variant} />

            {/* Content */}
            <View style={cardStyles.textLine} />
            <View style={cardStyles.textLine} />
            <View style={cardStyles.textLineShort} />

            {/* Media */}
            <View style={cardStyles.mediaRow}>
                <View style={cardStyles.mediaItem} />
                <View style={cardStyles.mediaItem} />
                <View style={cardStyles.mediaItem} />
            </View>

            {/* Footer */}
            <View style={cardStyles.footer}>
                <View style={cardStyles.helpfulButton} />
            </View>
        </View>
    );
});

SkeletonCard.displayName = 'SkeletonCard';

const cardStyles = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        padding: theme.margins.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.border,
        marginRight: 12,
    },
    userInfo: {
        flex: 1,
        gap: 6,
    },
    userName: {
        width: 100,
        height: 14,
        backgroundColor: theme.colors.border,
        borderRadius: theme.radius.s,
    },
    stars: {
        width: 80,
        height: 12,
        backgroundColor: theme.colors.border,
        borderRadius: theme.radius.s,
    },
    date: {
        width: 60,
        height: 12,
        backgroundColor: theme.colors.border,
        borderRadius: theme.radius.s,
    },
    variant: {
        width: 120,
        height: 14,
        backgroundColor: theme.colors.border,
        borderRadius: theme.radius.s,
        marginTop: 12,
    },
    textLine: {
        width: '100%',
        height: 14,
        backgroundColor: theme.colors.border,
        borderRadius: theme.radius.s,
        marginTop: 8,
    },
    textLineShort: {
        width: '60%',
        height: 14,
        backgroundColor: theme.colors.border,
        borderRadius: theme.radius.s,
        marginTop: 8,
    },
    mediaRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    mediaItem: {
        width: 80,
        height: 80,
        backgroundColor: theme.colors.border,
        borderRadius: theme.radius.m,
    },
    footer: {
        marginTop: 16,
    },
    helpfulButton: {
        width: 100,
        height: 32,
        backgroundColor: theme.colors.border,
        borderRadius: theme.radius.full,
    },
}));

// ============================================
// MAIN COMPONENT
// ============================================

export const ReviewListSkeleton = memo<ReviewListSkeletonProps>(({
    count = 3
}) => {
    return (
        <View style={styles.container}>
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonCard key={index} />
            ))}
        </View>
    );
});

ReviewListSkeleton.displayName = 'ReviewListSkeleton';

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
