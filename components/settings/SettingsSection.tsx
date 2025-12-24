import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface SettingsSectionProps {
    title: string;
    children: React.ReactNode;
}

/**
 * Settings Section Container
 * Groups related settings items with a title header
 */
export const SettingsSection: React.FC<SettingsSectionProps> = memo(({
    title,
    children,
}) => {
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.card}>
                {children}
            </View>
        </View>
    );
});

SettingsSection.displayName = 'SettingsSection';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        marginBottom: theme.margins.lg,
    },
    title: {
        fontSize: 11,
        fontWeight: '700',
        color: theme.colors.secondary,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: theme.margins.smd,
        marginLeft: theme.margins.sm,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
}));
