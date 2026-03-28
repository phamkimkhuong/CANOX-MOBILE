import i18n from '@/constants/i18n';
import type { ErrorBoundaryProps } from 'expo-router';
import React from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type CrashScope = 'app' | 'group' | 'screen' | 'section';
type CrashPresentation = 'fullScreen' | 'embedded';

interface AppCrashFallbackViewProps {
    error: Error;
    title?: string;
    titleKey?: string;
    message?: string;
    messageKey?: string;
    onRetry: () => void | Promise<void>;
    retryLabel?: string;
    retryLabelKey?: string;
    scope?: CrashScope;
    presentation?: CrashPresentation;
    onSecondaryAction?: () => void;
    secondaryActionLabel?: string;
    secondaryActionLabelKey?: string;
}

interface AppRouteErrorBoundaryProps extends ErrorBoundaryProps {
    title?: string;
    titleKey?: string;
    message?: string;
    messageKey?: string;
    retryLabel?: string;
    retryLabelKey?: string;
    scope?: CrashScope;
    presentation?: CrashPresentation;
    onSecondaryAction?: () => void;
    secondaryActionLabel?: string;
    secondaryActionLabelKey?: string;
}

interface AppRenderErrorFallbackProps extends FallbackProps {
    title?: string;
    titleKey?: string;
    message?: string;
    messageKey?: string;
    retryLabel?: string;
    retryLabelKey?: string;
    scope?: CrashScope;
    presentation?: CrashPresentation;
    onSecondaryAction?: () => void;
    secondaryActionLabel?: string;
    secondaryActionLabelKey?: string;
}

const resolveText = (text: string | undefined, translationKey: string | undefined) => {
    if (text) {
        return text;
    }

    if (translationKey) {
        return i18n.t(translationKey as never) as string;
    }

    return '';
};

