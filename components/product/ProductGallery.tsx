import type { GalleryItem } from '@/types/product/productDetail';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import React, {
    forwardRef,
    memo,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Text, useWindowDimensions, View, ViewToken } from 'react-native';
import Gallery, { RenderItemInfo } from 'react-native-awesome-gallery';
import Animated, {
    SharedValue,
    useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { IconSymbol } from '../ui/Icon';
import { VideoPlayerModal } from '../ui/VideoPlayerModal';

const THUMBNAIL_SIZE = 60;
const THUMBNAIL_GAP = 8;

// Placeholder blurhash for image loading
const IMAGE_PLACEHOLDER = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

interface ProductGalleryProps {
    gallery: GalleryItem[];
    onScrollY?: SharedValue<number>;
    onImagePress?: (index: number) => void;
    initialIndex?: number;
}

/**
 * Ref interface cho ProductGallery
 * Expose scrollToIndex method cho parent component
 */
export interface ProductGalleryRef {
    scrollToIndex: (index: number) => void;
}

interface GalleryItemViewProps {
    item: GalleryItem;
    index: number;
    width: number;
    height: number;
    onPress?: () => void;
}

interface ThumbnailItemProps {
    item: GalleryItem;
    index: number;
    isActive: boolean;
    onPress: () => void;
}

// ============================================
// GALLERY ITEM VIEW - Memoized
// ============================================

/**
 */
const GalleryItemView = memo<GalleryItemViewProps>(({
    item,
    index,
    width,
    height,
    onPress,
}) => {
    const { theme } = useUnistyles();

    // Memoize dynamic styles
    const containerStyle = useMemo(() => ({
        width,
        height,
        backgroundColor: theme.colors.background,
    }), [width, height, theme.colors.background]);

    if (item.type === 'VIDEO') {
        return (
            <Pressable style={containerStyle} onPress={onPress}>
                <Image
                    source={{ uri: item.url }}
                    style={itemStyles.image}
                    contentFit="cover"
                    transition={200}
                    placeholder={IMAGE_PLACEHOLDER}
                    cachePolicy="memory-disk"
                    recyclingKey={item.id}
                /><View style={itemStyles.videoOverlay}>
                    <View style={itemStyles.playButton}>
                        <IconSymbol
                            name="play"
                            size={32}
                            color={theme.colors.surface}
                        />
                    </View>
                </View>
            </Pressable>
        );
    }

    return (
        <Pressable style={containerStyle} onPress={onPress}>
            <Image
                source={{ uri: item.url }}
                style={itemStyles.image}
                contentFit="cover"
                transition={200}
                placeholder={IMAGE_PLACEHOLDER}
                cachePolicy="memory-disk"
                recyclingKey={item.id}
            />
        </Pressable>
    );
});

GalleryItemView.displayName = 'GalleryItemView';

const itemStyles = StyleSheet.create((theme) => ({
    image: {
        width: '100%',
        height: '100%',
    },
    videoOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    playButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
}));

// ============================================
// THUMBNAIL ITEM - Memoized
// ============================================

/**
 */
const ThumbnailItem = memo<ThumbnailItemProps>(({
    item,
    index,
    isActive,
    onPress,
}) => {
    const { theme } = useUnistyles();

    return (
        <Pressable
            onPress={onPress}
            style={[
                thumbnailStyles.container,
                isActive && thumbnailStyles.containerActive,
            ]}
        >
            <Image
                source={{ uri: item.url }}
                style={thumbnailStyles.image}
                contentFit="cover"
                transition={150}
                cachePolicy="memory-disk"
                recyclingKey={`thumb - ${item.id} `}
            />
            {item.type === 'VIDEO' && (
                <View style={thumbnailStyles.videoIcon}>
                    <IconSymbol name="play" size={16} color={theme.colors.surface} />
                </View>
            )}
        </Pressable>
    );
});

ThumbnailItem.displayName = 'ThumbnailItem';

const thumbnailStyles = StyleSheet.create((theme) => ({
    container: {
        width: THUMBNAIL_SIZE,
        height: THUMBNAIL_SIZE,
        borderRadius: theme.radius.m,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    containerActive: {
        borderColor: theme.colors.newPrimary,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    videoIcon: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
}));

// ============================================
// MAIN COMPONENT - Memoized với forwardRef
// ============================================

/**
 * ProductGallery - Gallery hiển thị ảnh/video sản phẩm
 * 
 */
export const ProductGallery = memo(forwardRef<ProductGalleryRef, ProductGalleryProps>(({
    gallery,
    onScrollY,
    onImagePress,
    initialIndex = 0,
}, ref) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('product');
    const insets = useSafeAreaInsets();

    const { width: screenWidth } = useWindowDimensions();
    const galleryHeight = screenWidth; // Square aspect ratio

    const flatListRef = useRef<Animated.FlatList<GalleryItem>>(null);
    const thumbnailScrollRef = useRef<Animated.ScrollView>(null);
    const [activeIndex, setActiveIndex] = useState(initialIndex);

    // Full screen image viewer state
    const [isViewerVisible, setIsViewerVisible] = useState(false);
    const [viewerIndex, setViewerIndex] = useState(0);

    // Video player modal state
    const [isVideoPlayerVisible, setIsVideoPlayerVisible] = useState(false);
    const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);

    // Sort gallery items: Video First, then Image
    const orderedGallery = useMemo(() => {
        return [...gallery].sort((a, b) => {
            if (a.type === 'VIDEO' && b.type === 'IMAGE') return -1;
            if (a.type === 'IMAGE' && b.type === 'VIDEO') return 1;
            return 0;
        });
    }, [gallery]);

    // Correct initial index if items were moved
    const correctedInitialIndex = useMemo(() => {
        if (initialIndex === undefined || initialIndex === 0 || gallery.length === 0) return initialIndex;
        const targetItem = gallery[initialIndex];
        if (!targetItem) return initialIndex;
        const newIndex = orderedGallery.findIndex(item => item.id === targetItem.id);
        return newIndex >= 0 ? newIndex : initialIndex;
    }, [gallery, orderedGallery, initialIndex]);

    // Filter only images for full-screen viewer
    const galleryImages = useMemo(() =>
        orderedGallery
            .filter(item => item.type === 'IMAGE')
            .map(item => ({ uri: item.url, id: item.id }))
        , [orderedGallery]);

    /**
     * Handle image press - opens fullscreen image viewer
     */
    const handleImagePress = useCallback((index: number) => {
        const item = orderedGallery[index];
        if (item.type === 'IMAGE') {
            // Find index in filtered images array
            const imgIndex = galleryImages.findIndex(img => img.uri === item.url);
            setViewerIndex(imgIndex >= 0 ? imgIndex : 0);
            setIsViewerVisible(true);
        }
        // Also call parent callback if exists
        onImagePress?.(index);
    }, [orderedGallery, galleryImages, onImagePress]);

    /**
     * Handle video press - opens fullscreen video player
     */
    const handleVideoPress = useCallback((index: number) => {
        const item = orderedGallery[index];
        if (item.type === 'VIDEO' && item.url) {
            setCurrentVideoUrl(item.url);
            setIsVideoPlayerVisible(true);
        }
        // Also call parent callback if exists
        onImagePress?.(index);
    }, [orderedGallery, onImagePress]);

    /**
     * Handle gallery item press - routes to image or video handler
     */
    const handleGalleryItemPress = useCallback((index: number) => {
        const item = orderedGallery[index];
        if (item.type === 'VIDEO') {
            handleVideoPress(index);
        } else {
            handleImagePress(index);
        }
    }, [orderedGallery, handleImagePress, handleVideoPress]);

    useImperativeHandle(ref, () => ({
        scrollToIndex: (index: number) => {
            if (flatListRef.current && index >= 0 && index < orderedGallery.length) {
                flatListRef.current.scrollToOffset({
                    offset: index * screenWidth,
                    animated: true,
                });
                setActiveIndex(index);
            }
        },
    }), [screenWidth, orderedGallery.length]);

    // === Viewability Config (stable refs) ===
    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    });

    const onViewableItemsChanged = useRef(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            if (viewableItems.length > 0 && viewableItems[0].index !== null) {
                setActiveIndex(viewableItems[0].index);
            }
        }
    );

    // === Auto-scroll thumbnail khi activeIndex thay đổi ===
    useEffect(() => {
        if (thumbnailScrollRef.current && activeIndex >= 0) {
            const thumbnailWidth = THUMBNAIL_SIZE + THUMBNAIL_GAP;
            const offset = activeIndex * thumbnailWidth;
            thumbnailScrollRef.current.scrollTo({ x: offset, animated: true });
        }
    }, [activeIndex]);

    // === Internal scroll to index ===
    const scrollToIndex = useCallback((index: number) => {
        flatListRef.current?.scrollToOffset({
            offset: index * screenWidth,
            animated: true,
        });
    }, [screenWidth]);

    // === Scroll Handler for horizontal scroll ===
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: () => {
            // Horizontal scroll - không propagate vertical
        },
    });

    // === Render Item - Memoized callback ===
    const renderItem = useCallback(
        ({ item, index }: { item: GalleryItem; index: number }) => (
            <GalleryItemView
                item={item}
                index={index}
                width={screenWidth}
                height={galleryHeight}
                onPress={() => handleGalleryItemPress(index)}
            />
        ),
        [screenWidth, galleryHeight, handleGalleryItemPress]
    );

    // === Key Extractor ===
    const keyExtractor = useCallback((item: GalleryItem) => item.id, []);

    // === Get Item Layout (for optimization) ===
    const getItemLayout = useCallback(
        (_: ArrayLike<GalleryItem> | null | undefined, index: number) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
        }),
        [screenWidth]
    );

    // === Memoize thumbnails to avoid re-render on activeIndex change only ===
    const thumbnailElements = useMemo(() => {
        return orderedGallery.map((item, index) => (
            <ThumbnailItem
                key={item.id}
                item={item}
                index={index}
                isActive={index === activeIndex}
                onPress={() => scrollToIndex(index)}
            />
        ));
    }, [orderedGallery, activeIndex, scrollToIndex]);

    // === Dynamic styles ===
    const emptyContainerStyle = useMemo(() => ({
        width: screenWidth,
        height: galleryHeight,
        backgroundColor: theme.colors.background,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        gap: theme.margins.sm,
    }), [screenWidth, galleryHeight, theme.colors.background, theme.margins.sm]);

    // === Empty State ===
    if (orderedGallery.length === 0) {
        return (
            <View style={emptyContainerStyle}>
                <IconSymbol
                    name="image-outline"
                    size={48}
                    color={theme.colors.secondary}
                />
                <Text style={styles.emptyText}>{t('gallery.noImages')}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Main Gallery */}
            <Animated.FlatList<GalleryItem>
                ref={flatListRef}
                data={orderedGallery}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                viewabilityConfig={viewabilityConfig.current}
                onViewableItemsChanged={onViewableItemsChanged.current}
                getItemLayout={getItemLayout}
                initialScrollIndex={correctedInitialIndex}
                decelerationRate="fast"
                bounces={false}
                removeClippedSubviews
                maxToRenderPerBatch={2}
                windowSize={3}
            />

            {/* Pagination Indicator */}
            <View style={styles.paginationContainer}>
                <View style={styles.pagination}>
                    <Text style={styles.paginationText}>
                        {activeIndex + 1}/{orderedGallery.length}
                    </Text>
                </View>
            </View>

            {/* Thumbnails (if > 1 item) */}
            {orderedGallery.length > 1 && (
                <Animated.ScrollView
                    ref={thumbnailScrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.thumbnailsContainer}
                    contentContainerStyle={styles.thumbnailsContent}
                    bounces={false}
                >
                    {thumbnailElements}
                </Animated.ScrollView>
            )}

            {/* Full Screen Image Viewer */}
            <Modal
                visible={isViewerVisible}
                transparent={true}
                onRequestClose={() => setIsViewerVisible(false)}
                animationType="fade"
            >
                <View style={viewerStyles.container}>
                    <Gallery
                        data={galleryImages}
                        keyExtractor={(item) => item.id}
                        initialIndex={viewerIndex}
                        onIndexChange={setViewerIndex}
                        onSwipeToClose={() => setIsViewerVisible(false)}
                        renderItem={({ item, setImageDimensions }: RenderItemInfo<{ uri: string; id: string }>) => (
                            <Image
                                source={{ uri: item.uri }}
                                style={viewerStyles.image}
                                contentFit="contain"
                                onLoad={(e) => {
                                    const { width, height } = e.source;
                                    setImageDimensions({ width, height });
                                }}
                            />
                        )}
                    />
                    {/* Viewer Header with Close Button */}
                    <View style={[viewerStyles.header, { top: insets.top }]}>
                        <Pressable
                            style={viewerStyles.closeButton}
                            onPress={() => setIsViewerVisible(false)}
                        >
                            <IconSymbol name="close" size={24} color="#FFF" />
                        </Pressable>
                        <Text style={viewerStyles.headerText}>
                            {viewerIndex + 1} / {galleryImages.length}
                        </Text>
                        <View style={viewerStyles.headerSpacer} />
                    </View>
                </View>

                <StatusBar style="light" hidden />
            </Modal>

            {/* Video Player Modal */}
            {currentVideoUrl && (
                <VideoPlayerModal
                    visible={isVideoPlayerVisible}
                    videoUrl={currentVideoUrl}
                    onClose={() => {
                        setIsVideoPlayerVisible(false);
                        setCurrentVideoUrl(null);
                    }}
                />
            )}
        </View>
    );
}));

ProductGallery.displayName = 'ProductGallery';

const styles = StyleSheet.create((theme) => ({
    container: {
        position: 'relative',
    },
    emptyText: {
        fontSize: 14,
        color: theme.colors.secondary,
    },
    paginationContainer: {
        position: 'absolute',
        bottom: theme.margins.md,
        right: theme.margins.sm,
    },
    pagination: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: theme.radius.full,
        paddingHorizontal: theme.margins.sm,
        paddingVertical: 4,
    },
    paginationText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    thumbnailsContainer: {
        position: 'absolute',
        bottom: theme.margins.md,
        left: theme.margins.md,
        maxWidth: '85%',
    },
    thumbnailsContent: {
        flexDirection: 'row',
        gap: THUMBNAIL_GAP,
        paddingRight: theme.margins.md,
    },
}));

const viewerStyles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    image: {
        flex: 1,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    closeButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    headerSpacer: {
        width: 44,
    },
    headerText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        height: 60,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
}));

export default ProductGallery;
