import { DataGuard } from '@/components/common/DataGuard';
import { IconSymbol } from '@/components/ui/Icon';
import { orderRoutes } from '@/constants/routes';
import { usePointHistory } from '@/hooks/api/loyalty/useLoyalty';
import { PointTransactionUI } from '@/types/loyalty/ui';
import { Navigator } from '@/utils/navigation';
import { FlashList } from '@shopify/flash-list';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ShopHistoryTabProps {
    shopId: string;
}

export const ShopHistoryTab: React.FC<ShopHistoryTabProps> = ({ shopId }) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation(['loyalty']);
    const styles = stylesheet;
    const { bottom } = useSafeAreaInsets();

    const historyQuery = usePointHistory(shopId, { size: 50 }); // Fetch first 50 to ensure we have data

    const renderItem = ({ item }: { item: PointTransactionUI }) => {
        const isExpiring = item.type === 'EXPIRED';

        const handlePress = () => {
            if (item.orderId) {
                Navigator.push(orderRoutes.detail(item.orderId));
            }
        };

        const RowComponent = item.orderId ? Pressable : View;

        return (
            <RowComponent
                style={item.orderId ? ({ pressed }) => [styles.row, pressed && styles.rowPressed] : styles.row}
                onPress={item.orderId ? handlePress : undefined}
            >
                <View style={styles.iconBox}>
                    <IconSymbol
                        name={item.isPositive ? 'arrow-down' : 'arrow-up'}
                        size={20}
                        color={item.isPositive ? theme.colors.success : theme.colors.typographySecondary}
                    />
                </View>

                <View style={styles.detail}>
                    <Text style={styles.title} numberOfLines={1}>{item.description}</Text>
                    <Text style={styles.date}>{item.date}</Text>
                </View>

                <View style={styles.amountBox}>
                    <Text style={[styles.amount, item.isPositive ? styles.amountPositive : styles.amountNegative]}>
                        {item.isPositive ? '+' : '-'}{item.amount.toLocaleString('vi-VN')}
                    </Text>
                    {isExpiring && <Text style={styles.statusExpired}>{t('loyalty:shopDetail.historyTab.expired')}</Text>}
                </View>

                {item.orderId ? (
                    <View style={styles.chevronBox}>
                        <IconSymbol name="chevron-right" size={16} color={theme.colors.border} />
                    </View>
                ) : null}
            </RowComponent>
        );
    };

    return (
        <View style={styles.container}>
            <DataGuard query={historyQuery}>
                {(history) => {
                    const transactions = history.transactions || [];

                    if (transactions.length === 0) {
                        return (
                            <View style={styles.emptyWrap}>
                                <IconSymbol name="document-text" size={48} color={theme.colors.secondaryLight} />
                                <Text style={styles.emptyText}>{t('loyalty:shopDetail.historyTab.empty')}</Text>
                            </View>
                        );
                    }

                    return (
                        <View style={styles.listWrap}>
                            <FlashList
                                data={transactions}
                                renderItem={renderItem}
                                keyExtractor={(item) => item.id}
                                contentContainerStyle={[styles.listContent, { paddingBottom: bottom + 40 }]}
                                showsVerticalScrollIndicator={false}
                            />
                        </View>
                    );
                }}
            </DataGuard>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    listWrap: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 16,
    },
    listContent: {
        paddingHorizontal: theme.margins.md,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    rowPressed: {
        opacity: 0.7,
        backgroundColor: theme.colors.backgroundNewSurface,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.backgroundNewSurface,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    detail: {
        flex: 1,
        paddingRight: 12,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
        marginBottom: 4,
    },
    date: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
    },
    amountBox: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    chevronBox: {
        marginLeft: 8,
        justifyContent: 'center',
    },
    amount: {
        fontSize: 15,
        fontWeight: '700',
    },
    amountPositive: {
        color: theme.colors.success,
    },
    amountNegative: {
        color: theme.colors.typography,
    },
    statusExpired: {
        fontSize: 11,
        fontWeight: '500',
        color: theme.colors.vibrantRed,
        marginTop: 4,
    },
    emptyWrap: {
        paddingTop: 60,
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 14,
        color: theme.colors.typographySecondary,
    },
}));
