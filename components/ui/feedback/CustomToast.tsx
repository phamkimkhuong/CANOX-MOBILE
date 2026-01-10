import { IconSymbol, IconSymbolName } from '@/components/ui/Icon';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Toast, { BaseToastProps, ToastConfig } from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

/**
 * CustomToast - Toast notification component với styling tùy chỉnh
 * 
 * Hỗ trợ 3 loại toast: success, error, info
 */
interface CustomToastProps extends BaseToastProps {
    type: 'success' | 'error' | 'info';
}

const ToastAlert = ({ text1, text2, type }: CustomToastProps) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    /**
     * Lấy config icon dựa theo loại toast
     * @returns Object chứa tên icon và màu sắc tương ứng
     */
    const getIconConfig = (): { name: IconSymbolName; color: string } => {
        switch (type) {
            case 'success': return { name: 'check-circle', color: theme.colors.success || '#22c55e' };
            case 'error': return { name: 'error', color: theme.colors.error };
            default: return { name: 'info', color: theme.colors.primary };
        }
    };

    const iconConfig = getIconConfig();

    const handleClose = () => {
        Toast.hide();
    };

    return (
        <View style={[styles.container, styles[`border${type}`]]}>
            <View style={styles.iconContainer}>
                <IconSymbol name={iconConfig.name} size={24} color={iconConfig.color} />
            </View>
            <View style={styles.contentContainer}>
                <Text style={styles.title} numberOfLines={1}>{text1}</Text>
                {text2 && <Text style={styles.message} numberOfLines={2}>{text2}</Text>}
            </View>
            <Pressable
                onPress={handleClose}
                style={({ pressed }) => [
                    styles.closeButton,
                    pressed && styles.closeButtonPressed
                ]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <IconSymbol name="close" size={18} color={theme.colors.typographySecondary} />
            </Pressable>
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
        width: '94%',
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
        marginRight: theme.margins.sm,
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
    closeButton: {
        padding: 4,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonPressed: {
        backgroundColor: theme.colors.backgroundSurface,
    },
}));
