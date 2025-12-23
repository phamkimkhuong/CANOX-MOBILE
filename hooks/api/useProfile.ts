import { UserProfile } from '@/types/user';
import { useQuery } from '@tanstack/react-query';

// Mock data
const MOCK_PROFILE: UserProfile = {
    id: 'u1',
    username: 'nguyenvana',
    fullName: 'Nguyễn Văn A',
    avatar: 'https://i.pravatar.cc/300',
    memberLevel: 'Thành viên Bạc',
    followingCount: 12,
    followerCount: 250,
    likeCount: 45,
    orderStats: {
        pendingPayment: 2,
        processing: 1,
        shipping: 5,
        review: 0,
    },
    wallet: {
        coins: 1200,
        vouchers: 3,
    }
};

export const useUserProfile = () => {
    return useQuery({
        queryKey: ['user-profile'],
        queryFn: async () => {
            // Giả lập delay mạng
            await new Promise(r => setTimeout(r, 1000));
            return MOCK_PROFILE;
        },
    });
};