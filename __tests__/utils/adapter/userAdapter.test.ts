/**
 * User Adapter Unit Tests
 */

import type { BuyerProfileDetailData, UserMeData } from '@/types/user';
import { transformBuyerProfileDetail, transformUserMe } from '@/utils/adapter/userAdapter';

const createUserMeData = (overrides: Partial<UserMeData> = {}): UserMeData => ({
    userId: 'user-1',
    username: 'johndoe',
    email: 'john@example.com',
    avatar: 'https://example.com/avatar.jpg',
    buyer: {
        buyerId: 'buyer-1',
        fullName: 'John Doe',
        phone: '0901234567',
        profileCompleted: true,
    },
    ...overrides,
});

describe('userAdapter', () => {
    describe('transformUserMe', () => {
        it('maps basic fields', () => {
            const result = transformUserMe(createUserMeData());

            expect(result.id).toBe('user-1');
            expect(result.username).toBe('johndoe');
            expect(result.email).toBe('john@example.com');
            expect(result.memberLevel).toBe('BRONZE');
        });

        it('uses buyer.fullName as fullName', () => {
            const result = transformUserMe(createUserMeData({
                buyer: { buyerId: 'buyer-1', fullName: 'Nguyễn Văn A', phone: '0901234567', profileCompleted: true },
            }));

            expect(result.fullName).toBe('Nguyễn Văn A');
        });

        it('falls back to username when buyer.fullName is missing', () => {
            const result = transformUserMe(createUserMeData({
                username: 'fallback_user',
                buyer: undefined,
            }));

            expect(result.fullName).toBe('fallback_user');
        });

        it('returns empty string when both fullName and username are missing', () => {
            const result = transformUserMe(createUserMeData({
                username: undefined,
                buyer: undefined,
            }));

            expect(result.fullName).toBe('');
        });

        it('uses profileCompleted flag from API', () => {
            const verified = transformUserMe(createUserMeData({
                buyer: { buyerId: 'buyer-1', fullName: 'Test', phone: '0901234567', profileCompleted: true },
            }));
            const notVerified = transformUserMe(createUserMeData({
                buyer: { buyerId: 'buyer-1', fullName: 'Test', phone: '0901234567', profileCompleted: false },
            }));

            expect(verified.isVerified).toBe(true);
            expect(notVerified.isVerified).toBe(false);
        });

        it('falls back to manual validation when profileCompleted is null', () => {
            const result = transformUserMe(createUserMeData({
                buyer: {
                    buyerId: 'buyer-1',
                    fullName: 'Valid Name',
                    phone: '0901234567',
                    profileCompleted: null as unknown as boolean,
                },
            }));

            // Both fullName and phone are valid → isVerified = true
            expect(result.isVerified).toBe(true);
        });

        it('marks as not verified when name is invalid placeholder', () => {
            const result = transformUserMe(createUserMeData({
                buyer: {
                    buyerId: 'buyer-1',
                    fullName: '-',
                    phone: '0901234567',
                    profileCompleted: null as unknown as boolean,
                },
            }));

            expect(result.isVerified).toBe(false);
        });

        it('cleans whitespace from avatar URL', () => {
            const result = transformUserMe(createUserMeData({
                avatar: 'https://example.com/  avatar .jpg',
            }));

            expect(result.avatar).toBe('https://example.com/avatar.jpg');
        });

        it('returns null avatar when empty', () => {
            const result = transformUserMe(createUserMeData({ avatar: '' }));
            expect(result.avatar).toBeNull();
        });

        it('defaults counts to 0', () => {
            const result = transformUserMe(createUserMeData());

            expect(result.recentViewCount).toBe(0);
            expect(result.followingShops).toBe(0);
        });
    });

    describe('transformBuyerProfileDetail', () => {
        it('maps all fields', () => {
            const data: BuyerProfileDetailData = {
                fullName: 'Nguyễn Văn A',
                phone: '0901234567',
                dateOfBirth: '1990-01-15',
                gender: 'MALE',
            };

            const result = transformBuyerProfileDetail(data);

            expect(result.fullName).toBe('Nguyễn Văn A');
            expect(result.phone).toBe('0901234567');
            expect(result.dateOfBirth).toBe('1990-01-15');
            expect(result.gender).toBe('MALE');
        });

        it('returns undefined for empty values', () => {
            const data: BuyerProfileDetailData = {
                fullName: '',
                phone: '',
                dateOfBirth: '',
                gender: undefined,
            };

            const result = transformBuyerProfileDetail(data);

            expect(result.fullName).toBeUndefined();
            expect(result.phone).toBeUndefined();
            expect(result.dateOfBirth).toBeUndefined();
            expect(result.gender).toBeUndefined();
        });
    });
});
