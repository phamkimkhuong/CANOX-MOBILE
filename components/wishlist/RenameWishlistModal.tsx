/**
 * ==============================================
 * RENAME WISHLIST MODAL - Simple Text Input
 * ==============================================
 * Lightweight modal for renaming a wishlist collection.
 * Reuses the same design language as CreateWishlistModal.
 */

import { IconSymbol } from '@/components/ui/Icon';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Animated,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { toastConfig } from '../ui/feedback/CustomToast';

const MAX_NAME_LENGTH = 100;

interface RenameWishlistModalProps {
    visible: boolean;
    currentName: string;
    onClose: () => void;
    onSubmit: (newName: string) => void;
    isLoading?: boolean;
}

export const RenameWishlistModal: React.FC<RenameWishlistModalProps> = ({
    visible,
    currentName,
    onClose,
    onSubmit,
    isLoading = false,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('wishlist');
    const styles = modalStyles;
    const inputRef = useRef<TextInput>(null);

    const [name, setName] = useState(currentName);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    // Reset name when modal opens with new currentName
    useEffect(() => {
        if (visible) {
            setName(currentName);
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 65,
                    friction: 10,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                // Auto-focus input after animation
                setTimeout(() => inputRef.current?.focus(), 100);
            });
        } else {
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.9);
        }
    }, [visible, currentName, fadeAnim, scaleAnim]);

    const trimmedName = name.trim();
    const isValid = trimmedName.length > 0 && trimmedName !== currentName;

    const handleSubmit = useCallback(() => {
        if (!isValid || isLoading) return;
        onSubmit(trimmedName);
    }, [isValid, isLoading, trimmedName, onSubmit]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {/* Backdrop */}
                <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
                    <Pressable style={styles.backdropPressable} onPress={onClose} />
                </Animated.View>

                {/* Content */}
                <Animated.View
                    style={[
                        styles.container,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerIconWrap}>
                            <IconSymbol name="edit" size={18} color="#fff" />
                        </View>
                        <Text style={styles.headerTitle}>{t('manage.rename')}</Text>
                        <Pressable style={styles.closeButton} onPress={onClose} hitSlop={8}>
                            <IconSymbol name="close" size={20} color={theme.colors.typographySecondary} />
                        </Pressable>
                    </View>

                    {/* Input */}
                    <View style={styles.inputSection}>
                        <TextInput
                            ref={inputRef}
                            style={styles.textInput}
                            value={name}
                            onChangeText={(text) => setName(text.slice(0, MAX_NAME_LENGTH))}
                            maxLength={MAX_NAME_LENGTH}
                            placeholder={t('create.namePlaceholder')}
                            placeholderTextColor={theme.colors.typographySecondary}
                            returnKeyType="done"
                            onSubmitEditing={handleSubmit}
                            selectTextOnFocus
                        />
                        <Text style={styles.charCount}>
                            {name.length}/{MAX_NAME_LENGTH}
                        </Text>
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <Pressable
                            style={styles.cancelButton}
                            onPress={onClose}
                        >
                            <Text style={styles.cancelText}>{t('manage.cancel')}</Text>
                        </Pressable>

                        <Pressable
                            style={[styles.submitButton, (!isValid || isLoading) && styles.submitDisabled]}
                            onPress={handleSubmit}
                            disabled={!isValid || isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <IconSymbol name="check" size={18} color="#fff" />
                                    <Text style={styles.submitText}>{t('manage.renameConfirm')}</Text>
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
