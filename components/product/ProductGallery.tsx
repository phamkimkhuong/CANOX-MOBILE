import { PRODUCT_STRINGS } from '@/constants/i18n/vi/product';
import type { GalleryItem } from '@/types/product/productDetail';
import { Image } from 'expo-image';
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
import { Pressable, Text, useWindowDimensions, View, ViewToken } from 'react-native';
import Animated, {
    SharedValue,
    useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { IconSymbol } from '../ui/Icon';

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
                />
                {/* Video Play Overlay */}
                <View style={itemStyles.videoOverlay}>
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
                recyclingKey={`thumb-${item.id}`}
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
        borderColor: theme.colors.primary,
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

    const { width: screenWidth } = useWindowDimensions();
    const galleryHeight = screenWidth; // Square aspect ratio

    const flatListRef = useRef<Animated.FlatList<GalleryItem>>(null);
    const thumbnailScrollRef = useRef<Animated.ScrollView>(null);
    const [activeIndex, setActiveIndex] = useState(initialIndex);

    useImperativeHandle(ref, () => ({
        scrollToIndex: (index: number) => {
            if (flatListRef.current && index >= 0 && index < gallery.length) {
                flatListRef.current.scrollToOffset({
                    offset: index * screenWidth,
                    animated: true,
                });
            }
        },
    }), [screenWidth, gallery.length]);

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
                onPress={() => onImagePress?.(index)}
            />
        ),
        [onImagePress, screenWidth, galleryHeight]
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
        return gallery.map((item, index) => (
            <ThumbnailItem
                key={item.id}
                item={item}
                index={index}
                isActive={index === activeIndex}
                onPress={() => scrollToIndex(index)}
            />
        ));
    }, [gallery, activeIndex, scrollToIndex]);

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
    if (gallery.length === 0) {
        return (
            <View style={emptyContainerStyle}>
                <IconSymbol
                    name="image-outline"
                    size={48}
                    color={theme.colors.secondary}
                />
                <Text style={styles.emptyText}>{PRODUCT_STRINGS.gallery.noImages}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Main Gallery */}
            <Animated.FlatList<GalleryItem>
                ref={flatListRef}
                data={gallery}
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
                initialScrollIndex={initialIndex}
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
                        {activeIndex + 1}/{gallery.length}
                    </Text>
                </View>
            </View>

            {/* Thumbnails (if > 1 item) */}
            {gallery.length > 1 && (
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
        </View>
    );
}));

ProductGallery.displayName = 'ProductGallery';

// ============================================
// STYLES
// ============================================

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

export default ProductGallery;
