import { IconSymbol } from '@/components/ui/Icon';
import { Navigator } from '@/utils/navigation';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

/**
 * ChatEmptyState - Component hiển thị khi không có cuộc trò chuyện nào hoặc khi chưa đăng nhập
 * 
 * Hiển thị icon và message hướng dẫn người dùng bắt đầu trò chuyện hoặc đăng nhập.
 */
interface ChatEmptyStateProps {
    isAuthenticated?: boolean;
}

export const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({ isAuthenticated = true }) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('chat');
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <IconSymbol
                    name={isAuthenticated ? "chat-bubble-outline" : "chatbubble-ellipses-outline"}
                    size={64}
                    color={theme.colors.secondary}
                />
            </View>
            <Text style={styles.title}>
                {isAuthenticated ? t('list.emptyTitle') : t('authRequired.title')}
            </Text>
            {isAuthenticated && (
                <Text style={styles.subtitle}>
                    {t('list.emptySubtitle')}
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
