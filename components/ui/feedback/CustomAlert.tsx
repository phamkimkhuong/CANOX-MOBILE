import { IconSymbol } from '@/components/ui/Icon';
import { lightTheme } from '@/constants/unistyles';
import { AlertConfig } from '@/utils/AlertHelper';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

const CustomAlert = forwardRef((_props, ref) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const [state, setState] = useState<{
        isVisible: boolean;
        config: AlertConfig;
    }>({
        isVisible: false,
        config: {
            title: 'Thông báo',
            type: 'info',
        }
    });

    useImperativeHandle(ref, () => ({
        show: (newConfig: AlertConfig) => {
            setState({
                isVisible: true,
                config: {
                    title: 'Thông báo',
                    type: 'info',
                    ...newConfig
                }
            });
        },
        hide: () => {
            setState(prev => ({ ...prev, isVisible: false }));
        }
    }));

    const handleConfirm = () => {
        const action = state.config.onConfirm;
        setState(prev => ({ ...prev, isVisible: false }));
        if (action) action();
    };

    const handleCancel = () => {
        const action = state.config.onCancel;
        setState(prev => ({ ...prev, isVisible: false }));
        if (action) action();
    };

    const handleButtonPress = (onPress?: () => void) => {
        setState(prev => ({ ...prev, isVisible: false }));
        if (onPress) onPress();
    };

    const getIconInfo = () => {
        const type = state.config.type || 'info';
        switch (type) {
            case 'success':
                return { name: 'check-circle' as const, color: theme.colors.success };
            case 'error':
                return { name: 'error' as const, color: theme.colors.error };
            case 'warning':
                return { name: 'warning' as const, color: theme.colors.warning };
            case 'info':
            default:
                return { name: 'info' as const, color: theme.colors.info };
        }
    };

    const icon = getIconInfo();
    const { config, isVisible } = state;

    const renderButtons = () => {
        // Option 1: Multiple buttons provided (Vertical list)
        if (config.buttons && config.buttons.length > 0) {
            return (
                <View style={styles.verticalFooter}>
                    {config.buttons.map((btn, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.verticalBtn,
                                index !== config.buttons!.length - 1 && styles.verticalBtnBorder
                            ]}
                            onPress={() => handleButtonPress(btn.onPress)}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.btnText,
                                    btn.style === 'cancel' && styles.btnCancelText,
                                    btn.style === 'destructive' && { color: theme.colors.error },
                                    btn.style === 'default' && { color: theme.colors.primary }
                                ]}
                            >
                                {btn.text}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            );
        }

        // Option 2: Default Confirm/Cancel (Horizontal)
        return (
            <View style={styles.footer}>
                {config.showCancel !== false && (
                    <TouchableOpacity
                        style={[styles.btn, styles.btnCancel]}
                        onPress={handleCancel}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.btnCancelText}>{config.cancelText || 'Hủy'}</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[
                        styles.btn,
                        styles.btnConfirm,
                        config.showCancel === false && styles.btnFull
                    ]}
                    onPress={handleConfirm}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.btnConfirmText, { color: icon.color }]}>
                        {config.confirmText || 'Đồng ý'}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="none"
            onRequestClose={handleCancel}
        >
            <View style={styles.modalOverlay}>
                <Pressable
                    style={styles.backdrop}
                    onPress={config.showCancel ? handleCancel : undefined}
                />
                <View style={styles.container}>
                    <View style={styles.content}>
                        {config.type && config.type !== 'info' && (
                            <View style={[styles.iconContainer, { backgroundColor: `${icon.color}15` }]}>
                                <IconSymbol name={icon.name} size={32} color={icon.color} />
                            </View>
                        )}

                        {config.title && <Text style={styles.title}>{config.title}</Text>}
                        {config.message && <Text style={styles.message}>{config.message}</Text>}
                    </View>

                    {renderButtons()}
                </View>
            </View>
        </Modal>
    );
});

const stylesheet = StyleSheet.create((theme: typeof lightTheme, runtime) => ({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.l,
        width: runtime.screen.width * 0.85,
        maxWidth: 400,
        overflow: 'hidden',
        elevation: 5, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    content: {
        paddingTop: theme.margins.xl,
        paddingBottom: theme.margins.lg,
        paddingHorizontal: theme.margins.lg,
        alignItems: 'center',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.margins.md,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: theme.margins.sm,
        color: theme.colors.typography,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    footer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    verticalFooter: {
        flexDirection: 'column',
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    btn: {
        flex: 1,
        paddingVertical: theme.margins.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    verticalBtn: {
        width: '100%',
        paddingVertical: theme.margins.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    verticalBtnBorder: {
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    btnFull: {
        borderLeftWidth: 0,
    },
    btnCancel: {
        borderRightWidth: 1,
        borderRightColor: theme.colors.border,
    },
    btnConfirm: {
        // Confirmation button custom styles
    },
    btnText: {
        fontSize: 16,
        fontWeight: '600',
    },
    btnCancelText: {
        color: theme.colors.typographySecondary,
        fontSize: 16,
        fontWeight: '600',
    },
    btnConfirmText: {
        fontSize: 16,
        fontWeight: '700',
    },
}));

export default CustomAlert;
