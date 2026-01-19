import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TextStyle, View, ViewStyle } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface PaymentCountdownProps {
    expiredAt: number; // timestamp in seconds
    onExpire?: () => void;
    label?: string;
    containerStyle?: ViewStyle;
    textStyle?: TextStyle;
}

/**
 * PaymentCountdown - Countdown chuyên dụng cho màn hình thanh toán
 * Hiển thị dạng: "Thanh toán trước 14:59"
 */
export const PaymentCountdown: React.FC<PaymentCountdownProps> = ({
    expiredAt,
    onExpire,
    label,
    containerStyle,
    textStyle,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('checkout');
    const styles = stylesheet;

    const [timeLeft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
        if (!expiredAt) return;

        const calculateTimeLeft = () => {
            const now = Math.floor(Date.now() / 1000);
            const diff = expiredAt - now;
            return Math.max(0, diff);
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            const newDiff = calculateTimeLeft();
            setTimeLeft(newDiff);
            if (newDiff <= 0) {
                clearInterval(timer);
                onExpire?.();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [expiredAt, onExpire]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (timeLeft <= 0) {
        return (
            <View style={[styles.container, containerStyle]}>
                <Text style={[styles.expiredText, textStyle]}>{t('payment.expired')}</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={[styles.label, textStyle]}>{label} </Text>}
            <Text style={[styles.timer, textStyle]}>{formatTime(timeLeft)}</Text>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    label: {
        fontSize: 13,
        color: theme.colors.warning,
        fontWeight: '600',
    },
    timer: {
        fontSize: 13,
        color: theme.colors.warning,
        fontWeight: '700',
    },
    expiredText: {
        fontSize: 13,
        color: theme.colors.error,
        fontWeight: '600',
    },
}));
