import { Stack } from 'expo-router';
import { useUnistyles } from 'react-native-unistyles';

/**
 * Settings Stack Layout
 * Handles nested navigation within settings section
 */
export default function SettingsLayout() {
    const { theme } = useUnistyles();

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: {
                    backgroundColor: theme.colors.background,
                },
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    title: 'Cài đặt',
                }}
            />
            <Stack.Screen
                name="profile"
                options={{
                    title: 'Hồ sơ & Địa chỉ',
                }}
            />
            <Stack.Screen
                name="change-password"
                options={{
                    title: 'Đổi mật khẩu',
                }}
            />
            <Stack.Screen
                name="linked-accounts"
                options={{
                    title: 'Tài khoản liên kết',
                }}
            />
            <Stack.Screen
                name="bank-cards"
                options={{
                    title: 'Tài khoản / Thẻ ngân hàng',
                }}
            />
            <Stack.Screen
                name="notifications"
                options={{
                    title: 'Cài đặt thông báo',
                }}
            />
            <Stack.Screen
                name="language"
                options={{
                    title: 'Ngôn ngữ / Language',
                }}
            />
            <Stack.Screen
                name="privacy-policy"
                options={{
                    title: 'Chính sách bảo mật',
                }}
            />
            <Stack.Screen
                name="terms"
                options={{
                    title: 'Điều khoản dịch vụ',
                }}
            />
            <Stack.Screen
                name="delete-account"
                options={{
                    title: 'Xóa tài khoản',
                }}
            />
        </Stack>
    );
}
