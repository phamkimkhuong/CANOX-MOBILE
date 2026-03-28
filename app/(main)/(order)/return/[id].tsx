import {
    OrderSummarySnippet,
} from '@/components/orders/cancel';
import {
    RefundBankSelector,
    ReturnMediaSection,
    ReturnReasonSelector,
} from '@/components/orders/return';
import { ROUTES } from '@/constants/routes';
import { orderRoutes } from '@/constants/routes';
import { useMyBankAccounts } from '@/hooks/api/bank/useBank';
import { useCreateReturnRequest } from '@/hooks/api/order/useCreateReturnRequest';
import { useReturnMediaUpload } from '@/hooks/api/order/useReturnMediaUpload';
import { IconSymbol } from '@/components/ui/Icon';
import { useOrderDetail } from '@/hooks/api/order/useOrderDetail';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import { useReturnRequestDraftStore } from '@/store/useReturnRequestDraftStore';
import type { UserBankAccountUI } from '@/types/bank/ui';
import {
    RETURN_DESCRIPTION_MAX_LENGTH,
    type ReturnReasonCode,
} from '@/types/order/return';
import { transformOrder } from '@/utils/adapter/order/orderAdapter';
import { toCreateReturnRequestPayload } from '@/utils/adapter/order/returnRequestAdapter';
import { Navigator } from '@/utils/navigation';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export default function ReturnRequestScreen() {
    useNavigationUnlockOnFocus();

    const { id: orderId } = useLocalSearchParams<{ id: string }>();
    const { theme } = useUnistyles();
    const { t } = useTranslation(['order', 'common']);
    const styles = stylesheet;
    const { bottom } = useSafeAreaInsets();

    const selectedReason = useReturnRequestDraftStore((state) => (
        state.drafts[orderId ?? '']?.reasonCode ?? null
    ));
    const selectedBankAccountId = useReturnRequestDraftStore((state) => (
        state.drafts[orderId ?? '']?.bankAccountId ?? null
    ));
    const description = useReturnRequestDraftStore((state) => (
        state.drafts[orderId ?? '']?.description ?? ''
    ));
    const setReasonCode = useReturnRequestDraftStore((state) => state.setReasonCode);
    const setBankAccountId = useReturnRequestDraftStore((state) => state.setBankAccountId);
    const setDescription = useReturnRequestDraftStore((state) => state.setDescription);

    const { data: rawOrder, isLoading: isLoadingOrder } = useOrderDetail(orderId);
    const { data: bankAccounts = [], isLoading: isLoadingBankAccounts } = useMyBankAccounts();
    const {
        mediaItems,
        hasUploadingMedia,
        pickImages,
        pickVideo,
        removeMedia,
        retryMediaUpload,
    } = useReturnMediaUpload(orderId);
    const clearDraft = useReturnRequestDraftStore((state) => state.clearDraft);

    const order = useMemo(() => (
        rawOrder ? transformOrder(rawOrder) : undefined
    ), [rawOrder]);

    const availableBankAccounts = useMemo<UserBankAccountUI[]>(() => {
        const defaultAccount = bankAccounts.find((account) => account.isDefault);
        if (!defaultAccount) return bankAccounts;

        const remainingAccounts = bankAccounts.filter((account) => account.id !== defaultAccount.id);
        return [defaultAccount, ...remainingAccounts];
    }, [bankAccounts]);

    const defaultBankAccount = useMemo(() => (
        availableBankAccounts.find((account) => account.isDefault) ?? null
    ), [availableBankAccounts]);

    const isLoadingBankSelector = isLoadingBankAccounts && availableBankAccounts.length === 0;
    const hasDescription = description.trim().length > 0;
    const hasFailedMedia = useMemo(() => (
        mediaItems.some((item) => item.uploadStatus === 'error')
    ), [mediaItems]);

    const createReturnRequestMutation = useCreateReturnRequest({
        onSuccess: () => {
            if (!orderId) return;

            clearDraft(orderId);

            Toast.show({
                type: 'success',
                text1: t('returnRequest.submitSuccess'),
                text2: t('returnRequest.submitSuccessDetail'),
            });

            Navigator.dismissTo(orderRoutes.detail(orderId));
        },
        onError: (error) => {
            Toast.show({
                type: 'error',
                text1: t('returnRequest.submitError'),
                text2: error.message || t('returnRequest.submitErrorDetail'),
            });
        },
    });

    const isSubmitDisabled = !selectedReason
        || !selectedBankAccountId
        || !hasDescription
        || hasFailedMedia
        || hasUploadingMedia
        || createReturnRequestMutation.isPending;

    const handleBack = useCallback(() => {
        Navigator.back();
    }, []);

    const handleReasonChange = useCallback((code: ReturnReasonCode) => {
        if (!orderId) return;
        setReasonCode(orderId, code);
    }, [orderId, setReasonCode]);

    const handleBankAccountChange = useCallback((bankAccountId: string) => {
        if (!orderId) return;
        setBankAccountId(orderId, bankAccountId);
    }, [orderId, setBankAccountId]);

    const handleAddBank = useCallback(() => {
        if (!orderId) return;

        Navigator.push({
            pathname: ROUTES.SETTINGS.ADD_BANK,
            params: {
                returnTo: 'return-request',
                orderId,
            },
        });
    }, [orderId]);

    const handleDescriptionChange = useCallback((value: string) => {
        if (!orderId) return;
        setDescription(orderId, value.slice(0, RETURN_DESCRIPTION_MAX_LENGTH));
    }, [orderId, setDescription]);

    const handleDescriptionBlur = useCallback(() => {
        if (!orderId) return;
        const trimmed = description.trim();
        if (trimmed === description) return;
        setDescription(orderId, trimmed);
    }, [description, orderId, setDescription]);

    const handleSubmit = useCallback(() => {
        if (!orderId) return;
        if (!selectedReason || !selectedBankAccountId || !hasDescription || hasUploadingMedia || hasFailedMedia) {
            return;
        }

        const payload = toCreateReturnRequestPayload({
            reasonCode: selectedReason,
            bankAccountId: selectedBankAccountId,
            description,
            mediaItems,
        });

        createReturnRequestMutation.mutate({
            orderId,
            payload,
        });
    }, [
        createReturnRequestMutation,
        description,
        hasDescription,
        hasFailedMedia,
        hasUploadingMedia,
        mediaItems,
        orderId,
        selectedBankAccountId,
        selectedReason,
        t,
    ]);

    useEffect(() => {
        if (!orderId) return;

        if (availableBankAccounts.length === 0) {
            if (selectedBankAccountId) {
                setBankAccountId(orderId, null);
            }
            return;
        }

        const hasSelectedAccount = !!selectedBankAccountId
            && availableBankAccounts.some((account) => account.id === selectedBankAccountId);

        if (hasSelectedAccount) return;

        if (defaultBankAccount && availableBankAccounts.some((account) => account.id === defaultBankAccount.id)) {
            setBankAccountId(orderId, defaultBankAccount.id);
            return;
        }

        if (availableBankAccounts.length === 1) {
            setBankAccountId(orderId, availableBankAccounts[0].id);
            return;
        }

        if (selectedBankAccountId) {
            setBankAccountId(orderId, null);
        }
    }, [
        availableBankAccounts,
        defaultBankAccount,
        orderId,
        selectedBankAccountId,
        setBankAccountId,
    ]);

    if (isLoadingOrder) {
        return (
            <View style={styles.container}>
                <Header onBack={handleBack} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.newPrimary} />
                    <Text style={styles.loadingText}>{t('returnRequest.loading')}</Text>
                </View>
            </View>
        );
    }

    if (!order || !rawOrder) {
        return (
            <View style={styles.container}>
                <Header onBack={handleBack} />
                <View style={styles.errorContainer}>
                    <IconSymbol
                        name="error-outline"
                        size={48}
                        color={theme.colors.error}
                    />
                    <Text style={styles.errorTitle}>{t('returnRequest.notFound')}</Text>
                    <Text style={styles.errorMessage}>
                        {t('returnRequest.notFoundDetail')}
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header onBack={handleBack} />

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[
                        styles.scrollContent,
                        {
                            paddingBottom: Math.max(
                                bottom + theme.margins.md + 88,
                                theme.margins.lg + 88
                            ),
                        },
                    ]}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.sectionCard}>
                        <OrderSummarySnippet
                            items={order.items}
                            grandTotal={order.grandTotal}
                            currency={order.currency}
                            orderNumber={order.orderNumber}
                            status={order.status}
                            statusRaw={order.statusRaw}
                            shopName={order.shopName}
                        />
                    </View>

                    <View style={styles.spacer} />

                    <View style={styles.formCard}>
                        <ReturnReasonSelector
                            selectedReason={selectedReason}
                            onReasonChange={handleReasonChange}
                        />

                        <View style={styles.fieldDivider} />

                        <RefundBankSelector
                            accounts={availableBankAccounts}
                            isLoading={isLoadingBankSelector}
                            selectedBankAccountId={selectedBankAccountId}
                            onSelectBankAccount={handleBankAccountChange}
                            onAddBank={handleAddBank}
                        />

                        <View style={styles.fieldDivider} />

                        <View style={styles.descriptionSection}>
                            <View style={styles.descriptionLabelRow}>
                                <Text style={styles.descriptionLabel}>
                                    {t('returnRequest.descriptionLabel')}
                                </Text>
                                <Text style={styles.requiredMark}>*</Text>
                            </View>
                            <View style={styles.descriptionInputWrap}>
                                <TextInput
                                    value={description}
                                    onChangeText={handleDescriptionChange}
                                    onBlur={handleDescriptionBlur}
                                    placeholder={t('returnRequest.descriptionPlaceholder')}
                                    placeholderTextColor={theme.colors.typographySecondary}
                                    multiline
                                    textAlignVertical="top"
                                    maxLength={RETURN_DESCRIPTION_MAX_LENGTH}
                                    style={styles.descriptionInput}
                                />
                            </View>
                            <View style={styles.descriptionFooter}>
                                <Text style={styles.descriptionCounter}>
                                    {description.length}/{RETURN_DESCRIPTION_MAX_LENGTH}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.fieldDivider} />

                        <ReturnMediaSection
                            mediaItems={mediaItems}
                            hasUploadingMedia={hasUploadingMedia}
                            onAddImages={pickImages}
                            onAddVideo={pickVideo}
                            onRemoveItem={removeMedia}
                            onRetryItem={retryMediaUpload}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View
                style={[
                    styles.submitBar,
                    {
                        paddingBottom: Math.max(bottom, theme.margins.sm),
                    },
                ]}
            >
                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        isSubmitDisabled && styles.submitButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={isSubmitDisabled}
                    activeOpacity={0.88}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: isSubmitDisabled, busy: createReturnRequestMutation.isPending }}
                >
                    <Text style={styles.submitButtonText}>
                        {createReturnRequestMutation.isPending
                            ? t('returnRequest.submitting')
                            : t('returnRequest.submit')}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

