import { SkeletonBox } from '@/components/ui/feedback/Skeleton';
import React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

/**
 * ProductCardSkeleton
 */
export const ProductCardSkeleton: React.FC<{
    animatedStyle?: object;
}> = ({ animatedStyle }) => {
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            <View style={styles.surface}>
                {/* Image Placeholder */}
                <SkeletonBox
                    width="100%"
                    height={160}
                    borderRadius={0}
                    animatedStyle={animatedStyle}
                />

                {/* Content Placeholder */}
                <View style={styles.content}>
                    <SkeletonBox width="90%" height={12} animatedStyle={animatedStyle} />
                    <SkeletonBox width="60%" height={12} animatedStyle={animatedStyle} style={styles.mt4} />

                    <View style={styles.priceRow}>
                        <SkeletonBox width={100} height={18} animatedStyle={animatedStyle} />
                    </View>

                    <View style={styles.metaRow}>
                        <SkeletonBox width={60} height={10} animatedStyle={animatedStyle} />
                        <SkeletonBox width={40} height={10} animatedStyle={animatedStyle} />
                    </View>
                </View>
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        paddingHorizontal: 4,
        paddingTop: 0,
        paddingBottom: 8,
    },
    surface: {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.m,
        borderWidth: 1,
        height: 260,
        overflow: 'hidden',
    },
    content: {
        padding: 8,
        gap: 6,
    },
    mt4: {
        marginTop: 4,
    },
    priceRow: {
        marginTop: 4,
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
}));
