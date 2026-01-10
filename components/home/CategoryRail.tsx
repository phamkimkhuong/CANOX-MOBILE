import { IconSymbol, IconSymbolName } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import { Navigator } from '@/utils/navigation';
import React, { memo, useCallback, useRef, useState } from 'react';
import {
    Animated,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

// Define kích thước cố định cho thanh chỉ báo
const INDICATOR_WIDTH = 40; // Thanh track chỉ rộng 40px
const INDICATOR_HEIGHT = 4;

interface Category {
    id: number;
    name: string;
    icon: IconSymbolName;
    color: string;
    route?: string;
}

const CATEGORIES: Category[] = [
    { id: 1, name: 'Flash Sale', icon: 'flash', color: '#f59e0b' },
    { id: 2, name: 'Free Ship', icon: 'shipping', color: '#3b82f6' },
    { id: 3, name: 'Vouchers', icon: 'ticket', color: '#fb923c', route: ROUTES.PROFILE.VOUCHERS },
    { id: 5, name: 'Top Up', icon: 'smartphone', color: '#a855f7' },
    { id: 6, name: 'Fashion', icon: 'shirt', color: '#f472b6' },
    { id: 7, name: 'Mart', icon: 'store', color: '#22c55e' },
    { id: 8, name: 'Coins', icon: 'cash', color: '#facc15', route: ROUTES.PROFILE.COINS },
    { id: 9, name: 'Global', icon: 'globe', color: '#2dd4bf', route: ROUTES.PROFILE.INTERNATIONAL_SHIPPING },
];

export const CategoryRail = memo(() => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const scrollX = useRef(new Animated.Value(0)).current;
    const [contentWidth, setContentWidth] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);

    // 1. Tính toán logic hiển thị
    // Track width cố định, không phụ thuộc màn hình nữa
    const trackWidth = INDICATOR_WIDTH;

    // Khoảng cách tối đa có thể scroll được
    const maxScrollRange = contentWidth - containerWidth;

    // Kiểm tra xem có cần hiện thanh scroll không (nếu nội dung ngắn quá thì ẩn)
    const showIndicator = contentWidth > containerWidth && containerWidth > 0;

    // 2. Tính độ rộng của cục thumb (cục chạy)
    // Tỷ lệ nghịch: View càng nhỏ so với Content thì Thumb càng nhỏ
    // Giới hạn thumb không nhỏ hơn 10px để vẫn nhìn thấy được
    const thumbWidth = showIndicator
        ? Math.max(12, (containerWidth / contentWidth) * trackWidth)
        : 0;

    // 3. Mapping vị trí scroll sang vị trí thumb
    const thumbTranslateX = showIndicator
        ? scrollX.interpolate({
            inputRange: [0, Math.max(1, maxScrollRange)], // Input: từ 0 đến max scroll
            outputRange: [0, trackWidth - thumbWidth],    // Output: chạy trong track
            extrapolate: 'clamp',
        })
        : 0;

    const handleScroll = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            // Animated.event native driver không hỗ trợ tốt layout calculation trực tiếp
            // nên dùng setValue thủ công ở đây vẫn ổn cho list nhỏ
            scrollX.setValue(event.nativeEvent.contentOffset.x);
        },
        [scrollX]
    );

    const handlePress = useCallback((route?: string) => {
        if (route) {
            Navigator.push(route);
        }
    }, []);

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16} // 16ms = 60fps
                onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
                onContentSizeChange={(w) => setContentWidth(w)}
                contentContainerStyle={styles.row}
            >
                {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                        key={cat.id}
                        style={styles.item}
                        activeOpacity={0.7}
                        onPress={() => handlePress(cat.route)}
                    >
                        <View style={styles.iconCircle}>
                            <IconSymbol name={cat.icon} size={20} color={cat.color} />
                        </View>
                        <Text style={styles.text} numberOfLines={2}>
                            {cat.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Chỉ báo Scroll */}
            {showIndicator && (
                <View style={styles.indicatorContainer}>
                    <View style={[styles.indicatorTrack, { width: trackWidth }]}>
                        <Animated.View
                            style={[
                                styles.indicatorThumb,
                                {
                                    width: thumbWidth,
                                    transform: [{ translateX: thumbTranslateX }],
                                },
                            ]}
                        />
                    </View>
                </View>
            )}
        </View>
    );
});

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        paddingVertical: theme.margins.sm / 2,
        backgroundColor: theme.colors.background, // Đảm bảo nền trùng màu app
    },
    row: {
        paddingHorizontal: theme.margins.sm, // Padding 2 bên mép
        alignItems: 'flex-start',
        gap: 12, // Khoảng cách giữa các item
    },
    item: {
        width: 64, // Cố định width để căn text đều nhau
        alignItems: 'center',
        gap: 4,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 1,
    },
    text: {
        fontSize: 10,
        color: theme.colors.typography,
        textAlign: 'center',
        fontWeight: '500',
        lineHeight: 12,
    },
    // Style cho thanh chỉ báo
    indicatorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: theme.margins.sm / 2,
    },
    indicatorTrack: {
        height: INDICATOR_HEIGHT,
        borderRadius: INDICATOR_HEIGHT / 2,
        backgroundColor: '#e2e8f0',
        overflow: 'hidden',
    },
    indicatorThumb: {
        height: '100%',
        borderRadius: INDICATOR_HEIGHT / 2,
        backgroundColor: theme.colors.primary,
    },
}));
