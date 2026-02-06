import { IconSymbol } from '@/components/ui/Icon';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

interface PushNotificationSoftAskProps {
    isVisible: boolean;
    onClose: () => void;
    onAccept: () => void;
}

export const PushNotificationSoftAsk: React.FC<PushNotificationSoftAskProps> = ({
    isVisible,
    onClose,
    onAccept,
}) => {
    const { t } = useTranslation(['notification']);
    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Animated.View
                    entering={FadeIn}
                    exiting={FadeOut}
                    style={StyleSheet.absoluteFill}
                >
                    <Pressable style={styles.backdrop} onPress={onClose} />
                </Animated.View>

                <Animated.View
                    entering={ZoomIn.duration(300)}
                    exiting={ZoomOut.duration(200)}
                    style={styles.modalContent}
                >
                    {/* Header Icon */}
                    <View style={styles.iconContainer}>
                        <View style={styles.iconCircle}>
                            <IconSymbol name="notifications-active" size={40} color="#ef4444" />
                        </View>
                    </View>

                    {/* Content */}
                    <Text style={styles.title}>{t('softAsk.title')}</Text>
                    <Text style={styles.description}>
                        {t('softAsk.description')}
                    </Text>

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <Pressable
                            style={({ pressed }) => [styles.buttonSecondary, pressed && styles.buttonPressed]}
                            onPress={onClose}
                        >
                            <Text style={styles.buttonTextSecondary}>{t('softAsk.later')}</Text>
                        </Pressable>

                        <Pressable
                            style={({ pressed }) => [styles.buttonPrimary, pressed && styles.buttonPressed]}
                            onPress={onAccept}
                        >
                            <Text style={styles.buttonTextPrimary}>{t('softAsk.accept')}</Text>
                        </Pressable>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create((theme) => ({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.margins.xl,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '100%',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.xl,
        padding: theme.margins.xl,
        alignItems: 'center',
        ...theme.shadows.large,
    },
    iconContainer: {
        marginBottom: theme.margins.lg,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fee2e2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.typography,
        marginBottom: theme.margins.sm,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: theme.margins.xl,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: theme.margins.md,
    },
    buttonPrimary: {
        flex: 1,
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.margins.md,
        borderRadius: theme.radius.xl,
        alignItems: 'center',
    },
    buttonSecondary: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingVertical: theme.margins.md,
        borderRadius: theme.radius.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    buttonTextPrimary: {
        color: theme.colors.surface,
        fontSize: 16,
        fontWeight: '600',
    },
    buttonTextSecondary: {
        color: theme.colors.typographySecondary,
        fontSize: 16,
        fontWeight: '600',
    },
    buttonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
}));
