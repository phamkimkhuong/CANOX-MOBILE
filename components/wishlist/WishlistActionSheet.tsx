/**
 * ==============================================
 * WISHLIST ACTION SHEET - Collection Management
 * ==============================================
 * Bottom sheet with actions for managing a wishlist:
 * - Rename
 * - Toggle Public/Private
 * - Share
 * - Delete (with confirmation)
 *
 * Uses @gorhom/bottom-sheet for consistency with chat ActionSheet.
 * Default wishlist cannot be deleted.
 */

import { IconSymbol } from '@/components/ui/Icon';
import {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetModal,
    BottomSheetView
} from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface WishlistInfo {
    id: string;
    name: string;
    itemCount: number;
    isDefault: boolean;
    isPublic: boolean;
}

export interface WishlistActionSheetRef {
    present: (wishlist: WishlistInfo) => void;
    dismiss: () => void;
}

interface WishlistActionSheetProps {
    onRename: (wishlist: WishlistInfo) => void;
    onTogglePublic: (wishlist: WishlistInfo) => void;
    onShare: (wishlist: WishlistInfo) => void;
    onDelete: (wishlist: WishlistInfo) => void;
}

export const WishlistActionSheet = forwardRef<WishlistActionSheetRef, WishlistActionSheetProps>(
    ({ onRename, onTogglePublic, onShare, onDelete }, ref) => {
        const { theme } = useUnistyles();
        const { t } = useTranslation('wishlist');
        const styles = sheetStyles;
        const insets = useSafeAreaInsets();
        const bottomSheetRef = useRef<BottomSheetModal>(null);
        const [wishlist, setWishlist] = useState<WishlistInfo | null>(null);

        useImperativeHandle(ref, () => ({
            present: (wl: WishlistInfo) => {
                setWishlist(wl);
                bottomSheetRef.current?.present();
            },
            dismiss: () => {
                bottomSheetRef.current?.dismiss();
            },
        }));

        const renderBackdrop = useCallback(
            (props: BottomSheetBackdropProps) => (
                <BottomSheetBackdrop
                    {...props}
                    appearsOnIndex={0}
                    disappearsOnIndex={-1}
                    opacity={0.3}
                />
            ),
            []
        );

        const handleRename = useCallback(() => {
            if (!wishlist) return;
            bottomSheetRef.current?.dismiss();
            // Delay to let sheet close before opening modal
            setTimeout(() => onRename(wishlist), 300);
        }, [wishlist, onRename]);

        const handleTogglePublic = useCallback(() => {
            if (!wishlist) return;
            bottomSheetRef.current?.dismiss();
            onTogglePublic(wishlist);
        }, [wishlist, onTogglePublic]);

        const handleShare = useCallback(() => {
            if (!wishlist) return;
            bottomSheetRef.current?.dismiss();
            onShare(wishlist);
        }, [wishlist, onShare]);

        const handleDelete = useCallback(() => {
            if (!wishlist) return;
            bottomSheetRef.current?.dismiss();
            // Delay to let sheet close before showing confirm
            setTimeout(() => onDelete(wishlist), 300);
        }, [wishlist, onDelete]);

        return (
            <BottomSheetModal
                ref={bottomSheetRef}
                enableDynamicSizing
                enablePanDownToClose
                backdropComponent={renderBackdrop}
                handleIndicatorStyle={styles.indicator}
                backgroundStyle={styles.background}
            >
                <BottomSheetView
                    style={[
                        styles.content,
                        { paddingBottom: insets.bottom > 0 ? insets.bottom + theme.margins.md : theme.margins.xl }
                    ]}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle} numberOfLines={1}>{wishlist?.name}</Text>
                        <Text style={styles.headerSubtitle}>
                            {wishlist?.itemCount ?? 0} {t('productCount')}
                        </Text>
                    </View>

                    {/* Rename */}
                    <Pressable
                        style={({ pressed }) => [styles.actionItem, pressed && styles.actionPressed]}
                        onPress={handleRename}
                    >
                        <View style={[styles.iconCircle, styles.iconDefault]}>
                            <IconSymbol name="edit" size={20} color={theme.colors.typography} />
                        </View>
                        <Text style={styles.actionText}>{t('manage.rename')}</Text>
                    </Pressable>

                    {/* Toggle Public/Private */}
                    <Pressable
                        style={({ pressed }) => [styles.actionItem, pressed && styles.actionPressed]}
                        onPress={handleTogglePublic}
                    >
                        <View style={[styles.iconCircle, styles.iconDefault]}>
                            <IconSymbol
                                name={wishlist?.isPublic ? 'visibility-off' : 'public'}
                                size={20}
                                color={theme.colors.typography}
                            />
                        </View>
                        <View style={styles.actionContent}>
                            <Text style={styles.actionText}>
                                {wishlist?.isPublic ? t('manage.makePrivate') : t('manage.makePublic')}
                            </Text>
                            <Text style={styles.actionSubtext}>
                                {wishlist?.isPublic ? t('manage.privateHint') : t('manage.publicHint')}
                            </Text>
                        </View>
                    </Pressable>

                    {/* Share */}
                    <Pressable
                        style={({ pressed }) => [styles.actionItem, pressed && styles.actionPressed]}
                        onPress={handleShare}
                    >
                        <View style={[styles.iconCircle, styles.iconDefault]}>
                            <IconSymbol name="share" size={20} color={theme.colors.typography} />
                        </View>
                        <Text style={styles.actionText}>{t('manage.share')}</Text>
                    </Pressable>

                    {/* Delete — hidden for default wishlist */}
                    {!wishlist?.isDefault && (
                        <>
                            <View style={styles.separator} />
                            <Pressable
                                style={({ pressed }) => [styles.actionItem, pressed && styles.deletePressed]}
                                onPress={handleDelete}
                            >
                                <View style={[styles.iconCircle, styles.iconDelete]}>
                                    <IconSymbol name="delete" size={20} color={theme.colors.error} />
                                </View>
                                <Text style={styles.deleteText}>{t('manage.delete')}</Text>
                            </Pressable>
                        </>
                    )}

                    {/* Cancel */}
                    <Pressable
                        style={({ pressed }) => [styles.cancelButton, pressed && styles.cancelPressed]}
                        onPress={() => bottomSheetRef.current?.dismiss()}
                    >
                        <Text style={styles.cancelText}>{t('manage.cancel')}</Text>
                    </Pressable>
                </BottomSheetView>
            </BottomSheetModal>
        );
    }
);

