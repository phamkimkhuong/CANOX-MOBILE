/**
 * ==============================================
 * SHOP GALLERY - Media showcase
 * ==============================================
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { ShopGalleryItem } from '@/types/shop';
import { Image } from 'expo-image';
import React, { memo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ShopGalleryProps {
    items: ShopGalleryItem[];
    title?: string;
    onItemPress?: (item: ShopGalleryItem) => void;
}

const ITEM_WIDTH = 140;
const ITEM_HEIGHT = 140;

export const ShopGallery = memo(({
    items,
    title = 'Hình ảnh',
    onItemPress
}: ShopGalleryProps) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    if (items.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {items.map((item) => (
                    <Pressable
                        key={item.id}
                        style={styles.galleryItem}
                        onPress={() => onItemPress?.(item)}
                    >
                        <Image
                            source={{ uri: item.thumbnailUrl || item.url }}
                            style={styles.galleryImage}
                            contentFit="cover"
                            transition={200}
                        />
                        {item.type === 'video' && (
                            <View style={styles.videoOverlay}>
                                <IconSymbol name="play-circle-outline" size={32} color="#FFF" />
                            </View>
                        )}
                        {item.caption && (
                            <View style={styles.captionContainer}>
                                <Text style={styles.caption} numberOfLines={1}>
                                    {item.caption}
                                </Text>
                            </View>
                        )}
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    );
});

ShopGallery.displayName = 'ShopGallery';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.m,
        paddingVertical: theme.margins.md,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.typography,
        marginBottom: theme.margins.md,
        paddingHorizontal: theme.margins.md,
    },
    scrollContent: {
        paddingHorizontal: theme.margins.md,
        gap: theme.margins.sm,
    },
    galleryItem: {
        width: ITEM_WIDTH,
        height: ITEM_HEIGHT,
        borderRadius: theme.radius.s,
        overflow: 'hidden',
        backgroundColor: theme.colors.background,
    },
    galleryImage: {
        width: '100%',
        height: '100%',
    },
    videoOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    captionContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    caption: {
        fontSize: 11,
        color: '#FFF',
    },
}));

export default ShopGallery;
