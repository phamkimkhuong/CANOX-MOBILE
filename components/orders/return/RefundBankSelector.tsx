import { IconSymbol } from '@/components/ui/Icon';
import type { UserBankAccountUI } from '@/types/bank/ui';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface RefundBankSelectorProps {
    accounts: UserBankAccountUI[];
    isLoading: boolean;
    selectedBankAccountId: string | null;
    onSelectBankAccount: (bankAccountId: string) => void;
    onAddBank: () => void;
}

export const RefundBankSelector: React.FC<RefundBankSelectorProps> = ({
    accounts,
    isLoading,
    selectedBankAccountId,
    onSelectBankAccount,
    onAddBank,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation(['order']);
    const insets = useSafeAreaInsets();
    const styles = stylesheet;
    const [isOpen, setIsOpen] = useState(false);

    const selectedAccount = useMemo(() => (
        accounts.find((account) => account.id === selectedBankAccountId) ?? null
    ), [accounts, selectedBankAccountId]);

    const triggerText = useMemo(() => {
        if (isLoading) return t('returnRequest.refundBankLoading');
        if (selectedAccount) return selectedAccount.formattedInfo;
        if (accounts.length === 0) return t('returnRequest.refundBankAdd');
        return t('returnRequest.refundBankPlaceholder');
    }, [accounts.length, isLoading, selectedAccount, t]);

    const handlePress = () => {
        if (isLoading) return;
        if (accounts.length === 0) {
            onAddBank();
            return;
        }
        setIsOpen(true);
    };

    return (
        <>
            <View style={styles.container}>
                <Text style={styles.label}>{t('returnRequest.refundBankLabel')}</Text>

                <Pressable
                    style={[
                        styles.trigger,
                        selectedAccount && styles.triggerSelected,
                        accounts.length === 0 && styles.triggerEmpty,
                    ]}
                    onPress={handlePress}
                    accessibilityRole="button"
                    accessibilityLabel={t('returnRequest.refundBankLabel')}
                    disabled={isLoading}
                >
                    <View style={styles.triggerMain}>
                        <Text
                            style={[
                                styles.triggerText,
                                !selectedAccount && styles.placeholderText,
                                accounts.length === 0 && styles.addText,
                            ]}
                            numberOfLines={1}
                        >
                            {triggerText}
                        </Text>
                        {selectedAccount?.isDefault && (
                            <View style={styles.defaultBadge}>
                                <Text style={styles.defaultBadgeText}>
                                    {t('returnRequest.refundBankDefault')}
                                </Text>
                            </View>
                        )}
                    </View>

                    <IconSymbol
                        name={accounts.length === 0 ? 'add-circle' : 'keyboard-arrow-down'}
                        size={22}
                        color={
                            accounts.length === 0
                                ? theme.colors.accent
                                : theme.colors.typographySecondary
                        }
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
                            <Text style={styles.sheetTitle}>{t('returnRequest.refundBankModalTitle')}</Text>
                            <Pressable
                                onPress={() => setIsOpen(false)}
                                style={styles.closeButton}
                                accessibilityRole="button"
                                accessibilityLabel={t('returnRequest.closeBankSelector')}
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
                            {accounts.map((account) => {
                                const isSelected = account.id === selectedBankAccountId;
                                return (
                                    <Pressable
                                        key={account.id}
                                        style={[
                                            styles.optionItem,
                                            isSelected && styles.optionItemSelected,
                                        ]}
                                        onPress={() => {
                                            onSelectBankAccount(account.id);
                                            setIsOpen(false);
                                        }}
                                    >
                                        <View style={styles.optionTextWrap}>
                                            <View style={styles.optionTopRow}>
                                                <Text
                                                    style={[
                                                        styles.optionBankName,
                                                        isSelected && styles.optionBankNameSelected,
                                                    ]}
                                                >
                                                    {account.bankDisplayName}
                                                </Text>
                                                {account.isDefault && (
                                                    <View style={styles.optionDefaultBadge}>
                                                        <Text style={styles.optionDefaultBadgeText}>
                                                            {t('returnRequest.refundBankDefault')}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text style={styles.optionBankInfo}>{account.formattedInfo}</Text>
                                            <Text style={styles.optionHolderName}>{account.accountHolder}</Text>
                                        </View>
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

                            <Pressable
                                style={styles.addBankButton}
                                onPress={() => {
                                    setIsOpen(false);
                                    onAddBank();
                                }}
                            >
                                <IconSymbol
                                    name="add-circle"
                                    size={20}
                                    color={theme.colors.accent}
                                />
                                <Text style={styles.addBankButtonText}>
                                    {t('returnRequest.refundBankAdd')}
                                </Text>
                            </Pressable>
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
        minHeight: 52,
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
    triggerEmpty: {
        borderColor: theme.colors.accent,
        backgroundColor: theme.colors.backgroundNewInput,
    },
    triggerMain: {
        flex: 1,
        gap: theme.margins.xs,
    },
    triggerText: {
        fontSize: theme.fontSizes.mdbase,
        fontWeight: theme.fontWeights.regular,
        color: theme.colors.typography,
    },
    placeholderText: {
        color: theme.colors.typographySecondary,
        fontWeight: theme.fontWeights.regular,
    },
    addText: {
        color: theme.colors.accent,
        fontWeight: theme.fontWeights.semibold,
    },
    defaultBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: theme.margins.sm,
        paddingVertical: 4,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.successSoft,
    },
    defaultBadgeText: {
        fontSize: theme.fontSizes.xsm,
        fontWeight: theme.fontWeights.semibold,
        color: theme.colors.success,
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
        minHeight: 68,
        borderRadius: theme.radius.m,
        borderWidth: 1,
        borderColor: theme.colors.borderMuted,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.smd,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.margins.sm,
    },
    optionItemSelected: {
        borderColor: theme.colors.secondaryLight,
        backgroundColor: theme.colors.backgroundNewInput,
    },
    optionTextWrap: {
        flex: 1,
        gap: 2,
    },
    optionTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
        flexWrap: 'wrap',
    },
    optionBankName: {
        fontSize: theme.fontSizes.base,
        fontWeight: theme.fontWeights.semibold,
        color: theme.colors.typography,
    },
    optionBankNameSelected: {
        color: theme.colors.typography,
    },
    optionDefaultBadge: {
        paddingHorizontal: theme.margins.sm,
        paddingVertical: 4,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.successSoft,
    },
    optionDefaultBadgeText: {
        fontSize: theme.fontSizes.xsm,
        fontWeight: theme.fontWeights.semibold,
        color: theme.colors.success,
    },
    optionBankInfo: {
        fontSize: theme.fontSizes.md,
        color: theme.colors.typographySecondary,
    },
    optionHolderName: {
        fontSize: theme.fontSizes.sm,
        color: theme.colors.typographySecondary,
    },
    addBankButton: {
        minHeight: 52,
        borderRadius: theme.radius.m,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: theme.colors.accent,
        backgroundColor: theme.colors.backgroundNewInput,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.margins.sm,
    },
    addBankButtonText: {
        fontSize: theme.fontSizes.base,
        fontWeight: theme.fontWeights.semibold,
        color: theme.colors.accent,
    },
}));
