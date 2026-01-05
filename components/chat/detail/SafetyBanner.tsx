/**
 * SafetyBanner - Warning banner to prevent fraud
 * Shows at the top of chat, below header
 */

import { IconSymbol } from '@/components/ui/Icon';
import React from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface SafetyBannerProps {
    onClose?: () => void;
}

/**
 * SafetyBanner - Scam warning banner
 * Required by e-commerce platforms for legal protection
 */
export const SafetyBanner: React.FC<SafetyBannerProps> = ({ onClose }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            <IconSymbol name="warning" size={14} color={theme.colors.warning} />
            <Text style={styles.text} numberOfLines={1}>
                Không giao dịch ngoài ứng dụng để tránh lừa đảo
            </Text>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(249, 115, 22, 0.08)',
        paddingHorizontal: theme.margins.md,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(249, 115, 22, 0.15)',
    },
    text: {
        flex: 1,
        fontSize: 12,
        color: theme.colors.warning,
        fontWeight: '500',
    },
}));

export default SafetyBanner;
