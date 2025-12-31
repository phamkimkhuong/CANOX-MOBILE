/**
 * CheckoutHeader Component
 * 
 * Simple header with back button and title.
 * Handles safe area insets for status bar.
 */

import { IconSymbol } from '@/components/ui/Icon';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, UnistylesRuntime, useUnistyles } from 'react-native-unistyles';

interface CheckoutHeaderProps {
    title?: string;
    onBack?: () => void;
}

export const CheckoutHeader: React.FC<CheckoutHeaderProps> = ({
    title = 'Thanh toán',
    onBack,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const router = useRouter();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    return (
        <View style={styles.container}>
            {/* Safe Area Spacer */}
            <View style={{ height: UnistylesRuntime.insets.top }} />

            {/* Header Content */}
            <View style={styles.content}>
                <Pressable
                    style={({ pressed }) => [
                        styles.backButton,
                        pressed && styles.backButtonPressed,
                    ]}
                    onPress={handleBack}
                    accessibilityRole="button"
                    accessibilityLabel="Quay lại"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <IconSymbol
                        name="arrow-back"
                        size={24}
                        color={theme.colors.typography}
                    />
                </Pressable>

                <Text style={styles.title}>{title}</Text>

                {/* Placeholder for symmetry */}
                <View style={styles.placeholder} />
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
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.sm,
    },

    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: theme.radius.full,
    },

    backButtonPressed: {
        backgroundColor: theme.colors.background,
    },

    title: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.typography,
        textAlign: 'center',
    },

    placeholder: {
        width: 40,
    },
}));

export default CheckoutHeader;
