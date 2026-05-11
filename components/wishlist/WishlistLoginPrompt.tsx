import { IconSymbol } from '@/components/ui/Icon';
import { WishlistHeroArtwork } from '@/components/wishlist/WishlistHeroArtwork';
import { ROUTES } from '@/constants/routes';
import { Navigator } from '@/utils/navigation';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export const WishlistLoginPrompt = () => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { t } = useTranslation('wishlist');

    const handleLogin = useCallback(() => {
        Navigator.push(ROUTES.AUTH.LOGIN);
    }, []);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.card}>
                <WishlistHeroArtwork variant="guest" style={styles.hero} />

                <View style={styles.copyBlock}>
                    <Text style={styles.title}>
                        {t('guest.title')}
                    </Text>
                    <Text style={styles.subtitle}>
                        {t('guest.subtitle')}
                    </Text>
                </View>

                <Pressable
                    onPress={handleLogin}
                    style={({ pressed }) => [
                        styles.loginButtonPressable,
                        pressed && styles.buttonPressed,
                    ]}
                    accessibilityLabel={t('guest.loginButton')}
                    accessibilityRole="button"
                >
                    <LinearGradient
                        colors={[theme.colors.newPrimary, theme.colors.vibrantRed]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.loginButton}
                    >
                        <Text style={styles.loginButtonText}>
                            {t('guest.loginButton')}
                        </Text>
                        <IconSymbol
                            name="chevron-right"
                            size={22}
                            color={theme.colors.onPrimary}
                        />
                    </LinearGradient>
                </Pressable>
            </View>
        </ScrollView>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    content: {
        flexGrow: 1,
        paddingHorizontal: theme.margins.smd,
        paddingTop: theme.margins.md,
        paddingBottom: theme.margins.xxl,
    },
    card: {
        borderRadius: theme.radius.l,
        borderWidth: 1,
        borderColor: theme.colors.borderMuted,
        backgroundColor: theme.colors.surface,
        overflow: 'hidden',
        paddingHorizontal: theme.margins.md,
        paddingTop: theme.margins.xs,
        paddingBottom: theme.margins.lg,
    },
    hero: {
        marginHorizontal: -theme.margins.md,
    },
    copyBlock: {
        alignItems: 'center',
        marginTop: -theme.margins.sm,
        paddingHorizontal: theme.margins.lg,
    },
    title: {
        fontSize: theme.fontSizes.xl,
        lineHeight: 28,
        fontWeight: '800',
        color: theme.colors.inkBlack,
        textAlign: 'center',
        marginBottom: theme.margins.sm,
    },
    subtitle: {
        fontSize: theme.fontSizes.sm,
        lineHeight: 20,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
    },
    loginButtonPressable: {
        width: '78%',
        alignSelf: 'center',
        marginTop: theme.margins.lg,
        borderRadius: theme.radius.full,
        ...theme.shadows.medium,
    },
    loginButton: {
        minHeight: 44,
        borderRadius: theme.radius.full,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.margins.sm,
        paddingHorizontal: theme.margins.lg,
    },
    buttonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    loginButtonText: {
        color: theme.colors.onPrimary,
        fontSize: theme.fontSizes.md,
        fontWeight: '800',
    },
}));
