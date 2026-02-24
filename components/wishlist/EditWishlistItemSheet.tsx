/**
 * ==============================================
 * EDIT WISHLIST ITEM SHEET - BottomSheet Form
 * ==============================================
 * Allows users to edit:
 * - Desired Price (target price for notifications)
 * - Notes (personal memo for purchase context)
 * - Priority (Normal / Urgent)
 */

import { IconSymbol } from '@/components/ui/Icon';
import { formatCurrency } from '@/utils/format';
import {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetModal,
    BottomSheetScrollView,
    BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
    Keyboard,
    Pressable,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

// ============================================
// TYPES
// ============================================

export interface EditWishlistItemData {
    itemId: string;
    wishlistId: string;
    productName: string;
    currentPrice: number;
    desiredPrice: number | null;
    notes: string | null;
    priority: number;
    imageUrl: string | null;
}

export interface EditWishlistItemResult {
    desiredPrice: number | null;
    notes: string | null;
    priority: number;
}

export interface EditWishlistItemSheetRef {
    present: (data: EditWishlistItemData) => void;
    dismiss: () => void;
}

interface EditWishlistItemSheetProps {
    onSubmit: (itemId: string, wishlistId: string, result: EditWishlistItemResult) => void;
    isLoading?: boolean;
}

// ============================================
// COMPONENT
// ============================================

export const EditWishlistItemSheet = forwardRef<
    EditWishlistItemSheetRef,
    EditWishlistItemSheetProps
>(({ onSubmit, isLoading = false }, ref) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('wishlist');
    const styles = sheetStyles;
    const insets = useSafeAreaInsets();
    const bottomSheetRef = useRef<BottomSheetModal>(null);

    // Form state
    const [data, setData] = useState<EditWishlistItemData | null>(null);
    const [priceText, setPriceText] = useState('');
    const [notes, setNotes] = useState('');
    const [priority, setPriority] = useState(0);

    useImperativeHandle(ref, () => ({
        present: (itemData: EditWishlistItemData) => {
            setData(itemData);
            setPriceText(
                itemData.desiredPrice != null && itemData.desiredPrice > 0
                    ? String(itemData.desiredPrice)
                    : ''
            );
            setNotes(itemData.notes ?? '');
            setPriority(itemData.priority);
            bottomSheetRef.current?.present();
        },
        dismiss: () => {
            bottomSheetRef.current?.dismiss();
        },
    }));

    // Dismiss keyboard when sheet is first shown
    useEffect(() => {
        if (data) {
            Keyboard.dismiss();
        }
    }, [data]);

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

    const handleSubmit = useCallback(() => {
        if (!data || isLoading) return;

        const parsedPrice = priceText.trim() ? Number(priceText.replace(/[^\d]/g, '')) : null;

        onSubmit(data.itemId, data.wishlistId, {
            desiredPrice: parsedPrice && parsedPrice > 0 ? parsedPrice : null,
            notes: notes.trim() || null,
            priority,
        });
    }, [data, isLoading, priceText, notes, priority, onSubmit]);

    const handleClearPrice = useCallback(() => {
        setPriceText('');
    }, []);

    // Format price on blur for readability
    const handlePriceBlur = useCallback(() => {
        if (priceText.trim()) {
            const numericValue = Number(priceText.replace(/[^\d]/g, ''));
            if (numericValue > 0) {
                setPriceText(String(numericValue));
            } else {
                setPriceText('');
            }
        }
    }, [priceText]);

    // Computed: has changes
    const hasChanges = (() => {
        if (!data) return false;
        const parsedPrice = priceText.trim()
            ? Number(priceText.replace(/[^\d]/g, ''))
            : null;
        const originalPrice = data.desiredPrice != null && data.desiredPrice > 0
            ? data.desiredPrice : null;
        return (
            parsedPrice !== originalPrice ||
            (notes.trim() || null) !== (data.notes || null) ||
            priority !== data.priority
        );
    })();

    return (
        <BottomSheetModal
            ref={bottomSheetRef}
            enableDynamicSizing
            enablePanDownToClose
            backdropComponent={renderBackdrop}
            handleIndicatorStyle={styles.indicator}
            backgroundStyle={styles.background}
            keyboardBehavior="interactive"
            keyboardBlurBehavior="restore"
            android_keyboardInputMode="adjustResize"
        >
            <BottomSheetScrollView
                style={styles.content}
                contentContainerStyle={{
                    paddingBottom: insets.bottom > 0 ? insets.bottom + theme.margins.md : theme.margins.xl,
                }}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerIconWrap}>
                        <IconSymbol name="edit" size={18} color="#fff" />
                    </View>
                    <View style={styles.headerTextWrap}>
                        <Text style={styles.headerTitle}>{t('editItem.title')}</Text>
                        <Text style={styles.headerSubtitle} numberOfLines={1}>
                            {data?.productName}
                        </Text>
                    </View>
                </View>

                {/* Current Price Info */}
                {data && (
                    <View style={styles.currentPriceRow}>
                        <Text style={styles.currentPriceLabel}>Giá hiện tại:</Text>
                        <Text style={styles.currentPriceValue}>
                            {formatCurrency(data.currentPrice)}
                        </Text>
                    </View>
                )}

                {/* Desired Price Input */}
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>{t('editItem.desiredPriceLabel')}</Text>
                    <View style={styles.priceInputRow}>
                        <View style={styles.priceInputWrap}>
                            <IconSymbol
                                name="flag"
                                size={16}
                                color={theme.colors.accent}
                                style={styles.priceIcon}
                            />
                            <BottomSheetTextInput
                                style={styles.textInput}
                                value={priceText}
                                onChangeText={setPriceText}
                                placeholder={t('editItem.desiredPricePlaceholder')}
                                placeholderTextColor={theme.colors.typographySecondary}
                                keyboardType="numeric"
                                onBlur={handlePriceBlur}
                                editable={!isLoading}
                            />
                        </View>
                        {priceText.length > 0 && (
                            <Pressable
                                style={styles.clearButton}
                                onPress={handleClearPrice}
                                hitSlop={8}
                            >
                                <IconSymbol name="close" size={16} color={theme.colors.typographySecondary} />
                            </Pressable>
                        )}
                    </View>
                    {priceText.trim() && Number(priceText.replace(/[^\d]/g, '')) > 0 && (
                        <Text style={styles.priceHint}>
                            → {formatCurrency(Number(priceText.replace(/[^\d]/g, '')))}
                        </Text>
                    )}
                </View>

                {/* Notes Input */}
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>{t('editItem.notesLabel')}</Text>
                    <View style={styles.notesInputWrap}>
                        <IconSymbol
                            name="note"
                            size={16}
                            color={theme.colors.typographySecondary}
                            style={styles.notesIcon}
                        />
                        <BottomSheetTextInput
                            style={styles.notesInput}
                            value={notes}
                            onChangeText={setNotes}
                            placeholder={t('editItem.notesPlaceholder')}
                            placeholderTextColor={theme.colors.typographySecondary}
                            multiline
                            maxLength={500}
                            numberOfLines={3}
                            textAlignVertical="top"
                            editable={!isLoading}
                        />
                    </View>
                    <Text style={styles.charCount}>
                        {notes.length}/500
                    </Text>
                </View>

                {/* Priority Selector */}
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>{t('editItem.priorityLabel')}</Text>
                    <View style={styles.priorityRow}>
                        {/* Normal */}
                        <Pressable
                            style={[
                                styles.priorityChip,
                                priority === 0 && styles.priorityChipActive,
                            ]}
                            onPress={() => setPriority(0)}
                            disabled={isLoading}
                        >
                            <IconSymbol
                                name="bookmark-outline"
                                size={16}
                                color={priority === 0 ? '#fff' : theme.colors.typography}
                            />
                            <Text
                                style={[
                                    styles.priorityChipText,
                                    priority === 0 && styles.priorityChipTextActive,
                                ]}
                            >
                                {t('editItem.priorityNormal')}
                            </Text>
                        </Pressable>

                        {/* Urgent */}
                        <Pressable
                            style={[
                                styles.priorityChip,
                                priority === 2 && styles.priorityChipUrgent,
                            ]}
                            onPress={() => setPriority(2)}
                            disabled={isLoading}
                        >
                            <IconSymbol
                                name="fire"
                                size={16}
                                color={priority === 2 ? '#fff' : theme.colors.error}
                            />
                            <Text
                                style={[
                                    styles.priorityChipText,
                                    priority === 2 && styles.priorityChipTextUrgent,
                                ]}
                            >
                                {t('editItem.priorityUrgent')}
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <Pressable
                        style={styles.cancelButton}
                        onPress={() => bottomSheetRef.current?.dismiss()}
                        disabled={isLoading}
                    >
                        <Text style={styles.cancelText}>{t('editItem.cancel')}</Text>
                    </Pressable>

                    <Pressable
                        style={[
                            styles.submitButton,
                            (!hasChanges || isLoading) && styles.submitDisabled,
                        ]}
                        onPress={handleSubmit}
                        disabled={!hasChanges || isLoading}
                    >
                        <IconSymbol name="check" size={18} color="#fff" />
                        <Text style={styles.submitText}>
                            {isLoading ? t('editItem.saving') : t('editItem.save')}
                        </Text>
                    </Pressable>
                </View>
            </BottomSheetScrollView>
        </BottomSheetModal>
    );
});

