import { IconSymbol } from '@/components/ui/Icon';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

/**
 * ChatEmptyState - Component hiển thị khi không có cuộc trò chuyện nào
 * 
 * Hiển thị icon và message hướng dẫn người dùng bắt đầu trò chuyện.
 */
export const ChatEmptyState: React.FC = () => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('chat');
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <IconSymbol
                    name="chat-bubble-outline"
                    size={64}
                    color={theme.colors.secondary}
                />
            </View>
            <Text style={styles.title}>{t('list.emptyTitle')}</Text>
            <Text style={styles.subtitle}>
                {t('list.emptySubtitle')}
            </Text>
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
}));
