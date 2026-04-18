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

import { createRouteErrorBoundary } from '@/components/common/AppCrashFallback';
import { Stack } from 'expo-router';

export const ErrorBoundary = createRouteErrorBoundary({
    scope: 'group',
    titleKey: 'common:crash.main.title',
    messageKey: 'common:crash.main.message',
});

export default function MainLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
        </Stack>
    );
}
