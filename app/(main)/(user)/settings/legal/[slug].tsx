import { PolicyWebView } from '@/components/common/PolicyWebView';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

/**
 * Legal WebView Screen
 * 
 * Dynamic route: /settings/legal/[slug]
 * Receives `url` and `title` via search params from the legal list screen.
 * 
 * Example navigation:
 *   router.push({ pathname: '/settings/legal/[slug]', params: { slug: 'privacy', url, title } })
 */
export default function LegalWebViewScreen() {
    const { url, title } = useLocalSearchParams<{ url: string; title: string }>();

    return (
        <PolicyWebView
            url={url ?? ''}
            title={title ?? 'Chính sách'}
        />
    );
}
