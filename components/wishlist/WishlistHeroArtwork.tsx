import { IconSymbol } from '@/components/ui/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface WishlistHeroArtworkProps {
    variant: 'empty' | 'guest';
    style?: StyleProp<ViewStyle>;
}

export const WishlistHeroArtwork: React.FC<WishlistHeroArtworkProps> = ({
    variant,
    style,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const isGuest = variant === 'guest';

    return (
        <View style={[styles.hero, isGuest && styles.heroGuest, style]}>
            <View style={[styles.heroCloud, styles.heroCloudLeft]} />
            <View style={[styles.heroCloud, styles.heroCloudRight]} />
            <View style={[styles.sparkle, styles.sparkleTopLeft]}>
                <IconSymbol name="sparkles" size={18} color={theme.colors.warning} />
            </View>
            <View style={[styles.sparkle, styles.sparkleMidLeft]}>
                <IconSymbol name="sparkles" size={16} color={theme.colors.newPrimary} />
            </View>
            <View style={[styles.sparkle, styles.sparkleRight]}>
                <IconSymbol name="sparkles" size={16} color={theme.colors.warning} />
            </View>
            <View style={styles.dotCluster}>
                <View style={styles.heroDot} />
                <View style={styles.heroDotSmall} />
                <View style={styles.heroDotSmall} />
            </View>

            <View style={styles.heartShadow} />
            <View style={styles.heartWrap}>
                <LinearGradient
                    colors={[theme.colors.accent, theme.colors.vibrantRed]}
                    start={{ x: 0.15, y: 0 }}
                    end={{ x: 0.85, y: 1 }}
                    style={styles.heartGradient}
                >
                    <IconSymbol name="heart.fill" size={100} color={theme.colors.onPrimary} />
                </LinearGradient>
            </View>

            <View style={styles.tagCard}>
                <View style={styles.tagRing} />
                <Text style={styles.tagPercent}>%</Text>
            </View>

            {
                isGuest ? (
                    <View style={styles.lockWrap}>
                        <LinearGradient
                            colors={[theme.colors.surface, theme.colors.warningLight]}
                            start={{ x: 0.2, y: 0 }}
                            end={{ x: 0.8, y: 1 }}
                            style={styles.lockBody}
                        >
                            <IconSymbol name="lock" size={42} color={theme.colors.warning} />
                        </LinearGradient>
                    </View>
                ) : (
                    <View style={styles.bellWrap}>
                        <LinearGradient
                            colors={[theme.colors.warningSoft, theme.colors.warning]}
                            start={{ x: 0.2, y: 0 }}
                            end={{ x: 0.8, y: 1 }}
                            style={styles.bellGradient}
                        >
                            <IconSymbol name="notifications-filled" size={48} color={theme.colors.onPrimary} />
                        </LinearGradient>
                        <View style={styles.bellHeartBadge}>
                            <IconSymbol name="heart.fill" size={18} color={theme.colors.onPrimary} />
                        </View>
                    </View>
                )
            }
        </View >
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    hero: {
        height: 145,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: theme.margins.xs,
    },
    heroGuest: {
        height: 165,
        marginTop: theme.margins.sm,
    },
    heroCloud: {
        position: 'absolute',
        width: 210,
        height: 118,
        borderRadius: 64,
        backgroundColor: theme.colors.accentSubtle,
        opacity: 0.8,
    },
    heroCloudLeft: {
        left: -34,
        bottom: 10,
    },
    heroCloudRight: {
        right: -36,
        bottom: 28,
    },
    sparkle: {
        position: 'absolute',
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sparkleTopLeft: {
        left: '22%',
        top: 14,
    },
    sparkleMidLeft: {
        left: '6%',
        bottom: 36,
    },
    sparkleRight: {
        right: '4%',
        bottom: 34,
    },
    dotCluster: {
        position: 'absolute',
        right: '14%',
        top: 46,
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    heroDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.colors.warning,
        opacity: 0.65,
    },
    heroDotSmall: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: theme.colors.warning,
        opacity: 0.65,
    },
    heartShadow: {
        position: 'absolute',
        bottom: 32,
        width: 150,
        height: 18,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.backgroundNewSurface,
        transform: [{ scaleX: 1.3 }],
    },
    heartWrap: {
        width: 150,
        height: 140,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ translateY: 8 }],
    },
    heartGradient: {
        width: 125,
        height: 115,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 70,
        ...theme.shadows.large,
    },
    tagCard: {
        position: 'absolute',
        left: '20%',
        bottom: 52,
        width: 62,
        height: 80,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.warningLight,
        borderWidth: 2,
        borderColor: theme.colors.warningSoft,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '16deg' }],
        ...theme.shadows.medium,
    },
    tagRing: {
        position: 'absolute',
        top: 8,
        left: 18,
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 3,
        borderColor: theme.colors.warning,
        backgroundColor: theme.colors.surface,
    },
    tagPercent: {
        marginTop: 12,
        fontSize: 34,
        fontWeight: '800',
        color: theme.colors.warning,
    },
    bellWrap: {
        position: 'absolute',
        right: '20%',
        bottom: 58,
        width: 84,
        height: 84,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '-14deg' }],
    },
    bellGradient: {
        width: 82,
        height: 82,
        borderRadius: 42,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.small,
    },
    bellHeartBadge: {
        position: 'absolute',
        right: -2,
        top: -4,
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: theme.colors.newPrimary,
        borderWidth: 3,
        borderColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    lockWrap: {
        position: 'absolute',
        right: '19%',
        bottom: 52,
        width: 82,
        height: 82,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '8deg' }],
    },
    lockBody: {
        width: 80,
        height: 80,
        borderRadius: theme.radius.xl,
        borderWidth: 2,
        borderColor: theme.colors.warningSoft,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.medium,
    },
}));
