/**
 * TicketSeparator - Đường răng cưa cho Voucher Card
 */

import React, { memo, useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface TicketSeparatorProps {
    /** Chiều cao của separator (= chiều cao của card) */
    height: number;
    /** Màu nền của vùng separator */
    separatorBgColor?: string;
    /** Màu của đường kẻ đứt đoạn */
    dashedLineColor?: string;
    /** Bán kính của nửa hình tròn (lõm) */
    circleRadius?: number;
    /** Độ rộng của separator */
    width?: number;
}

const createSeparatorPath = (
    width: number,
    height: number,
    cx: number,
    r: number
): string => {
    // Điểm bắt đầu và kết thúc của các cutout trên cạnh
    const topCutoutLeft = cx - r;
    const topCutoutRight = cx + r;
    const bottomCutoutLeft = cx - r;
    const bottomCutoutRight = cx + r;

    // Path theo chiều kim đồng hồ
    // Arc command: A rx ry x-rotation large-arc-flag sweep-flag x y
    // sweep-flag: 1 = clockwise, 0 = counter-clockwise
    return [
        // Bắt đầu từ góc trên trái
        `M 0 0`,

        // Đi ngang đến bắt đầu cutout trên
        `L ${topCutoutLeft} 0`,

        // Arc vào trong (semicircle hướng xuống) - sweep=0 để arc đi vào trong
        // Từ (cx-r, 0) đến (cx+r, 0), arc hướng xuống
        `A ${r} ${r} 0 0 0 ${topCutoutRight} 0`,

        // Tiếp tục đến góc trên phải
        `L ${width} 0`,

        // Đi xuống góc dưới phải
        `L ${width} ${height}`,

        // Đi ngang đến cuối cutout dưới
        `L ${bottomCutoutRight} ${height}`,

        // Arc vào trong (semicircle hướng lên) - sweep=0 để arc đi vào trong
        // Từ (cx+r, height) đến (cx-r, height), arc hướng lên
        `A ${r} ${r} 0 0 0 ${bottomCutoutLeft} ${height}`,

        // Tiếp tục đến góc dưới trái
        `L 0 ${height}`,

        // Đóng path (tự động về góc trên trái)
        `Z`
    ].join(' ');
};

/**
 * TicketSeparator Component
 * 
 * Vẽ separator với 2 semicircle cutouts bằng một Path duy nhất
 * Đảm bảo hoạt động đúng trên cả iOS và Android
 */
export const TicketSeparator = memo<TicketSeparatorProps>(({
    height,
    separatorBgColor,
    dashedLineColor,
    circleRadius = 10,
    width = 20,
}) => {
    const { theme } = useUnistyles();

    // Default colors từ theme
    const bgColor = separatorBgColor ?? theme.colors.surface;
    const dashColor = dashedLineColor ?? 'rgba(0, 0, 0, 0.15)';

    // Tọa độ tâm của cutouts
    const centerX = width / 2;

    // Tạo path cho separator shape
    const separatorPath = useMemo(
        () => createSeparatorPath(width, height, centerX, circleRadius),
        [width, height, centerX, circleRadius]
    );

    // Tính toán đường kẻ đứt đoạn
    const lineStartY = circleRadius + 4; // Bắt đầu sau cutout trên
    const lineEndY = height - circleRadius - 4; // Kết thúc trước cutout dưới
    const dashLength = 4;
    const dashGap = 4;
    const dashPattern = `${dashLength} ${dashGap}`;

    return (
        <View style={[styles.container, { width, height }]}>
            <Svg width={width} height={height}>
                {/* Vẽ separator shape với cutouts */}
                <Path
                    d={separatorPath}
                    fill={bgColor}
                />

                {/* Đường kẻ đứt đoạn dọc ở giữa */}
                <Line
                    x1={centerX}
                    y1={lineStartY}
                    x2={centerX}
                    y2={lineEndY}
                    stroke={dashColor}
                    strokeWidth={1.5}
                    strokeDasharray={dashPattern}
                    strokeLinecap="round"
                />
            </Svg>
        </View>
    );
});

TicketSeparator.displayName = 'TicketSeparator';

const styles = StyleSheet.create({
    container: {
        overflow: 'visible',
    },
});

export default TicketSeparator;
