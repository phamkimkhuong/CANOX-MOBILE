import { IconSymbol } from '@/components/ui/Icon';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoPlayer, VideoView } from 'expo-video';
import { useNavigation } from 'expo-router';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GestureResponderEvent, LayoutAnimation, Pressable, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { scheduleOnRN } from 'react-native-worklets';

import { creatorRoutes, productRoutes } from '@/constants/routes';
import { useVideoStore } from '@/store/useVideoStore';
import { Navigator } from '@/utils/navigation';
import { ProductCard } from './ProductCard';
import { SocialActions } from './SocialActions';
import { VideoSkeleton } from './VideoSkeleton';

export interface VideoData {
    id: string;
    videoUrl: string;
    posterUrl: string;
    shopName: string;
    caption: string;
    likes: number;
    comments: number;
    shares: number;
    product: {
        id: string;
        name: string;
        price: number;
        imageUrl: string;
    };
}

interface VideoItemProps {
    item: VideoData;
    mode: 'active' | 'preload' | 'idle';
}

// Sub-component xử lý Player thực sự
const VideoPlayerLayer = memo(({
    url,
    mode,
    isPaused,
    isMuted,
    isFocused,
    onPlayerReady,
    onStatusChange
}: {
    url: string;
    mode: 'active' | 'preload';
    isPaused: boolean;
    isMuted: boolean;
    isFocused?: boolean;
    onPlayerReady: (player: VideoPlayer) => void;
    onStatusChange: (status: string) => void;
}) => {
    const player = useVideoPlayer(url, (p) => {
        p.loop = true;
        p.muted = isMuted;
    });

    useEffect(() => {
        player.muted = isMuted;
    }, [isMuted, player]);

    useEffect(() => {
        if (mode === 'active') {
            onPlayerReady(player);
            onStatusChange(player.status);
        }
    }, [mode, player, onPlayerReady, onStatusChange]);

    useEffect(() => {
        if (mode === 'active' && !isPaused && isFocused) {
            player.play();
        } else {
            player.pause();
        }
    }, [mode, isPaused, player, isFocused]);

    return (
        <VideoView
            style={StyleSheet.absoluteFill}
            player={player}
            contentFit="cover"
            nativeControls={false}
        />
    );
});

const VideoProgressBar = memo(({ player }: { player: VideoPlayer }) => {
    const { theme } = useUnistyles();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!player) return;
        const interval = setInterval(() => {
            if (player.duration > 0) {
                setProgress((player.currentTime / player.duration) * 100);
            }
        }, 100);
        return () => clearInterval(interval);
    }, [player]);

    if (!player) return null;

    return (
        <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: theme.colors.newPrimary }]} />
        </View>
    );
});

const HeartAnimation = ({ x, y, onComplete }: { x: number, y: number, onComplete: () => void }) => {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(1);
    const translateY = useSharedValue(0);

    useEffect(() => {
        scale.value = withSequence(
            withSpring(1.5),
            withSpring(1.2),
            withTiming(0, { duration: 500 }, () => {
                scheduleOnRN(onComplete);
            })
        );
        translateY.value = withTiming(-100, { duration: 800 });
        opacity.value = withTiming(0, { duration: 800 });
    }, [onComplete, opacity, scale, translateY]);

    const animatedStyle = useAnimatedStyle(() => ({
        position: 'absolute',
        left: x - 40,
        top: y - 40,
        opacity: opacity.value,
        transform: [
            { scale: scale.value },
            { translateY: translateY.value }
        ],
        zIndex: 9999,
    }));

    return (
        <Animated.View style={animatedStyle}>
            <IconSymbol name="heart.fill" size={80} color="#ff2d55" />
        </Animated.View>
    );
};

