import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export default function ProfileSettingsScreen() {
    const { t } = useTranslation('profile');
    return (
        <View style={styles.container}>
            <Text>{t('settings.items.profile')}</Text>
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
}));
