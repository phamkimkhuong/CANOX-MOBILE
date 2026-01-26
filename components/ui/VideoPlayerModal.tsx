import { IconSymbol } from '@/components/ui/Icon';
import { useEvent, useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    StatusBar,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

/**
 * VideoPlayerModal Component
 * 
 * A fullscreen modal for playing video content using expo-video.
 * Provides native video playback with high performance (60fps) using
 * ExoPlayer on Android and AVPlayer on iOS.
 * 
 * Features:
 * - Fullscreen immersive playback
 * - Native controls (play/pause, seek, fullscreen)
 * - Loading indicator while buffering
 * - Close button to dismiss modal
 * - Auto-play on open
 * - Pause on close
 * 
 * @param visible - Whether the modal is visible
 * @param videoUrl - URL of the video to play
 * @param onClose - Callback when modal is closed
 * @param title - Optional title to display in header
 */
interface VideoPlayerModalProps {
    visible: boolean;
    videoUrl: string;
    onClose: () => void;
}

export function VideoPlayerModal({
    visible,
    videoUrl,
    onClose,
}: VideoPlayerModalProps) {
    const insets = useSafeAreaInsets();
    const [error, setError] = useState<string | null>(null);

    // Create video player instance with the video URL
    const player = useVideoPlayer(videoUrl, (player) => {
        // Configure player when created
        player.loop = false;
        player.muted = false;
    });

    // Use expo's useEvent hook to track player status
    const { status } = useEvent(player, 'statusChange', { status: player.status });

    // Determine loading state from status
    const isLoading = status === 'loading';

    /**
     * Listen for status changes to capture errors
     */
    useEventListener(player, 'statusChange', ({ status: newStatus, error: playerError }) => {
        if (newStatus === 'error' && playerError) {
            setError('Không thể phát video');
        } else if (newStatus === 'readyToPlay') {
            setError(null);
        }
    });

    /**
     * Auto-play when modal opens, pause when closes
     */
    useEffect(() => {
        if (!player) return;

        if (visible) {
            // Reset error state when opening
            setError(null);
            // Start playing
            player.play();
        } else {
            // Pause when closing
            player.pause();
        }
    }, [visible, player]);

    /**
     * Handle close button press
     */
    const handleClose = useCallback(() => {
        player?.pause();
        onClose();
    }, [player, onClose]);

    /**
     * Handle retry button press
     */
    const handleRetry = useCallback(() => {
        setError(null);
        player?.replay();
    }, [player]);

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={false}
            animationType="fade"
            onRequestClose={handleClose}
            statusBarTranslucent
        >
            <View style={styles.container}>
                {/* Video View */}
                <VideoView
                    player={player}
                    style={styles.video}
                    contentFit="contain"
                    nativeControls
                    fullscreenOptions={{ enable: true }}
                    allowsPictureInPicture
                />

                {/* Loading Overlay */}
                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#FFFFFF" />
                    </View>
                )}

                {/* Error Overlay */}
                {error && (
                    <View style={styles.errorOverlay}>
                        <IconSymbol name="alert-circle-outline" size={48} color="#FF4444" />
                        <Text style={styles.errorText}>{error}</Text>
                        <Pressable style={styles.retryButton} onPress={handleRetry}>
                            <Text style={styles.retryText}>Thử lại</Text>
                        </Pressable>
                    </View>
                )}

                {/* Header with Close Button */}
                <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                    <Pressable
                        style={styles.closeButton}
                        onPress={handleClose}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <IconSymbol name="close" size={24} color="#FFFFFF" />
                    </Pressable>
                    <View style={styles.headerSpacer} />
                </View>


                {/* Hide status bar for immersive experience */}
                <StatusBar hidden />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    video: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        paddingBottom: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    closeButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    headerSpacer: {
        width: 44,
    },
    headerTitle: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        marginHorizontal: theme.margins.sm,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        gap: theme.margins.md,
    },
    errorOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        gap: theme.margins.md,
        padding: theme.margins.lg,
    },
    errorText: {
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center',
    },
    retryButton: {
        paddingHorizontal: theme.margins.lg,
        paddingVertical: theme.margins.sm,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.m,
        marginTop: theme.margins.sm,
    },
    retryText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
}));

export default VideoPlayerModal;
