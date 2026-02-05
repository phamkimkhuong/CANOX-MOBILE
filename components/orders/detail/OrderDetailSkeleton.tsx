/**
 * ==============================================
 * ORDER DETAIL SKELETON - Loading State
 * ==============================================
 * Full-page skeleton mimicking the Order Detail layout:
 * - Header (status bar)
 * - Timeline/Tracker
 * - Shipping Info
 * - Address
 * - Items List
 * - Price Summary
 */

import { SkeletonBox, SkeletonCircle, SkeletonText } from '@/components/ui/feedback/Skeleton';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { StyleSheet, UnistylesRuntime } from 'react-native-unistyles';



/**
 * Tracker Skeleton - 4-step progress bar
 */
const TrackerSkeleton: React.FC = () => {
    const styles = stylesheet;

    return (
        <View style={styles.trackerContainer}>
            <View style={styles.trackerSteps}>
                {[1, 2, 3, 4].map((i) => (
                    <View key={i} style={styles.trackerStep}>
                        <SkeletonCircle size={28} />
                        <SkeletonText width={50} height={10} style={styles.mt6} />
                    </View>
                ))}
            </View>

            {/* Progress line */}
            <SkeletonBox width="75%" height={2} style={styles.trackerLine} />
        </View>
    );
};

/**
 * Shipping Info Skeleton
 */
const ShippingSkeleton: React.FC = () => {
    const styles = stylesheet;

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <SkeletonCircle size={32} />
                <SkeletonText width={120} height={14} style={styles.ml12} />
            </View>
            <View style={styles.shippingRows}>

                <View style={styles.row}>
                    <SkeletonText width={80} height={12} />
                    <SkeletonText width={100} height={12} />
                </View>
                <View style={styles.row}>
                    <SkeletonText width={100} height={12} />
                    <SkeletonText width={120} height={12} />
                </View>
            </View>
        </View>
    );
};

/**
 * Address Skeleton
 */
const AddressSkeleton: React.FC = () => {
    const styles = stylesheet;

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <SkeletonCircle size={32} />
                <SkeletonText width={100} height={14} style={styles.ml12} />
            </View>
            <View style={styles.addressContent}>
                <SkeletonText width="60%" height={14} />
                <SkeletonText width="40%" height={12} style={styles.mt6} />
                <SkeletonText width="90%" height={12} style={styles.mt6} />
            </View>
        </View>
    );
};


/**
 * Shop Header Skeleton
 */
const ShopHeaderSkeleton: React.FC = () => {
    const styles = stylesheet;

    return (
        <View style={styles.shopHeader}>
            <SkeletonCircle size={24} />
            <SkeletonText width={120} height={14} style={styles.ml8} />
        </View>
    );
};


/**
 * Product Item Skeleton
 */
const ProductItemSkeleton: React.FC = () => {
    const styles = stylesheet;

    return (
        <View style={styles.productItem}>
            <SkeletonBox width={72} height={72} borderRadius={8} />
            <View style={styles.productInfo}>
                <SkeletonText width="80%" height={13} />
                <SkeletonText width="40%" height={11} style={styles.mt4} />
                <View style={styles.priceRow}>

                    <SkeletonText width={70} height={13} />
                    <SkeletonText width={30} height={11} />
                </View>
            </View>
            <SkeletonText width={60} height={13} />
        </View>
    );
};

/**
 * Price Summary Skeleton
 */
const PriceSummarySkeleton: React.FC = () => {
    const styles = stylesheet;

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <SkeletonCircle size={32} />
                <SkeletonText width={140} height={14} style={styles.ml12} />
            </View>
            <View style={styles.priceRows}>

                {[1, 2, 3].map((i) => (
                    <View key={i} style={styles.row}>
                        <SkeletonText width={80} height={12} />
                        <SkeletonText width={70} height={12} />
                    </View>
                ))}
                {/* Total row */}
                <View style={[styles.row, styles.mt8]}>
                    <SkeletonText width={100} height={15} />
                    <SkeletonText width={90} height={18} />
                </View>
            </View>

        </View>
    );
};


/**
 * OrderDetailSkeleton - Full page loading skeleton
 * 
 * @param minimumDuration - Minimum time (ms) to display skeleton, even if data is ready.
 *                          Prevents jarring "flash" effect for fast API responses.
 *                          Defaults to 0 (no minimum), set to 350ms for instant taps.
 * @param onMinimumReached - Callback fired when minimum duration has passed
 */
interface OrderDetailSkeletonProps {
    minimumDuration?: number;
    onMinimumReached?: () => void;
}

export const OrderDetailSkeleton: React.FC<OrderDetailSkeletonProps> = ({
    minimumDuration = 0,
    onMinimumReached,
}) => {
    const styles = stylesheet;

    // Effect to handle minimum duration timer
    React.useEffect(() => {
        if (minimumDuration > 0 && onMinimumReached) {
            const timer = setTimeout(() => {
                onMinimumReached();
            }, minimumDuration);
            return () => clearTimeout(timer);
        }
    }, [minimumDuration, onMinimumReached]);

    return (
        <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            <TrackerSkeleton />

            <View style={styles.section}>
                <ShippingSkeleton />
            </View>

            <View style={styles.section}>
                <AddressSkeleton />
            </View>

            <View style={styles.section}>
                <ShopHeaderSkeleton />
                <ProductItemSkeleton />
                <ProductItemSkeleton />
            </View>

            <View style={styles.section}>
                <PriceSummarySkeleton />
            </View>
        </ScrollView>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    mt4: {
        marginTop: 4,
    },
    mt6: {
        marginTop: 6,
    },
    mt8: {
        marginTop: 8,
    },
    ml8: {
        marginLeft: 8,
    },
    ml12: {
        marginLeft: 12,
    },
    safeTop: {
        paddingTop: UnistylesRuntime.insets.top + 8,
    },
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: theme.margins.xl,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.smd,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerCenter: {
        alignItems: 'center',
    },
    trackerContainer: {
        backgroundColor: theme.colors.surface,
        paddingVertical: theme.margins.lg,
        paddingHorizontal: theme.margins.md,
    },
    trackerSteps: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    trackerStep: {
        alignItems: 'center',
    },
    trackerLine: {
        position: 'absolute',
        top: 14,
        left: '12%',
        zIndex: -1,
    },
    section: {
        marginTop: theme.margins.sm,
    },
    card: {
        backgroundColor: theme.colors.surface,
        paddingVertical: theme.margins.md,
        paddingHorizontal: theme.margins.md,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.margins.smd,
    },
    shippingRows: {
        gap: theme.margins.sm,
        paddingLeft: 44,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    addressContent: {
        paddingLeft: 44,
    },
    shopHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        paddingVertical: theme.margins.smd,
        paddingHorizontal: theme.margins.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    productItem: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        paddingVertical: theme.margins.sm,
        paddingHorizontal: theme.margins.md,
    },
    productInfo: {
        flex: 1,
        marginLeft: theme.margins.smd,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: theme.margins.sm,
    },
    priceRows: {
        paddingLeft: 44,
        gap: 6,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: theme.margins.smd,
        paddingHorizontal: theme.margins.md,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
}));
