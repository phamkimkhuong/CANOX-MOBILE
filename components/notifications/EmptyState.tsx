import { IconSymbol } from '@/components/ui/Icon';
import React from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

/**
 * EmptyState - Component hiển thị khi không có thông báo nào
 * 
 * Hiển thị icon bell và message hướng dẫn.
 */
interface EmptyStateProps {
    filterLabel?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ filterLabel }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <IconSymbol
                    name="notifications-none"
                    size={64}
                    color={theme.colors.secondary}
                />
            </View>
            <Text style={styles.title}>Không có thông báo</Text>
            <Text style={styles.subtitle}>
                {filterLabel
                    ? `Bạn chưa có thông báo nào trong mục "${filterLabel}"`
                    : 'Bạn chưa có thông báo nào'}
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
