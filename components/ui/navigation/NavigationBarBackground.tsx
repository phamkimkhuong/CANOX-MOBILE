import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * NavigationBarBackground Component
 * 
 * Create a View with dark background color for the Navigation Bar area of the phone.
 * Solve the problem of Navigation Bar being transparent on Android edge-to-edge mode
 * making navigation bar icons (white) invisible on a bright background.
 * 
 * Features:
 * - Automatically calculate height based on `useSafeAreaInsets().bottom`
 * - Only display when the device has a Navigation Bar (insets.bottom > 0)
 * - Not display when the device uses pure gesture navigation or has no navigation bar
 * - Set `position: 'absolute'` at the bottom to not affect content layout
 * - zIndex low to be below other overlays (Toast, Alert, Modal)
 * 
 * @param backgroundColor - Màu nền của Navigation Bar area (mặc định: #1a1a1a)
 */
interface NavigationBarBackgroundProps {
    backgroundColor?: string;
}

export function NavigationBarBackground({
    backgroundColor = '#1a1a1a'
}: NavigationBarBackgroundProps) {
    const insets = useSafeAreaInsets();

    // NOT render if no safe area bottom (device has no navigation bar)
    if (insets.bottom === 0) {
        return null;
    }

    return (
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
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1,
    },
});
