// components/home/HomeHeader.tsx
import { Ionicons } from '@expo/vector-icons'; // Dùng icon cho đẹp
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Badge, Surface, useTheme } from 'react-native-paper';

export const HomeHeader = () => {
    const theme = useTheme();

    return (
        <Surface style={styles.headerContainer} elevation={2}>
            {/* 1. Thanh tìm kiếm (Chiếm phần lớn diện tích) */}
            <View style={[styles.searchContainer, { backgroundColor: '#eff6ff' }]}>
                <Ionicons name="search" size={20} color="#94a3b8" style={{ marginLeft: 10 }} />

                <TextInput
                    placeholder="Search for products..."
                    placeholderTextColor="#94a3b8"
                    style={styles.searchInput}
                />

                <TouchableOpacity style={styles.cameraBtn}>
                    <Ionicons name="camera-outline" size={22} color="#94a3b8" />
                </TouchableOpacity>
            </View>

            {/* 2. Các nút chức năng (Giỏ hàng & Chat) */}
            <View style={styles.actions}>
                <TouchableOpacity style={styles.iconBtn}>
                    <Ionicons name="cart-outline" size={26} color="#475569" />
                    {/* Badge thông báo màu đỏ */}
                    <Badge style={styles.badge} size={16}>3</Badge>
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconBtn}>
                    <Ionicons name="chatbubble-ellipses-outline" size={26} color="#475569" />
                </TouchableOpacity>
            </View>
        </Surface>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        paddingTop: 10, // Cộng thêm SafeArea nếu cần
        backgroundColor: 'rgba(255,255,255,0.95)', // Giả lập Backdrop blur
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    searchContainer: {
        flex: 1, // Chiếm hết không gian còn lại
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
        borderRadius: 20, // Rounded full
        paddingHorizontal: 5,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 8,
        fontSize: 14,
        color: '#334155',
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
        backgroundColor: '#ef4444',
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    }
});