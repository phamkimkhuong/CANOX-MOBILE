import { IconSymbol } from '@/components/ui/Icon';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

/**
 * NotificationHeader - Header cho màn hình thông báo
 * 
 * Bao gồm title và nút "Đọc tất cả" để mark all notifications as read.
 */
interface NotificationHeaderProps {
    onMarkAllRead?: () => void;
    isMarkingAll?: boolean; // Trạng thái loading khi đang đánh dấu tất cả
}

export const NotificationHeader: React.FC<NotificationHeaderProps> = ({
    onMarkAllRead,
    isMarkingAll = false,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const insets = useSafeAreaInsets();
    const { t } = useTranslation('notification');

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.content}>
                <Text style={styles.title}>{t('header.title')}</Text>
                <TouchableOpacity
                    style={[styles.markAllButton, isMarkingAll && styles.markAllButtonDisabled]}
                    onPress={onMarkAllRead}
                    activeOpacity={0.7}
                    disabled={isMarkingAll} // Disable khi đang loading
                >
                    <IconSymbol
                        name="done-all"
                        size={18}
                        color={isMarkingAll ? theme.colors.secondary : theme.colors.primary}
                    />
                    <Text style={[
                        styles.markAllText,
                        isMarkingAll && styles.markAllTextDisabled
                    ]}>
                        {t('header.markAllRead')}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        height: 56,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.typography,
        letterSpacing: -0.3,
    },
    markAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    markAllButtonDisabled: {
        opacity: 0.6,
    },
    markAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    markAllTextDisabled: {
        color: theme.colors.secondary,
    },
}));
