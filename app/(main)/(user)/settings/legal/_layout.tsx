/**
 * Legal Layout - Slot (Pass-through)
 * 
 * KHÔNG tạo Stack Navigator riêng để tránh Layout Hell.
 * Header được quản lý bởi (main)/_layout.tsx
 */

import { Slot } from 'expo-router';

export default function LegalLayout() {
    return <Slot />;
}
