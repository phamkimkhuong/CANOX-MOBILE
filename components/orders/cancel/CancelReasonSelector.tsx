/**
 * ==============================================
 * CANCEL REASON SELECTOR
 * ==============================================
 * Features:
 * - Radio button list
 * - "Lý do khác" shows TextArea (required)
 * - Validation: OTHER requires detail text
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { CancelReasonCode } from '@/types/order/cancel';
import { CANCEL_REASONS, MIN_OTHER_REASON_LENGTH } from '@/types/order/cancelReasons';
import React from 'react';
import {
    Pressable,
    Text,
    TextInput,
    View,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface CancelReasonSelectorProps {
    /** Currently selected reason code */
    selectedReason: CancelReasonCode | null;
    /** Callback when reason is selected */
    onReasonChange: (code: CancelReasonCode) => void;
    /** Custom reason text (for OTHER) */
    otherReasonText: string;
    /** Callback when custom text changes */
    onOtherTextChange: (text: string) => void;
    /** Whether to show error state on OTHER textarea */
    showOtherError?: boolean;
}

export const CancelReasonSelector: React.FC<CancelReasonSelectorProps> = ({
    selectedReason,
    onReasonChange,
    otherReasonText,
    onOtherTextChange,
    showOtherError = false,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const isOtherSelected = selectedReason === 'OTHER';

    return (
        <View style={styles.container}>
            {/* Header */}
            <Text style={styles.header}>Lý do huỷ đơn</Text>

            {/* Reason Options */}
            <View style={styles.optionsList}>
                {CANCEL_REASONS.map((reason) => {
                    const isSelected = selectedReason === reason.code;
                    const isOther = reason.code === 'OTHER';

                    return (
                        <View key={reason.code}>
                            <Pressable
                                style={[
                                    styles.optionItem,
                                    isSelected && styles.optionItemSelected,
                                ]}
                                onPress={() => onReasonChange(reason.code)}
                                accessibilityRole="radio"
                                accessibilityState={{ checked: isSelected }}
                            >
                                <Text
                                    style={[
                                        styles.optionLabel,
                                        isSelected && styles.optionLabelSelected,
                                    ]}
                                >
                                    {reason.label}
                                </Text>

                                {/* Radio Circle */}
                                <View
                                    style={[
                                        styles.radioOuter,
                                        isSelected && styles.radioOuterSelected,
                                    ]}
                                >
                                    {isSelected && (
                                        <View style={styles.radioInner} />
                                    )}
                                </View>
                            </Pressable>

                            {/* TextArea for "OTHER" - only show when selected */}
                            {isOther && isSelected && (
                                <View style={styles.textAreaWrapper}>
                                    <TextInput
                                        style={[
                                            styles.textArea,
                                            showOtherError && styles.textAreaError,
                                        ]}
                                        placeholder="Nhập lý do chi tiết (tối thiểu 10 ký tự)..."
                                        placeholderTextColor={theme.colors.typographySecondary}
                                        multiline
                                        numberOfLines={4}
                                        textAlignVertical="top"
                                        value={otherReasonText}
                                        onChangeText={onOtherTextChange}
                                        maxLength={500}
                                    />

                                    {/* Character count */}
                                    <View style={styles.charCountRow}>
                                        {showOtherError && (
                                            <View style={styles.errorRow}>
                                                <IconSymbol
                                                    name="error-outline"
                                                    size={14}
                                                    color={theme.colors.error}
                                                />
                                                <Text style={styles.errorText}>
                                                    Vui lòng nhập tối thiểu {MIN_OTHER_REASON_LENGTH} ký tự
                                                </Text>
                                            </View>
                                        )}
                                        <Text style={styles.charCount}>
                                            {otherReasonText.length}/500
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        paddingVertical: theme.margins.md,
    },
    header: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.typography,
        paddingHorizontal: theme.margins.md,
        marginBottom: theme.margins.smd,
    },
    optionsList: {
        gap: theme.margins.sm,
        paddingHorizontal: theme.margins.md,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.margins.smd,
        paddingHorizontal: theme.margins.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.surface,
    },
    optionItemSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primaryLight,
    },
    optionLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.typography,
        marginRight: theme.margins.sm,
    },
    optionLabelSelected: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioOuterSelected: {
        borderColor: theme.colors.primary,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.colors.primary,
    },
    textAreaWrapper: {
        marginTop: theme.margins.sm,
        marginLeft: theme.margins.sm,
    },
    textArea: {
        height: 100,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.m,
        padding: theme.margins.smd,
        fontSize: 14,
        color: theme.colors.typography,
        backgroundColor: theme.colors.background,
    },
    textAreaError: {
        borderColor: theme.colors.error,
    },
    charCountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
    },
    errorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    errorText: {
        fontSize: 12,
        color: theme.colors.error,
    },
    charCount: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        marginLeft: 'auto',
    },
}));
