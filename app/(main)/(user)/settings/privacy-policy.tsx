import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import React from 'react';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export default function PrivacyPolicyScreen() {
    // Unlock navigation when screen gains focus
    useNavigationUnlockOnFocus();

    return (

        <View style={styles.container}>
            <Text>Chính sách bảo mật</Text>
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
}));
