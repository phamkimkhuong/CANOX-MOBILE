/**
 * ShopNoteInput Component
 * 
 * Input field for customer notes to shop.
 * Replaces the anti-pattern "Chat với Shop" in checkout flow.
 * 
 * Features:
 * - Inline text input (not a button to chat)
 * - Shows placeholder when empty
 * - Expandable for longer notes
 */

import { IconSymbol } from '@/components/ui/Icon';
import React, { useCallback, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ShopNoteInputProps {
    /** Current note value */
    value: string;
    /** Callback when note changes */
    onChange: (note: string) => void;
    /** Maximum characters allowed */
    maxLength?: number;
    /** Placeholder text */
    placeholder?: string;
}

export const ShopNoteInput: React.FC<ShopNoteInputProps> = ({
    value,
    onChange,
    maxLength = 200,
    placeholder = 'Ghi chú cho Shop (VD: Màu sắc, size, thời gian giao...)',
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [tempNote, setTempNote] = useState(value);

    const handleOpen = useCallback(() => {
        setTempNote(value);
        setIsModalVisible(true);
    }, [value]);

    const handleSave = useCallback(() => {
        onChange(tempNote.trim());
        setIsModalVisible(false);
    }, [tempNote, onChange]);

    const handleClose = useCallback(() => {
        setIsModalVisible(false);
    }, []);

    return (
        <>
            {/* Compact Display */}
            <Pressable
                style={({ pressed }) => [
                    styles.container,
                    pressed && styles.containerPressed,
                ]}
                onPress={handleOpen}
                accessibilityRole="button"
                accessibilityLabel="Thêm ghi chú cho Shop"
            >
                <IconSymbol
                    name="note"
                    size={18}
                    color={theme.colors.typographySecondary}
                />
                <Text
                    style={[styles.displayText, !value && styles.placeholderText]}
                    numberOfLines={1}
                >
                    {value || placeholder}
                </Text>
                <IconSymbol
                    name="chevron-right"
                    size={18}
                    color={theme.colors.typographySecondary}
                />
            </Pressable>

            {/* Full Modal for editing */}
            <Modal
                visible={isModalVisible}
                transparent
                animationType="slide"
                onRequestClose={handleClose}
            >
                <TouchableWithoutFeedback onPress={handleClose}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                                style={styles.modalContainer}
                            >
                                <View style={styles.modalContent}>
                                    {/* Handle bar */}
                                    <View style={styles.handleBar} />

                                    {/* Header */}
                                    <View style={styles.modalHeader}>
                                        <View style={styles.modalHeaderLeft}>
                                            <IconSymbol
                                                name="note-filled"
                                                size={22}
                                                color={theme.colors.primary}
                                            />
                                            <Text style={styles.modalTitle}>
                                                Ghi chú cho Shop
                                            </Text>
                                        </View>
                                        <Pressable
                                            onPress={handleClose}
                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                        >
                                            <IconSymbol
                                                name="close"
                                                size={22}
                                                color={theme.colors.typographySecondary}
                                            />
                                        </Pressable>
                                    </View>

                                    {/* Input Area */}
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            style={styles.textInput}
                                            value={tempNote}
                                            onChangeText={setTempNote}
                                            placeholder={placeholder}
                                            placeholderTextColor={theme.colors.secondary}
                                            multiline
                                            maxLength={maxLength}
                                            autoFocus
                                            textAlignVertical="top"
                                        />
                                        <Text style={styles.charCount}>
                                            {tempNote.length}/{maxLength}
                                        </Text>
                                    </View>

                                    {/* Suggestions */}
                                    <View style={styles.suggestions}>
                                        <Text style={styles.suggestionsTitle}>
                                            Gợi ý:
                                        </Text>
                                        <View style={styles.chipContainer}>
                                            {QUICK_NOTES.map((note, index) => (
                                                <Pressable
                                                    key={`quick-note-${index}`}
                                                    style={({ pressed }) => [
                                                        styles.chip,
                                                        pressed && styles.chipPressed,
                                                    ]}
                                                    onPress={() => setTempNote(note)}
                                                >
                                                    <Text style={styles.chipText}>{note}</Text>
                                                </Pressable>
                                            ))}
                                        </View>
                                    </View>

                                    {/* Save Button */}
                                    <View style={styles.modalFooter}>
                                        <Pressable
                                            style={({ pressed }) => [
                                                styles.saveButton,
                                                pressed && styles.saveButtonPressed,
                                            ]}
                                            onPress={handleSave}
                                        >
                                            <Text style={styles.saveButtonText}>
                                                Xác nhận
                                            </Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </KeyboardAvoidingView>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    );
};

// Quick note suggestions
const QUICK_NOTES = [
    'Gọi trước khi giao',
    'Giao giờ hành chính',
    'Gói kỹ giúp Shop',
    'Kiểm tra hàng trước',
];

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.margins.smd,
        paddingHorizontal: theme.margins.md,
        gap: theme.margins.sm,
    },

    containerPressed: {
        backgroundColor: theme.colors.background,
    },

    displayText: {
        flex: 1,
        fontSize: 14,
        color: theme.colors.typography,
    },

    placeholderText: {
        color: theme.colors.secondary,
    },

    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'flex-end',
    },

    modalContainer: {
        width: '100%',
    },

    modalContent: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },

    handleBar: {
        width: 36,
        height: 4,
        backgroundColor: theme.colors.border,
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: theme.margins.sm,
    },

    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.lg,
        paddingVertical: theme.margins.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },

    modalHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
    },

    modalTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: theme.colors.typography,
    },

    inputContainer: {
        padding: theme.margins.lg,
    },

    textInput: {
        minHeight: 100,
        maxHeight: 150,
        padding: theme.margins.md,
        backgroundColor: theme.colors.background,
        borderRadius: 12,
        fontSize: 15,
        color: theme.colors.typography,
        lineHeight: 22,
    },

    charCount: {
        fontSize: 12,
        color: theme.colors.secondary,
        textAlign: 'right',
        marginTop: theme.margins.sm,
    },

    suggestions: {
        paddingHorizontal: theme.margins.lg,
        paddingBottom: theme.margins.md,
    },

    suggestionsTitle: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
        marginBottom: theme.margins.sm,
    },

    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.margins.sm,
    },

    chip: {
        paddingHorizontal: theme.margins.md,
        paddingVertical: 8,
        backgroundColor: theme.colors.background,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },

    chipPressed: {
        backgroundColor: `${theme.colors.primary}15`,
        borderColor: theme.colors.primary,
    },

    chipText: {
        fontSize: 13,
        color: theme.colors.typography,
    },

    modalFooter: {
        padding: theme.margins.lg,
        paddingBottom: theme.margins.xl,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },

    saveButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.margins.md,
        borderRadius: 12,
        alignItems: 'center',
    },

    saveButtonPressed: {
        opacity: 0.9,
    },

    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
}));

export default ShopNoteInput;
