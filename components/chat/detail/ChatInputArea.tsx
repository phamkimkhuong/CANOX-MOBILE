/**
 * ChatInputArea - Input area with dynamic buttons
 * Handles text input, send button, and attachment options
 */

import { IconSymbol } from '@/components/ui/Icon';
import React, { useCallback, useRef, useState } from 'react';
import {
    Platform,
    Pressable,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ChatInputAreaProps {
    onSend: (text: string) => void;
    onAttachment?: () => void;
    onCamera?: () => void;
    onEmoji?: () => void;
    placeholder?: string;
    disabled?: boolean;
    maxLength?: number;
}

/**
 * ChatInputArea - Smart input with dynamic send button
 * 
 * States:
 * - Empty: Shows emoji + camera buttons
 * - Has text: Shows send button (animated transition)
 */
export const ChatInputArea: React.FC<ChatInputAreaProps> = ({
    onSend,
    onAttachment,
    onCamera,
    onEmoji,
    placeholder = 'Nhập tin nhắn...',
    disabled = false,
    maxLength = 1000,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const insets = useSafeAreaInsets();
    const inputRef = useRef<TextInput>(null);

    const [text, setText] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const hasText = text.trim().length > 0;

    // Focus input when tapping anywhere in input container
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

    return (
        <View
            style={[
                styles.container,
                { paddingBottom: Math.max(insets.bottom, 12) },
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

            {/* Input container - Pressable to expand touch area */}
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

                {/* Right icons: Always visible (Emoji + Camera) */}
                <View style={styles.rightIcons}>
                    <TouchableOpacity
                        style={styles.inputIcon}
                        onPress={onEmoji}
                        disabled={disabled}
                    >
                        <IconSymbol
                            name="happy"
                            size={22}
                            color={theme.colors.secondary}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.inputIcon}
                        onPress={onCamera}
                        disabled={disabled}
                    >
                        <IconSymbol
                            name="camera"
                            size={22}
                            color={theme.colors.secondary}
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