EditWishlistItemSheet.displayName = 'EditWishlistItemSheet';

// ============================================
// STYLES
// ============================================

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
        paddingHorizontal: theme.margins.lg,
        paddingTop: theme.margins.sm,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.margins.lg,
        gap: theme.margins.smd,
    },
    headerIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.newPrimary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTextWrap: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: theme.colors.typography,
        letterSpacing: -0.3,
    },
    headerSubtitle: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
        marginTop: 1,
    },

    // Current price info
    currentPriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
        paddingVertical: theme.margins.smd,
        paddingHorizontal: theme.margins.smd,
        backgroundColor: theme.colors.backgroundNewInput,
        borderRadius: theme.radius.m,
        marginBottom: theme.margins.lg,
    },
    currentPriceLabel: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
        fontWeight: '500',
    },
    currentPriceValue: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.error,
    },

    // Input sections
    inputSection: {
        marginBottom: theme.margins.lg,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.typography,
        marginBottom: theme.margins.sm,
    },

    // Price input
    priceInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
    },
    priceInputWrap: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.backgroundNewInput,
        paddingHorizontal: theme.margins.smd,
    },
    priceIcon: {
        marginRight: theme.margins.sm,
    },
    textInput: {
        flex: 1,
        paddingVertical: theme.margins.smd,
        fontSize: 15,
        color: theme.colors.typography,
    },
    clearButton: {
        padding: theme.margins.sm,
    },
    priceHint: {
        fontSize: 12,
        color: theme.colors.accent,
        fontWeight: '500',
        marginTop: theme.margins.xs,
        marginLeft: theme.margins.xs,
    },

    // Notes input
    notesInputWrap: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.backgroundNewInput,
        paddingHorizontal: theme.margins.smd,
        paddingTop: theme.margins.smd,
        alignItems: 'flex-start',
    },
    notesIcon: {
        marginRight: theme.margins.sm,
        marginTop: 2,
    },
    notesInput: {
        flex: 1,
        fontSize: 14,
        color: theme.colors.typography,
        minHeight: 72,
        paddingBottom: theme.margins.smd,
    },
    charCount: {
        fontSize: 11,
        color: theme.colors.typographySecondary,
        textAlign: 'right',
        marginTop: theme.margins.xs,
    },

    // Priority
    priorityRow: {
        flexDirection: 'row',
        gap: theme.margins.smd,
    },
    priorityChip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: theme.margins.smd,
        borderRadius: theme.radius.m,
        borderWidth: 1.5,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
    },
    priorityChipActive: {
        backgroundColor: theme.colors.newPrimary,
        borderColor: theme.colors.newPrimary,
    },
    priorityChipUrgent: {
        backgroundColor: theme.colors.error,
        borderColor: theme.colors.error,
    },
    priorityChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    priorityChipTextActive: {
        color: '#fff',
    },
    priorityChipTextUrgent: {
        color: '#fff',
    },

    // Actions
    actions: {
        flexDirection: 'row',
        gap: theme.margins.smd,
        marginTop: theme.margins.sm,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: theme.margins.smd,
        borderRadius: theme.radius.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    submitButton: {
        flex: 1.5,
        flexDirection: 'row',
        paddingVertical: theme.margins.smd,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.newPrimary,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    submitDisabled: {
        opacity: 0.5,
    },
    submitText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },
}));
