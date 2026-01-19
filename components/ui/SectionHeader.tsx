import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { IconSymbol } from './Icon';

interface SectionHeaderProps {
    title: string;
    onSeeAll?: () => void;
    seeAllLabel?: string;
}

export const SectionHeader = ({ title, onSeeAll, seeAllLabel }: SectionHeaderProps) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('common');
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            {onSeeAll && (
                <TouchableOpacity
                    style={styles.seeAllBtn}
                    onPress={onSeeAll}
                    accessibilityLabel={seeAllLabel || t('actions.seeAll')}
                >
                    <Text style={styles.seeAllText}>{seeAllLabel || t('actions.seeAll')}</Text>
                    <IconSymbol name="chevron-right" size={16} color={theme.colors.secondary} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.margins.sm,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.typography,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    seeAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    seeAllText: {
        fontSize: 12,
        color: theme.colors.secondary,
        fontWeight: '500',
    },
}));
