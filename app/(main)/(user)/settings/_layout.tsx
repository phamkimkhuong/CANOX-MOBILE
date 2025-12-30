/**
 * Settings Layout - Slot (Pass-through)
 * 
 * KHÔNG tạo Stack Navigator riêng ở đây để tránh Layout Hell.
 * Header được quản lý bởi (main)/_layout.tsx
 * 
 * Mỗi screen settings tự set title động bằng:
 * <Stack.Screen options={{ title: 'Tiêu đề' }} />
 */

import { Slot } from 'expo-router';

export default function SettingsLayout() {
    // Slot = pass-through, không tạo thêm Navigator
    return <Slot />;
}
