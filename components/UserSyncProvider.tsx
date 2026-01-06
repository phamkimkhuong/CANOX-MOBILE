import { useUserAddresses } from '@/hooks/api/useUserAddresses';
import React from 'react';

/**
 * UserSyncProvider
 * 
 * Component chạy ngầm ở top-level để:
 * 1. Fetch và đồng bộ danh sách địa chỉ vào Zustand Store ngay khi app start/login.
 * 2. Pre-fetch các dữ liệu cần thiết khác nếu cần.
 */
export const UserSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    useUserAddresses();

    return <>{children}</>;
};
