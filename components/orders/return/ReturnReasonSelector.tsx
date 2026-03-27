import { IconSymbol } from '@/components/ui/Icon';
import type { ReturnReasonCode } from '@/types/order/return';
import { RETURN_REASONS } from '@/types/order/returnReasons';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ReturnReasonSelectorProps {
    selectedReason: ReturnReasonCode | null;
    onReasonChange: (code: ReturnReasonCode) => void;
}

export const ReturnReasonSelector: React.FC<ReturnReasonSelectorProps> = ({
    selectedReason,
    onReasonChange,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation(['order']);
    const insets = useSafeAreaInsets();
    const styles = stylesheet;
    const [isOpen, setIsOpen] = useState(false);

    const selectedLabel = useMemo(() => {
        if (!selectedReason) {
            return t('returnRequest.reasonPlaceholder');
        }

        return t(`returnRequest.reasons.${selectedReason}` as never);
    }, [selectedReason, t]);

    const handleSelect = (code: ReturnReasonCode) => {
        onReasonChange(code);
        setIsOpen(false);
    };

    return (
        <>
            <View style={styles.container}>
                <Text style={styles.label}>{t('returnRequest.selectReason')}</Text>

                <Pressable
                    style={[
                        styles.trigger,
                        selectedReason && styles.triggerSelected,
                    ]}
                    onPress={() => setIsOpen(true)}
                    accessibilityRole="button"
                    accessibilityLabel={t('returnRequest.selectReason')}
                >
                    <Text
                        style={[
                            styles.triggerText,
                            !selectedReason && styles.placeholderText,
                        ]}
                        numberOfLines={1}
                    >
                        {selectedLabel}
                    </Text>
                    <IconSymbol
                        name="keyboard-arrow-down"
                        size={22}
                        color={theme.colors.typographySecondary}
                    />
                </Pressable>
            </View>

            <Modal
                visible={isOpen}
                transparent
                animationType="slide"
                onRequestClose={() => setIsOpen(false)}
            >
                <View style={styles.modalRoot}>
                    <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)} />

                    <View
                        style={[
                            styles.sheet,
                            {
                                paddingBottom: insets.bottom > 0
                                    ? insets.bottom + theme.margins.md
                                    : theme.margins.xl,
                            },
                        ]}
                    >
                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>{t('returnRequest.modalTitle')}</Text>
                            <Pressable
                                onPress={() => setIsOpen(false)}
                                style={styles.closeButton}
                                accessibilityRole="button"
                                accessibilityLabel={t('returnRequest.closeSelector')}
                            >
                                <IconSymbol
                                    name="close"
                                    size={20}
                                    color={theme.colors.typography}
                                />
                            </Pressable>
                        </View>

                        <ScrollView
                            style={styles.optionScroll}
                            contentContainerStyle={styles.optionList}
                            showsVerticalScrollIndicator={false}
                            bounces={false}
                        >
                            {RETURN_REASONS.map((reason) => {
                                const isSelected = selectedReason === reason.code;
                                return (
                                    <Pressable
                                        key={reason.code}
                                        style={[
                                            styles.optionItem,
                                            isSelected && styles.optionItemSelected,
                                        ]}
                                        onPress={() => handleSelect(reason.code)}
                                    >
                                        <Text
                                            style={[
                                                styles.optionText,
                                                isSelected && styles.optionTextSelected,
                                            ]}
                                        >
                                            {t(`returnRequest.reasons.${reason.code}` as never)}
                                        </Text>
                                        {isSelected && (
                                            <IconSymbol
                                                name="check"
                                                size={18}
                                                color={theme.colors.success}
                                            />
                                        )}
                                    </Pressable>
                                );
                            })}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        gap: theme.margins.sm,
    },
    label: {
        fontSize: theme.fontSizes.md,
        fontWeight: theme.fontWeights.semibold,
        color: theme.colors.typography,
    },
    trigger: {
        minHeight: 42,
        borderRadius: theme.radius.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.margins.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.margins.sm,
    },
    triggerSelected: {
        borderColor: theme.colors.secondaryLight,
        backgroundColor: theme.colors.backgroundNewInput,
    },
    triggerText: {
        flex: 1,
        fontSize: theme.fontSizes.mdbase,
        fontWeight: theme.fontWeights.regular,
        color: theme.colors.typography,
    },
    placeholderText: {
        color: theme.colors.typographySecondary,
        fontWeight: theme.fontWeights.regular,
    },
    modalRoot: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(18, 18, 18, 0.45)',
    },
    sheet: {
        maxHeight: '78%',
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: theme.radius.xl,
        borderTopRightRadius: theme.radius.xl,
        paddingHorizontal: theme.margins.md,
        paddingTop: theme.margins.md,
        gap: theme.margins.md,
        ...theme.shadows.large,
    },
    optionScroll: {
        flexGrow: 0,
    },
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sheetTitle: {
        fontSize: theme.fontSizes.lg,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.typography,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: theme.radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.backgroundNewInput,
    },
    optionList: {
        gap: theme.margins.sm,
    },
    optionItem: {
        minHeight: 52,
        borderRadius: theme.radius.m,
        borderWidth: 1,
        borderColor: theme.colors.borderMuted,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.margins.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.margins.sm,
    },
    optionItemSelected: {
        borderColor: theme.colors.secondaryLight,
        backgroundColor: theme.colors.backgroundNewInput,
    },
    optionText: {
        flex: 1,
        fontSize: theme.fontSizes.base,
        color: theme.colors.typography,
    },
    optionTextSelected: {
        fontWeight: theme.fontWeights.semibold,
        color: theme.colors.typography,
    },
}));
