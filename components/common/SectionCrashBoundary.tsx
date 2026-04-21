import React, { ReactNode } from 'react';
import { ErrorBoundary, type FallbackProps, type OnErrorCallback } from 'react-error-boundary';

import { AppRenderErrorFallback } from './AppCrashFallback';

export interface SectionCrashBoundaryProps {
    children: ReactNode;
    titleKey?: string;
    messageKey?: string;
    retryLabelKey?: string;
    resetKeys?: unknown[];
    onError?: OnErrorCallback;
    onReset?: (details:
        | { reason: 'imperative-api'; args: unknown[] }
        | { reason: 'keys'; prev: unknown[] | undefined; next: unknown[] | undefined }
    ) => void;
    fallback?: (props: FallbackProps) => ReactNode;
}

export function SectionCrashBoundary({
    children,
    titleKey = 'common:crash.section.title',
    messageKey = 'common:crash.section.message',
    retryLabelKey = 'common:actions.retry',
    resetKeys,
    onError,
    onReset,
    fallback,
}: SectionCrashBoundaryProps) {
    return (
        <ErrorBoundary
            resetKeys={resetKeys}
            onError={onError}
            onReset={onReset}
            fallbackRender={(props) =>
                fallback ? (
                    fallback(props)
                ) : (
                    <AppRenderErrorFallback
                        {...props}
                        scope="section"
                        presentation="embedded"
                        titleKey={titleKey}
                        messageKey={messageKey}
                        retryLabelKey={retryLabelKey}
                    />
                )
            }
        >
            {children}
        </ErrorBoundary>
    );
}
