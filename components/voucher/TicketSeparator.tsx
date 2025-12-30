/**
 * TicketSeparator - Đường răng cưa cho Voucher Card
 * 
 * Tạo hiệu ứng "tờ vé" với:
 * - 2 nửa hình tròn (bán nguyệt) ở trên và dưới để tạo lõm
 * - Đường kẻ đứt đoạn dọc ở giữa
 * 
 * Sử dụng View thuần để tránh dependency react-native-svg
 */

import React, { memo, useMemo } from 'react';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface TicketSeparatorProps {
    /** Chiều cao của separator (= chiều cao của card) */
    height: number;
    /** Màu nền của container cha để tạo hiệu ứng "đục lỗ" */
    backgroundColor?: string;
    /** Màu của đường kẻ đứt đoạn */
    lineColor?: string;
    /** Bán kính của nửa hình tròn (lõm) */
    circleRadius?: number;
    /** Độ rộng của separator */
    width?: number;
}

/**
 * Component tạo đường phân cách kiểu vé xé
 * Render với 2 hình tròn (đục lỗ) và đường kẻ đứt dọc
 */
export const TicketSeparator = memo<TicketSeparatorProps>(({
    height,
    backgroundColor,
    lineColor,
    circleRadius = 8,
    width = 16,
}) => {
    const { theme } = useUnistyles();

    // Màu mặc định từ theme
    const bgColor = backgroundColor ?? theme.colors.background;
    const dashColor = lineColor ?? 'rgba(255, 255, 255, 0.3)';

    // Generate dashed line segments
    const dashCount = useMemo(() => {
        const availableHeight = height - (circleRadius * 2) - 16; // Space minus circles and padding
        const dashHeight = 4;
        const gapHeight = 4;
        return Math.floor(availableHeight / (dashHeight + gapHeight));
    }, [height, circleRadius]);

    const dashes = useMemo(() => {
        return Array.from({ length: dashCount }, (_, i) => i);
    }, [dashCount]);

    return (
        <View style={[styles.container, { width, height }]}>
            {/* Nửa hình tròn trên (đục lỗ) */}
            <View
                style={[
                    styles.circle,
                    styles.circleTop,
                    {
                        width: circleRadius * 2,
                        height: circleRadius * 2,
                        borderRadius: circleRadius,
                        backgroundColor: bgColor,
                    },
                ]}
            />

            {/* Đường kẻ đứt đoạn dọc */}
            <View style={styles.dashContainer}>
                {dashes.map((i) => (
                    <View
                        key={i}
                        style={[
                            styles.dash,
                            { backgroundColor: dashColor },
                        ]}
                    />
                ))}
            </View>

            {/* Nửa hình tròn dưới (đục lỗ) */}
            <View
                style={[
                    styles.circle,
                    styles.circleBottom,
                    {
                        width: circleRadius * 2,
                        height: circleRadius * 2,
                        borderRadius: circleRadius,
                        backgroundColor: bgColor,
                    },
                ]}
            />
        </View>
    );
});

TicketSeparator.displayName = 'TicketSeparator';

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
    },
    circle: {
        position: 'absolute',
        zIndex: 10,
    },
    circleTop: {
        top: 0,
        transform: [{ translateY: -8 }], // Half outside
    },
    circleBottom: {
        bottom: 0,
        transform: [{ translateY: 8 }], // Half outside
    },
    dashContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        flex: 1,
        paddingVertical: 16,
    },
    dash: {
        width: 2,
        height: 4,
        borderRadius: 1,
    },
});

export default TicketSeparator;
