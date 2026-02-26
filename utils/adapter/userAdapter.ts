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
    const displayName = buyer?.fullName || apiData.username || '';

    // Determine if user is truly verified:
    const hasValidFullName = Boolean(
        buyer?.fullName &&
        buyer.fullName.trim() !== '' &&
        buyer.fullName !== '-'
    );
    const hasValidPhone = Boolean(
        buyer?.phone &&
        buyer.phone.trim() !== '' &&
        buyer.phone !== '-'
    );
    // Use API profileCompleted flag if available, fallback to manual validation
    const isVerified = buyer?.profileCompleted ?? (hasValidFullName && hasValidPhone);

    return {
        id: apiData.userId,
        username: apiData.username || '',
        fullName: displayName,
        email: apiData.email || undefined,
        phone: buyer?.phone || undefined,
        avatar: apiData.avatar?.replace(/\s+/g, '') || null,
        dateOfBirth: buyer?.dateOfBirth || undefined,
        gender: (buyer?.gender as Gender) || undefined,
        // Default to BRONZE - can be enhanced with member level API later
        memberLevel: 'BRONZE',
        isVerified,
        recentViewCount: 0,
        followingShops: 0,
    };
};
