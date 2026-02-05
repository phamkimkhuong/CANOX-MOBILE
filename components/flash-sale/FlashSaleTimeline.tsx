import { IconSymbol } from '@/components/ui/Icon';
import { SlotStatus } from '@/types/campaign';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

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
}

/**
 * FlashSaleTimeline - Premium Liquid Glass Tab Selection
 */
export const FlashSaleTimeline = memo(({ tabs, activeTabId, onTabPress }: FlashSaleTimelineProps) => {
    const scrollRef = useRef<ScrollView>(null);
    const styles = stylesheet;

    // Auto-scroll to active tab on mount
    useEffect(() => {
        if (activeTabId && tabs.length > 0) {
            const index = tabs.findIndex(t => t.id === activeTabId);
            if (index !== -1) {
                setTimeout(() => {
                    scrollRef.current?.scrollTo({ x: index * 100 - 20, animated: true });
                }, 100);
            }
        }
    }, [activeTabId, tabs]);

    return (
        <View style={styles.container}>
            <View style={styles.timelineWrapper}>
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    snapToInterval={100}
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
                                            colors={isLive ? ['#ff7a00', '#ee4d2d'] : ['#4f46e5', '#3b82f6']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={styles.activeGradient}
                                        >
                                            <Content tab={tab} isSelected={true} isLive={isLive} />
                                            {/* Top Highlight */}
                                            <View style={styles.tabHighlight} />
                                        </LinearGradient>
                                    ) : (
                                        <View style={styles.inactiveContainer}>
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
    const styles = stylesheet;
    return (
        <View style={styles.content}>
            <Text style={[
                styles.timeLabel,
                isSelected && styles.textSelected
            ]}>
                {tab.label}
            </Text>
            <View style={styles.statusRow}>
                {isLive && isSelected && (
                    <IconSymbol name="flame" size={10} color="#fff" />
                )}
                <Text style={[
                    styles.statusLabel,
                    isSelected && styles.textSelected,
                    isLive && !isSelected && styles.textLive
                ]}>
                    {isLive ? t('home:flashSale.statusLive') : t('home:flashSale.statusUpcoming')}
                </Text>
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((_theme) => ({
    container: {
        backgroundColor: 'transparent', // Blend with screen gradient
        paddingVertical: 10,
    },
    timelineWrapper: {
        height: 56,
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 8,
    },
    tab: {
        width: 100,
        height: 48,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
    },
    tabSelected: {
        borderColor: 'rgba(255, 255, 255, 0.2)',
        elevation: 10,
        shadowColor: '#ee4d2d',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    activeGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inactiveContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    timeLabel: {
        fontSize: 15,
        fontWeight: '800',
        color: 'rgba(255, 255, 255, 0.6)',
        letterSpacing: 0.3,
    },
    statusLabel: {
        fontSize: 8.5,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.4)',
        letterSpacing: 0.4,
    },
    textSelected: {
        color: '#fff',
    },
    textLive: {
        color: '#f97316',
    },
    tabHighlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
}));
