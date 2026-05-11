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
 * - Heart toggle: always red, tap to confirm removal
 */

import { IconSymbol } from '@/components/ui/Icon';
import { CreateWishlistModal, RenameWishlistModal } from '@/components/wishlist';
import {
    EditWishlistItemSheet,
    type EditWishlistItemSheetRef,
} from '@/components/wishlist/EditWishlistItemSheet';
import {
    WishlistActionSheet,
    type WishlistActionSheetRef,
} from '@/components/wishlist/WishlistActionSheet';
import {
    WishlistCollectionChips,
} from '@/components/wishlist/WishlistCollectionChips';
import {
    WishlistEmptyState,
    WishlistEmptyStateSkeleton,
} from '@/components/wishlist/WishlistEmptyState';
import {
    WishlistProductGrid,
} from '@/components/wishlist/WishlistProductGrid';
import {
    flattenWishlists,
    useCreateWishlist,
    useDeleteWishlist,
    useMoveWishlistItem,
    useShareWishlist,
    useUpdateWishlist,
    useUpdateWishlistItem,
    useWishlistDetail,
    useWishlists,
} from '@/hooks/api/wishlist';
import { useRemoveWishlistItem } from '@/hooks/api/wishlist/useRemoveWishlistItem';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import type { WishlistItemUI } from '@/types/wishlist';
import { Alert as CustomAlert } from '@/utils/AlertHelper';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Pressable,
    Share,
    Text,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface PrivateWishlistTabProps {
    isWishlistEmpty?: boolean;
    isWishlistListLoading?: boolean;
}

// ============================================
// MAIN SCREEN
// ============================================

