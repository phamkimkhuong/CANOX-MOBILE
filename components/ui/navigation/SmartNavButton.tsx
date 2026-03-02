import { Navigator } from '@/utils/navigation';
import * as Haptics from 'expo-haptics';
import { Href } from 'expo-router';
import React, { useCallback } from 'react';
import { GestureResponderEvent, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';

interface SmartButtonProps extends PressableProps {
    route?: Href | string;
    prefetchAction?: () => Promise<unknown> | void;
    /** Enable haptic feedback on press-in (default: true) */
    enableHaptic?: boolean;
    style?: StyleProp<ViewStyle>;
}

/**
 * SmartNavButton — High-performance navigation button.
 */
export const SmartNavButton: React.FC<SmartButtonProps> = ({
    route,
    prefetchAction,
    enableHaptic = true,
    children,
    style,
    onPressIn,
    onPress,
    ...restProps
}) => {
    const handlePressIn = useCallback((event: GestureResponderEvent) => {
        if (enableHaptic) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
        if (prefetchAction) {
            prefetchAction();
        }
        if (onPressIn) {
            onPressIn(event);
        }
    }, [enableHaptic, prefetchAction, onPressIn]);

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
