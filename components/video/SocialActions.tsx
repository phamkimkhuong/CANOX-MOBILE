import { IconSymbol } from '@/components/ui/Icon';
import React from 'react';
import { Share, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

interface SocialActionsProps {
    likes: number;
    comments: number;
    shares: number;
    isLiked?: boolean;
    onLike?: () => void;
    onComment?: () => void;
    onProfilePress?: () => void;
}

export const SocialActions = ({
    likes,
    comments,
    shares,
    isLiked,
    onLike,
    onComment,
    onProfilePress
}: SocialActionsProps) => {
    const scale = useSharedValue(1);

    const handleLike = () => {
        scale.value = withSpring(1.2, {}, () => {
            scale.value = withSpring(1);
        });
        onLike?.();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handleShare = async () => {
        try {
            await Share.share({
                message: 'Xem video sản phẩm tuyệt vời này trên CANOX!',
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            {/* Profile */}
            <TouchableOpacity style={styles.actionItem} onPress={onProfilePress}>
                <View style={styles.avatarContainer}>
                    <IconSymbol name="person-filled" size={32} color="#fff" />
                    <View style={styles.plusIcon}>
                        <IconSymbol name="add" size={12} color="#fff" />
                    </View>
                </View>
            </TouchableOpacity>

            {/* Like */}
            <TouchableOpacity style={styles.actionItem} onPress={handleLike}>
                <Animated.View style={[styles.iconContainer, animatedStyle]}>
                    <IconSymbol
                        name="favorite"
                        size={32}
                        color={isLiked ? "#ff2d55" : "#fff"}
                    />
                </Animated.View>
                <Text style={styles.actionText}>{likes >= 1000 ? `${(likes / 1000).toFixed(1)}k` : likes}</Text>
            </TouchableOpacity>

            {/* Comment */}
            <TouchableOpacity style={styles.actionItem} onPress={onComment}>
                <View style={styles.iconContainer}>
                    <IconSymbol name="chat-filled" size={32} color="#fff" />
                </View>
                <Text style={styles.actionText}>{comments}</Text>
            </TouchableOpacity>

            {/* Share */}
            <TouchableOpacity style={styles.actionItem} onPress={handleShare}>
                <View style={styles.iconContainer}>
                    <IconSymbol name="share" size={32} color="#fff" />
                </View>
                <Text style={styles.actionText}>{shares}</Text>
            </TouchableOpacity>

        </View>
    );
};

const styles = StyleSheet.create((theme) => ({
    container: {
        alignItems: 'center',
        gap: 20,
    },
    actionItem: {
        alignItems: 'center',
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#fff',
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    plusIcon: {
        position: 'absolute',
        bottom: -8,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#ff2d55',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    actionText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    }
}));
