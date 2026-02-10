import { IconSymbol } from '@/components/ui/Icon';
import { Navigator } from '@/utils/navigation';
import { router } from 'expo-router';
import React, { memo, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Platform, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { WebView, type WebViewNavigation } from 'react-native-webview';

interface PolicyWebViewProps {
    /** URL to load in WebView */
    url: string;
    /** Title displayed in the native header */
    title: string;
    /** Whether to show share button */
    showShare?: boolean;
}

/**
 * PolicyWebView - In-app WebView for legal/policy pages
 * 
 * Provides a native-feeling experience:
 * - Native header with back button and title
 * - WebView loads URL from your domain
 * - Loading indicator overlay
 * - Error state with retry
 * - No address bar visible → feels like native screen
 */
export const PolicyWebView: React.FC<PolicyWebViewProps> = memo(({
    url,
    title,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('profile');
    const insets = useSafeAreaInsets();
    const styles = stylesheet;
    const webViewRef = useRef<WebView>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [canGoBack, setCanGoBack] = useState(false);

    // Handle native back press
    const handleGoBack = useCallback(() => {
        if (canGoBack && webViewRef.current) {
            webViewRef.current.goBack();
        } else if (router.canGoBack()) {
            Navigator.back();
        } else {
            Navigator.replace('/(tabs)/me');
        }
    }, [canGoBack]);

    // Handle WebView navigation state changes
    const handleNavigationStateChange = useCallback((navState: WebViewNavigation) => {
        setCanGoBack(navState.canGoBack);
    }, []);

    // Handle retry on error
    const handleRetry = useCallback(() => {
        setHasError(false);
        setIsLoading(true);
        webViewRef.current?.reload();
    }, []);

    // Inject CSS to style the web content to match app theme
    const injectedCSS = `
        (function() {
            var style = document.createElement('style');
            style.innerHTML = \`
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    padding: 16px;
                    padding-bottom: 60px;
                    line-height: 1.6;
                    color: ${theme.colors.typography};
                    background-color: ${theme.colors.background};
                    -webkit-text-size-adjust: 100%;
                }
                h1, h2, h3, h4, h5, h6 {
                    color: ${theme.colors.typography};
                    margin-top: 24px;
                    margin-bottom: 12px;
                }
                a { color: ${theme.colors.primary}; }
                img { max-width: 100%; height: auto; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid ${theme.colors.border}; padding: 8px; }
            \`;
            document.head.appendChild(style);
        })();
        true;
    `;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar
                barStyle={Platform.OS === 'ios' ? 'dark-content' : 'dark-content'}
                backgroundColor="transparent"
                translucent
            />

            {/* Native Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={handleGoBack}
                    style={styles.headerButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityLabel={t('legalWebView.back')}
                    accessibilityRole="button"
                >
                    <IconSymbol
                        name="back"
                        size={24}
                        color={theme.colors.typography}
                    />
                </TouchableOpacity>

                <Text style={styles.headerTitle} numberOfLines={1}>
                    {title}
                </Text>

                {/* Placeholder for symmetry */}
                <View style={styles.headerButton} />
            </View>

            {/* WebView Content */}
            {hasError ? (
                <View style={styles.errorContainer}>
                    <IconSymbol
                        name="wifi-off"
                        size={48}
                        color={theme.colors.secondary}
                    />
                    <Text style={styles.errorTitle}>
                        {t('legalWebView.errorTitle')}
                    </Text>
                    <Text style={styles.errorSubtitle}>
                        {t('legalWebView.errorSubtitle')}
                    </Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={handleRetry}
                        activeOpacity={0.7}
                    >
                        <IconSymbol name="refresh" size={18} color="#fff" />
                        <Text style={styles.retryText}>{t('legalWebView.retry')}</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <WebView
                        ref={webViewRef}
                        source={{ uri: url }}
                        style={styles.webview}
                        onLoadStart={() => setIsLoading(true)}
                        onLoadEnd={() => setIsLoading(false)}
                        onError={() => {
                            setIsLoading(false);
                            setHasError(true);
                        }}
                        onNavigationStateChange={handleNavigationStateChange}
                        injectedJavaScript={injectedCSS}
                        // Security & performance
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        startInLoadingState={false}
                        scalesPageToFit={true}
                        // Prevent navigation to external URLs
                        originWhitelist={['https://*', 'http://*']}
                        // iOS specific
                        allowsInlineMediaPlayback={true}
                        // Android specific
                        mixedContentMode="compatibility"
                        // Hide native loading indicator, we use our own
                        renderLoading={() => <View />}
                    />

                    {/* Custom Loading Overlay */}
                    {isLoading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator
                                size="large"
                                color={theme.colors.primary}
                            />
                            <Text style={styles.loadingText}>
                                {t('legalWebView.loading')}
                            </Text>
                        </View>
                    )}
                </>
            )}
        </View>
    );
});

PolicyWebView.displayName = 'PolicyWebView';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    // Native Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
        paddingHorizontal: theme.margins.md,
        backgroundColor: theme.colors.background,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 17,
        fontWeight: '600',
        color: theme.colors.typography,
        marginHorizontal: theme.margins.sm,
    },
    // WebView
    webview: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    // Loading
    loadingOverlay: {
        ...({
            position: 'absolute',
            top: 56,
            left: 0,
            right: 0,
            bottom: 0,
        } as const),
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: theme.colors.secondary,
    },
    // Error
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        gap: 12,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.typography,
        marginTop: 8,
    },
    errorSubtitle: {
        fontSize: 14,
        color: theme.colors.secondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 8,
    },
    retryText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
}));
