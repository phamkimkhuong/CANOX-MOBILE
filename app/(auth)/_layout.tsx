import '@/constants/unistyles';
import { createRouteErrorBoundary } from '@/components/common/AppCrashFallback';
import { Stack } from 'expo-router';
import React from 'react';

export const ErrorBoundary = createRouteErrorBoundary({
	titleKey: 'common:crash.auth.title',
	messageKey: 'common:crash.auth.message',
	scope: 'group',
});

export default function AuthLayout() {
	return <Stack screenOptions={{ headerShown: false }} />;
}

