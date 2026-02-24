/**
 * ==============================================
 * WISHLIST HUB SCREEN - Redesigned
 * ==============================================
 * Route: /wishlist
 *
 * Design:
 * - Header with back + create button
 * - Horizontal collection chips (from user's wishlists)
 * - 2-column product grid showing items of selected wishlist
 * - Default wishlist selected by default
 * - Heart toggle: always red, tap to remove with undo snackbar
 */

import { IconSymbol } from '@/components/ui/Icon';
import { UndoSnackbar } from '@/components/wishlist/UndoSnackbar';
import {
    WishlistCollectionChips,
} from '@/components/wishlist/WishlistCollectionChips';
import {
    WishlistProductGrid,
} from '@/components/wishlist/WishlistProductGrid';
import {
    flattenWishlists,
    useWishlistDetail,
    useWishlists,
} from '@/hooks/api/wishlist';
import { useRemoveWishlistItem } from '@/hooks/api/wishlist/useRemoveWishlistItem';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import type { WishlistItemUI } from '@/types/wishlist';
import { Navigator } from '@/utils/navigation';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Pressable,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, UnistylesRuntime, useUnistyles } from 'react-native-unistyles';

// ============================================
// PENDING REMOVAL STATE
// ============================================

interface PendingRemoval {
    item: WishlistItemUI;
    wishlistId: string;
}

// ============================================
// HEADER COMPONENT
// ============================================

const WishlistHeader: React.FC<{
    onBack: () => void;
    onCreate: () => void;
    totalItems: number;
}> = ({ onBack, onCreate, totalItems }) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('wishlist');
    const styles = headerStyles;

    return (
        <View style={styles.container}>
            <Pressable style={styles.backButton} onPress={onBack} hitSlop={8}>
                <IconSymbol name="back" size={24} color={theme.colors.typography} />
            </Pressable>

            <View style={styles.titleContainer}>
                <Text style={styles.title}>{t('title')}</Text>
                {totalItems > 0 && (
                    <Text style={styles.subtitle}>
                        {totalItems} {t('productCount')}
                    </Text>
                )}
            </View>

            <Pressable style={styles.createButton} onPress={onCreate} hitSlop={8}>
                <View style={styles.createIcon}>
                    <IconSymbol name="add" size={20} color={theme.colors.primary} />
                </View>
            </Pressable>
        </View>
    );
};

const headerStyles = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: UnistylesRuntime.insets.top + 4,
        paddingBottom: 8,
        paddingHorizontal: theme.margins.md,
        backgroundColor: theme.colors.surface,
    },
    backButton: {
        padding: theme.margins.sm,
        marginLeft: -theme.margins.sm,
    },
    titleContainer: {
        flex: 1,
        marginLeft: theme.margins.sm,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.typography,
        letterSpacing: -0.3,
    },
    subtitle: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        marginTop: 1,
    },
    createButton: {
        padding: theme.margins.sm,
        marginRight: -theme.margins.sm,
    },
    createIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.primaryMuted,
        justifyContent: 'center',
        alignItems: 'center',
    },
}));

// ============================================
// MAIN SCREEN
// ============================================

