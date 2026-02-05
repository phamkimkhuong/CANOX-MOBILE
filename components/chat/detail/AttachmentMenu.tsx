import { IconSymbol } from '@/components/ui/Icon';
import {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetModal,
    BottomSheetView
} from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

/**
 * ==============================================
 * AttachmentMenu - Menu attachment for Chat
 * ==============================================
 * Uses BottomSheetModal with dynamic sizing to automatically
 * calculate height based on content. Includes safe area handling
 * to prevent content being cut off by home indicator.
 */

interface AttachmentMenuProps {
    onSelectOption: (type: 'media' | 'product' | 'order') => void;
}

export const AttachmentMenu = forwardRef<BottomSheetModal, AttachmentMenuProps>(
    ({ onSelectOption }, ref) => {
        const styles = stylesheet;
        const insets = useSafeAreaInsets();

        // Backdrop when opening menu
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

        return (
            <BottomSheetModal
                ref={ref}
                enableDynamicSizing={true}
                enablePanDownToClose
                backdropComponent={renderBackdrop}
                handleIndicatorStyle={styles.indicator}
                backgroundStyle={styles.background}
                bottomInset={insets.bottom}
            >
                <BottomSheetView style={styles.content}>
                    <Text style={styles.title}>Gửi nội dung</Text>

                    <View style={styles.optionsGrid}>
                        {/* Option: Hình ảnh */}
                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={() => onSelectOption('media')}
                        >
                            <View style={styles.iconCircleBlue}>
                                <IconSymbol name="image" size={24} color="#1976D2" />
                            </View>
                            <Text style={styles.optionLabel}>Hình ảnh</Text>
                        </TouchableOpacity>

                        {/* Option: Gửi sản phẩm */}
                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={() => onSelectOption('product')}
                        >
                            <View style={styles.iconCircleGreen}>
                                <IconSymbol name="shopping-bag" size={24} color="#388E3C" />
                            </View>
                            <Text style={styles.optionLabel}>Sản phẩm</Text>
                        </TouchableOpacity>

                        {/* Option: Gửi đơn hàng */}
                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={() => onSelectOption('order')}
                        >
                            <View style={styles.iconCircleOrange}>
                                <IconSymbol name="shipping" size={24} color="#F57C00" />
                            </View>
                            <Text style={styles.optionLabel}>Đơn hàng</Text>
                        </TouchableOpacity>
                    </View>
                </BottomSheetView>
            </BottomSheetModal>
        );
    }
);

const stylesheet = StyleSheet.create((theme, runtime) => ({
    background: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    indicator: {
        backgroundColor: theme.colors.border,
        width: 40,
    },
    content: {
        paddingHorizontal: theme.margins.lg,
        paddingTop: theme.margins.sm,
        paddingBottom: Math.max(runtime.insets.bottom, 24),
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.typography,
        marginBottom: theme.margins.lg,
        textAlign: 'center',
    },
    optionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: theme.margins.md,
    },
    optionItem: {
        alignItems: 'center',
        gap: 10,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    iconCircleBlue: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        backgroundColor: '#E3F2FD',
    },
    iconCirclePurple: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        backgroundColor: '#F3E5F5',
    },
    iconCircleGreen: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        backgroundColor: '#E8F5E9',
    },
    iconCircleOrange: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        backgroundColor: '#FFF3E0',
    },
    optionLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: theme.colors.typographySecondary,
    },
}));

