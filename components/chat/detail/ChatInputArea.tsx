/**
 * ChatInputArea - Input area with dynamic buttons
 * Handles text input, send button, emoji picker and attachment options
 */

import { IconSymbol } from '@/components/ui/Icon';
import React, { useCallback, useRef, useState } from 'react';
import {
    Keyboard,
    Platform,
    Pressable,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useKeyboardState } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import EmojiPicker, { type EmojiType } from 'rn-emoji-keyboard';

interface ChatInputAreaProps {
    onSend: (text: string) => void;
    onAttachment?: () => void;
    placeholder?: string;
    disabled?: boolean;
    maxLength?: number;
}

/**
 * ChatInputArea - Smart input with dynamic send button and emoji picker
 * 
 * Features:
 * - Emoji picker using rn-emoji-keyboard
 * - Dynamic send button (appears when text is entered)
 * - Attachment menu trigger
 */
export const ChatInputArea: React.FC<ChatInputAreaProps> = ({
    onSend,
    onAttachment,
    placeholder = 'Nhập tin nhắn...',
    disabled = false,
    maxLength = 1000,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const insets = useSafeAreaInsets();
    const inputRef = useRef<TextInput>(null);

    const { isVisible: isKeyboardVisible } = useKeyboardState();

    const [text, setText] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

    const hasText = text.trim().length > 0;
    const bottomPadding = isKeyboardVisible ? 8 : Math.max(insets.bottom, 12);

    const handleInputContainerPress = useCallback(() => {
        inputRef.current?.focus();
    }, []);

    const handleSend = useCallback(() => {
        const trimmedText = text.trim();
        if (trimmedText.length > 0) {
            onSend(trimmedText);
            setText('');
        }
    }, [text, onSend]);

    const handleChangeText = useCallback((value: string) => {
        if (value.length <= maxLength) {
            setText(value);
        }
    }, [maxLength]);

    const handleOpenEmojiPicker = useCallback(() => {
        Keyboard.dismiss();
        setIsEmojiPickerOpen(true);
    }, []);

    const handleCloseEmojiPicker = useCallback(() => {
        setIsEmojiPickerOpen(false);
    }, []);

    const handleEmojiSelected = useCallback((emoji: EmojiType) => {
        setText(prev => prev + emoji.emoji);
    }, []);

    return (
        <>
            <View
                style={[
                    styles.container,
                    { paddingBottom: bottomPadding },
                ]}
            >
                {/* Attachment button */}
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={onAttachment}
                    disabled={disabled}
                >
                    <IconSymbol
                        name="add-circle"
                        size={26}
                        color={theme.colors.secondary}
                    />
                </TouchableOpacity>

                {/* Input container */}
                <Pressable
                    style={[
                        styles.inputContainer,
                        isFocused && styles.inputContainerFocused,
                    ]}
                    onPress={handleInputContainerPress}
                >
                    <TextInput
                        ref={inputRef}
                        style={styles.input}
                        placeholder={placeholder}
                        placeholderTextColor={theme.colors.secondary}
                        value={text}
                        onChangeText={handleChangeText}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        multiline
                        maxLength={maxLength}
                        editable={!disabled}
                        returnKeyType="default"
                        blurOnSubmit={false}
                    />

                    {/* Emoji button */}
                    <View style={styles.rightIcons}>
                        <TouchableOpacity
                            style={styles.inputIcon}
                            onPress={handleOpenEmojiPicker}
                            disabled={disabled}
                        >
                            <IconSymbol
                                name="happy"
                                size={22}
                                color={isEmojiPickerOpen ? theme.colors.primary : theme.colors.secondary}
                            />
                        </TouchableOpacity>
                    </View>
                </Pressable>

                {/* Send button (when has text) */}
                {hasText && (
                    <TouchableOpacity
                        style={styles.sendButton}
                        onPress={handleSend}
                        disabled={disabled}
                        activeOpacity={0.8}
                    >
                        <IconSymbol
                            name="send"
                            size={20}
                            color={theme.colors.surface}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {/* Emoji Picker Modal */}
            <EmojiPicker
                open={isEmojiPickerOpen}
                onClose={handleCloseEmojiPicker}
                onEmojiSelected={handleEmojiSelected}
                enableSearchBar
                enableRecentlyUsed
                categoryPosition="top"
                enableCategoryChangeGesture
                theme={{
                    backdrop: 'rgba(0,0,0,0.3)',
                    knob: theme.colors.border,
                    container: theme.colors.surface,
                    header: theme.colors.typography,
                    skinTonesContainer: theme.colors.backgroundInput,
                    category: {
                        icon: theme.colors.secondary,
                        iconActive: theme.colors.primary,
                        container: theme.colors.surface,
                        containerActive: theme.colors.primaryMuted,
                    },
                    search: {
                        text: theme.colors.typography,
                        placeholder: theme.colors.secondary,
                        icon: theme.colors.secondary,
                        background: theme.colors.backgroundInput,
                    },
                    emoji: {
                        selected: theme.colors.primaryMuted,
                    },
                }}
            />
        </>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: theme.margins.smd,
        paddingTop: theme.margins.smd,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        gap: 8,
    },
    iconButton: {
        padding: 4,
        marginBottom: Platform.OS === 'ios' ? 4 : 8,
    },
    inputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: theme.colors.backgroundInput,
        borderRadius: 22,
        paddingHorizontal: 12,
        minHeight: 44,
        maxHeight: 120,
    },
    inputContainerFocused: {
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.primaryLight,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.typography,
        paddingTop: Platform.OS === 'ios' ? 11 : 8,
        paddingBottom: Platform.OS === 'ios' ? 11 : 8,
        paddingLeft: 4,
        maxHeight: 100,
        lineHeight: 22,
    },
    rightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: Platform.OS === 'ios' ? 9 : 10,
        gap: 6,
    },
    inputIcon: {
        padding: 4,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 0,
    },
}));

export default ChatInputArea;

