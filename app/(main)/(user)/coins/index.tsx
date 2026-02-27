/**
 * ==============================================
 * LOYALTY OVERVIEW SCREEN - Tổng quan Xu Tích Lũy
 * ==============================================
 * Route: /(main)/(user)/coins
 *
 * Show dashboard coins loyalty from all shops.
 */

import { DataGuard } from '@/components/common/DataGuard';
import {
    HowItWorks,
    LoyaltyEmptyState,
    LoyaltyHeader,
    LoyaltyHeroCard,
    ShopPointItem,
} from '@/components/loyalty';
import { ROUTES, loyaltyRoutes } from '@/constants/routes';
import { useLoyaltyOverview } from '@/hooks/api/loyalty/useLoyalty';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import type { LoyaltyOverviewUI } from '@/types/loyalty/ui';
import { Navigator } from '@/utils/navigation';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    RefreshControl,
    ScrollView,
    Text,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export default function LoyaltyOverviewScreen() {
    useNavigationUnlockOnFocus();

    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { bottom } = useSafeAreaInsets();
    const { t } = useTranslation('loyalty');

    const query = useLoyaltyOverview();

    const handleBack = useCallback(() => {
        Navigator.back();
    }, []);

    const handleShopPress = useCallback((shopId: string, shopName?: string, shopLogo?: string) => {
        Navigator.push(loyaltyRoutes.shopDetail(shopId, shopName, shopLogo));
    }, []);

    const handleShopNow = useCallback(() => {
        Navigator.push(ROUTES.TABS.HOME);
    }, []);

    return (
        <View style={styles.container}>
            <LoyaltyHeader onBack={handleBack} />

            <DataGuard
                query={query}
                isDataEmpty={() => false}
                onSecondaryAction={handleBack}
            >
                {(overview: LoyaltyOverviewUI, meta) => (
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom + 40 }]}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={meta.isRefetching}
                                onRefresh={() => meta.refetch()}
                                colors={[theme.colors.primary]}
                                tintColor={theme.colors.primary}
                            />
                        }
                    >
                        {/* Hero Card — Always show */}
                        <LoyaltyHeroCard overview={overview} />

                        {/* Shop List or Empty */}
                        {overview.shops.length > 0 ? (
                            <Animated.View entering={FadeInDown.duration(350).delay(250)}>
                                <View style={styles.shopSection}>
                                    <Text style={styles.sectionTitle}>
                                        {t('shopSection.title')}
                                    </Text>
                                    {overview.shops.map((shop, index) => (
                                        <ShopPointItem
                                            key={shop.shopId}
                                            shop={shop}
                                            index={index}
                                            onPress={handleShopPress}
                                        />
                                    ))}
                                </View>
                            </Animated.View>
                        ) : (
                            <LoyaltyEmptyState onShopNow={handleShopNow} />
                        )}

                        {/* How it works */}
                        <HowItWorks />
                    </ScrollView>
                )}
            </DataGuard>
        </View>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        // paddingBottom is dynamic based on safe area
    },
    shopSection: {
        marginTop: theme.margins.lg,
        marginHorizontal: theme.margins.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.typography,
        marginBottom: theme.margins.smd,
    },
}));
