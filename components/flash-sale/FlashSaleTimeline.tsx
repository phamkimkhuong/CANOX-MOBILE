import { IconSymbol } from '@/components/ui/Icon';
import { SlotStatus } from '@/types/campaign';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

const TAB_WIDTH = 108;
const TAB_GAP = 8;

export interface FlashSaleTab {
    id: string;
    label: string;
    status: SlotStatus;
    isActive: boolean;
}

interface FlashSaleTimelineProps {
    tabs: FlashSaleTab[];
    activeTabId: string | null;
    onTabPress: (tab: FlashSaleTab) => void;
    embedded?: boolean;
}

/**
 * FlashSaleTimeline - Premium Liquid Glass Tab Selection
 */
export const FlashSaleTimeline = memo(({ tabs, activeTabId, onTabPress, embedded = false }: FlashSaleTimelineProps) => {
    const scrollRef = useRef<ScrollView>(null);
    const { theme } = useUnistyles();
    const styles = stylesheet;

    // Auto-scroll to active tab on mount
    useEffect(() => {
        if (activeTabId && tabs.length > 0) {
            const index = tabs.findIndex(t => t.id === activeTabId);
            if (index !== -1) {
                setTimeout(() => {
                    scrollRef.current?.scrollTo({ x: index * (TAB_WIDTH + TAB_GAP) - 20, animated: true });
                }, 100);
            }
        }
    }, [activeTabId, tabs]);

    return (
        <View style={[styles.container, embedded && styles.containerEmbedded]}>
            <View style={[styles.timelineWrapper, embedded && styles.timelineWrapperEmbedded]}>
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    snapToInterval={TAB_WIDTH + TAB_GAP}
                    decelerationRate="fast"
                >
                    {tabs.map((tab, index) => {
                        const isSelected = tab.id === activeTabId;
                        const isLive = tab.status === SlotStatus.ACTIVE;

                        return (
                            <Animated.View
                                key={tab.id}
                                entering={FadeInRight.delay(index * 100).duration(500)}
                            >
                                <TouchableOpacity
                                    style={[
                                        styles.tab,
                                        isSelected && styles.tabSelected,
                                    ]}
                                    activeOpacity={0.8}
                                    onPress={() => onTabPress(tab)}
                                >
                                    {isSelected ? (
                                        <LinearGradient
                                            colors={isLive
                                                ? [theme.colors.newPrimary, theme.colors.accent]
                                                : [theme.colors.surfaceGlassOverlay, theme.colors.warningLight]
                                            }
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={[
                                                styles.activeGradient,
                                                isLive ? styles.activeGradientLive : styles.activeGradientUpcoming,
                                            ]}
                                        >
                                            <Content tab={tab} isSelected={true} isLive={isLive} />
                                            {/* Top Highlight */}
                                            <View style={[styles.tabHighlight, isLive ? styles.tabHighlightLive : styles.tabHighlightUpcoming]} />
                                        </LinearGradient>
                                    ) : (
                                        <View style={[
                                            styles.inactiveContainer,
                                            isLive && styles.inactiveContainerLive,
                                        ]}>
                                            <Content tab={tab} isSelected={false} isLive={isLive} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}
                </ScrollView>
            </View>
        </View>
    );
});

const Content = ({ tab, isSelected, isLive }: { tab: FlashSaleTab; isSelected: boolean; isLive: boolean }) => {
    const { t } = useTranslation(['home']);
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const timeLabelStyle = isSelected
        ? (isLive ? styles.timeLabelSelectedLive : styles.timeLabelSelectedUpcoming)
        : (isLive ? styles.timeLabelInactiveLive : styles.timeLabelInactiveUpcoming);

    const statusPillStyle = isSelected
        ? (isLive ? styles.statusPillSelectedLive : styles.statusPillSelectedUpcoming)
        : (isLive ? styles.statusPillInactiveLive : styles.statusPillInactiveUpcoming);

    const statusTextStyle = isSelected
        ? (isLive ? styles.statusLabelSelectedLive : styles.statusLabelSelectedUpcoming)
        : (isLive ? styles.statusLabelInactiveLive : styles.statusLabelInactiveUpcoming);

    return (
        <View style={styles.content}>
            <Text style={[
                styles.timeLabel,
                timeLabelStyle,
            ]}>
                {tab.label}
            </Text>
            <View style={[styles.statusPill, statusPillStyle]}>
                {isLive ? (
                    <IconSymbol
                        name="flame"
                        size={10}
                        color={isSelected ? theme.colors.onPrimary : theme.colors.warning}
                    />
                ) : (
                    <View style={[
                        styles.statusDot,
                        isSelected ? styles.statusDotSelectedUpcoming : styles.statusDotInactiveUpcoming,
                    ]} />
                )}
                <Text style={[
                    styles.statusLabel,
                    statusTextStyle,
                ]}>
                    {isLive ? t('home:flashSale.statusLive') : t('home:flashSale.statusUpcoming')}
                </Text>
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: 'transparent',
        paddingVertical: theme.margins.sm,
    },
    containerEmbedded: {
        paddingVertical: 0,
    },
    timelineWrapper: {
        height: 74,
        marginHorizontal: theme.margins.md,
        padding: theme.margins.xs,
        borderRadius: theme.radius.xl,
        backgroundColor: theme.colors.surfaceGlassOverlay,
        borderWidth: 1,
        borderColor: theme.colors.borderGlass,
        shadowColor: theme.colors.newPrimary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 8,
    },
    timelineWrapperEmbedded: {
        marginHorizontal: 0,
        backgroundColor: theme.colors.surfaceGlass,
        shadowOpacity: 0.08,
        shadowRadius: 14,
        elevation: 5,
    },
    scrollContent: {
        paddingHorizontal: theme.margins.xs,
        gap: TAB_GAP,
        alignItems: 'center',
    },
    tab: {
        width: TAB_WIDTH,
        height: 58,
        borderRadius: theme.radius.l,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'transparent',
        backgroundColor: 'transparent',
    },
    tabSelected: {
        borderColor: theme.colors.borderGlass,
        elevation: 10,
        shadowColor: theme.colors.newPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
    },
    activeGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeGradientLive: {
        borderColor: theme.colors.borderGlass,
    },
    activeGradientUpcoming: {
        borderColor: theme.colors.warningLight,
    },
    inactiveContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: theme.radius.l,
        backgroundColor: theme.colors.surfaceTranslucent,
        borderWidth: 1,
        borderColor: theme.colors.borderGlass,
    },
    inactiveContainerLive: {
        backgroundColor: theme.colors.warningSubtle,
        borderColor: theme.colors.warningLight,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    timeLabel: {
        fontSize: theme.fontSizes.mdbase,
        fontWeight: theme.fontWeights.bold,
        letterSpacing: 0.3,
    },
    timeLabelSelectedLive: {
        color: theme.colors.onPrimary,
    },
    timeLabelSelectedUpcoming: {
        color: theme.colors.typography,
    },
    timeLabelInactiveLive: {
        color: theme.colors.warning,
    },
    timeLabelInactiveUpcoming: {
        color: theme.colors.typographySecondary,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: theme.margins.sm,
        paddingVertical: 4,
        borderRadius: theme.radius.full,
        borderWidth: 1,
    },
    statusPillSelectedLive: {
        backgroundColor: theme.colors.surfaceGlass,
        borderColor: theme.colors.borderGlass,
    },
    statusPillSelectedUpcoming: {
        backgroundColor: theme.colors.warningSubtle,
        borderColor: theme.colors.warningLight,
    },
    statusPillInactiveLive: {
        backgroundColor: theme.colors.warningLight,
        borderColor: theme.colors.warningSoft,
    },
    statusPillInactiveUpcoming: {
        backgroundColor: theme.colors.surfaceGlass,
        borderColor: theme.colors.borderGlass,
    },
    statusLabel: {
        fontSize: theme.fontSizes.xs,
        fontWeight: theme.fontWeights.bold,
        letterSpacing: 0.4,
    },
    statusLabelSelectedLive: {
        color: theme.colors.onPrimary,
    },
    statusLabelSelectedUpcoming: {
        color: theme.colors.warning,
    },
    statusLabelInactiveLive: {
        color: theme.colors.warning,
    },
    statusLabelInactiveUpcoming: {
        color: theme.colors.secondary,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: theme.radius.full,
    },
    statusDotSelectedUpcoming: {
        backgroundColor: theme.colors.warning,
    },
    statusDotInactiveUpcoming: {
        backgroundColor: theme.colors.secondary,
    },
    tabHighlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
    },
    tabHighlightLive: {
        backgroundColor: 'rgba(255, 255, 255, 0.45)',
    },
    tabHighlightUpcoming: {
        backgroundColor: theme.colors.warningLight,
    },
}));
