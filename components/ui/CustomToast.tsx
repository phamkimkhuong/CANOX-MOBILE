import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { BaseToastProps, ToastConfig } from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

// Định nghĩa props
interface CustomToastProps extends BaseToastProps {
    type: 'success' | 'error' | 'info';
}

const ToastAlert = ({ text1, text2, type }: CustomToastProps) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    // Config màu sắc icon dựa theo type
    const getIconConfig = () => {
        switch (type) {
            case 'success': return { name: 'check-circle', color: theme.colors.success || '#22c55e' };
            case 'error': return { name: 'error', color: theme.colors.error };
            default: return { name: 'info', color: theme.colors.primary };
        }
    };

    const iconConfig = getIconConfig();

    return (
        <View style={[styles.container, styles[`border${type}`]]}>
            <View style={styles.iconContainer}>
                <MaterialIcons name={iconConfig.name as any} size={24} color={iconConfig.color} />
            </View>
            <View style={styles.contentContainer}>
                <Text style={styles.title}>{text1}</Text>
                {text2 && <Text style={styles.message}>{text2}</Text>}
            </View>
        </View>
    );
};

// Config để truyền vào Toast Global
export const toastConfig: ToastConfig = {
    success: (props) => <ToastAlert {...props} type="success" />,
    error: (props) => <ToastAlert {...props} type="error" />,
    info: (props) => <ToastAlert {...props} type="info" />,
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        width: '90%',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.m,
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.margins.md,
        // Shadow for iOS & Android
        shadowColor: theme.colors.typography,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderLeftWidth: 4, // Điểm nhấn màu bên trái
    },
    bordersuccess: { borderLeftColor: theme.colors.success || '#22c55e' },
    bordererror: { borderLeftColor: theme.colors.error },
    borderinfo: { borderLeftColor: theme.colors.primary },

    iconContainer: {
        marginRight: theme.margins.md,
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.typography,
        marginBottom: 2,
    },
    message: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
        lineHeight: 18,
    },
}));