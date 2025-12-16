// components/home/HomeBanner.tsx
import { LinearGradient } from 'expo-linear-gradient'; // Thư viện vừa cài
import React from 'react';
import { Dimensions, ImageBackground, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85; // Chiều rộng 85vw

const BANNERS = [
    {
        id: 1,
        title: 'Super Brand Day',
        subtitle: 'Up to 70% off electronics',
        tag: 'LIMITED TIME',
        tagColor: '#0088cc', // Primary
        tagText: '#fff',
        image: 'https://img.freepik.com/free-vector/gradient-colorful-sale-background_23-2148847427.jpg', // Ảnh mẫu đẹp
    },
    {
        id: 2,
        title: 'Summer Fashion',
        subtitle: 'Refresh your wardrobe today',
        tag: 'NEW ARRIVALS',
        tagColor: '#fff',
        tagText: '#0088cc',
        image: 'https://img.freepik.com/free-photo/pretty-young-stylish-sexy-woman-pink-luxury-dress-summer-fashion-trend-chic-style-sunglasses-blue-studio-background-shopping-holding-paper-bags-talking-mobile-phone-shopaholic_285396-2957.jpg',
    },
];

export const HomeBanner = () => {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + 16} // Snap từng item (Card + margin)
            decelerationRate="fast"
            contentContainerStyle={styles.scrollContent}
        >
            {BANNERS.map((item) => (
                <View key={item.id} style={styles.cardContainer}>
                    <ImageBackground
                        source={{ uri: item.image }}
                        style={styles.imageBg}
                        imageStyle={{ borderRadius: 12 }} // Bo góc ảnh
                    >
                        {/* Lớp phủ Gradient đen mờ dần lên */}
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.8)']}
                            style={styles.gradient}
                        >
                            {/* Badge Tag */}
                            <View style={[styles.tag, { backgroundColor: item.tagColor }]}>
                                <Text style={{ color: item.tagText, fontSize: 10, fontWeight: 'bold' }}>
                                    {item.tag}
                                </Text>
                            </View>

                            <Text variant="headlineSmall" style={styles.title}>{item.title}</Text>
                            <Text variant="bodyMedium" style={styles.subtitle}>{item.subtitle}</Text>
                        </LinearGradient>
                    </ImageBackground>
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 16,
    },
    cardContainer: {
        width: CARD_WIDTH,
        height: CARD_WIDTH * 0.5, // Tỷ lệ 2:1
        borderRadius: 12,
        // Shadow giả lập tailwind shadow-md shadow-blue-100
        shadowColor: '#0088cc',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4, // Cho Android
        backgroundColor: 'white',
    },
    imageBg: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    gradient: {
        height: '60%', // Gradient chỉ chiếm 60% dưới của ảnh
        justifyContent: 'flex-end',
        padding: 16,
        borderRadius: 12,
    },
    tag: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginBottom: 8,
    },
    title: {
        color: 'white',
        fontWeight: 'bold',
        lineHeight: 28,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.9)',
    }
});