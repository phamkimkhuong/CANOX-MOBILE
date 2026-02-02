import { VideoData, VideoItem } from '@/components/video/VideoItem';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useIsFocused } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import React, { useCallback, useRef, useState } from 'react';
import { StatusBar, View, useWindowDimensions } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

const MOCK_VIDEOS: VideoData[] = [
    {
        id: '1',
        videoUrl: 'https://media.khuongblog.tech/cdn-cgi/media/fit=scale-down,width=720/video1.mp4',
        posterUrl: 'https://media.khuongblog.tech/cdn-cgi/media/mode=frame,time=1s,format=jpg/video1.mp4',
        shopName: 'FashionStore',
        caption: 'Váy trắng tinh khôi cho mùa hè này! 🔥 #thoitrang #vayxinh',
        likes: 1240,
        comments: 45,
        shares: 89,
        product: {
            id: 'p1',
            name: 'Váy Trắng Mùa Hè',
            price: 350000,
            imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200',
        }
    },
    {
        id: '2',
        videoUrl: 'https://media.khuongblog.tech/cdn-cgi/media/fit=scale-down,width=720/video2.mp4',
        posterUrl: 'https://media.khuongblog.tech/cdn-cgi/media/mode=frame,time=1s,format=jpg/video2.mp4',
        shopName: 'TechGadget',
        caption: 'Deal sập sàn cho iPhone 15 Pro Max hôm nay 📱 #apple #iphone',
        likes: 5600,
        comments: 231,
        shares: 450,
        product: {
            id: 'p2',
            name: 'iPhone 15 Pro Max',
            price: 28990000,
            imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200',
        }
    },
    {
        id: '3',
        videoUrl: 'https://media.khuongblog.tech/cdn-cgi/media/fit=scale-down,width=720/video1.mp4',
        posterUrl: 'https://media.khuongblog.tech/cdn-cgi/media/mode=frame,time=1s,format=jpg/vide1.mp4',
        shopName: 'CoffeeHouse',
        caption: 'Cà phê nguyên chất Arabica thơm ngon đậm vị ☕ #cafe #chill',
        likes: 890,
        comments: 12,
        shares: 34,
        product: {
            id: 'p3',
            name: 'Cà Phê Arabica 500g',
            price: 180000,
            imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=200',
        }
    },
    {
        id: "4",
        videoUrl: 'https://media.khuongblog.tech/cdn-cgi/media/fit=scale-down,width=720/video2.mp4',
        posterUrl: 'https://media.khuongblog.tech/cdn-cgi/media/mode=frame,time=1s,format=jpg/video2.mp4',
        shopName: 'CoffeeHouse',
        caption: 'Cà phê nguyên chất Arabica thơm ngon đậm vị ☕ #cafe #chill',
        likes: 890,
        comments: 12,
        shares: 34,
        product: {
            id: 'p3',
            name: 'Cà Phê Arabica 500g',
            price: 180000,
            imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=200',
        }
    }
];

export default function VideoScreen() {
    const { height: windowHeight } = useWindowDimensions();
    const tabBarHeight = useBottomTabBarHeight();
    const isFocused = useIsFocused();

    const [activeIndex, setActiveIndex] = useState(0);

    const visibleHeight = windowHeight - tabBarHeight;

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setActiveIndex(viewableItems[0].index ?? 0);
        }
    }).current;

    const renderItem = useCallback(({ item, index }: any) => {
        // Thuật toán Cửa sổ trượt (Sliding Window): 
        // Chỉ 'active' item đang xem, 'preload' item tiếp theo và trước đó.
        let mode: 'active' | 'preload' | 'idle' = 'idle';

        if (isFocused && index === activeIndex) {
            mode = 'active';
        } else if (index === activeIndex + 1 || index === activeIndex - 1) {
            mode = 'preload';
        }

        return (
            <View style={{ height: visibleHeight }}>
                <VideoItem
                    item={item}
                    mode={mode}
                />
            </View>
        );
    }, [activeIndex, isFocused, visibleHeight]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent />
            <FlashList
                {...({
                    data: MOCK_VIDEOS,
                    renderItem,
                    keyExtractor: (item: any) => item.id,
                    estimatedItemSize: visibleHeight,
                    pagingEnabled: true,
                    showsVerticalScrollIndicator: false,
                    onViewableItemsChanged: onViewableItemsChanged,
                    viewabilityConfig: {
                        itemVisiblePercentThreshold: 50
                    },
                    bounces: false
                } as any)}
            />
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
}));
