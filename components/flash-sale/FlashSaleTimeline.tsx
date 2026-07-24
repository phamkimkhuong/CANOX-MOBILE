import { IconSymbol } from '@/components/ui/Icon';
import { SlotStatus } from '@/types/campaign';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useEffect, useRef } from 'react';
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
                                        styles.tab
                                    ]}
                                    activeOpacity={0.8}
                                    onPress={() => onTabPress(tab)}
                                >
                                    {isSelected ? (
                                        <LinearGradient
                                            colors={isLive
                                                ? [theme.colors.newPrimary, theme.colors.accent]
                                                : ['#fff7ed', '#fed7aa']
                                            }
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={[
                                                styles.activeGradient,
                                                isLive ? styles.activeGradientLive : styles.activeGradientUpcoming,
                                            ]}
                                        >
                                            <Content tab={tab} isSelected={true} isLive={isLive} />
                                            <View style={[styles.tabHighlight, isLive ? styles.tabHighlightLive : styles.tabHighlightUpcoming]} />
                                            <View style={[styles.activeIndicator, isLive ? styles.activeIndicatorLive : styles.activeIndicatorUpcoming]} />
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
            <Text
                style={[styles.timeLabel, timeLabelStyle]}
                numberOfLines={1}
            >
                {tab.label}
            </Text>
            <View style={[styles.statusPill, statusPillStyle]}>
                {isLive ? (
                    <IconSymbol
                        name="flame"
                        size={10}
                        color={isSelected ? '#ffffff' : theme.colors.warning}
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
        height: 78,
        marginHorizontal: theme.margins.md,
    },
    timelineWrapperEmbedded: {
        marginHorizontal: 0,
        backgroundColor: theme.colors.surfaceGlass,
    },
    scrollContent: {
        paddingHorizontal: theme.margins.xs,
        gap: TAB_GAP,
        alignItems: 'center',
    },
    tab: {
        width: TAB_WIDTH,
        height: 60,
        borderRadius: theme.radius.l,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'transparent',
        backgroundColor: 'transparent',
    },
    activeGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 4,
    },
    activeGradientLive: {
        borderColor: theme.colors.borderGlass,
    },
    activeGradientUpcoming: {
        borderColor: '#fdba74',
        borderWidth: 1,
    },
    inactiveContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.surfaceTranslucent,
        borderWidth: 1,
        borderColor: theme.colors.borderGlass,
        paddingVertical: 4,
    },
    inactiveContainerLive: {
        backgroundColor: theme.colors.warningSubtle,
        borderColor: theme.colors.warningLight,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingHorizontal: 4,
        width: '100%',
    },
    timeLabel: {
        fontSize: theme.fontSizes.sm,
        fontWeight: theme.fontWeights.bold,
        letterSpacing: 0.2,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    timeLabelSelectedLive: {
        color: '#ffffff',
    },
    timeLabelSelectedUpcoming: {
        color: '#c2410c',
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
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: theme.radius.full,
        borderWidth: 1,
    },
    statusPillSelectedLive: {
        backgroundColor: 'rgba(0, 0, 0, 0.28)',
        borderColor: 'rgba(255, 255, 255, 0.40)',
    },
    statusPillSelectedUpcoming: {
        backgroundColor: theme.colors.warning,
        borderColor: theme.colors.warning,
    },
    statusPillInactiveLive: {
        backgroundColor: theme.colors.warningLight,
        borderColor: theme.colors.warningSoft,
    },
    statusPillInactiveUpcoming: {
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
        borderColor: 'rgba(0, 0, 0, 0.08)',
    },
    statusLabel: {
        fontSize: theme.fontSizes.xs - 1,
        fontWeight: theme.fontWeights.bold,
        letterSpacing: 0.3,
    },
    statusLabelSelectedLive: {
        color: '#ffffff',
    },
    statusLabelSelectedUpcoming: {
        color: '#ffffff',
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
        backgroundColor: '#ffffff',
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
    activeIndicator: {
        position: 'absolute',
        bottom: 2,
        alignSelf: 'center',
        width: 28,
        height: 3,
        borderRadius: 2,
    },
    activeIndicatorLive: {
        backgroundColor: '#ffffff',
    },
    activeIndicatorUpcoming: {
        backgroundColor: '#c2410c',
    },
}));