const sheetStyles = StyleSheet.create((theme) => ({
    background: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    indicator: {
        backgroundColor: theme.colors.border,
        width: 40,
    },
    content: {
        paddingHorizontal: theme.margins.md,
        paddingTop: theme.margins.sm,
    },
    header: {
        paddingVertical: theme.margins.sm,
        paddingHorizontal: theme.margins.sm,
        marginBottom: theme.margins.xs,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: theme.colors.typography,
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.margins.smd,
        paddingHorizontal: theme.margins.sm,
        borderRadius: theme.radius.m,
        gap: 14,
    },
    actionPressed: {
        backgroundColor: theme.colors.activeSubtle,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconDefault: {
        backgroundColor: theme.colors.backgroundNewSurface,
    },
    iconDelete: {
        backgroundColor: theme.colors.errorSubtle,
    },
    actionContent: {
        flex: 1,
        gap: 1,
    },
    actionText: {
        fontSize: 15,
        fontWeight: '500',
        color: theme.colors.typography,
    },
    actionSubtext: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
    },
    deleteText: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.error,
    },
    deletePressed: {
        backgroundColor: theme.colors.errorSubtle,
    },
    separator: {
        height: 1,
        backgroundColor: theme.colors.borderMuted,
        marginVertical: theme.margins.xs,
        marginHorizontal: theme.margins.sm,
    },
    cancelButton: {
        marginTop: theme.margins.sm,
        paddingVertical: theme.margins.smd,
        alignItems: 'center',
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.backgroundNewInput,
    },
    cancelPressed: {
        backgroundColor: theme.colors.secondaryLight,
    },
    cancelText: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.typographySecondary,
    },
}));
