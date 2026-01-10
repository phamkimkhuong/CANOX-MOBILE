/**
 * ==============================================
 * USER ME ADAPTER
 * ==============================================
 */

import { UserProfile } from '@/types/profile/profile';
import { Gender, UserMeData } from '@/types/user';

/**
 * Transform User Me API Data → UserProfile (Profile UI)
 * 
 * Priority logic:
 * - fullName: buyer.fullName || username
 * - avatar: image (Google avatar)
 * - Default member level: BRONZE (can be enhanced later)
 */
export const transformUserMe = (apiData: UserMeData): UserProfile => {
    // Extract buyer info
    const buyer = apiData.buyer;
    const displayName = buyer?.fullName || apiData.username;

    return {
        id: apiData.userId,
        username: apiData.username,
        fullName: displayName,
        email: apiData.email,
        phone: buyer?.phone || undefined,
        avatar: apiData.image || null,
        dateOfBirth: buyer?.dateOfBirth || null,
        gender: (buyer?.gender as Gender) || null,
        // Default to BRONZE - can be enhanced with member level API later
        memberLevel: 'BRONZE',
        isVerified: apiData.status === 'ACTIVE',
        recentViewCount: 0,
        followingShops: 0,
    };
};
