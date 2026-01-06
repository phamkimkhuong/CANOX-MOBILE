import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';

/**
 * ProductCardSkeleton 
 */
export const ProductCardSkeleton = () => {
    const { theme } = useUnistyles();

    return (
        <View style={styles.container}>
            <View style={[styles.surface, {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.primaryLight,
                borderRadius: theme.radius.m,
            }]}>
                {/* Image Placeholder */}
                <View style={[styles.imageWrapper, { backgroundColor: theme.colors.primaryMuted }]} />

                {/* Content Placeholder */}
                <View style={styles.content}>
                    <View style={[styles.titleLine, { backgroundColor: theme.colors.secondaryLight }]} />
                    <View style={[styles.titleLine, { backgroundColor: theme.colors.secondaryLight, width: '60%' }]} />

                    <View style={styles.priceRow}>
                        <View style={[styles.priceTag, { backgroundColor: theme.colors.secondaryLight }]} />
                    </View>

                    <View style={styles.metaRow}>
                        <View style={[styles.metaLine, { backgroundColor: theme.colors.secondaryLight }]} />
                        <View style={[styles.metaLine, { backgroundColor: theme.colors.secondaryLight, width: 40 }]} />
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 4,
        paddingTop: 0,
    },
    surface: {
        borderWidth: 1,
        height: 260,
        overflow: 'hidden',
    },
    imageWrapper: {
        width: '100%',
        aspectRatio: 1,
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
    },
    priceRow: {
        marginTop: 4,
        marginBottom: 4,
    },
    priceTag: {
        height: 18,
        width: 100,
        borderRadius: 4,
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
    }
});