export const VideoItem = memo(({ item, mode }: VideoItemProps) => {
    const { isMuted, setIsMuted } = useVideoStore();
    const { t } = useTranslation(['video', 'common']);
    const [isLiked, setIsLiked] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [activePlayer, setActivePlayer] = useState<VideoPlayer | null>(null);
    const [playerStatus, setPlayerStatus] = useState<string>('idle');
    const [hearts, setHearts] = useState<{ id: number, x: number, y: number }[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isProductVisible, setIsProductVisible] = useState(true);
    const navigation = useNavigation();
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        setIsFocused(navigation.isFocused());
        const unsubscribeFocus = navigation.addListener('focus', () => setIsFocused(true));
        const unsubscribeBlur = navigation.addListener('blur', () => setIsFocused(false));
        return () => {
            unsubscribeFocus();
            unsubscribeBlur();
        };
    }, [navigation]);

    const handleProfilePress = useCallback(() => {
        Navigator.push(creatorRoutes.detail(item.id));
    }, [item.id]);

    const handleProductPress = useCallback(() => {
        Navigator.push(productRoutes.detail(item.product.id));
    }, [item.product.id]);

    const toggleProductVisible = (visible: boolean) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsProductVisible(visible);
    };

    const lastTap = useRef<number>(0);

    useEffect(() => {
        if (mode === 'active') {
            setIsPaused(false);
        } else {
            setActivePlayer(null);
            setPlayerStatus('idle');
        }
    }, [mode]);

    const onDoubleTap = useCallback((x: number, y: number) => {
        if (!isLiked) {
            setIsLiked(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        const newHeart = { id: Date.now(), x, y };
        setHearts(prev => [...prev, newHeart]);
    }, [isLiked]);

    const removeHeart = useCallback((id: number) => {
        setHearts(prev => prev.filter(h => h.id !== id));
    }, []);

    const toggleMute = useCallback(() => {
        setIsMuted(!isMuted);
        Haptics.selectionAsync();
    }, [isMuted, setIsMuted]);

    const handlePress = useCallback((event: GestureResponderEvent) => {
        const now = Date.now();
        const DOUBLE_PRESS_DELAY = 300;

        if (now - lastTap.current < DOUBLE_PRESS_DELAY) {
            // Double tap detected
            const { locationX, locationY } = event.nativeEvent;
            onDoubleTap(locationX, locationY);
        } else {
            // Single tap detected (maybe) - wait to see
            setTimeout(() => {
            }, DOUBLE_PRESS_DELAY);
        }
        lastTap.current = now;
        setIsPaused(prev => !prev);
    }, [onDoubleTap]);

    return (
        <View style={styles.container}>
            <Image source={item.posterUrl} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />

            <Pressable style={StyleSheet.absoluteFill} onPress={handlePress}>
                {(mode === 'active' || mode === 'preload') && (
                    <VideoPlayerLayer
                        url={item.videoUrl}
                        mode={mode}
                        isPaused={isPaused}
                        isMuted={isMuted}
                        isFocused={isFocused}
                        onPlayerReady={setActivePlayer}
                        onStatusChange={setPlayerStatus}
                    />
                )}

                {mode === 'active' && playerStatus === 'loading' && <VideoSkeleton />}

                {mode === 'active' && playerStatus === 'error' && (
                    <View style={styles.centerContainer}>
                        <IconSymbol name="wifi-exclamationmark" size={44} color="rgba(255,255,255,0.4)" />
                        <Text style={styles.errorText}>{t('loadError')}</Text>
                    </View>
                )}

                {isPaused && playerStatus === 'readyToPlay' && (
                    <View style={styles.playIconContainer}>
                        <View style={styles.playIconBg}>
                            <IconSymbol name="play.fill" size={40} color="white" style={styles.playIcon} />
                        </View>
                    </View>
                )}
            </Pressable>

            {hearts.map(heart => (
                <HeartAnimation
                    key={heart.id}
                    x={heart.x}
                    y={heart.y}
                    onComplete={() => removeHeart(heart.id)}
                />
            ))}

            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.bottomOverlay}>
                <View style={styles.content}>
                    {isProductVisible ? (
                        <ProductCard
                            {...item.product}
                            onPress={handleProductPress}
                            onClose={() => toggleProductVisible(false)}
                        />
                    ) : (
                        <TouchableOpacity
                            style={styles.recallHandle}
                            onPress={() => toggleProductVisible(true)}
                            activeOpacity={0.8}
                        >
                            <BlurView intensity={30} tint="dark" style={styles.recallBlur}>
                                <IconSymbol name="shopping-cart" size={14} color="#fff" />
                                <Text style={styles.recallText}>{t('reviewProduct')}</Text>
                            </BlurView>
                        </TouchableOpacity>
                    )}
                    <Pressable onPress={handleProfilePress}>
                        <Text style={styles.shopName}>@{item.shopName}</Text>
                    </Pressable>
                    <Pressable onPress={() => setIsExpanded(!isExpanded)}>
                        <Text
                            style={styles.caption}
                            numberOfLines={isExpanded ? undefined : 2}
                        >
                            {item.caption}
                        </Text>
                        {!isExpanded && item.caption.length > 60 && (
                            <Text style={styles.moreText}>{t('common:actions.seeMore')}</Text>
                        )}
                    </Pressable>
                </View>
            </LinearGradient>

            <View style={styles.rightActionsContainer}>
                <SocialActions
                    likes={isLiked ? item.likes + 1 : item.likes}
                    comments={item.comments}
                    shares={item.shares}
                    isLiked={isLiked}
                    onLike={() => {
                        setIsLiked(!isLiked);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    onProfilePress={handleProfilePress}
                />

                <Pressable onPress={toggleMute} style={styles.muteButtonContainer}>
                    <BlurView intensity={20} tint="dark" style={styles.muteButtonBlur}>
                        <IconSymbol
                            name={isMuted ? "speaker.slash.fill" : "speaker.wave.2.fill"}
                            size={22}
                            color="white"
                        />
                    </BlurView>
                </Pressable>
            </View>

            {mode === 'active' && activePlayer && <VideoProgressBar player={activePlayer} />}

            <View style={styles.topOverlay}>
                <Text style={styles.topTabText}>{t('following')}</Text>
                <Text style={[styles.topTabText, styles.topTabTextActive]}>{t('forYou')}</Text>
            </View>
        </View>
    );
});

const styles = StyleSheet.create((_theme, rt) => ({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    topOverlay: {
        position: 'absolute',
        top: rt.insets.top + 10,
        left: 0,
        right: 0,
        zIndex: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
    },
    topTabText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
        opacity: 0.6,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    topTabTextActive: {
        opacity: 1,
    },
    bottomOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 12,
        paddingBottom: 25,
        paddingTop: 100,
    },
    content: {
        width: '80%',
    },
    shopName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 8,
    },
    caption: {
        color: '#fff',
        fontSize: 14,
        marginBottom: 12,
        lineHeight: 20,
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 8,
    },
    moreText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 12,
        marginTop: -8, // Kéo sát vào caption
    },
    rightActionsContainer: {
        position: 'absolute',
        bottom: 40,
        right: 12,
        alignItems: 'center',
        gap: 20,
    },
    muteButtonContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.2)',
        backgroundColor: 'rgba(255,255,255,0.7)',
    },
    muteButtonBlur: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playIconContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playIconBg: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playIcon: {
        opacity: 0.8,
    },
    progressBarContainer: {
        position: 'absolute',
        bottom: 15, // Đẩy cao hơn một chút so với cũ
        left: 0,
        right: 0,
        height: 2.5,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        zIndex: 1000,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#fff',
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
    },
    centerContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13,
        marginTop: 12,
        fontWeight: '500',
    },
    recallHandle: {
        marginBottom: 12,
        alignSelf: 'flex-start',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    recallBlur: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    recallText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 6,
    }
}));
