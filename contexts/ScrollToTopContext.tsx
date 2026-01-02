/**
 * ScrollToTopContext
 * 
 * Context to communicate the "scroll to top" event between Tab Navigator and screens.
 * Pattern: When user taps on the active tab, the screen will scroll to the top.
 * 
 * This is the standard UX used by Instagram, Twitter, TikTok, etc.
 */

import React, { createContext, useCallback, useContext, useRef } from 'react';

type ScrollToTopCallback = () => void;

interface ScrollToTopContextType {
    /**
     * Register callback when the screen wants to listen to the scroll to top event
     * @param screenName - Screen ID (e.g., 'index', 'category')
     * @param callback - Function to call when scroll to top is needed
     */
    registerScrollToTop: (screenName: string, callback: ScrollToTopCallback) => void;

    /**
     * Unregister callback
     * @param screenName - Screen ID
     */
    unregisterScrollToTop: (screenName: string) => void;

    /**
     * Trigger scroll to top for a specific screen
     * @param screenName - Screen ID
     */
    triggerScrollToTop: (screenName: string) => void;
}

const ScrollToTopContext = createContext<ScrollToTopContextType | null>(null);

export const ScrollToTopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Map to store callbacks by screen name
    const callbacksRef = useRef<Map<string, ScrollToTopCallback>>(new Map());

    const registerScrollToTop = useCallback((screenName: string, callback: ScrollToTopCallback) => {
        callbacksRef.current.set(screenName, callback);
    }, []);

    const unregisterScrollToTop = useCallback((screenName: string) => {
        callbacksRef.current.delete(screenName);
    }, []);

    const triggerScrollToTop = useCallback((screenName: string) => {
        const callback = callbacksRef.current.get(screenName);
        if (callback) {
            callback();
        }
    }, []);

    return (
        <ScrollToTopContext.Provider
            value={{
                registerScrollToTop,
                unregisterScrollToTop,
                triggerScrollToTop,
            }}
        >
            {children}
        </ScrollToTopContext.Provider>
    );
};

/**
 * Hook to use in screens
 */
export const useScrollToTopContext = () => {
    const context = useContext(ScrollToTopContext);
    if (!context) {
        throw new Error('useScrollToTopContext must be used within ScrollToTopProvider');
    }
    return context;
};

/**
 * Convenience hook to register scroll to top in a screen
 * Automatically cleanup when component unmount
 * 
 * @param screenName - Screen name (must match name in Tabs.Screen)
 * @param scrollToTop - Function to execute scroll to top
 */
export const useScrollToTopHandler = (screenName: string, scrollToTop: () => void) => {
    const { registerScrollToTop, unregisterScrollToTop } = useScrollToTopContext();

    React.useEffect(() => {
        registerScrollToTop(screenName, scrollToTop);
        return () => {
            unregisterScrollToTop(screenName);
        };
    }, [screenName, scrollToTop, registerScrollToTop, unregisterScrollToTop]);
};
