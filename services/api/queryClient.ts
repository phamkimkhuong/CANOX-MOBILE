import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2, // Thử lại 2 lần nếu lỗi mạng
            staleTime: 1000 * 60, // Data cũ sau 1 phút (đồng bộ với config cũ)
        },
    },
});
