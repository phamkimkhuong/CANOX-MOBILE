/**
 * MessageActionSheet - Bottom Sheet for message actions
 * Displayed when user long-presses on a message
 * 
 * Features:
 * - Recall message (DELETE_FOR_EVERYONE) - only for own messages
 * - Copy message content
 */

import { IconSymbol } from '@/components/ui/Icon';
import { DeleteType } from '@/hooks/api/chat';
import { Message } from '@/types/chat/message';
import {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetModal,
    BottomSheetView
} from '@gorhom/bottom-sheet';
import * as Clipboard from 'expo-clipboard';
import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface MessageActionSheetProps {
    onRecallMessage: (messageId: string, deleteType: DeleteType) => void;
}

export interface MessageActionSheetRef {
    present: (message: Message, isMe: boolean) => void;
    dismiss: () => void;
}

export const MessageActionSheet = forwardRef<MessageActionSheetRef, MessageActionSheetProps>(
    ({ onRecallMessage }, ref) => {
        const { theme } = useUnistyles();
        const styles = stylesheet;
        const insets = useSafeAreaInsets();
        const bottomSheetRef = useRef<BottomSheetModal>(null);
        const [currentMessage, setCurrentMessage] = useState<Message | null>(null);
        const [isMe, setIsMe] = useState(false);

        // Expose methods to parent
        useImperativeHandle(ref, () => ({
            present: (message: Message, isMeParam: boolean) => {
                setCurrentMessage(message);
                setIsMe(isMeParam);
                bottomSheetRef.current?.present();
            },
            dismiss: () => {
                bottomSheetRef.current?.dismiss();
            },
        }));

        // Backdrop component
        const renderBackdrop = useCallback(
            (props: BottomSheetBackdropProps) => (
                <BottomSheetBackdrop
                    {...props}
                    appearsOnIndex={0}
                    disappearsOnIndex={-1}
                    opacity={0.3}
                />
            ),
            []
        );

        // Handle copy message
        const handleCopy = useCallback(async () => {
            if (!currentMessage) return;

            const content = currentMessage.content;
            if (content) {
                await Clipboard.setStringAsync(content);
                Toast.show({
                    type: 'success',
                    text1: 'Đã sao chép',
                    visibilityTime: 1500,
                });
            }
            bottomSheetRef.current?.dismiss();
        }, [currentMessage]);

        // Handle recall message (DELETE_FOR_EVERYONE)
        const handleRecall = useCallback(() => {
            if (!currentMessage) return;

            onRecallMessage(currentMessage.id, 'DELETE_FOR_EVERYONE');
            bottomSheetRef.current?.dismiss();
        }, [currentMessage, onRecallMessage]);

        const isDeleted = currentMessage?.isDeleted;

        return (
            <BottomSheetModal
                ref={bottomSheetRef}
                enableDynamicSizing
                enablePanDownToClose
                backdropComponent={renderBackdrop}
                handleIndicatorStyle={styles.indicator}
                backgroundStyle={styles.background}
            >
                <BottomSheetView style={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                    {/* Copy Action - Always available for text messages */}
                    {!isDeleted && currentMessage?.type === 'TEXT' && (
                        <Pressable
                            style={({ pressed }) => [
                                styles.actionItem,
                                pressed && styles.actionItemPressed
                            ]}
                            onPress={handleCopy}
                        >
                            <View style={[styles.iconCircle, { backgroundColor: theme.colors.primaryMuted }]}>
                                <IconSymbol name="content-copy" size={20} color={theme.colors.primary} />
                            </View>
                            <Text style={styles.actionText}>Sao chép</Text>
                        </Pressable>
                    )}

                    {/* Recall Action - Only for own messages that haven't been deleted */}
                    {isMe && !isDeleted && (
                        <Pressable
                            style={({ pressed }) => [
                                styles.actionItem,
                                pressed && styles.actionItemPressed
                            ]}
                            onPress={handleRecall}
                        >
                            <View style={[styles.iconCircle, { backgroundColor: theme.colors.warningSoft }]}>
                                <IconSymbol name="undo" size={20} color={theme.colors.warning} />
                            </View>
                            <View style={styles.actionContent}>
                                <Text style={styles.actionText}>Thu hồi tin nhắn</Text>
                                <Text style={styles.actionSubtext}>Tin nhắn sẽ bị xóa với tất cả mọi người</Text>
                            </View>
                        </Pressable>
                    )}

                    {/* Cancel */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.cancelButton,
                            pressed && styles.cancelButtonPressed
                        ]}
                        onPress={() => bottomSheetRef.current?.dismiss()}
                    >
                        <Text style={styles.cancelText}>Hủy</Text>
                    </Pressable>
                </BottomSheetView>
            </BottomSheetModal>
        );
    }
);

const stylesheet = StyleSheet.create((theme) => ({
    background: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    indicator: {
        backgroundColor: theme.colors.border,
        width: 40,
    },
    content: {
        paddingHorizontal: theme.margins.md,
        paddingTop: theme.margins.sm,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.margins.smd,
        paddingHorizontal: theme.margins.sm,
        borderRadius: theme.radius.m,
        gap: 14,
    },
    actionItemPressed: {
        backgroundColor: theme.colors.primaryMuted,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionContent: {
        flex: 1,
        gap: 2,
    },
    actionText: {
        fontSize: 15,
        fontWeight: '500',
        color: theme.colors.typography,
    },
    actionSubtext: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
    },
    cancelButton: {
        marginTop: theme.margins.sm,
        paddingVertical: theme.margins.smd,
        alignItems: 'center',
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.backgroundInput,
    },
    cancelButtonPressed: {
        backgroundColor: theme.colors.secondaryLight,
    },
    cancelText: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.typographySecondary,
    },
}));
