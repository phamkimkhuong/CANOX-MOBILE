import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withSpring
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

/**
 * ==============================================
 * PasswordStrengthIndicator
 * ==============================================
 * Hiển thị độ mạnh của mật khẩu dưới dạng progress bar
 * với 4 mức độ: Yếu, Trung bình, Khá mạnh, Mạnh
 * 
 * Criteria:
 * - Độ dài >= 6: +1
 * - Có chữ thường: +1
 * - Có chữ hoa: +1
 * - Có số: +1
 * - Có ký tự đặc biệt: +1
 * 
 * @param password - Mật khẩu cần đánh giá
 */

interface PasswordStrengthIndicatorProps {
    password: string;
}

interface StrengthLevel {
    score: number;
    label: string;
    color: string;
    width: number;
}

/**
 * Tính toán độ mạnh của mật khẩu
 */
const calculateStrength = (password: string): number => {
    let score = 0;

    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    return Math.min(score, 6);
};

export const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    // Calculate strength level based on score
    const strengthInfo = useMemo((): StrengthLevel => {
        const score = calculateStrength(password);

        if (score <= 2) {
            return {
                score,
                label: 'Yếu',
                color: theme.colors.error,
                width: 25,
            };
        }
        if (score <= 3) {
            return {
                score,
                label: 'Trung bình',
                color: theme.colors.warning,
                width: 50,
            };
        }
        if (score <= 4) {
            return {
                score,
                label: 'Khá mạnh',
                color: theme.colors.info,
                width: 75,
            };
        }
        return {
            score,
            label: 'Mạnh',
            color: theme.colors.success,
            width: 100,
        };
    }, [password, theme.colors]);

    // Animated width for progress bar
    const animatedStyle = useAnimatedStyle(() => {
        return {
            width: withSpring(`${strengthInfo.width}%` as unknown as number, {
                damping: 15,
                stiffness: 100,
            }),
            backgroundColor: strengthInfo.color,
        };
    }, [strengthInfo.width, strengthInfo.color]);

    return (
        <View style={styles.container}>
            {/* Progress Bar Track */}
            <View style={styles.track}>
                <Animated.View style={[styles.progress, animatedStyle]} />
            </View>

            {/* Label */}
            <View style={styles.labelContainer}>
                <Text style={styles.labelPrefix}>Độ mạnh:</Text>
                <Text style={[styles.labelValue, { color: strengthInfo.color }]}>
                    {strengthInfo.label}
                </Text>
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        marginBottom: theme.margins.md,
    },
    track: {
        height: 4,
        backgroundColor: theme.colors.border,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progress: {
        height: '100%',
        borderRadius: 2,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: 4,
    },
    labelPrefix: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
    },
    labelValue: {
        fontSize: 12,
        fontWeight: '600',
    },
}));
