import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface SectionHeaderProps {
    title: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
    const styles = stylesheet;
    const { t } = useTranslation('notification');

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t(`sections.${title}` as any)}</Text>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.backgroundSurface,
        paddingVertical: theme.margins.sm,
        paddingHorizontal: theme.margins.md,
        borderBottomWidth: 1,
        borderBottomColor: 'transparent',
    },
    title: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.typographySecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
}));
