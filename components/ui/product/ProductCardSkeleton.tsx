import { SkeletonBox } from '@/components/ui/feedback/Skeleton';
import React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

/**
 * ProductCardSkeleton - Optimized for low-end devices
 * Uses Shell-based pattern to match real ProductCard exactly and minimize view count
 */
export const ProductCardSkeleton: React.FC<{
    animatedStyle?: object;
}> = ({ animatedStyle }) => {
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            <View style={styles.shadowWrapper}>
                <View style={styles.surface}>
                    {/* Image Block (aspectRatio: 1 matching exactly real card) */}
                    <SkeletonBox
                        width="100%"
                        height={undefined}
                        style={styles.imageBlock}
                        borderRadius={0}
                        animatedStyle={animatedStyle}
                    />

                    {/* Content Block - Minimalist representation */}
                    <View style={styles.content}>
                        {/* Title lines */}
                        <SkeletonBox width="90%" height={12} animatedStyle={animatedStyle} />
                        <SkeletonBox width="60%" height={12} animatedStyle={animatedStyle} style={styles.mt4} />

                        {/* Price block */}
                        <View style={styles.priceRow}>
                            <SkeletonBox width="45%" height={18} animatedStyle={animatedStyle} />
                        </View>

                        {/* Footer block (Meta/sold) */}
                        <View style={styles.metaRow}>
                            <SkeletonBox width="30%" height={10} animatedStyle={animatedStyle} />
                            <SkeletonBox width="20%" height={10} animatedStyle={animatedStyle} />
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

// Matches ProductCard stylesheet closely to avoid layout shift (jank)
const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        padding: 4, // Matches ProductCard exactly
    },
    shadowWrapper: {
        borderRadius: 24, // Matches ProductCard exactly
        backgroundColor: theme.colors.surface,
        // Premium Shadow (Matches ProductCard exactly)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    surface: {
        borderRadius: 24, // Matches ProductCard exactly
        backgroundColor: theme.colors.surface,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    imageBlock: {
        width: '100%',
        aspectRatio: 1,
    },
    content: {
        padding: 10,
        gap: 6,
    },
    mt4: {
        marginTop: 4,
    },
    priceRow: {
        marginTop: 8,
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
}));