export default function WishlistHubScreen() {
    useNavigationUnlockOnFocus();

    const styles = stylesheet;
    const { bottom } = useSafeAreaInsets();
    const { t } = useTranslation('wishlist');

    // Fetch all wishlists for chips
    const {
        data: wishlistsData,
        isLoading: isLoadingWishlists,
    } = useWishlists();

    const wishlists = useMemo(() => flattenWishlists(wishlistsData), [wishlistsData]);

    // Sort: Default first, then by date
    const sortedWishlists = useMemo(() => {
        return [...wishlists].sort((a, b) => {
            if (a.isDefault) return -1;
            if (b.isDefault) return 1;
            return 0;
        });
    }, [wishlists]);

    // Track active wishlist selection
    const [activeWishlistId, setActiveWishlistId] = useState<string | null>(null);
    const hasAutoSelected = useRef(false);
    const effectiveWishlistId = useMemo(() => {
        if (activeWishlistId) return activeWishlistId;

        // Auto-select on first data arrival
        if (sortedWishlists.length > 0 && !hasAutoSelected.current) {
            const defaultWl = sortedWishlists.find(w => w.isDefault);
            const autoId = defaultWl?.id ?? sortedWishlists[0].id;
            queueMicrotask(() => {
                hasAutoSelected.current = true;
                setActiveWishlistId(autoId);
            });
            return autoId;
        }

        return null;
    }, [activeWishlistId, sortedWishlists]);

    // Fetch items of selected wishlist
    const {
        data: wishlistDetail,
        isLoading: isLoadingItems,
    } = useWishlistDetail(effectiveWishlistId);

    // Remove mutation
    const removeItemMutation = useRemoveWishlistItem();

    // ============================================
    // UNDO SNACKBAR STATE
    // ============================================
    const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval | null>(null);
    const pendingRemovalRef = useRef<PendingRemoval | null>(null);

    // ---- DERIVED STATE ----
    const isLoading = isLoadingWishlists || (!!effectiveWishlistId && isLoadingItems);

    const activeWishlist = useMemo(
        () => sortedWishlists.find(w => w.id === effectiveWishlistId),
        [sortedWishlists, effectiveWishlistId]
    );

    const totalItems = useMemo(
        () => wishlists.reduce((sum, w) => sum + w.itemCount, 0),
        [wishlists]
    );

    // Items with pending removal filtered out visually
    const displayItems = useMemo(() => {
        const items = wishlistDetail?.items ?? [];
        if (!pendingRemoval) return items;
        // Lọc bỏ hẳn item đang chờ xoá khỏi danh sách hiển thị
        return items.filter(item => item.id !== pendingRemoval.item.id);
    }, [wishlistDetail?.items, pendingRemoval]);

    // ---- HANDLERS ----

    const handleBack = useCallback(() => {
        Navigator.back();
    }, []);

    const handleCreate = useCallback(() => {
        // TODO: Open create wishlist modal/screen
    }, []);

    const handleSelectWishlist = useCallback((wishlistId: string) => {
        setActiveWishlistId(wishlistId);
    }, []);

    // ============================================
    // HEART PRESS → UNDO FLOW
    // ============================================

    /**
     * User taps heart on a product in the grid.
     * Since we're in wishlist, all items are already favorited.
     * Tapping heart = request to remove from wishlist.
     */
    const handleFavoritePress = useCallback((variantId: string) => {
        if (!wishlistDetail) return;

        // Find the item by variantId
        const item = wishlistDetail.items.find(i => i.variantId === variantId);
        if (!item) return;

        // If another item is already pending, commit that removal first
        if (pendingRemovalRef.current) {
            const prev = pendingRemovalRef.current;
            removeItemMutation.mutate({
                wishlistId: prev.wishlistId,
                itemId: prev.item.id,
                variantId: prev.item.variantId,
            });
        }

        const newPending: PendingRemoval = {
            item,
            wishlistId: item.wishlistId,
        };
        pendingRemovalRef.current = newPending;
        setPendingRemoval(newPending);
    }, [wishlistDetail, removeItemMutation]);

    /**
     * Snackbar auto-dismisses → Actually delete
     */
    const handleSnackbarDismiss = useCallback(() => {
        const current = pendingRemovalRef.current;
        if (current) {
            removeItemMutation.mutate({
                wishlistId: current.wishlistId,
                itemId: current.item.id,
                variantId: current.item.variantId,
            });
        }
        pendingRemovalRef.current = null;
        setPendingRemoval(null);
    }, [removeItemMutation]);

    /**
     * User taps "Undo" → Cancel the removal
     */
    const handleUndo = useCallback(() => {
        pendingRemovalRef.current = null;
        setPendingRemoval(null);
    }, []);

    // ---- RENDER ----

    // List header = Chips + Info bar
    const ListHeader = useMemo(() => (
        <View>
            <WishlistCollectionChips
                wishlists={sortedWishlists}
                activeId={effectiveWishlistId}
                onSelect={handleSelectWishlist}
                onCreate={handleCreate}
                isLoading={isLoadingWishlists}
            />

            {/* Active wishlist info bar */}
            {activeWishlist && !isLoading && (
                <View style={styles.infoBar}>
                    <View style={styles.infoLeft}>
                        <Text style={styles.infoName} numberOfLines={1}>
                            {activeWishlist.name}
                        </Text>
                        <Text style={styles.infoCount}>
                            {activeWishlist.itemCount} {t('productCount')}
                        </Text>
                    </View>
                    {activeWishlist.isPublic && (
                        <View style={styles.publicBadge}>
                            <IconSymbol name="public" size={12} color="#fff" />
                            <Text style={styles.publicText}>{t('isPublic')}</Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    ), [
        sortedWishlists,
        effectiveWishlistId,
        handleSelectWishlist,
        handleCreate,
        isLoadingWishlists,
        isLoading,
        activeWishlist,
        styles.infoBar,
        styles.infoLeft,
        styles.infoName,
        styles.infoCount,
        styles.publicBadge,
        styles.publicText,
        t,
    ]);

    return (
        <View style={[styles.container, { paddingBottom: bottom }]}>
            {/* Header */}
            <WishlistHeader
                onBack={handleBack}
                onCreate={handleCreate}
                totalItems={totalItems}
            />

            {/* Product Grid (includes chips as header) */}
            <WishlistProductGrid
                items={displayItems}
                isLoading={isLoading}
                onFavoritePress={handleFavoritePress}
                ListHeaderComponent={ListHeader}
                wishlistName={activeWishlist?.name}
            />

            {/* Undo Snackbar */}
            <UndoSnackbar
                visible={pendingRemoval !== null}
                productName={pendingRemoval?.item.productName ?? ''}
                onUndo={handleUndo}
                onDismiss={handleSnackbarDismiss}
            />
        </View>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    infoBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.sm,
    },
    infoLeft: {
        flex: 1,
    },
    infoName: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    infoCount: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        marginTop: 1,
    },
    publicBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.info,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        gap: 3,
    },
    publicText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#fff',
    },
}));
