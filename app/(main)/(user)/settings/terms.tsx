import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import React from 'react';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export default function TermsScreen() {
    // Unlock navigation when screen gains focus
    useNavigationUnlockOnFocus();

    return (

        <View style={styles.container}>
            <Text>Điều khoản dịch vụ</Text>
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
