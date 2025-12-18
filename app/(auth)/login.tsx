import '@/constants/unistyles';
import { router } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

// Auth protection is handled centrally by useAuthGuard in app/_layout.tsx
// This screen only renders login UI

export default function LoginScreen() {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>
                <Text style={styles.title}>Login</Text>
                <Text onPress={handleLogin} style={{ marginTop: 20, color: theme.colors.primary }}>Bấm tôi để đăng nhập (giả lập)</Text>
            </View>
        </SafeAreaView>
    );
}

const handleLogin = async () => {
    try {
        const token = "fake-jwt-token"; // Ví dụ
        await login(token);

        // Logic Senior: Nếu đang ở luồng Auth thì mới đá về Tabs
        if (router.canGoBack()) {
            router.back(); // Quay lại trang trước đó (Ví dụ: Quay lại Cart)
        } else {
            router.replace('/(tabs)'); // Fallback về Home
        }
    } catch (e) {
        // Handle error
    }
}
// Giả lập hàm login
const login = (token: string): Promise<void> => {
    // Lưu token vào storage, context, v.v.
    return Promise.resolve();
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: theme.margins.md,
        justifyContent: 'center',
    },
    title: {
        color: theme.colors.typography,
        fontSize: 22,
        fontWeight: '700',
    },
}));

