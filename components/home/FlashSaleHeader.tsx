import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { IconSymbol } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import { Navigator } from '@/utils/navigation';
import { FlashSaleData } from '@/types/home';

const formatNumber = (num: number) => num.toString().padStart(2, '0');

interface FlashSaleHeaderProps {
    displayedData: FlashSaleData;
    displayedIsUpcoming: boolean;
    timeLeft: { days: number; hours: number; minutes: number; seconds: number };
}

export const FlashSaleHeader = memo(({ displayedData, displayedIsUpcoming, timeLeft }: FlashSaleHeaderProps) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { t } = useTranslation('home');

    const statusTimerKey = `${displayedData.slot.id}:${displayedData.slot.isUpcoming ? 'upcoming' : 'active'}`;

    return (
        <View style={styles.header}>
            <View style={styles.headerTopRow}>
                <Text style={styles.title}>{t('flashSale.title')}</Text>

                <TouchableOpacity
                    style={styles.seeAllBtn}
                    onPress={() => Navigator.push(ROUTES.CAMPAIGN.FLASH_SALE)}
                >
                    <Text style={styles.seeAllText}>{t('flashSale.seeAll')}</Text>
                    <IconSymbol name="chevron-right" size={14} color={theme.colors.secondary} />
                </TouchableOpacity>
            </View>

            <Animated.View
                key={statusTimerKey}
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(140)}
                style={styles.statusTimerGroup}
            >
                {displayedIsUpcoming ? (
                    <Text style={styles.upcomingLabel}>{t('flashSale.startingIn')}</Text>
                ) : null}

                <View style={styles.timerRow}>
                    {timeLeft.days > 0 ? (
                        <>
                            <View style={[styles.timerBox, displayedIsUpcoming && styles.timerBoxUpcoming]}>
                                <Text style={styles.timerText}>{timeLeft.days}</Text>
                            </View>
                            <Text style={styles.timerDayText}>{t('flashSale.day')}</Text>
                        </>
                    ) : null}

                    <View style={[styles.timerBox, displayedIsUpcoming && styles.timerBoxUpcoming]}>
                        <Text style={styles.timerText}>{formatNumber(timeLeft.hours)}</Text>
                    </View>
                    <Text style={styles.timerColon}>:</Text>
                    <View style={[styles.timerBox, displayedIsUpcoming && styles.timerBoxUpcoming]}>
                        <Text style={styles.timerText}>{formatNumber(timeLeft.minutes)}</Text>
                    </View>
                    <Text style={styles.timerColon}>:</Text>
                    <View style={[styles.timerBox, displayedIsUpcoming && styles.timerBoxUpcoming]}>
                        <Text style={styles.timerText}>{formatNumber(timeLeft.seconds)}</Text>
                    </View>
                </View>
            </Animated.View>
        </View>
    );
});

const stylesheet = StyleSheet.create((theme) => ({
    header: {
        paddingHorizontal: theme.margins.md,
        marginBottom: 12,
        gap: theme.margins.xs,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    statusTimerGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        minWidth: 0,
    },
    title: {
        fontSize: theme.fontSizes.base,
        fontWeight: 'bold',
        fontStyle: 'italic',
        color: theme.colors.warning,
        letterSpacing: 0.5,
    },
    upcomingLabel: {
        fontSize: theme.fontSizes.xs,
        fontWeight: '600',
        color: theme.colors.secondary,
        flexShrink: 1,
    },
    timerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timerBox: {
        backgroundColor: theme.colors.typography,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
    },
    timerBoxUpcoming: {
        backgroundColor: theme.colors.warning,
    },
    timerText: {
        color: theme.colors.surface,
        fontSize: theme.fontSizes.xs,
        fontWeight: 'bold',
    },
    timerColon: {
        color: theme.colors.typography,
        fontWeight: 'bold',
    },
    timerDayText: {
        fontSize: theme.fontSizes.xs,
        color: theme.colors.typography,
        fontWeight: '600',
        marginHorizontal: 1,
    },
    seeAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        flexShrink: 0,
        opacity: 0.78,
    },
    seeAllText: {
        fontSize: theme.fontSizes.xs,
        color: theme.colors.secondary,
        fontWeight: '400',
    },
}));
