import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export const SocialLoginButtons = () => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <View style={styles.socialRow}>
            <SocialButton icon="logo-google" color="#DB4437" />
            <SocialButton icon="logo-facebook" color="#4267B2" />
            <SocialButton icon="logo-apple" color="#000000" />
        </View>
    );
};

const SocialButton = ({ icon, color }: { icon: keyof typeof Ionicons.glyphMap; color: string }) => {
    const styles = stylesheet;
    return (
        <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
            <Ionicons name={icon} size={24} color={color} />
        </TouchableOpacity>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    socialRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
    },
    socialBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
}));