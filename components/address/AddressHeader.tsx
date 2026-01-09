/**
 * AddressHeader - Header cho màn hình Address
 * 
 * Responsive header với back button và title
 */

import { IconSymbol } from '@/components/ui/Icon';
import { Navigator } from '@/utils/navigation';
import { router } from 'expo-router';
import React, { memo, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface AddressHeaderProps {
    title: string;
    showBack?: boolean;
    onBack?: () => void;
}

// ============================================
// COMPONENT
// ============================================

export const AddressHeader: React.FC<AddressHeaderProps> = memo(({
    title,
    showBack = true,
    onBack,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const insets = useSafeAreaInsets();

    const handleBack = useCallback(() => {
        if (onBack) {
            onBack();
        } else if (router.canGoBack()) {
            Navigator.back();
        }
    }, [onBack]);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.content}>
                {/* Back Button */}
                {showBack ? (
                    <Pressable
                        onPress={handleBack}
                        style={styles.backButton}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel="Quay lại"
                    >
                        <IconSymbol
                            name="back"
                            size={24}
                            color={theme.colors.typography}
                        />
                    </Pressable>
                ) : (
                    <View style={styles.placeholder} />
                )}

                {/* Title */}
                <Text style={styles.title} numberOfLines={1}>
                    {title}
                </Text>

                {/* Right placeholder for symmetry */}
                <View style={styles.placeholder} />
            </View>
        </View>
    );
});

AddressHeader.displayName = 'AddressHeader';

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
        paddingVertical: theme.margins.smd,
        minHeight: 52,
    },
    backButton: {
        padding: theme.margins.sm,
        marginLeft: -theme.margins.sm,
    },
    title: {
        flex: 1,
        fontSize: 17,
        fontWeight: '600',
        color: theme.colors.typography,
        textAlign: 'center',
        paddingHorizontal: theme.margins.md,
    },
    placeholder: {
        width: 32,
    },
}));
