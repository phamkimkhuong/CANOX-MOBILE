import React from 'react';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

/**
 * ProductCardSkeleton
 */
export const ProductCardSkeleton = () => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            <View style={styles.surface}>
                {/* Image Placeholder */}
                <View style={styles.imageWrapper} />

                {/* Content Placeholder */}
                <View style={styles.content}>
                    <View style={styles.titleLine} />
                    <View style={[styles.titleLine, styles.w60p]} />

                    <View style={styles.priceRow}>
                        <View style={styles.priceTag} />
                    </View>

                    <View style={styles.metaRow}>
                        <View style={styles.metaLine} />
                        <View style={[styles.metaLine, styles.w40]} />
                    </View>
                </View>
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        padding: 4,
        paddingTop: 0,
    },
    surface: {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.primaryLight,
        borderRadius: theme.radius.m,
        borderWidth: 1,
        height: 260,
        overflow: 'hidden',
    },
    imageWrapper: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: theme.colors.primaryMuted,
    },
    content: {
        padding: 8,
        gap: 6,
    },
    titleLine: {
        height: 12,
        borderRadius: 4,
        width: '90%',
        marginBottom: 2,
        backgroundColor: theme.colors.secondaryLight,
    },
    w60p: {
        width: '60%',
    },
    priceRow: {
        marginTop: 4,
        marginBottom: 4,
    },
    priceTag: {
        height: 18,
        width: 100,
        borderRadius: 4,
        backgroundColor: theme.colors.secondaryLight,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    metaLine: {
        height: 10,
        width: 60,
        borderRadius: 4,
        backgroundColor: theme.colors.secondaryLight,
    },
    w40: {
        width: 40,
    },
}));
