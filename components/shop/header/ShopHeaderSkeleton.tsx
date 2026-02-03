/**
 * ==============================================
 * SHOP HEADER SKELETON - Simplified Loading State
 * ==============================================
 * 
 * Lightweight skeleton - only essential elements
 * Optimized for CPU performance
 */

import { SkeletonBox, SkeletonCircle, SkeletonText } from '@/components/ui/feedback/Skeleton';
import React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

const BANNER_HEIGHT = 200;

/**
 * ShopHeaderSkeleton - Minimal skeleton for shop header
 */
export const ShopHeaderSkeleton: React.FC = () => {
    return (
        <View style={styles.container}>
            {/* Banner */}
            <SkeletonBox width="100%" height={BANNER_HEIGHT} borderRadius={0} />

            {/* Info Card */}
            <View style={styles.infoCard}>
                {/* Avatar + Name Row */}
                <View style={styles.row}>
                    <SkeletonCircle size={64} />
                    <View style={styles.textColumn}>
                        <SkeletonText width="60%" height={18} />
                        <SkeletonText width="40%" height={12} style={styles.mt6} />
                    </View>
                </View>

                {/* Stats Row - 3 columns */}
                <View style={styles.statsRow}>
                    <SkeletonText width="25%" height={14} />
                    <SkeletonText width="25%" height={14} />
                    <SkeletonText width="25%" height={14} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.background,
    },
    infoCard: {
        backgroundColor: theme.colors.surface,
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 24,
        marginTop: -15,
        marginBottom: 5,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textColumn: {
        flex: 1,
        marginLeft: 12,
    },
    mt6: {
        marginTop: 6,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
}));

export default ShopHeaderSkeleton;