// Crash fallback intentionally avoids theme, query, router, and i18n hooks.
export function AppCrashFallbackView({
    error,
    title,
    titleKey,
    message,
    messageKey,
    onRetry,
    retryLabel,
    retryLabelKey = 'common:actions.retry',
    scope = 'screen',
    presentation = 'fullScreen',
    onSecondaryAction,
    secondaryActionLabel,
    secondaryActionLabelKey,
}: AppCrashFallbackViewProps) {
    const isFullScreen = presentation === 'fullScreen';
    const resolvedTitle = resolveText(title, titleKey);
    const resolvedMessage = resolveText(message, messageKey);
    const resolvedRetryLabel = resolveText(retryLabel, retryLabelKey);
    const resolvedSecondaryActionLabel = resolveText(secondaryActionLabel, secondaryActionLabelKey);
    const scopeLabel = i18n.t(`common:crash.scope.${scope}` as never) as string;
    const debugTitle = i18n.t('common:crash.debugTitle' as never) as string;

    return (
        <View style={[styles.shell, isFullScreen ? styles.fullScreenShell : styles.embeddedShell]}>
            <View style={[styles.card, isFullScreen ? styles.fullScreenCard : styles.embeddedCard]}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{scopeLabel}</Text>
                </View>

                <Text style={styles.title}>{resolvedTitle}</Text>
                <Text style={styles.message}>{resolvedMessage}</Text>

                <View style={styles.actions}>
                    <Pressable
                        accessibilityRole="button"
                        style={({ pressed }) => [
                            styles.primaryButton,
                            pressed ? styles.primaryButtonPressed : null,
                        ]}
                        onPress={() => {
                            void onRetry();
                        }}
                    >
                        <Text style={styles.primaryButtonText}>{resolvedRetryLabel}</Text>
                    </Pressable>

                    {onSecondaryAction && resolvedSecondaryActionLabel ? (
                        <Pressable
                            accessibilityRole="button"
                            style={({ pressed }) => [
                                styles.secondaryButton,
                                pressed ? styles.secondaryButtonPressed : null,
                            ]}
                            onPress={onSecondaryAction}
                        >
                            <Text style={styles.secondaryButtonText}>{resolvedSecondaryActionLabel}</Text>
                        </Pressable>
                    ) : null}
                </View>

                {__DEV__ ? (
                    <View style={styles.debugBlock}>
                        <Text style={styles.debugTitle}>{debugTitle}</Text>
                        <ScrollView
                            style={styles.debugScroll}
                            contentContainerStyle={styles.debugContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <Text selectable style={styles.debugText}>
                                {`${error.name}: ${error.message}`}
                            </Text>
                        </ScrollView>
                    </View>
                ) : null}
            </View>
        </View>
    );
}

export function AppRouteErrorBoundary({
    error,
    retry,
    title,
    titleKey,
    message,
    messageKey,
    retryLabel,
    retryLabelKey,
    scope,
    presentation,
    onSecondaryAction,
    secondaryActionLabel,
    secondaryActionLabelKey,
}: AppRouteErrorBoundaryProps) {
    return (
        <AppCrashFallbackView
            error={error}
            title={title}
            titleKey={titleKey}
            message={message}
            messageKey={messageKey}
            onRetry={retry}
            retryLabel={retryLabel}
            retryLabelKey={retryLabelKey}
            scope={scope}
            presentation={presentation}
            onSecondaryAction={onSecondaryAction}
            secondaryActionLabel={secondaryActionLabel}
            secondaryActionLabelKey={secondaryActionLabelKey}
        />
    );
}

export function AppRenderErrorFallback({
    error,
    resetErrorBoundary,
    title,
    titleKey,
    message,
    messageKey,
    retryLabel,
    retryLabelKey,
    scope,
    presentation,
    onSecondaryAction,
    secondaryActionLabel,
    secondaryActionLabelKey,
}: AppRenderErrorFallbackProps) {
    return (
        <AppCrashFallbackView
            error={error}
            title={title}
            titleKey={titleKey}
            message={message}
            messageKey={messageKey}
            onRetry={resetErrorBoundary}
            retryLabel={retryLabel}
            retryLabelKey={retryLabelKey}
            scope={scope}
            presentation={presentation}
            onSecondaryAction={onSecondaryAction}
            secondaryActionLabel={secondaryActionLabel}
            secondaryActionLabelKey={secondaryActionLabelKey}
        />
    );
}

export function createRouteErrorBoundary(
    config: Omit<AppRouteErrorBoundaryProps, 'error' | 'retry'>
) {
    const RouteErrorBoundary = (props: ErrorBoundaryProps) => (
        <AppRouteErrorBoundary {...props} {...config} />
    );

    RouteErrorBoundary.displayName = `RouteErrorBoundary(${config.title})`;

    return RouteErrorBoundary;
}

const styles = StyleSheet.create({
    shell: {
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenShell: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    embeddedShell: {
        minHeight: 320,
        padding: 16,
        borderRadius: 20,
    },
    card: {
        width: '100%',
        maxWidth: 520,
        borderRadius: 24,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    fullScreenCard: {
        padding: 24,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 6,
    },
    embeddedCard: {
        padding: 20,
    },
    badge: {
        alignSelf: 'flex-start',
        marginBottom: 14,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: '#fff1f2',
    },
    badgeText: {
        color: '#be123c',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    title: {
        color: '#0f172a',
        fontSize: 22,
        fontWeight: '800',
        lineHeight: 28,
    },
    message: {
        marginTop: 10,
        color: '#475569',
        fontSize: 15,
        lineHeight: 22,
    },
    actions: {
        marginTop: 20,
        gap: 10,
    },
    primaryButton: {
        minHeight: 48,
        borderRadius: 14,
        backgroundColor: '#dc2626',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    primaryButtonPressed: {
        backgroundColor: '#b91c1c',
    },
    primaryButtonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '700',
    },
    secondaryButton: {
        minHeight: 44,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        backgroundColor: '#ffffff',
    },
    secondaryButtonPressed: {
        backgroundColor: '#f8fafc',
    },
    secondaryButtonText: {
        color: '#0f172a',
        fontSize: 14,
        fontWeight: '600',
    },
    debugBlock: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 16,
    },
    debugTitle: {
        color: '#64748b',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.6,
        textTransform: 'uppercase',
    },
    debugScroll: {
        marginTop: 8,
        maxHeight: 160,
    },
    debugContent: {
        paddingBottom: 4,
    },
    debugText: {
        color: '#334155',
        fontSize: 13,
        lineHeight: 19,
    },
});
