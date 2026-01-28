/**
 * ==============================================
 * ANONYMOUS TOGGLE - Đánh giá ẩn danh
 * ==============================================
 * Toggle switch for anonymous review
 * 
 * NOTE: Currently commented out as API doesn't support isAnonymous yet.
 * Uncomment when backend adds support.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface AnonymousToggleProps {
    /** Current value */
    value: boolean;
    /** Callback when toggled */
    onChange: (value: boolean) => void;
    /** User's display name (for preview) */
    displayName?: string;
}

/**
 * Mask username for anonymous display
 * "Nguyễn Văn A" -> "N*****A"
 */
const maskUsername = (name: string): string => {
    if (!name || name.length < 2) return '***';
    const first = name.charAt(0);
    const last = name.charAt(name.length - 1);
    return `${first}*****${last}`;
};

/**
 * AnonymousToggle - Switch for anonymous review mode
 * 
 * TODO: Enable when API supports isAnonymous field
 */
export const AnonymousToggle: React.FC<AnonymousToggleProps> = ({
    value,
    onChange,
    displayName = 'Người dùng',
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { t } = useTranslation(['myReviews']);

    const maskedName = maskUsername(displayName);

    // ============================================
    // TEMPORARILY DISABLED - API NOT READY
    // Remove this return when API supports isAnonymous
    // ============================================
    return null;

    // ============================================
    // UNCOMMENT BELOW WHEN API IS READY
    // ============================================
    /*
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconWrapper}>
                    <IconSymbol
                        name="eye-off"
                        size={20}
                        color={value ? theme.colors.primary : theme.colors.secondary}
                    />
                </View>

                <View style={styles.textWrapper}>
                    <Text style={styles.label}>{t('form.anonymousTitle')}</Text>
                    <Text style={styles.hint}>
                        {value
                            ? t('form.anonymousMasked', { name: maskedName })
                            : t('form.anonymousVisible', { name: displayName })}
                    </Text>
                </View>
            </View>

            <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{
                    false: theme.colors.secondaryLight,
                    true: theme.colors.primarySoft,
                }}
                thumbColor={value ? theme.colors.primary : theme.colors.surface}
            />
        </View>
    );
    */
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.background,
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.smd,
        borderRadius: theme.radius.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.smd,
        flex: 1,
    },
    iconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.primaryMuted,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textWrapper: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    hint: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        marginTop: 2,
    },
}));

export default AnonymousToggle;
