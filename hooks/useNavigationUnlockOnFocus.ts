import { Navigator } from '@/utils/navigation';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

/**
 * Hook to unlock navigation when screen gains focus
 * 
 * ## When to use:
 * - On screens that are navigation targets (Cart, Product Detail, etc.)
 * - On screens where users might navigate back and forth frequently
 * - As a safety net in complex navigation flows
 */
export const useNavigationUnlockOnFocus = () => {
    useFocusEffect(
        useCallback(() => {
            // Small delay to ensure navigation animation has completed
            const timer = setTimeout(() => {
                Navigator.unlock();
            }, 100);

            return () => clearTimeout(timer);
        }, [])
    );
};

/**
 * Hook variant that unlocks immediately on focus
 * Use when you're certain animation is complete
 */
export const useNavigationUnlockOnFocusImmediate = () => {
    useFocusEffect(
        useCallback(() => {
            Navigator.unlock();
        }, [])
    );
};
