/**
 * ==============================================
 * CREATE WISHLIST MODAL
 * ==============================================
 * A clean, minimal modal for creating a new wishlist collection.
 * Features:
 * - Text input for collection name
 * - Optional public toggle
 * - Animated entrance/exit
 * - Input validation (empty name not allowed)
 */

import { IconSymbol } from '@/components/ui/Icon';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { toastConfig } from '../ui/feedback/CustomToast';

const MAX_NAME_LENGTH = 100;

interface CreateWishlistModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; isPublic: boolean }) => void;
    isLoading?: boolean;
}

export const CreateWishlistModal: React.FC<CreateWishlistModalProps> = ({
    visible,
    onClose,
    onSubmit,
    isLoading = false,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('wishlist');
    const styles = modalStyles;

    const inputRef = useRef<TextInput>(null);
    const [name, setName] = useState('');
    const [isPublic, setIsPublic] = useState(false);

    // Reset state when modal opens
    useEffect(() => {
        if (visible) {
            setName('');
            setIsPublic(false);
            // Focus input after modal animation
            setTimeout(() => {
                inputRef.current?.focus();
            }, 300);
        }
    }, [visible]);

    const handleSubmit = useCallback(() => {
        const trimmed = name.trim();
        if (!trimmed || isLoading) return;

        Keyboard.dismiss();
        onSubmit({ name: trimmed, isPublic });
    }, [name, isPublic, isLoading, onSubmit]);

    const handleClose = useCallback(() => {
        if (isLoading) return;
        Keyboard.dismiss();
        onClose();
    }, [isLoading, onClose]);

    const isValid = name.trim().length > 0;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {/* Backdrop */}
                <Animated.View
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(150)}
                    style={styles.backdrop}
                >
                    <Pressable
                        style={styles.backdropPressable}
                        onPress={handleClose}
                    />
                </Animated.View>

                {/* Modal Content */}
                <Animated.View
                    entering={FadeIn.duration(250)}
                    exiting={FadeOut.duration(150)}
                    style={styles.container}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerIconWrap}>
                            <IconSymbol name="collections" size={20} color="#fff" />
                        </View>
                        <Text style={styles.headerTitle}>{t('create.title')}</Text>
                        <Pressable
                            style={styles.closeButton}
                            onPress={handleClose}
                            hitSlop={8}
                        >
                            <IconSymbol name="close" size={20} color={theme.colors.typographySecondary} />
                        </Pressable>
                    </View>

                    {/* Name Input */}
                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>{t('create.nameLabel')}</Text>
                        <TextInput
                            ref={inputRef}
                            style={styles.textInput}
                            value={name}
                            onChangeText={setName}
                            placeholder={t('create.namePlaceholder')}
                            placeholderTextColor={theme.colors.typographySecondary}
                            maxLength={MAX_NAME_LENGTH}
                            returnKeyType="done"
                            onSubmitEditing={handleSubmit}
                            autoCapitalize="sentences"
                            editable={!isLoading}
                        />
                        <Text style={styles.charCount}>
                            {name.length}/{MAX_NAME_LENGTH}
                        </Text>
                    </View>

                    {/* Public Toggle */}
                    <View style={styles.toggleRow}>
                        <View style={styles.toggleInfo}>
                            <IconSymbol name="public" size={18} color={theme.colors.typographySecondary} />
                            <View style={styles.toggleTextWrap}>
                                <Text style={styles.toggleLabel}>{t('create.publicLabel')}</Text>
                                <Text style={styles.toggleHint}>{t('create.publicHint')}</Text>
                            </View>
                        </View>
                        <Switch
                            value={isPublic}
                            onValueChange={setIsPublic}
                            trackColor={{
                                false: theme.colors.border,
                                true: theme.colors.newPrimary,
                            }}
                            thumbColor="#fff"
                            disabled={isLoading}
                        />
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <Pressable
                            style={styles.cancelButton}
                            onPress={handleClose}
                            disabled={isLoading}
                        >
                            <Text style={styles.cancelText}>{t('create.cancel')}</Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.submitButton,
                                (!isValid || isLoading) && styles.submitDisabled,
                            ]}
                            onPress={handleSubmit}
                            disabled={!isValid || isLoading}
                        >
                            {isLoading ? (
                                <Text style={styles.submitText}>{t('create.creating')}</Text>
                            ) : (
                                <>
                                    <IconSymbol name="add" size={18} color="#fff" />
                                    <Text style={styles.submitText}>{t('create.submit')}</Text>
                                </>
                            )}
                        </Pressable>
                    </View>
                </Animated.View>

                {/* Local Toast for Modal errors */}
                <Toast config={toastConfig} />
            </KeyboardAvoidingView>
        </Modal>
    );
};

const modalStyles = StyleSheet.create((theme) => ({
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    backdropPressable: {
        flex: 1,
    },
    container: {
        width: '88%',
        maxWidth: 400,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.xl,
        padding: theme.margins.lg,
        ...theme.shadows.large,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.margins.lg,
        gap: theme.margins.smd,
    },
    headerIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.newPrimary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.typography,
        letterSpacing: -0.3,
    },
    closeButton: {
        padding: theme.margins.xs,
    },
    inputSection: {
        marginBottom: theme.margins.md,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.typography,
        marginBottom: theme.margins.sm,
    },
    textInput: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.m,
        paddingHorizontal: theme.margins.smd,
        paddingVertical: theme.margins.smd,
        fontSize: 15,
        color: theme.colors.typography,
        backgroundColor: theme.colors.backgroundNewInput,
    },
    charCount: {
        fontSize: 11,
        color: theme.colors.typographySecondary,
        textAlign: 'right',
        marginTop: theme.margins.xs,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.margins.smd,
        marginBottom: theme.margins.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderMuted,
    },
    toggleInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
    },
    toggleTextWrap: {
        flex: 1,
    },
    toggleLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    toggleHint: {
        fontSize: 11,
        color: theme.colors.typographySecondary,
        marginTop: 1,
    },
    actions: {
        flexDirection: 'row',
        gap: theme.margins.smd,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: theme.margins.smd,
        borderRadius: theme.radius.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    submitButton: {
        flex: 1.5,
        flexDirection: 'row',
        paddingVertical: theme.margins.smd,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.newPrimary,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    submitDisabled: {
        opacity: 0.5,
    },
    submitText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },
}));
