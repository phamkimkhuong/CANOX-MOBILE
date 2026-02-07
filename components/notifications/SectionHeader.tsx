import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface SectionHeaderProps {
    title: string;
}

export const SectionHeader = memo<SectionHeaderProps>(({ title }) => {
    const styles = stylesheet;
    const { t } = useTranslation('notification');

    return (
        <View style={styles.container}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Text style={styles.title}>{t(`sections.${title}` as any)}</Text>
        </View>
    );
});

SectionHeader.displayName = 'SectionHeader';

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
