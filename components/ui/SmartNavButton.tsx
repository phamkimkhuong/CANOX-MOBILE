import { Navigator } from '@/utils/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Href } from 'expo-router';
import React, { useCallback, useRef } from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';

import { createLogger } from '@/utils/logger';

const log = createLogger('ProductCard');

interface SmartButtonProps extends PressableProps {
    route?: Href | string;
    prefetchAction?: () => Promise<any> | void;
    style?: StyleProp<ViewStyle>;
}

/**
 * SmartNavButton - Extreme Performance Version
 */
export const SmartNavButton: React.FC<SmartButtonProps> = ({
    route,
    prefetchAction,
    children,
    style,
    ...props
}) => {
    const queryClient = useQueryClient();
    const touchStartTime = useRef(0);

    const handlePressIn = useCallback((event: any) => {
        touchStartTime.current = Date.now();
        if (prefetchAction) {
            prefetchAction();
        }
        if (props.onPressIn) {
            props.onPressIn(event);
        }
    }, [prefetchAction, props.onPressIn]);

    const handlePress = useCallback((event: any) => {
        if (props.onPress) {
            props.onPress(event);
            return;
        }
        if (route) {
            Navigator.push(route);
        }
    }, [route, props.onPress]);

    return (
        <Pressable
            onPressIn={handlePressIn}
            onPress={handlePress}
            delayLongPress={200}
            pressRetentionOffset={20}
            unstable_pressDelay={0}
            style={style}
            {...props}
        >
            {children}
        </Pressable>
    );
};
