import { PolicyWebView } from '@/components/common/PolicyWebView';
import { LEGAL_URLS } from '@/constants/legal';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import React from 'react';

/**
 * Terms of Service Screen
 * Renders the terms from the website via WebView
 */
export default function TermsScreen() {
    useNavigationUnlockOnFocus();

    return (
        <PolicyWebView
            url={LEGAL_URLS.TOS}
            title="Điều khoản sử dụng"
        />
    );
}
