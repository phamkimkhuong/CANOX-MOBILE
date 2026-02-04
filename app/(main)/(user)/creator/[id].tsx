import { IconSymbol } from '@/components/ui/Icon';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width / 3;

export default function CreatorProfileScreen() {
    // Unlock navigation when screen gains focus
    useNavigationUnlockOnFocus();

    const { id } = useLocalSearchParams();

    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { theme } = useUnistyles();
    const [activeTab, setActiveTab] = useState<'videos' | 'products'>('videos');

    const handleBack = () => router.back();
    const handleVisitShop = () => router.push(`/(main)/(shop)/shop/${id}`);

    // Mock User Data
    const creator = {
        name: 'CANOX Official Store',
        username: '@canox_vn',
        avatar: 'https://i.pravatar.cc/300?u=canox',
        bio: 'Chuyên cung cấp các sản phẩm gia dụng thông minh & phụ kiện công nghệ hàng đầu Việt Nam. Cam kết hàng chính hãng 100%.',
        followers: '1.2M',
        following: '150',
        likes: '15.4M',
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View style={styles.profileSection}>
                <Image source={creator.avatar} style={styles.avatar} />
                <Text style={styles.name}>{creator.name}</Text>
                <Text style={styles.username}>{creator.username}</Text>

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{creator.following}</Text>
                        <Text style={styles.statLabel}>Đang follow</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{creator.followers}</Text>
                        <Text style={styles.statLabel}>Follower</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{creator.likes}</Text>
                        <Text style={styles.statLabel}>Thích</Text>
                    </View>
                </View>

                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.followButton}>
                        <LinearGradient
                            colors={[theme.colors.newPrimary, '#ff4b6e']}
                            style={styles.gradientButton}
                        >
                            <Text style={styles.followButtonText}>Follow</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.messageButton}>
                        <IconSymbol name="chat-dots" size={20} color={theme.colors.typography} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.bio} numberOfLines={3}>
                    {creator.bio}
                </Text>

                <TouchableOpacity style={styles.visitShopCard} onPress={handleVisitShop}>
                    <BlurView intensity={20} tint="light" style={styles.visitShopBlur}>
                        <IconSymbol name="storefront" size={20} color={theme.colors.newPrimary} />
                        <View style={styles.visitShopInfo}>
                            <Text style={styles.visitShopTitle}>Ghé thăm Shop</Text>
                            <Text style={styles.visitShopSubtitle}>Xem toàn bộ sản phẩm & ưu đãi</Text>
                        </View>
                        <IconSymbol name="chevron-right" size={16} color={theme.colors.typographySecondary} />
                    </BlurView>
                </TouchableOpacity>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tabItem, activeTab === 'videos' && styles.activeTab]}
                    onPress={() => setActiveTab('videos')}
                >
                    <IconSymbol
                        name="video"
                        size={22}
                        color={activeTab === 'videos' ? theme.colors.typography : theme.colors.typographySecondary}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabItem, activeTab === 'products' && styles.activeTab]}
                    onPress={() => setActiveTab('products')}
                >
                    <IconSymbol
                        name="bag"
                        size={22}
                        color={activeTab === 'products' ? theme.colors.typography : theme.colors.typographySecondary}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Custom Nav Bar */}
            <View style={[styles.navBar, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={handleBack} style={styles.navButton}>
                    <IconSymbol name="back" size={24} color={theme.colors.typography} />
                </TouchableOpacity>
                <Text style={styles.navTitle}>{creator.name}</Text>
                <TouchableOpacity style={styles.navButton}>
                    <IconSymbol name="more" size={24} color={theme.colors.typography} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            >
                {renderHeader()}

                {activeTab === 'videos' ? (
                    <View style={styles.gridContainer}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
                            <View key={item} style={styles.videoPoster}>
                                <Image
                                    source={`https://picsum.photos/400/600?random=${item}`}
                                    style={StyleSheet.absoluteFill}
                                />
                                <View style={styles.videoStats}>
                                    <IconSymbol name="play-fill" size={12} color="#fff" />
                                    <Text style={styles.videoStatsText}>12.5K</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.productGrid}>
                        {[1, 2, 3, 4].map((item) => (
                            <TouchableOpacity key={item} style={styles.productCard}>
                                <Image
                                    source={`https://picsum.photos/300/300?random=${item + 10}`}
                                    style={styles.productImage}
                                />
                                <View style={styles.productInfo}>
                                    <Text style={styles.productName} numberOfLines={2}>Sản phẩm công nghệ cao cấp {item}</Text>
                                    <Text style={styles.productPrice}>₫990.000</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 8,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 0.5,
        borderBottomColor: theme.colors.secondary,
    },
    navButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    headerContainer: {
        backgroundColor: theme.colors.surface,
    },
    profileSection: {
        alignItems: 'center',
        paddingTop: 20,
        paddingHorizontal: 24,
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 2,
        borderColor: theme.colors.newPrimary,
    },
    name: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.typography,
        marginTop: 12,
    },
    username: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        marginTop: 4,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 12,
        backgroundColor: theme.colors.secondary,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
        gap: 8,
    },
    followButton: {
        flex: 1,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
    },
    gradientButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    followButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    messageButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bio: {
        marginTop: 20,
        fontSize: 14,
        lineHeight: 20,
        color: theme.colors.typography,
        textAlign: 'center',
    },
    visitShopCard: {
        marginTop: 20,
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.newPrimary + '30',
    },
    visitShopBlur: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    visitShopInfo: {
        flex: 1,
        marginLeft: 12,
    },
    visitShopTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    visitShopSubtitle: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        marginTop: 2,
    },
    tabContainer: {
        flexDirection: 'row',
        marginTop: 24,
        borderTopWidth: 0.5,
        borderBottomWidth: 0.5,
        borderColor: theme.colors.secondary,
    },
    tabItem: {
        flex: 1,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.typography,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    videoPoster: {
        width: width / 3,
        height: (width / 3) * 1.5,
        borderWidth: 0.5,
        borderColor: theme.colors.background,
        backgroundColor: theme.colors.secondary,
    },
    videoStats: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    videoStatsText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
        marginLeft: 4,
    },
    productGrid: {
        padding: 8,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    productCard: {
        width: (width - 24) / 2,
        backgroundColor: theme.colors.surface,
        margin: 4,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 0.5,
        borderColor: theme.colors.secondary,
    },
    productImage: {
        width: '100%',
        aspectRatio: 1,
    },
    productInfo: {
        padding: 8,
    },
    productName: {
        fontSize: 13,
        color: theme.colors.typography,
        lineHeight: 18,
    },
    productPrice: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.newPrimary,
        marginTop: 4,
    },
}));
