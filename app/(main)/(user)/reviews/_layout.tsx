/**
 * ==============================================
 * REVIEWS LAYOUT - Stack navigator for reviews
 * ==============================================
 */

import { Stack } from 'expo-router';
import { useUnistyles } from 'react-native-unistyles';

export default function ReviewsLayout() {
    const { theme } = useUnistyles();

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: {
                    backgroundColor: theme.colors.background,
                },
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="write/[itemId]" />
        </Stack>
    );
}
