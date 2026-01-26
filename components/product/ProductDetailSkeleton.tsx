import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, UnistylesRuntime, useUnistyles } from 'react-native-unistyles';

// ============================================
// ANIMATED SKELETON BOX
// ============================================
interface SkeletonBoxProps {
    width: number | string;
    height: number;
    borderRadius?: number;
    style?: object;
}

const SkeletonBox: React.FC<SkeletonBoxProps> = ({
    width,
    height,
    borderRadius = 4,
    style,
}) => {
    const { theme } = useUnistyles();

    return (
        <View
            style={[
                {
                    width: typeof width === 'number' ? width : width,
                    height,
                    borderRadius,
                    backgroundColor: theme.colors.secondaryLight,
                },
                style,
            ]}
        />
    );
};

export const ProductDetailSkeleton: React.FC = () => {
    const insets = useSafeAreaInsets();
    const { theme } = useUnistyles();

    // Reactive screen dimensions - tự động update khi xoay màn hình
    const { width: screenWidth } = useWindowDimensions();
    const galleryHeight = screenWidth; // Gallery là hình vuông

    return (
        <View style={[styles.container, styles.safeTop]}>
            {/* Gallery Skeleton */}
            <SkeletonBox
                width={screenWidth}
                height={galleryHeight}
                borderRadius={0}
            />

            {/* Price Section */}
            <View style={styles.section}>
                <SkeletonBox width={120} height={28} borderRadius={4} />
                <View style={styles.row}>
                    <SkeletonBox width={80} height={16} borderRadius={4} />
                    <SkeletonBox width={60} height={20} borderRadius={4} />
                </View>
                <SkeletonBox width={screenWidth - 32} height={48} borderRadius={8} style={styles.titleSkeleton} />
                <View style={styles.row}>
                    <SkeletonBox width={60} height={16} borderRadius={4} />
                    <SkeletonBox width={80} height={16} borderRadius={4} />
                    <SkeletonBox width={70} height={16} borderRadius={4} />
                </View>
            </View>

            {/* Variant Selector */}
            <View style={styles.variantSection}>
                <SkeletonBox width={60} height={14} borderRadius={4} />
                <SkeletonBox width={100} height={14} borderRadius={4} />
            </View>

            {/* Shop Info */}
            <View style={styles.shopSection}>
                <View style={styles.shopHeader}>
                    <SkeletonBox width={56} height={56} borderRadius={28} />
                    <View style={styles.shopInfo}>
                        <SkeletonBox width={120} height={16} borderRadius={4} />
                        <SkeletonBox width={80} height={12} borderRadius={4} style={styles.mt8} />
                    </View>
                    <SkeletonBox width={70} height={32} borderRadius={8} />
                </View>
                <View style={styles.shopStats}>
                    {[1, 2, 3, 4].map((i) => (
                        <View key={i} style={styles.statItem}>
                            <SkeletonBox width={40} height={16} borderRadius={4} />
                            <SkeletonBox width={60} height={12} borderRadius={4} style={styles.mt4} />
                        </View>
                    ))}
                </View>
            </View>

            {/* Specs Section */}
            <View style={styles.specsSection}>
                <SkeletonBox width={120} height={18} borderRadius={4} style={styles.mb12} />
                {[1, 2, 3, 4, 5].map((i) => (
                    <View key={i} style={styles.specRow}>
                        <SkeletonBox width={100} height={14} borderRadius={4} />
                        <SkeletonBox width={150} height={14} borderRadius={4} />
                    </View>
                ))}
            </View>

            {/* Description Section */}
            <View style={styles.descSection}>
                <SkeletonBox width={120} height={18} borderRadius={4} style={styles.mb12} />
                <SkeletonBox width="100%" height={14} borderRadius={4} />
                <SkeletonBox width="100%" height={14} borderRadius={4} style={styles.mt8} />
                <SkeletonBox width="80%" height={14} borderRadius={4} style={styles.mt8} />
                <SkeletonBox width="90%" height={14} borderRadius={4} style={styles.mt8} />
            </View>

            {/* Bottom Bar Skeleton */}
            <View style={[styles.bottomBar, styles.safeBottom]}>
                <View style={styles.leftActions}>
                    <SkeletonBox width={40} height={40} borderRadius={8} />
                    <SkeletonBox width={40} height={40} borderRadius={8} />
                </View>
                <View style={styles.rightActions}>
                    <SkeletonBox width={120} height={44} borderRadius={8} />
                    <SkeletonBox width={120} height={44} borderRadius={8} />
                </View>
            </View>
        </View>
    );
};


const styles = StyleSheet.create((theme) => ({
    mt4: {
        marginTop: 4,
    },
    mt8: {
        marginTop: 8,
    },
    mb12: {
        marginBottom: 12,
    },
    safeTop: {
        paddingTop: UnistylesRuntime.insets.top,
    },
    safeBottom: {
        paddingBottom: UnistylesRuntime.insets.bottom + 8,
    },
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    section: {
        backgroundColor: theme.colors.surface,
        padding: theme.margins.md,
        gap: theme.margins.sm,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.smd,
    },
    titleSkeleton: {
        marginVertical: theme.margins.sm,
    },
    variantSection: {
        backgroundColor: theme.colors.surface,
        padding: theme.margins.md,
        marginTop: theme.margins.sm,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    shopSection: {
        backgroundColor: theme.colors.surface,
        padding: theme.margins.md,
        marginTop: theme.margins.sm,
    },
    shopHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    shopInfo: {
        flex: 1,
        marginLeft: theme.margins.smd,
    },
    shopStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: theme.margins.md,
        paddingTop: theme.margins.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    statItem: {
        alignItems: 'center',
    },
    specsSection: {
        backgroundColor: theme.colors.surface,
        padding: theme.margins.md,
        marginTop: theme.margins.sm,
    },
    specRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: theme.margins.sm,
    },
    descSection: {
        backgroundColor: theme.colors.surface,
        padding: theme.margins.md,
        marginTop: theme.margins.sm,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        paddingTop: 8,
        paddingHorizontal: theme.margins.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    leftActions: {
        flexDirection: 'row',
        gap: theme.margins.sm,
    },
    rightActions: {
        flex: 1,
        flexDirection: 'row',
        gap: 8,
        marginLeft: theme.margins.smd,
    },
}));

export default ProductDetailSkeleton;
