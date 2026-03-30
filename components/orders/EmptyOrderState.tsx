import { IconSymbol, IconSymbolName } from '@/components/ui/Icon';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface EmptyOrderStateProps {
    status: string;
    onShopNow?: () => void;
}

const STATUS_ICONS: Record<string, IconSymbolName> = {
    ALL: 'bag',
    AWAITING_PAYMENT: 'card',
    CREATED: 'time',
    FULFILLING: 'truck-step',
    POST_DELIVERY: 'cube',
    RETURN_REFUND: 'wallet',
    CANCELLED: 'close-circle',
};

export const EmptyOrderState: React.FC<EmptyOrderStateProps> = ({
    status,
    onShopNow,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('order');
    const styles = stylesheet;

    const icon = STATUS_ICONS[status] || STATUS_ICONS.CREATED;

    // Map status key to i18n path
    const getI18nPath = (key: string) => {
        const pathMap: Record<string, string> = {
            ALL: 'all',
            AWAITING_PAYMENT: 'awaitingPayment',
            CREATED: 'created',
            FULFILLING: 'fulfilling',
            POST_DELIVERY: 'delivered',
            RETURN_REFUND: 'returned',
            CANCELLED: 'cancelled',
        };
        return pathMap[key] || 'all';
    };

    const i18nPath = getI18nPath(status);

    return (
        <View style={styles.container}>
            <View style={styles.iconWrapper}>
                <IconSymbol
                    name={icon}
                    size={64}
                    color={theme.colors.secondary}
                />
            </View>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Text style={styles.title}>{t(`list.emptyState.${i18nPath}.title` as any)}</Text>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Text style={styles.description}>{t(`list.emptyState.${i18nPath}.description` as any)}</Text>

            {onShopNow && (
                <Pressable
                    style={({ pressed }) => [
                        styles.button,
                        pressed && styles.buttonPressed,
                    ]}
                    onPress={onShopNow}
                >
                    <IconSymbol
                        name="bag"
                        size={18}
                        color={theme.colors.onPrimary}
                    />
                    <Text style={styles.buttonText}>{t('list.emptyState.shopNow')}</Text>
                </Pressable>
            )}
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.margins.xl,
        paddingVertical: theme.margins.xxl,
    },
    iconWrapper: {
        width: 120,
        height: 120,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.backgroundSurface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.margins.lg,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.typography,
        textAlign: 'center',
        marginBottom: theme.margins.sm,
    },
    description: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
        backgroundColor: theme.colors.newPrimary,
        paddingHorizontal: theme.margins.lg,
        paddingVertical: theme.margins.smd,
        borderRadius: theme.radius.m,
        marginTop: theme.margins.lg,
    },
    buttonPressed: {
        opacity: 0.8,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.onPrimary,
    },
}));
