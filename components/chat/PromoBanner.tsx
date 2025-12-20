import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface PromoBannerProps {
    title: string;
    subtitle: string;
    icon?: string;
    onPress?: () => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({
    title,
    subtitle,
    icon = 'local-shipping',
    onPress,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.9}
        >
            <View style={styles.content}>
                <Text style={styles.subtitle}>{subtitle}</Text>
                <Text style={styles.title}>{title}</Text>
            </View>
            <View style={styles.iconContainer}>
                <MaterialIcons
                    name={icon as React.ComponentProps<typeof MaterialIcons>['name']}
                    size={24}
                    color="#fff"
                />
            </View>
        </TouchableOpacity>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        marginHorizontal: theme.margins.md,
        marginVertical: theme.margins.smd,
        padding: theme.margins.smd,
        borderRadius: theme.radius.l,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.primary,
    },
    content: {
        flex: 1,
    },
    subtitle: {
        fontSize: 12,
        color: theme.colors.textOnOverlay,
        fontWeight: '500',
        marginBottom: 2,
    },
    title: {
        fontSize: 14,
        color: theme.colors.onPrimary,
        fontWeight: '700',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.surfaceTranslucent,
        justifyContent: 'center',
        alignItems: 'center',
    },
}));