export const PrivateWishlistTab: React.FC<PrivateWishlistTabProps> = ({
    isWishlistEmpty,
    isWishlistListLoading,
}) => {
    useNavigationUnlockOnFocus();

    const styles = stylesheet;
    const { theme } = useUnistyles();
    const { t } = useTranslation('wishlist');

    // Fetch all wishlists for chips
    const {
        data: wishlistsData,
        isLoading: isLoadingWishlists,
        isRefetching: isRefetchingWishlists,
        refetch: refetchWishlists,
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
    const effectiveWishlistId = activeWishlistId;

    // Auto-select first/default wishlist on initial data load
    useEffect(() => {
        if (!activeWishlistId && sortedWishlists.length > 0 && !hasAutoSelected.current) {
            const defaultWl = sortedWishlists.find(w => w.isDefault);
            const autoId = defaultWl?.id ?? sortedWishlists[0].id;
            hasAutoSelected.current = true;
            setActiveWishlistId(autoId);
        }
    }, [activeWishlistId, sortedWishlists]);


    // Fetch items of selected wishlist
    const {
        data: wishlistDetail,
        isLoading: isLoadingItems,
        isRefetching: isRefetchingItems,
        refetch: refetchItems,
    } = useWishlistDetail(effectiveWishlistId);

    // Mutations
    const removeItemMutation = useRemoveWishlistItem();
    const createWishlistMutation = useCreateWishlist();
    const deleteWishlistMutation = useDeleteWishlist();
    const updateWishlistMutation = useUpdateWishlist();
    const shareWishlistMutation = useShareWishlist();
    const updateItemMutation = useUpdateWishlistItem();
    const moveItemMutation = useMoveWishlistItem();

    // ActionSheet ref
    const actionSheetRef = useRef<WishlistActionSheetRef>(null);
    // Edit item sheet ref
    const editItemSheetRef = useRef<EditWishlistItemSheetRef>(null);

    // ============================================
    // MODAL STATES
    // ============================================
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);

    // ---- DERIVED STATE ----
    const isPendingSelection = !isLoadingWishlists && sortedWishlists.length > 0 && !effectiveWishlistId;
    const isLoading = isLoadingWishlists || isPendingSelection || (!!effectiveWishlistId && isLoadingItems);

    const activeWishlist = useMemo(
        () => sortedWishlists.find(w => w.id === effectiveWishlistId),
        [sortedWishlists, effectiveWishlistId]
    );

    const displayItems = useMemo(() => wishlistDetail?.items ?? [], [wishlistDetail?.items]);

    const adjustedActiveItemCount = activeWishlist?.itemCount ?? 0;

    const hasNoFavoriteItems = !isLoadingWishlists
        && !isPendingSelection
        && displayItems.length === 0
        && (sortedWishlists.length === 0 || sortedWishlists.every(wishlist => wishlist.itemCount === 0));

    const shouldShowEmptySkeleton = isWishlistListLoading ?? (isLoadingWishlists && !wishlistsData);
    const shouldShowEmptyState = isWishlistEmpty ?? (hasNoFavoriteItems && !isLoading);

    // ---- HANDLERS ----

    // Removed handleBack since its handled by the main screen

    const handleCreate = useCallback(() => {
        if (wishlists.length >= 5) {
            Toast.show({
                type: 'info',
                text1: t('error.errorTitle'),
                text2: t('error.limitReached'),
            });
            return;
        }
        setShowCreateModal(true);
    }, [wishlists.length, t]);

    const handleCloseCreateModal = useCallback(() => {
        setShowCreateModal(false);
    }, []);

    const handleCreateSubmit = useCallback(({ name, isPublic }: { name: string; isPublic: boolean }) => {
        createWishlistMutation.mutate(
            { name, isPublic },
            {
                onSuccess: (response) => {
                    setShowCreateModal(false);
                    // Auto-select the newly created wishlist
                    const newId = response?.data?.id;
                    if (newId) {
                        setActiveWishlistId(newId);
                    }
                    Toast.show({
                        type: 'success',
                        text1: t('create.success', { name }),
                    });
                },
            }
        );
    }, [createWishlistMutation, t]);

    const handleSelectWishlist = useCallback((wishlistId: string) => {
        setActiveWishlistId(wishlistId);
    }, []);

    const handleRefresh = useCallback(() => {
        refetchWishlists();
        if (effectiveWishlistId) {
            refetchItems();
        }
    }, [refetchWishlists, refetchItems, effectiveWishlistId]);

    // ============================================
    // HEART PRESS → CONFIRM REMOVE FLOW
    // ============================================

    /**
     * User taps heart on a product in the grid.
     * Since we're in wishlist, all items are already favorited.
     * Tapping heart = ask buyer to confirm before removing.
     */
    const handleFavoritePress = useCallback((variantId: string) => {
        if (!wishlistDetail) return;

        // Find the item by variantId
        const item = wishlistDetail.items.find(i => i.variantId === variantId);
        if (!item) return;

        CustomAlert.show({
            title: t('removeItem.confirmTitle'),
            message: t('removeItem.confirmMessage', { name: item.productName }),
            type: 'warning',
            confirmText: t('removeItem.confirmAction'),
            cancelText: t('manage.cancel'),
            showCancel: true,
            onConfirm: () => {
                removeItemMutation.mutate({
                    wishlistId: item.wishlistId,
                    itemId: item.id,
                    variantId: item.variantId,
                });
            },
        });
    }, [wishlistDetail, removeItemMutation, t]);

    // ---- ACTION SHEET HANDLERS ----

    const handleOpenActionSheet = useCallback(() => {
        if (!activeWishlist) return;
        actionSheetRef.current?.present({
            id: activeWishlist.id,
            name: activeWishlist.name,
            itemCount: adjustedActiveItemCount,
            isDefault: activeWishlist.isDefault,
            isPublic: activeWishlist.isPublic,
        });
    }, [activeWishlist, adjustedActiveItemCount]);

    const handleRename = useCallback(() => {
        setShowRenameModal(true);
    }, []);

    const handleRenameSubmit = useCallback((newName: string) => {
        if (!activeWishlist) return;
        updateWishlistMutation.mutate({
            wishlistId: activeWishlist.id,
            data: { name: newName }
        }, {
            onSuccess: () => {
                setShowRenameModal(false);
                Toast.show({
                    type: 'success',
                    text1: t('manage.renameSuccess', { name: newName }),
                });
            }
        });
    }, [activeWishlist, updateWishlistMutation, t]);

    const handleTogglePublic = useCallback(() => {
        if (!activeWishlist) return;
        const newPublicStatus = !activeWishlist.isPublic;
        updateWishlistMutation.mutate({
            wishlistId: activeWishlist.id,
            data: { isPublic: newPublicStatus }
        }, {
            onSuccess: () => {
                Toast.show({
                    type: 'success',
                    text1: newPublicStatus ? t('manage.makePublicSuccess') : t('manage.makePrivateSuccess'),
                });
            }
        });
    }, [activeWishlist, updateWishlistMutation, t]);

    const handleShare = useCallback(() => {
        if (!activeWishlist) return;
        shareWishlistMutation.mutate(activeWishlist.id, {
            onSuccess: (response) => {
                const token = response.data?.shareToken || response.data;
                const url = `https://canox.com/wishlist/shared/${token}`;
                Share.share({
                    message: t('share.message', { name: activeWishlist.name, url }),
                    url: url,
                });
            }
        });
    }, [activeWishlist, shareWishlistMutation, t]);

    const handleDeleteWishlist = useCallback((wl: { id: string; name: string; itemCount: number }) => {
        CustomAlert.show({
            title: t('manage.deleteConfirmTitle'),
            message: t('manage.deleteConfirmMessage', { count: wl.itemCount, name: wl.name }),
            type: 'warning',
            confirmText: t('manage.delete'),
            cancelText: t('manage.cancel'),
            showCancel: true,
            onConfirm: () => {
                deleteWishlistMutation.mutate(wl.id, {
                    onSuccess: () => {
                        // Switch to default wishlist
                        const defaultWl = sortedWishlists.find(w => w.isDefault && w.id !== wl.id);
                        setActiveWishlistId(defaultWl?.id ?? sortedWishlists[0]?.id ?? null);
                        Toast.show({
                            type: 'success',
                            text1: t('manage.deleteSuccess', { name: wl.name }),
                        });
                    },
                });
            },
        });
    }, [deleteWishlistMutation, sortedWishlists, t]);

    // ---- EDIT ITEM HANDLERS ----

    const handleItemLongPress = useCallback((item: WishlistItemUI) => {
        editItemSheetRef.current?.present({
            itemId: item.id,
            variantId: item.variantId,
            wishlistId: item.wishlistId,
            productName: item.productName,
            currentPrice: item.price,
            desiredPrice: item.desiredPrice,
            notes: item.notes,
            priority: item.priority,
            imageUrl: item.imageUrl,
        });
    }, []);

    const handleEditItemSubmit = useCallback((
        itemId: string,
        fromWishlistId: string,
        result: {
            desiredPrice: number | null;
            notes: string | null;
            priority: number;
            targetWishlistId: string;
            variantId: string;
        }
    ) => {
        const { targetWishlistId, variantId, ...data } = result;

        // CHECK IF MOVING OR JUST UPDATING
        if (targetWishlistId && targetWishlistId !== fromWishlistId) {
            moveItemMutation.mutate(
                {
                    itemId,
                    sourceWishlistId: fromWishlistId,
                    targetWishlistId,
                    variantId,
                    data: {
                        desiredPrice: data.desiredPrice ?? undefined,
                        notes: data.notes ?? undefined,
                        priority: data.priority as 0 | 1 | 2,
                    }
                },
                {
                    onSuccess: () => {
                        editItemSheetRef.current?.dismiss();
                        Toast.show({
                            type: 'success',
                            text1: t('editItem.success'),
                        });
                    },
                    onError: () => {
                        Toast.show({
                            type: 'error',
                            text1: t('error.errorTitle'),
                        });
                    },
                }
            );
        } else {
            // JUST UPDATE
            updateItemMutation.mutate(
                {
                    wishlistId: fromWishlistId,
                    itemId,
                    data: {
                        desiredPrice: data.desiredPrice ?? undefined,
                        notes: data.notes ?? undefined,
                        priority: data.priority as 0 | 1 | 2,
                    },
                },
                {
                    onSuccess: () => {
                        editItemSheetRef.current?.dismiss();
                        Toast.show({
                            type: 'success',
                            text1: t('editItem.success'),
                        });
                    },
                    onError: () => {
                        Toast.show({
                            type: 'error',
                            text1: t('error.errorTitle'),
                        });
                    },
                }
            );
        }
    }, [updateItemMutation, moveItemMutation, t]);

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
                            {adjustedActiveItemCount} {t('productCount')}
                        </Text>
                    </View>
                    {activeWishlist.isPublic && (
                        <View style={styles.publicBadge}>
                            <IconSymbol name="public" size={12} color="#fff" />
                            <Text style={styles.publicText}>{t('isPublic')}</Text>
                        </View>
                    )}
                    {/* More actions button */}
                    <Pressable
                        style={styles.moreButton}
                        onPress={handleOpenActionSheet}
                        hitSlop={8}
                    >
                        <IconSymbol name="more" size={20} color={theme.colors.typographySecondary} />
                    </Pressable>
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
        adjustedActiveItemCount,
        handleOpenActionSheet,
        styles.infoBar,
        styles.infoLeft,
        styles.infoName,
        styles.infoCount,
        styles.publicBadge,
        styles.publicText,
        styles.moreButton,
        theme.colors.typographySecondary,
        t,
    ]);

    return (
        <View style={styles.container}>
            {shouldShowEmptySkeleton ? (
                <WishlistEmptyStateSkeleton />
            ) : shouldShowEmptyState ? (
                <WishlistEmptyState
                    isRefetching={isRefetchingWishlists || isRefetchingItems}
                    onRefresh={handleRefresh}
                />
            ) : (
                <WishlistProductGrid
                    items={displayItems}
                    isLoading={isLoading}
                    onFavoritePress={handleFavoritePress}
                    onItemLongPress={handleItemLongPress}
                    ListHeaderComponent={ListHeader}
                    wishlistName={activeWishlist?.name}
                    isRefetching={isRefetchingWishlists || isRefetchingItems}
                    onRefresh={handleRefresh}
                />
            )}

            {/* Create Wishlist Modal */}
            <CreateWishlistModal
                visible={showCreateModal}
                onClose={handleCloseCreateModal}
                onSubmit={handleCreateSubmit}
                isLoading={createWishlistMutation.isPending}
            />

            {/* Rename Modal */}
            <RenameWishlistModal
                visible={showRenameModal}
                currentName={activeWishlist?.name ?? ''}
                onClose={() => setShowRenameModal(false)}
                onSubmit={handleRenameSubmit}
                isLoading={updateWishlistMutation.isPending}
            />

            {/* Action Sheet for collection management */}
            <WishlistActionSheet
                ref={actionSheetRef}
                onRename={handleRename}
                onTogglePublic={handleTogglePublic}
                onShare={handleShare}
                onDelete={handleDeleteWishlist}
            />

            {/* Edit Wishlist Item Sheet */}
            <EditWishlistItemSheet
                ref={editItemSheetRef}
                onSubmit={handleEditItemSubmit}
                isLoading={updateItemMutation.isPending}
            />
        </View>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: theme.margins.md,
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
        backgroundColor: theme.colors.accent,
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
    moreButton: {
        padding: theme.margins.xs,
        marginLeft: theme.margins.sm,
    },
}));
