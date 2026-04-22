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
 */
export const ChatInputArea: React.FC<ChatInputAreaProps> = React.memo(({
    onSend,
    onAttachment,
    placeholder = 'Nhập tin nhắn...',
    disabled = false,
    maxLength = 1000,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const inputRef = useRef<TextInput>(null);
    const [text, setText] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

    const staticPaddingStyle = {
        paddingBottom: 8,
    };

    const hasText = text.trim().length > 0;

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

    const handleChangeText = useCallback((newText: string) => {
        setText(newText);
    }, []);

    const handleEmojiSelected = useCallback((emoji: EmojiType) => {
        setText(prev => prev + emoji.emoji);
    }, []);

    const handleOpenEmojiPicker = useCallback(() => {
        Keyboard.dismiss();
        setTimeout(() => {
            setIsEmojiPickerOpen(true);
        }, 100);
    }, []);

    const handleCloseEmojiPicker = useCallback(() => {
        setIsEmojiPickerOpen(false);
    }, []);

    return (
        <>
            <View style={[styles.outerContainer, staticPaddingStyle]}>
                <View style={styles.container}>
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
                            submitBehavior="submit"
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
                                    color={isEmojiPickerOpen ? theme.colors.newPrimary : theme.colors.secondary}
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
                                color={theme.colors.newPrimary}
                            />
                        </TouchableOpacity>
                    )}
                </View>
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
                        iconActive: theme.colors.newPrimary,
                        container: theme.colors.surface,
                        containerActive: theme.colors.activeSoft,
                    },
                    search: {
                        text: theme.colors.typography,
                        placeholder: theme.colors.secondary,
                        icon: theme.colors.secondary,
                        background: theme.colors.backgroundInput,
                    },
                    emoji: {
                        selected: theme.colors.activeSoft,
                    },
                }}
            />
        </>
    );
});

const stylesheet = StyleSheet.create((theme) => ({
    outerContainer: {
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        overflow: 'hidden', // Crucial to hide the translated content
    },
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: theme.margins.smd,
        paddingTop: theme.margins.smd,
        backgroundColor: theme.colors.surface,
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
        borderRadius: 24,
        paddingHorizontal: 14,
        minHeight: 46,
        maxHeight: 120,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    inputContainerFocused: {
        backgroundColor: theme.colors.surface,
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
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: theme.colors.activeSoft,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 0,
        borderWidth: 0.5,
        borderColor: theme.colors.activeLight,
    },
}));

export default ChatInputArea;
