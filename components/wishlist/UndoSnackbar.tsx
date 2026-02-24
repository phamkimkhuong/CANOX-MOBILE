/**
 * ==============================================
 * UNDO SNACKBAR - Wishlist Remove with Undo
 * ==============================================
 * Spotify-style snackbar with undo capability.
 * Uses Reanimated for smooth slide-in/slide-out animation.
 */

import { IconSymbol } from '@/components/ui/Icon';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import Animated, {
    FadeIn,
    FadeOut
} from 'react-native-reanimated';
import { StyleSheet, UnistylesRuntime, useUnistyles } from 'react-native-unistyles';

const SNACKBAR_DURATION = 4000; // 4 seconds to undo

interface UndoSnackbarProps {
    /** Whether snackbar is visible */
    visible: boolean;
    /** Name of the removed product */
    productName: string;
    /** Called when user taps Undo */
    onUndo: () => void;
    /** Called when snackbar auto-dismisses (time to actually delete) */
    onDismiss: () => void;
}

export const UndoSnackbar: React.FC<UndoSnackbarProps> = ({
    visible,
    productName,
    onUndo,
    onDismiss,
}) => {
    const { t } = useTranslation('wishlist');
    const { theme } = useUnistyles();
    const styles = snackbarStyles;
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Auto-dismiss timer
    useEffect(() => {
        if (visible) {
            timerRef.current = setTimeout(() => {
                onDismiss();
            }, SNACKBAR_DURATION);
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [visible, onDismiss]);

    const handleUndo = useCallback(() => {
        // Clear the auto-dismiss timer
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onUndo();
    }, [onUndo]);

    if (!visible) return null;

    // Truncate long product names
    const displayName = productName.length > 30
        ? `${productName.substring(0, 30)}...`
        : productName;

    return (
        <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={styles.wrapper}
        >
            <View style={styles.container}>
                {/* Icon + Message */}
                <View style={styles.messageSection}>
                    <IconSymbol
                        name="check-circle"
                        size={20}
                        color={theme.colors.onPrimary}
                    />
                    <Text style={styles.message} numberOfLines={1}>
                        {t('snackbar.removed', { name: displayName })}
                    </Text>
                </View>

                {/* Undo Button */}
                <Pressable
                    style={({ pressed }) => [
                        styles.undoButton,
                        pressed && styles.undoPressed,
                    ]}
                    onPress={handleUndo}
                    hitSlop={12}
                >
                    <Text style={styles.undoText}>
                        {t('snackbar.undo')}
                    </Text>
                </Pressable>
            </View>
        </Animated.View>
    );
};

const snackbarStyles = StyleSheet.create((theme) => ({
    wrapper: {
        position: 'absolute',
        bottom: UnistylesRuntime.insets.bottom + 16,
        left: theme.margins.md,
        right: theme.margins.md,
        zIndex: 9999,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#323232',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.smd,
        borderRadius: theme.radius.l,
        ...theme.shadows.medium,
        gap: theme.margins.sm,
    },
    messageSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
    },
    message: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.onPrimary ?? '#FFFFFF',
    },
    undoButton: {
        paddingHorizontal: theme.margins.smd,
        paddingVertical: theme.margins.sm,
        borderRadius: theme.radius.m,
    },
    undoPressed: {
        opacity: 0.7,
    },
    undoText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#60A5FA',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
}));
