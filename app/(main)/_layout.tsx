/**
 * Main Stack Layout - Quản lý tất cả pushed screens (không có Tab Bar)
 * 
 * Đây là NƠI DUY NHẤT quản lý Navigation Stack cho các screens trong (main).
 * Các cấp con như (shop), (user), (order) KHÔNG nên có _layout.tsx riêng
 * hoặc chỉ dùng Slot để pass-through.
 * 
 * Quy tắc:
 * 1. headerShown: false - Vì các screens tự xây header riêng
 * 2. Nếu screen nào cần header mặc định, tự override trong component:
 *    <Stack.Screen options={{ headerShown: true, title: '...' }} />
 * 3. KHÔNG tạo thêm Stack Navigator ở các cấp con để tránh Layout Hell
 */

import { Stack } from 'expo-router';

export default function MainLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false, // Các screens tự xây header riêng
                animation: 'slide_from_right',
            }}
        >
            {/* Expo Router tự động register các screens từ file system */}
            {/* Nếu screen cần header mặc định, override trong component:
                <Stack.Screen options={{ headerShown: true, title: 'Tiêu đề' }} />
            */}
        </Stack>
    );
}
