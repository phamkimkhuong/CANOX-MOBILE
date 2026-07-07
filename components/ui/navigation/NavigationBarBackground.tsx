import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * NavigationBarBackground Component
 * 
 * Create a View with dark background color for the Navigation Bar area of the phone.
 * Solve the problem of Navigation Bar being transparent on Android edge-to-edge mode
 * making navigation bar icons (white) invisible on a bright background.
 * @param backgroundColor - Màu nền của Navigation Bar area (mặc định: #1a1a1a)
 */
interface NavigationBarBackgroundProps {
    backgroundColor?: string;
}

export function NavigationBarBackground({
    backgroundColor = 'rgba(255,255,255,0.95)'
}: NavigationBarBackgroundProps) {
    const insets = useSafeAreaInsets();

    // Only apply for Android navigation bar background issue.
    if (Platform.OS !== 'android' || insets.bottom === 0) {
        return null;
    }

    return (
        <>
            <StatusBar style="dark" />
            <View
                style={[
                    styles.container,
                    {
                        height: insets.bottom,
                        backgroundColor,
                    }
                ]}
                pointerEvents="none"
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1,
        borderTopWidth: 0.5,
        borderTopColor: '#e2e8f0',
    },
});
