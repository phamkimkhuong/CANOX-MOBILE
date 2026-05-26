import { IconSymbol } from '@/components/ui/Icon';
import { toastConfig } from '@/components/ui/feedback/CustomToast';
import { redirectToStoreReview } from '@/utils/rateApp';
import * as Haptics from 'expo-haptics';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface RateAppModalProps {
    visible: boolean;
    onClose: () => void;
}

type ModalStage = 'rating' | 'feedback' | 'redirect';

export const RateAppModal: React.FC<RateAppModalProps> = memo(({ visible, onClose }) => {
    const { theme } = useUnistyles();
    const { i18n } = useTranslation('common');
    const styles = modalStyles;

    const [rating, setRating] = useState<number>(0);
    const [stage, setStage] = useState<ModalStage>('rating');
    const [feedbackText, setFeedbackText] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const inputRef = useRef<TextInput>(null);

    const isVi = i18n.language?.startsWith('vi');
    const getText = useCallback((vi: string, en: string) => (isVi ? vi : en), [isVi]);

    // Reset state when modal opens
    useEffect(() => {
        if (visible) {
            setRating(0);
            setStage('rating');
            setFeedbackText('');
            setIsSubmitting(false);
        }
    }, [visible]);

    // Stage 1: Star Press Handler
    const handleStarPress = useCallback((selectedRating: number) => {
        setRating(selectedRating);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => { });

        // Delay slightly for smooth visual feedback before stage transition
        setTimeout(() => {
            if (selectedRating >= 4) {
                setStage('redirect');
            } else {
                setStage('feedback');
                // Auto-focus input on next frame
                setTimeout(() => {
                    inputRef.current?.focus();
                }, 100);
            }
        }, 320);
    }, []);

    // Dismiss Modal safely
    const handleClose = useCallback(() => {
        if (isSubmitting) return;
        Keyboard.dismiss();
        onClose();
    }, [isSubmitting, onClose]);

    // Stage 2 (Positive): Redirect to App Store Review
    const handleRedirect = useCallback(async () => {
        handleClose();
        // Redirect directly in Option B (Deep Linking)
        await redirectToStoreReview();
    }, [handleClose]);

    // Stage 2 (Negative): Submit Internal Feedback Form
    const handleFeedbackSubmit = useCallback(() => {
        if (isSubmitting) return;
        const text = feedbackText.trim();
        if (!text) return;

        setIsSubmitting(true);
        Keyboard.dismiss();

        // Simulate sending feedback payload to support backend
        setTimeout(() => {
            setIsSubmitting(false);
            onClose();

            // Display a beautiful Success Toast
            Toast.show({
                type: 'success',
                text1: getText('Cảm ơn đóng góp của bạn!', 'Thank you for your feedback!'),
                text2: getText(
                    'Ý kiến của bạn đã được chuyển tới CSKH CanoX.',
                    'Your input has been sent to CanoX support.'
                ),
                visibilityTime: 3000,
            });
        }, 1000);
    }, [feedbackText, isSubmitting, onClose, getText]);

    const isFeedbackValid = feedbackText.trim().length > 0;

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
                {/* Backdrop Overlay */}
                <Animated.View
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(150)}
                    style={styles.backdrop}
                >
                    <Pressable style={styles.backdropPressable} onPress={handleClose} />
                </Animated.View>

                {/* Centered Modal Card */}
                <Animated.View
                    entering={FadeIn.duration(250)}
                    exiting={FadeOut.duration(150)}
                    style={styles.container}
                >
                    {/* STAGE 1: Star Rating */}
                    {stage === 'rating' && (
                        <View style={styles.contentWrap}>
                            <View style={styles.iconCircleWrap}>
                                <IconSymbol name="star" size={24} color="#FFF" />
                            </View>
                            <Text style={styles.title}>
                                {getText('Đánh giá CanoX', 'Rate CanoX')}
                            </Text>
                            <Text style={styles.subtitle}>
                                {getText(
                                    'Trải nghiệm của bạn với CanoX như thế nào?',
                                    'How is your experience with CanoX so far?'
                                )}
                            </Text>

                            {/* Stars Row */}
                            <View style={styles.starsRow}>
                                {[1, 2, 3, 4, 5].map((starIndex) => {
                                    const isFilled = starIndex <= rating;
                                    return (
                                        <Pressable
                                            key={starIndex}
                                            onPress={() => handleStarPress(starIndex)}
                                            style={styles.starTouch}
                                            hitSlop={4}
                                        >
                                            <IconSymbol
                                                name={isFilled ? 'star-fill' : 'star-outline'}
                                                size={36}
                                                color={isFilled ? '#FACC15' : theme.colors.typographySecondary}
                                            />
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    {/* STAGE 2: Redirect to Store Review (4-5 Stars) */}
                    {stage === 'redirect' && (
                        <View style={styles.contentWrap}>
                            <View style={[styles.iconCircleWrap, styles.iconCircleLove]}>
                                <IconSymbol name="favorite" size={24} color="#FFF" />
                            </View>
                            <Text style={styles.title}>
                                {getText('Tuyệt vời!', 'Wonderful!')}
                            </Text>
                            <Text style={styles.subtitle}>
                                {getText(
                                    'Bạn có muốn dành 1 phút để chia sẻ niềm vui này lên Store không?',
                                    'Would you like to take 1 minute to share your love on the Store?'
                                )}
                            </Text>

                            {/* Two Actions Buttons */}
                            <View style={styles.actions}>
                                <Pressable style={styles.cancelButton} onPress={handleClose}>
                                    <Text style={styles.cancelText}>
                                        {getText('Để sau', 'Later')}
                                    </Text>
                                </Pressable>

                                <Pressable style={styles.submitButton} onPress={handleRedirect}>
                                    <IconSymbol name="star-fill" size={16} color="#FFF" />
                                    <Text style={styles.submitText}>
                                        {getText('Đánh giá ngay', 'Rate Now')}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    )}

                    {/* STAGE 2: Internal Feedback Form (1-3 Stars) */}
                    {stage === 'feedback' && (
                        <View style={styles.contentWrap}>
                            <View style={[styles.iconCircleWrap, styles.iconCircleSupport]}>
                                <IconSymbol name="headset" size={24} color="#FFF" />
                            </View>
                            <Text style={styles.title}>
                                {getText('Chúng tôi rất tiếc!', 'We are sorry!')}
                            </Text>
                            <Text style={styles.subtitle}>
                                {getText(
                                    'CanoX chân thành xin lỗi vì trải nghiệm chưa trọn vẹn này. Hãy chia sẻ thêm để chúng tôi cải thiện nhé!',
                                    'CanoX sincerely apologizes for this imperfect experience. Please share your thoughts to help us improve!'
                                )}
                            </Text>

                            {/* Multiline input */}
                            <View style={styles.inputSection}>
                                <TextInput
                                    ref={inputRef}
                                    style={styles.feedbackInput}
                                    value={feedbackText}
                                    onChangeText={setFeedbackText}
                                    placeholder={getText(
                                        'Nhập ý kiến đóng góp của bạn tại đây...',
                                        'Type your feedback here...'
                                    )}
                                    placeholderTextColor={theme.colors.typographySecondary}
                                    multiline
                                    numberOfLines={4}
                                    maxLength={300}
                                    editable={!isSubmitting}
                                />
                                <Text style={styles.charCount}>
                                    {feedbackText.length}/300
                                </Text>
                            </View>

                            {/* Actions */}
                            <View style={styles.actions}>
                                <Pressable
                                    style={styles.cancelButton}
                                    onPress={handleClose}
                                    disabled={isSubmitting}
                                >
                                    <Text style={styles.cancelText}>
                                        {getText('Hủy', 'Cancel')}
                                    </Text>
                                </Pressable>

                                <Pressable
                                    style={[
                                        styles.submitButton,
                                        (!isFeedbackValid || isSubmitting) && styles.submitDisabled,
                                    ]}
                                    onPress={handleFeedbackSubmit}
                                    disabled={!isFeedbackValid || isSubmitting}
                                >
                                    <Text style={styles.submitText}>
                                        {isSubmitting
                                            ? getText('Đang gửi...', 'Sending...')
                                            : getText('Gửi đóng góp', 'Send Feedback')}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    )}
                </Animated.View>

                {/* Custom Toast inside Modal Context */}
                <Toast config={toastConfig} />
            </KeyboardAvoidingView>
        </Modal>
    );
});

RateAppModal.displayName = 'RateAppModal';

const modalStyles = StyleSheet.create((theme) => ({
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
    },
    backdropPressable: {
        flex: 1,
    },
    container: {
        width: '86%',
        maxWidth: 380,
        backgroundColor: theme.colors.surface,
        borderRadius: 24,
        padding: theme.margins.lg,
        ...theme.shadows.large,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
    },
    contentWrap: {
        alignItems: 'center',
        width: '100%',
    },
    iconCircleWrap: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: theme.colors.newPrimary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.margins.md,
    },
    iconCircleLove: {
        backgroundColor: '#EF4444',
    },
    iconCircleSupport: {
        backgroundColor: '#F59E0B',
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: theme.colors.typography,
        marginBottom: theme.margins.xs,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 13,
        lineHeight: 18,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
        marginBottom: theme.margins.md,
        paddingHorizontal: theme.margins.xs,
    },
    starsRow: {
        flexDirection: 'row',
        gap: theme.margins.smd,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: theme.margins.sm,
        width: '100%',
    },
    starTouch: {
        padding: theme.margins.xs,
    },
    inputSection: {
        width: '100%',
        marginBottom: theme.margins.md,
    },
    feedbackInput: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 16,
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.sm,
        fontSize: 14,
        color: theme.colors.typography,
        backgroundColor: theme.colors.backgroundNewInput,
        height: 100,
        textAlignVertical: 'top',
    },
    charCount: {
        fontSize: 11,
        color: theme.colors.typographySecondary,
        textAlign: 'right',
        marginTop: 4,
    },
    actions: {
        flexDirection: 'row',
        gap: theme.margins.smd,
        width: '100%',
        marginTop: theme.margins.sm,
    },
    cancelButton: {
        flex: 1,
        height: 48,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelText: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    submitButton: {
        flex: 1.3,
        height: 48,
        borderRadius: 14,
        backgroundColor: theme.colors.newPrimary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    submitDisabled: {
        opacity: 0.5,
    },
    submitText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#FFF',
    },
}));
