import React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface NotificationSkeletonProps {
    count?: number;
}

const SkeletonItem: React.FC = () => {
    const styles = stylesheet;

    return (
        <View style={styles.item}>
            <View style={styles.iconSkeleton} />
            <View style={styles.textContainer}>
                <View style={styles.titleSkeleton} />
                <View style={styles.messageSkeleton} />
                <View style={styles.timeSkeleton} />
            </View>
        </View>
    );
};

export const NotificationSkeleton: React.FC<NotificationSkeletonProps> = ({ count = 5 }) => {
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            {/* Section header skeleton */}
            <View style={styles.sectionSkeleton}>
                <View style={styles.sectionTextSkeleton} />
            </View>

            {/* Items skeleton */}
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonItem key={index} />
            ))}
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
    },
    sectionSkeleton: {
        paddingVertical: theme.margins.sm,
        paddingHorizontal: theme.margins.md,
        backgroundColor: theme.colors.backgroundSurface,
    },
    sectionTextSkeleton: {
        width: 80,
        height: 12,
        borderRadius: theme.radius.s,
        backgroundColor: theme.colors.secondaryLight,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.md,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        gap: theme.margins.smd,
    },
    iconSkeleton: {
        width: 56,
        height: 56,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.secondaryLight,
    },
    textContainer: {
        flex: 1,
        gap: theme.margins.sm,
    },
    titleSkeleton: {
        width: '70%',
        height: 16,
        borderRadius: theme.radius.s,
        backgroundColor: theme.colors.secondaryLight,
    },
    messageSkeleton: {
        width: '100%',
        height: 36,
        borderRadius: theme.radius.s,
        backgroundColor: theme.colors.secondaryLight,
    },
    timeSkeleton: {
        width: 60,
        height: 12,
        borderRadius: theme.radius.s,
        backgroundColor: theme.colors.secondaryLight,
        marginTop: theme.margins.sm,
    },
}));