interface HeaderProps {
    onBack: () => void;
}

const Header: React.FC<HeaderProps> = ({ onBack }) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation(['order', 'common']);
    const styles = stylesheet;
    const { top } = useSafeAreaInsets();

    return (
        <View style={[styles.header, { paddingTop: top + 8 }]}>
            <TouchableOpacity
                style={styles.headerBackButton}
                onPress={onBack}
                activeOpacity={0.7}
                accessibilityLabel={t('common:actions.back')}
                accessibilityRole="button"
            >
                <IconSymbol
                    name="arrow-back"
                    size={24}
                    color={theme.colors.typography}
                />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('returnRequest.title')}</Text>
            <View style={styles.headerSpacer} />
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: theme.margins.md,
        paddingTop: theme.margins.md,
    },
    submitBar: {
        paddingHorizontal: theme.margins.md,
        paddingTop: theme.margins.sm,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    submitButton: {
        minHeight: 52,
        borderRadius: theme.radius.m,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.newPrimary,
        paddingHorizontal: theme.margins.lg,
    },
    submitButtonDisabled: {
        backgroundColor: theme.colors.secondaryLight,
    },
    submitButtonText: {
        fontSize: theme.fontSizes.base,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.surface,
    },
    spacer: {
        height: theme.margins.md,
    },
    sectionCard: {
        borderRadius: theme.radius.l,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.secondaryLight,
        backgroundColor: theme.colors.surface,
    },
    formCard: {
        gap: theme.margins.md,
        padding: theme.margins.md,
        borderRadius: theme.radius.l,
        borderWidth: 1,
        borderColor: theme.colors.secondaryLight,
        backgroundColor: theme.colors.surface,
    },
    fieldDivider: {
        height: 1,
        backgroundColor: theme.colors.borderMuted,
    },
    descriptionSection: {
        gap: theme.margins.sm,
    },
    descriptionLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    descriptionLabel: {
        fontSize: theme.fontSizes.md,
        fontWeight: theme.fontWeights.semibold,
        color: theme.colors.typography,
    },
    requiredMark: {
        fontSize: theme.fontSizes.md,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.error,
        lineHeight: 20,
    },
    descriptionInputWrap: {
        minHeight: 132,
        borderRadius: theme.radius.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.sm,
    },
    descriptionInput: {
        minHeight: 108,
        fontSize: theme.fontSizes.base,
        lineHeight: 20,
        color: theme.colors.typography,
    },
    descriptionFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    descriptionCounter: {
        fontSize: theme.fontSizes.sm,
        color: theme.colors.typographySecondary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.smd,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerBackButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: -theme.margins.sm,
    },
    headerTitle: {
        flex: 1,
        fontSize: 17,
        fontWeight: '700',
        color: theme.colors.newPrimary,
        textAlign: 'center',
    },
    headerSpacer: {
        width: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: theme.margins.md,
    },
    loadingText: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.margins.xl,
        gap: theme.margins.smd,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.typography,
        marginTop: theme.margins.sm,
    },
    errorMessage: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
    },
}));
