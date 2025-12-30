/**
 * Voucher Layout
 * 
 * Stack navigation cho các màn hình voucher
 */

import { Stack } from 'expo-router';
import React from 'react';
import { useUnistyles } from 'react-native-unistyles';

export default function VoucherLayout() {
    const { theme } = useUnistyles();

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: {
                    backgroundColor: theme.colors.background,
                },
                animation: 'slide_from_right',

            }}
        >
            <Stack.Screen name="index" />
        </Stack>
    );
}

