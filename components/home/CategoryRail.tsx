import { ROUTES } from '@/constants/routes';
import { Navigator } from '@/utils/navigation';
import { Image } from 'expo-image';
import React, { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

// Define kích thước cố định cho thanh chỉ báo
const INDICATOR_WIDTH = 40; // Thanh track chỉ rộng 40px
const INDICATOR_HEIGHT = 4;

interface Category {
    id: number;
    nameKey: string;
    imageSource: any;
    route?: string;
}

const CATEGORIES: Category[] = [
    { id: 1, nameKey: 'home:categories.flashSale', imageSource: require('@/assets/images/categories/flash-on.png'), route: ROUTES.CAMPAIGN.FLASH_SALE },
    { id: 2, nameKey: 'home:categories.allCategories', imageSource: require('@/assets/images/categories/category.png'), route: ROUTES.CATEGORY.INDEX },
    { id: 3, nameKey: 'home:categories.coins', imageSource: require('@/assets/images/categories/stack-of-coins.png'), route: ROUTES.PROFILE.COINS },
    { id: 4, nameKey: 'home:categories.global', imageSource: require('@/assets/images/categories/globe.png'), route: ROUTES.PROFILE.INTERNATIONAL_SHIPPING },
    { id: 5, nameKey: 'home:categories.vouchers', imageSource: require('@/assets/images/categories/discount.png'), route: ROUTES.PROFILE.VOUCHERS },
    { id: 6, nameKey: 'home:categories.freeShip', imageSource: require('@/assets/images/categories/delivery.png') },
    { id: 7, nameKey: 'home:categories.fashion', imageSource: require('@/assets/images/categories/shopping-bag.png') },
];

export const CategoryRail = memo(() => {
    const styles = stylesheet;

    // Use Reanimated shared value instead of Animated.Value (runs on UI thread)
    const scrollX = useSharedValue(0);
    const [contentWidth, setContentWidth] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);

    // 1. Tính toán logic hiển thị
    // Track width cố định, không phụ thuộc màn hình nữa
    const trackWidth = INDICATOR_WIDTH;

    // Khoảng cách tối đa có thể scroll được
    const maxScrollRange = contentWidth - containerWidth;

    // Kiểm tra xem có cần hiện thanh scroll không (nếu nội dung ngắn quá thì ẩn)
    const showIndicator = contentWidth > containerWidth && containerWidth > 0;

    // Tính độ rộng của cục thumb
    // Tỷ lệ nghịch: View càng nhỏ so với Content thì Thumb càng nhỏ
    // Giới hạn thumb không nhỏ hơn 10px để vẫn nhìn thấy được
    const thumbWidth = showIndicator
        ? Math.max(12, (containerWidth / contentWidth) * trackWidth)
        : 0;

    // 3. Animated style for thumb (runs on UI thread via Reanimated)
    const thumbAnimatedStyle = useAnimatedStyle(() => {
        const translateX = interpolate(
            scrollX.value,
            [0, Math.max(1, maxScrollRange)],
            [0, trackWidth - thumbWidth],
            'clamp'
        );
        return {
            transform: [{ translateX }],
            top: 0,
        };
    });

    const { t } = useTranslation();

    const handleScroll = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            // Update shared value (runs on UI thread, no JS bridge overhead)
            scrollX.value = event.nativeEvent.contentOffset.x;
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
                        <View style={styles.iconBox}>
                            <Image
                                source={cat.imageSource}
                                style={styles.categoryImage}
                                contentFit="contain"
                                cachePolicy="memory-disk"
                            />
                        </View>
                        <Text style={styles.text} numberOfLines={2}>
                            {t(cat.nameKey as any)}
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
                                { width: thumbWidth },
                                thumbAnimatedStyle,
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
        backgroundColor: theme.colors.header.headerBackground,
        marginHorizontal: -theme.margins.sm, // Negative margin to full bleed
    },
    row: {
        paddingHorizontal: theme.margins.sm, // Padding 2 bên mép
        alignItems: 'flex-start',
        gap: 12, // Khoảng cách giữa các item
    },
    item: {
        width: 72, // Cố định width để căn text đều nhau
        alignItems: 'center',
        gap: 6,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 16, // Smooth squircle appearance
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    categoryImage: {
        width: 32, // Slightly smaller to fit perfectly inside the box
        height: 32,
    },
    text: {
        fontSize: theme.fontSizes.xs,
        color: theme.colors.header.onHeader || '#ffffff',
        textAlign: 'center',
        fontWeight: '700',
        lineHeight: 14,
        textShadowColor: 'rgba(0, 0, 0, 0.15)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
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
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        overflow: 'hidden',
    },
    indicatorThumb: {
        height: '100%',
        borderRadius: INDICATOR_HEIGHT / 2,
        backgroundColor: '#ffffff',
    },
}));
