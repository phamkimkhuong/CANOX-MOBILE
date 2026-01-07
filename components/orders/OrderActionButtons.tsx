/**
 * ==============================================
 * ORDER ACTION BUTTONS - Nút bấm theo trạng thái
 * ==============================================
 * Render các nút action dựa trên trạng thái đơn hàng
 * Visual Hierarchy: Primary (filled) > Secondary (outlined) > Danger (outlined red)
 */

import { IconSymbol, IconSymbolName } from '@/components/ui/Icon';
import { OrderAction, OrderUI } from '@/types/order/order';
import { getOrderActions } from '@/utils/adapter/order/orderActions';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface OrderActionButtonsProps {
    order: OrderUI;
    onAction: (action: OrderAction['action'], order: OrderUI) => void;
}

export const OrderActionButtons: React.FC<OrderActionButtonsProps> = ({
    order,
    onAction,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const actions = getOrderActions(order);

    if (actions.length === 0) return null;

    const getButtonStyle = (type: OrderAction['type']) => {
        switch (type) {
            case 'primary':
                return styles.primaryButton;
            case 'danger':
                return styles.dangerButton;
            default:
                return styles.secondaryButton;
        }
    };

    const getTextStyle = (type: OrderAction['type']) => {
        switch (type) {
            case 'primary':
                return styles.primaryText;
            case 'danger':
                return styles.dangerText;
            default:
                return styles.secondaryText;
        }
    };

    const getIconColor = (type: OrderAction['type']) => {
        switch (type) {
            case 'primary':
                return theme.colors.onPrimary;
            case 'danger':
                return theme.colors.error;
            default:
                return theme.colors.typography;
        }
    };

    return (
        <View style={styles.container}>
            {actions.map((action, index) => (
                <Pressable
                    key={action.action}
                    style={({ pressed }) => [
                        styles.button,
                        getButtonStyle(action.type),
                        pressed && styles.pressed,
                    ]}
                    onPress={() => onAction(action.action, order)}
                >
                    {action.icon && (
                        <IconSymbol
                            name={action.icon as IconSymbolName}
                            size={16}
                            color={getIconColor(action.type)}
                        />
                    )}
                    <Text style={[styles.buttonText, getTextStyle(action.type)]}>
                        {action.label}
                    </Text>
                </Pressable>
            ))}
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.sm,
        gap: theme.margins.sm,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.sm,
        borderRadius: theme.radius.m,
        gap: 6,
        minWidth: 100,
    },
    pressed: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },
    primaryButton: {
        backgroundColor: theme.colors.primary,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    dangerButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.error,
    },
    buttonText: {
        fontSize: 13,
        fontWeight: '600',
    },
    primaryText: {
        color: theme.colors.onPrimary,
    },
    secondaryText: {
        color: theme.colors.typography,
    },
    dangerText: {
        color: theme.colors.error,
    },
}));
