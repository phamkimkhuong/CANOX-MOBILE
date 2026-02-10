import { PolicyWebView } from '@/components/common/PolicyWebView';
import { LEGAL_URLS } from '@/constants/legal';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import React from 'react';

/**
 * Privacy Policy Screen
 * Renders the privacy policy from the website via WebView
 */
export default function PrivacyPolicyScreen() {
    useNavigationUnlockOnFocus();

    return (
        <PolicyWebView
            url={LEGAL_URLS.PRIVACY}
            title="Chính sách bảo mật"
        />
    );
}
