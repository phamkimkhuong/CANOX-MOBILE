import { IconSymbol, IconSymbolName } from '@/components/ui/Icon';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

/**
 * SocialLoginButtons - Component hiển thị các nút đăng nhập bằng mạng xã hội
 * 
 * Hỗ trợ: Google, Facebook, Apple
 * Sử dụng IconSymbol để đảm bảo consistency với toàn bộ dự án.
 */
export const SocialLoginButtons = () => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <View style={styles.socialRow}>
            <SocialButton icon="logo-google" color="#DB4437" />
            <SocialButton icon="logo-facebook" color="#4267B2" />
            <SocialButton icon="logo-apple" color="#000000" />
        </View>
    );
};

/**
 * SocialButton - Nút đăng nhập mạng xã hội đơn lẻ
 * @param icon - Tên icon từ IconSymbolName
 * @param color - Màu của icon (brand color)
 */
const SocialButton = ({ icon, color }: { icon: IconSymbolName; color: string }) => {
    const styles = stylesheet;
    return (
        <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
            <IconSymbol name={icon} size={24} color={color} />
        </TouchableOpacity>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    socialRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
    },
    socialBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
}));