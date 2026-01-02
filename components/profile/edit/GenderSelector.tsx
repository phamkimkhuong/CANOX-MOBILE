import { IconSymbol } from '@/components/ui/Icon';
import { Gender } from '@/types/user';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface GenderOption {
    value: Gender;
    label: string;
    icon: 'male' | 'female' | 'person';
}

const GENDER_OPTIONS: GenderOption[] = [
    { value: 'MALE', label: 'Nam', icon: 'male' },
    { value: 'FEMALE', label: 'Nữ', icon: 'female' },
    { value: 'OTHER', label: 'Khác', icon: 'person' },
];

interface GenderSelectorProps {
    value: Gender | null;
    onChange: (gender: Gender) => void;
    error?: string;
    disabled?: boolean;
}

/**
 * GenderSelector - Segmented Control for gender selection
 * Single-tap selection (no dropdown needed)
 * Visual feedback with icons and selected state
 */
export const GenderSelector: React.FC<GenderSelectorProps> = ({
    value,
    onChange,
    error,
    disabled = false,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Giới tính</Text>

            <View style={[styles.segmentContainer, !!error && styles.segmentError]}>
                {GENDER_OPTIONS.map((option, index) => {
                    const isSelected = value === option.value;
                    const isFirst = index === 0;
                    const isLast = index === GENDER_OPTIONS.length - 1;

                    return (
                        <TouchableOpacity
                            key={option.value}
                            style={[
                                styles.segment,
                                isFirst && styles.segmentFirst,
                                isLast && styles.segmentLast,
                                isSelected && styles.segmentSelected,
                            ]}
                            onPress={() => onChange(option.value)}
                            disabled={disabled}
                            activeOpacity={0.7}
                        >
                            <IconSymbol
                                name={option.icon}
                                size={18}
                                color={isSelected ? theme.colors.surface : theme.colors.secondary}
                            />
                            <Text
                                style={[
                                    styles.segmentText,
                                    isSelected && styles.segmentTextSelected,
                                ]}
                            >
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        marginBottom: theme.margins.lg,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
        marginBottom: theme.margins.sm,
        marginLeft: 4,
    },
    segmentContainer: {
        flexDirection: 'row',
        borderRadius: theme.radius.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
        backgroundColor: theme.colors.backgroundInput,
    },
    segmentError: {
        borderColor: theme.colors.error,
    },
    segment: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.margins.md,
        gap: 6,
        borderRightWidth: 1,
        borderRightColor: theme.colors.border,
    },
    segmentFirst: {
        borderTopLeftRadius: theme.radius.m - 1,
        borderBottomLeftRadius: theme.radius.m - 1,
    },
    segmentLast: {
        borderRightWidth: 0,
        borderTopRightRadius: theme.radius.m - 1,
        borderBottomRightRadius: theme.radius.m - 1,
    },
    segmentSelected: {
        backgroundColor: theme.colors.primary,
        borderRightColor: theme.colors.primary,
    },
    segmentText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.secondary,
    },
    segmentTextSelected: {
        color: theme.colors.surface,
        fontWeight: '600',
    },
    errorText: {
        fontSize: 12,
        color: theme.colors.error,
        marginTop: 4,
        marginLeft: 4,
    },
}));

export default GenderSelector;
