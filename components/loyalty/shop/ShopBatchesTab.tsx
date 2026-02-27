import { DataGuard } from '@/components/common/DataGuard';
import { IconSymbol } from '@/components/ui/Icon';
import { usePointBatches } from '@/hooks/api/loyalty/useLoyalty';
import { PointBatchUI } from '@/types/loyalty/ui';
import { FlashList } from '@shopify/flash-list';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ShopBatchesTabProps {
    shopId: string;
}

export const ShopBatchesTab: React.FC<ShopBatchesTabProps> = ({ shopId }) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation(['loyalty']);
    const styles = stylesheet;
    const { bottom } = useSafeAreaInsets();

    const batchesQuery = usePointBatches(shopId);

    const renderItem = ({ item }: { item: PointBatchUI }) => {
        const isWarning = item.isExpiringSoon || item.status === 'EXPIRED';

        return (
            <View style={[styles.ticketCard, isWarning && styles.ticketCardWarning]}>
                {/* Left Side: Ticket Notch & Content */}
                <View style={styles.ticketContent}>
                    <Text style={styles.ticketAmount}>+{item.amount.toLocaleString('vi-VN')} {t('loyalty:shopDetail.batchesTab.unit')}</Text>
                    <Text style={styles.ticketSource}>{item.source}</Text>
                    <View style={styles.metaRow}>
                        <IconSymbol name={isWarning ? 'time' : 'calendar'} size={14} color={isWarning ? theme.colors.warning : theme.colors.typographySecondary} />
                        <Text style={[styles.expiryText, isWarning && styles.expiryTextWarning]}>
                            {item.expiryText}
                        </Text>
                    </View>
                </View>

                {/* Right Side: Ticket Cutout */}
                <View style={styles.ticketBadgeWrap}>
                    <View style={styles.dashedLine} />
                    <View style={styles.ticketBadge}>
                        <Text style={[styles.ticketStatusText, item.status !== 'ACTIVE' && styles.ticketStatusTextDim]}>
                            {item.status === 'ACTIVE' ? t('loyalty:shopDetail.batchesTab.available') : item.status}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <DataGuard query={batchesQuery}>
                {(batches) => {
                    // Filter ACTIVE and sort by date for better UX
                    const activeBatches = batches.filter(b => b.status === 'ACTIVE');

                    if (activeBatches.length === 0) {
                        return (
                            <View style={styles.emptyWrap}>
                                <IconSymbol name="wallet" size={48} color={theme.colors.secondaryLight} />
                                <Text style={styles.emptyText}>{t('loyalty:shopDetail.batchesTab.empty')}</Text>
                            </View>
                        );
                    }

                    return (
                        <FlashList
                            data={activeBatches}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={[styles.listContent, { paddingBottom: bottom + 40 }]}
                            showsVerticalScrollIndicator={false}
                        />
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
    listContent: {
        paddingHorizontal: theme.margins.md,
        paddingTop: 16,
    },
    ticketCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        marginBottom: 12,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        overflow: 'hidden',
    },
    ticketCardWarning: {
        borderWidth: 1,
        borderColor: theme.colors.warningLight,
    },
    ticketContent: {
        flex: 1,
        padding: 16,
    },
    ticketAmount: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.vibrantRed,
        marginBottom: 4,
    },
    ticketSource: {
        fontSize: 14,
        color: theme.colors.typography,
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    expiryText: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
    },
    expiryTextWarning: {
        color: theme.colors.warning,
        fontWeight: '600',
    },
    ticketBadgeWrap: {
        width: 80,
        backgroundColor: theme.colors.backgroundNewSurface,
        flexDirection: 'row',
        alignItems: 'center',
    },
    dashedLine: {
        width: 1,
        height: '80%',
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderStyle: 'dashed',
        position: 'absolute',
        left: 0,
    },
    ticketBadge: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ticketStatusText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.vibrantRed,
        transform: [{ rotate: '-90deg' }],
        width: 100,
        textAlign: 'center',
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
    ticketStatusTextDim: {
        opacity: 0.5,
    },
}));
