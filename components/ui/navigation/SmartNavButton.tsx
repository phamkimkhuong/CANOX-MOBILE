import { Navigator } from '@/utils/navigation';
import { Href } from 'expo-router';
import React, { useCallback, useRef } from 'react';
import { GestureResponderEvent, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';

interface SmartButtonProps extends PressableProps {
    route?: Href | string;
    prefetchAction?: () => Promise<unknown> | void;
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
    onPressIn,
    onPress,
    ...restProps
}) => {
    const touchStartTime = useRef(0);

    const handlePressIn = useCallback((event: GestureResponderEvent) => {
        touchStartTime.current = Date.now();
        if (prefetchAction) {
            prefetchAction();
        }
        if (onPressIn) {
            onPressIn(event);
        }
    }, [prefetchAction, onPressIn]);

    const handlePress = useCallback((event: GestureResponderEvent) => {
        if (onPress) {
            onPress(event);
            return;
        }
        if (route) {
            Navigator.push(route);
        }
    }, [route, onPress]);

    return (
        <Pressable
            {...restProps}
            onPressIn={handlePressIn}
            onPress={handlePress}
            delayLongPress={200}
            pressRetentionOffset={20}
            unstable_pressDelay={0}
            style={style}
        >
            {children}
        </Pressable>
    );
};
