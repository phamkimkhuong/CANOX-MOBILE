import { IconSymbol } from '@/components/ui/Icon';
import { Navigator } from '@/utils/navigation';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

/**
 * EmptyState - Component hiển thị khi không có thông báo nào hoặc khi chưa đăng nhập
 * 
 * Hiển thị icon bell và message hướng dẫn hoặc nút đăng nhập.
 */
interface EmptyStateProps {
    filterLabel?: string;
    isAuthenticated?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ filterLabel, isAuthenticated = true }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { t } = useTranslation('notification');

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <IconSymbol
                    name={isAuthenticated ? "notifications" : "notifications-off"}
                    size={64}
                    color={theme.colors.secondary}
                />
            </View>
            <Text style={styles.title}>
                {isAuthenticated ? t('empty.title') : t('authRequired.title')}
            </Text>
            {isAuthenticated && (
                <Text style={styles.subtitle}>
                    {filterLabel
                        ? t('empty.subtitleWithFilter', { filter: filterLabel })
                        : t('empty.subtitle')}
                </Text>
            )}

            {!isAuthenticated && (
                <Pressable
                    onPress={() => Navigator.push('/(auth)/login')}
                    style={({ pressed }) => [
                        styles.loginButton,
                        pressed && styles.buttonPressed
                    ]}
                    accessibilityLabel={t('authRequired.login')}
                    accessibilityRole="button"
                >
                    <Text style={styles.loginButtonText}>{t('authRequired.login')}</Text>
                </Pressable>
            )}
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.margins.xl,
        paddingVertical: theme.margins.xl * 2,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: theme.colors.primaryMuted,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.margins.lg,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.typography,
        marginBottom: theme.margins.sm,
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
    },
    buttonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    loginButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
}));
