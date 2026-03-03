import { IconSymbol } from '@/components/ui/Icon';
import { Navigator } from '@/utils/navigation';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export const WishlistLoginPrompt = () => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { t } = useTranslation('wishlist');

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <IconSymbol
                    name="favorite"
                    size={64}
                    color={theme.colors.newPrimary}
                />
                <View style={styles.lockBadge}>
                    <IconSymbol
                        name="lock"
                        size={16}
                        color={'#FFFFFF'}
                    />
                </View>
            </View>
            <Text style={styles.title}>
                {t('guest.title')}
            </Text>
            <Text style={styles.subtitle}>
                {t('guest.subtitle')}
            </Text>

            <Pressable
                onPress={() => Navigator.push('/(auth)/login')}
                style={({ pressed }) => [
                    styles.loginButton,
                    pressed && styles.buttonPressed
                ]}
                accessibilityLabel={t('guest.loginButton')}
                accessibilityRole="button"
            >
                <Text style={styles.loginButtonText}>{t('guest.loginButton')}</Text>
            </Pressable>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.margins.xl,
        paddingBottom: theme.margins.xl * 2,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: theme.colors.primaryMuted,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.margins.lg,
        position: 'relative',
    },
    lockBadge: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.typography,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: theme.colors.background,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.typography,
        marginBottom: theme.margins.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    loginButton: {
        marginTop: theme.margins.xl,
        backgroundColor: theme.colors.newPrimary,
        paddingVertical: theme.margins.md,
        paddingHorizontal: theme.margins.xl * 1.5,
        borderRadius: theme.radius.full,
        elevation: 2,
        shadowColor: theme.colors.newPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    buttonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.96 }],
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
}));
