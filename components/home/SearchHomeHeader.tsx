import { IconSymbol } from '@/components/ui/Icon';
import '@/constants/unistyles';
import { router } from 'expo-router';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { StyleSheet, UnistylesRuntime, useUnistyles } from 'react-native-unistyles';

/**
 * HomeHeader - Header component cho trang chủ
 * 
 * Bao gồm thanh tìm kiếm và các nút chức năng (giỏ hàng, chat).
 */
export const HomeHeader = () => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <View style={styles.headerContainer}>
            {/* 1. Thanh tìm kiếm */}
            <View style={styles.searchContainer}>
                <IconSymbol name="search" size={20} color={theme.colors.secondary} style={{ marginLeft: 10 }} />

                <TextInput
                    placeholder="Tìm kiếm sản phẩm..."
                    placeholderTextColor={theme.colors.secondary}
                    style={styles.searchInput}
                />

                <TouchableOpacity style={styles.cameraBtn}>
                    <IconSymbol name="camera-outline" size={22} color={theme.colors.secondary} />
                </TouchableOpacity>
            </View>

            {/* 2. Các nút chức năng */}
            <View style={styles.actions}>
                <TouchableOpacity style={styles.iconBtn}>
                    <IconSymbol name="cart" size={26} color={theme.colors.typographySecondary} />
                    {/* Badge tự code bằng View thuần */}
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>3</Text>
                    </View>
                </TouchableOpacity>

                {/* {Router to chat.tsx} */}
                <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/chat')}>
                    <IconSymbol name="chatbubble-ellipses-outline" size={26} color={theme.colors.typographySecondary} />
                </TouchableOpacity>
            </View>
        </View>
    );
};
const stylesheet = StyleSheet.create((theme) => ({
    headerContainer: {
        paddingHorizontal: theme.margins.md,
        paddingBottom: 12,
        // MAGIC CỦA UNISTYLES 3.0: Tự động cộng thêm chiều cao Status Bar
        paddingTop: UnistylesRuntime.insets.top + 10,
        backgroundColor: 'rgba(255,255,255,0.95)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
        borderRadius: theme.radius.full, // Dùng token radius
        backgroundColor: '#eff6ff',
        paddingHorizontal: 5,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 8,
        fontSize: 14,
        color: theme.colors.typography,
        fontFamily: 'System', // Thay bằng font custom nếu có
    },
    cameraBtn: {
        padding: 8,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    iconBtn: {
        padding: 4,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: theme.colors.error,
        borderRadius: 10,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#fff', // Tạo viền trắng cho badge nổi bật
    },
    badgeText: {
        color: 'white',
        fontSize: 9,
        fontWeight: 'bold',
    }
}));