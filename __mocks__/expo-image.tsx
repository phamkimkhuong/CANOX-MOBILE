import React from 'react';
import { View, type ViewProps } from 'react-native';

interface MockImageProps extends ViewProps {
    source?: unknown;
    contentFit?: string;
    transition?: number;
    accessibilityLabel?: string;
}

export const Image = (props: MockImageProps) => (
    <View testID="mock-expo-image" {...props} />
);
