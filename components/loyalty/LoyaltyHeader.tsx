/**
 * LoyaltyHeader - Header chung cho Loyalty screens
 */

import { IconSymbol } from '@/components/ui/Icon';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, UnistylesRuntime, useUnistyles } from 'react-native-unistyles';

interface LoyaltyHeaderProps {
    onBack: () => void;
    title?: string;
}

export const LoyaltyHeader: React.FC<LoyaltyHeaderProps> = ({ onBack, title }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { t } = useTranslation('loyalty');

    return (
        <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={onBack}>
                <IconSymbol name="back" size={24} color={theme.colors.typography} />
            </Pressable>
            <Text style={styles.headerTitle}>{title ?? t('title')}</Text>
            <View style={styles.headerSpacer} />
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: UnistylesRuntime.insets.top,
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.sm,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    backButton: {
        padding: theme.margins.sm,
        marginLeft: -theme.margins.sm,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.typography,
        marginLeft: theme.margins.sm,
    },
    headerSpacer: {
        width: 40,
    },
}));
