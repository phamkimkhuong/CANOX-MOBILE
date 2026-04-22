import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, RenderHookOptions } from '@testing-library/react-native';
import React, { ReactNode } from 'react';

// Create a custom query client for testing so tests don't share cache
export const createTestQueryClient = () => {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
                staleTime: 0,
            },
            mutations: {
                retry: false,
            },
        },
    });
};

interface WrapperProps {
    children: ReactNode;
}

export const renderHookWithProviders = <Result, Props>(
    renderCallback: (props: Props) => Result,
    options?: Omit<RenderHookOptions<Props>, 'wrapper'>
) => {
    const queryClient = createTestQueryClient();

    const Wrapper = ({ children }: WrapperProps) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );

    return {
        ...renderHook(renderCallback, { wrapper: Wrapper, ...options }),
        queryClient, // Return queryClient to allow cache manipulation in tests
    };
};
