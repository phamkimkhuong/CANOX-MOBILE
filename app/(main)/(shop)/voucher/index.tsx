/**
 * Voucher Screen - Kho Voucher
 * 
 * Features:
 * - Sticky header với search & filter
 * - Featured voucher (AI Pick)
 * - Filterable voucher list
 * - Sort options
 */

import { IconSymbol } from '@/components/ui/Icon';
import {
    FeaturedVoucher,
    FilterBar,
    VoucherCard,
} from '@/components/voucher';
import { VOUCHER_STRINGS } from '@/constants/i18n/vi/voucher';
import { useVoucherList } from '@/hooks/api/useVoucherList';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import { createLogger } from '@/utils/logger';
import { Navigator } from '@/utils/navigation';
import { MaterialIcons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    Text,
    TextInput,
    View,
} from 'react-native';
import Animated, {
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { VoucherUI } from '@/types/voucher';

const log = createLogger('VoucherScreen');

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList) as typeof FlashList;

export default function VoucherScreen() {
    // Unlock navigation when screen gains focus
    useNavigationUnlockOnFocus();

    const insets = useSafeAreaInsets();

    const { theme } = useUnistyles();

    // Hook for voucher data
    const {
        vouchers,
        featuredVoucher,
        isLoading,
        activeTab,
        tabs,
        setActiveTab,
        sortBy,
        searchQuery,
        setSearchQuery,
        collectVoucher,
        handleUseVoucher,
        setReminder,
        refetch,
    } = useVoucherList();

    // Search input state
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // Scroll animation for header
    const scrollY = useSharedValue(0);
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    // Header animated style (compact on scroll)
    const headerAnimatedStyle = useAnimatedStyle(() => {
        const isScrolled = scrollY.value > 50;
        return {
            shadowOpacity: withTiming(isScrolled ? 0.1 : 0, { duration: 200 }),
            elevation: withTiming(isScrolled ? 4 : 0, { duration: 200 }),
        };
    });

    // Handlers
    const handleBack = useCallback(() => {
        Navigator.back();
    }, []);

    const handleMyVouchers = useCallback(() => {
        // TODO: Navigate to my vouchers
        log.info('Navigate to my vouchers');
    }, []);

    const handleCollect = useCallback(async (id: string) => {
        await collectVoucher(id);
    }, [collectVoucher]);

    const handleUse = useCallback((id: string) => {
        handleUseVoucher(id);
    }, [handleUseVoucher]);

    const handleReminder = useCallback(async (id: string) => {
        await setReminder(id);
    }, [setReminder]);

    const handleViewConditions = useCallback((id: string) => {
        // TODO: Show conditions modal
        log.info('View conditions for:', id);
    }, []);

    // List header component
    const ListHeader = useMemo(() => (
        <View style={styles.listHeader}>
            {/* Featured Voucher */}
            {featuredVoucher && (
                <FeaturedVoucher
                    voucher={featuredVoucher}
                    onCollect={handleCollect}
                />
            )}

            {/* List Title */}
            <View style={styles.listTitleRow}>
                <Text style={styles.listTitle}>
                    {VOUCHER_STRINGS.list.title}
                </Text>
                <Pressable style={styles.sortButton}>
                    <Text style={styles.sortText}>
                        {VOUCHER_STRINGS.sort.label}: {VOUCHER_STRINGS.sort[sortBy]}
                    </Text>
                    <MaterialIcons
                        name="expand-more"
                        size={16}
                        color={theme.colors.typographySecondary}
                    />
                </Pressable>
            </View>
        </View>
    ), [featuredVoucher, handleCollect, sortBy, theme.colors.typographySecondary]);

    // Render voucher item
    const renderItem = useCallback(({ item }: { item: VoucherUI }) => (
        <View style={styles.cardWrapper}>
            <VoucherCard
                voucher={item}
                onCollect={handleCollect}
                onUse={handleUse}
                onReminder={handleReminder}
                onViewConditions={handleViewConditions}
                backgroundColor={theme.colors.background}
            />
        </View>
    ), [handleCollect, handleUse, handleReminder, handleViewConditions, theme.colors.background]);

    const keyExtractor = useCallback((item: VoucherUI) => item.id, []);

    // Empty state
    const EmptyComponent = useMemo(() => (
        <View style={styles.emptyContainer}>
            <IconSymbol
                name="confirmation-number"
                size={64}
                color={theme.colors.secondary}
            />
            <Text style={styles.emptyTitle}>{VOUCHER_STRINGS.list.empty}</Text>
            <Text style={styles.emptyDescription}>
                {VOUCHER_STRINGS.list.emptyDescription}
            </Text>
        </View>
    ), [theme.colors.secondary]);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Sticky Header */}
            <Animated.View style={[styles.header, headerAnimatedStyle]}>
                {/* Top Row: Back, Title, My Vouchers */}
                <View style={styles.headerTop}>
                    <Pressable
                        style={styles.backButton}
                        onPress={handleBack}
                        hitSlop={8}
                    >
                        <MaterialIcons
                            name="arrow-back"
                            size={24}
                            color={theme.colors.typography}
                        />
                    </Pressable>

                    <Text style={styles.headerTitle}>
                        {VOUCHER_STRINGS.header.title}
                    </Text>

                    <Pressable
                        style={styles.myVouchersButton}
                        onPress={handleMyVouchers}
                    >
                        <Text style={styles.myVouchersText}>
                            {VOUCHER_STRINGS.header.myVouchers}
                        </Text>
                        <MaterialIcons
                            name="chevron-right"
                            size={18}
                            color={theme.colors.info}
                        />
                    </Pressable>
                </View>

                {/* Search Row */}
                <View style={styles.searchRow}>
                    <View style={[
                        styles.searchInput,
                        isSearchFocused && styles.searchInputFocused,
                    ]}>
                        <MaterialIcons
                            name="search"
                            size={20}
                            color={theme.colors.secondary}
                        />
                        <TextInput
                            style={styles.searchTextInput}
                            placeholder={VOUCHER_STRINGS.header.searchPlaceholder}
                            placeholderTextColor={theme.colors.secondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                        />
                    </View>
                    <Pressable style={styles.filterButton}>
                        <MaterialIcons
                            name="tune"
                            size={20}
                            color={theme.colors.typographySecondary}
                        />
                    </Pressable>
                </View>

                {/* Filter Tabs */}
                <FilterBar
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    tabs={tabs}
                />
            </Animated.View>

            {/* Voucher List */}
            <AnimatedFlashList<VoucherUI>
                data={vouchers}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                ListHeaderComponent={ListHeader}
                ListEmptyComponent={isLoading ? null : EmptyComponent}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={refetch}
                        tintColor={theme.colors.buttonActive}
                    />
                }
            />

            {/* Loading Overlay */}
            {isLoading && vouchers.length === 0 && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={theme.colors.buttonActive} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },

    // Header
    header: {
        backgroundColor: theme.colors.background,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.sm,
        gap: theme.margins.sm,
    },
    backButton: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    myVouchersButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    myVouchersText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.info,
    },

    // Search
    searchRow: {
        flexDirection: 'row',
        paddingHorizontal: theme.margins.md,
        gap: theme.margins.sm,
    },
    searchInput: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.l,
        paddingHorizontal: theme.margins.smd,
        paddingVertical: theme.margins.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: theme.margins.sm,
    },
    searchInputFocused: {
        borderColor: theme.colors.primary,
        borderWidth: 2,
    },
    searchTextInput: {
        flex: 1,
        fontSize: 14,
        color: theme.colors.typography,
        padding: 0,
    },
    filterButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.l,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },

    // List
    listContent: {
        paddingBottom: 100,
    },
    listHeader: {
        paddingTop: theme.margins.md,
    },
    listTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        marginBottom: theme.margins.sm,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    sortText: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
    },
    cardWrapper: {
        paddingHorizontal: theme.margins.md,
    },
    separator: {
        height: 12,
    },

    // Empty State
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.margins.xxl,
        paddingHorizontal: theme.margins.lg,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.typography,
        marginTop: theme.margins.md,
    },
    emptyDescription: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
        marginTop: theme.margins.sm,
    },

    // Loading
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        alignItems: 'center',
        justifyContent: 'center',
    },
}));

