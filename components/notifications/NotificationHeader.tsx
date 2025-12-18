import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface NotificationHeaderProps {
    onMarkAllRead?: () => void;
}

export const NotificationHeader: React.FC<NotificationHeaderProps> = ({ onMarkAllRead }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.content}>
                <Text style={styles.title}>Thông báo</Text>
                <TouchableOpacity
                    style={styles.markAllButton}
                    onPress={onMarkAllRead}
                    activeOpacity={0.7}
                >
                    <MaterialIcons name="done-all" size={18} color={theme.colors.primary} />
                    <Text style={styles.markAllText}>Đọc tất cả</Text>
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
    markAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
    },
}));
