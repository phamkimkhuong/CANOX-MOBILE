/**
 * ==============================================
 * BRAND STORY SECTIONS - Widget-based Rendering
 * ==============================================
 *
 * Renders Brand Story sections based on type:
 * - TEXT_BLOCK: Simple text content
 * - RICH_TEXT: Styled text with spans
 * - IMAGE_HERO: Large banner image
 * - VIDEO_INTRO: Video player
 * - GALLERY_GRID: Grid of images
 * - TIMELINE: Historical milestones
 *
 * @see shopHomeDesign/SHOP_IDENTITY_API_SPEC.md
 */

import { IconSymbol } from '@/components/ui/Icon';
import type {
    BrandStory,
    BrandStorySection,
    GalleryGridItem,
    RichTextSpan,
    TimelineItem,
} from '@/types/shop/shopIdentity';
import {
    isGalleryGridSection,
    isImageHeroSection,
    isRichTextSection,
    isTextBlockSection,
    isTimelineSection,
    isVideoIntroSection,
} from '@/types/shop/shopIdentity';
import React, { memo, useCallback, useState } from 'react';
import {
    Image,
    Pressable,
    Text,
    useColorScheme,
    View,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

// ============================================
// SECTION: TEXT_BLOCK
// ============================================
interface TextBlockSectionProps {
    title?: string;
    content: string;
}

const TextBlockSection = memo(({ title, content }: TextBlockSectionProps) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <View style={sectionStyles.textBlock}>
            {title && <Text style={sectionStyles.sectionTitle}>{title}</Text>}
            <Text
                style={sectionStyles.textContent}
                numberOfLines={expanded ? undefined : 4}
            >
                {content}
            </Text>
            {content.length > 200 && (
                <Pressable onPress={() => setExpanded(!expanded)}>
                    <Text style={sectionStyles.expandText}>
                        {expanded ? 'Thu gọn' : 'Xem thêm'}
                    </Text>
                </Pressable>
            )}
        </View>
    );
});

TextBlockSection.displayName = 'TextBlockSection';

// ============================================
// SECTION: RICH_TEXT
// ============================================
interface RichTextSectionProps {
    spans: RichTextSpan[];
}

const RichTextSection = memo(({ spans }: RichTextSectionProps) => {
    const colorScheme = useColorScheme();
    const { theme } = useUnistyles();

    return (
        <View style={sectionStyles.richText}>
            <Text style={sectionStyles.richTextContainer}>
                {spans.map((span, index) => {
                    const style: any = {
                        color: theme.colors.typographySecondary,
                        fontSize: 14,
                        lineHeight: 22,
                    };

                    if (span.style) {
                        if (span.style.bold) style.fontWeight = '700';
                        if (span.style.italic) style.fontStyle = 'italic';
                        if (span.style.size) style.fontSize = span.style.size;
                        if (span.style.color) {
                            const colorValue = colorScheme === 'dark'
                                ? span.style.color.dark
                                : span.style.color.light;
                            if (colorValue) style.color = colorValue;
                        }
                    }

                    return (
                        <Text key={index} style={style}>
                            {span.text}
                        </Text>
                    );
                })}
            </Text>
        </View>
    );
});

RichTextSection.displayName = 'RichTextSection';

// ============================================
// SECTION: IMAGE_HERO
// ============================================
interface ImageHeroSectionProps {
    thumbnailUrl: string;
    originalUrl: string;
    aspectRatio?: number;
    onPress?: () => void;
}

const ImageHeroSection = memo(({
    thumbnailUrl,
    aspectRatio = 1.5,
    onPress,
}: ImageHeroSectionProps) => {
    return (
        <Pressable
            style={[sectionStyles.imageHero, { aspectRatio }]}
            onPress={onPress}
        >
            <Image
                source={{ uri: thumbnailUrl }}
                style={sectionStyles.heroImage}
                resizeMode="cover"
            />
        </Pressable>
    );
});

ImageHeroSection.displayName = 'ImageHeroSection';

// ============================================
// SECTION: VIDEO_INTRO
// ============================================
interface VideoIntroSectionProps {
    posterUrl?: string;
    duration?: number;
    aspectRatio?: number;
    onPress?: () => void;
}

const VideoIntroSection = memo(({
    posterUrl,
    duration,
    aspectRatio = 1.78,
    onPress,
}: VideoIntroSectionProps) => {
    const { theme } = useUnistyles();

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Pressable
            style={[sectionStyles.videoIntro, { aspectRatio }]}
            onPress={onPress}
        >
            {posterUrl && (
                <Image
                    source={{ uri: posterUrl }}
                    style={sectionStyles.videoPoster}
                    resizeMode="cover"
                />
            )}
            <View style={sectionStyles.playOverlay}>
                <View style={sectionStyles.playButton}>
                    <IconSymbol name="play" size={32} color="#FFF" />
                </View>
            </View>
            {duration && (
                <View style={sectionStyles.durationBadge}>
                    <Text style={sectionStyles.durationText}>
                        {formatDuration(duration)}
                    </Text>
                </View>
            )}
        </Pressable>
    );
});

VideoIntroSection.displayName = 'VideoIntroSection';

// ============================================
// SECTION: GALLERY_GRID
// ============================================
interface GalleryGridSectionProps {
    title?: string;
    columnCount?: number;
    items: GalleryGridItem[];
    onItemPress?: (item: GalleryGridItem) => void;
}

const GalleryGridSection = memo(({
    title,
    columnCount = 2,
    items,
    onItemPress,
}: GalleryGridSectionProps) => {
    const itemWidth = `${100 / columnCount}%`;

    return (
        <View style={sectionStyles.galleryGrid}>
            {title && <Text style={sectionStyles.sectionTitle}>{title}</Text>}
            <View style={sectionStyles.galleryContainer}>
                {items.map((item, index) => (
                    <Pressable
                        key={index}
                        style={[sectionStyles.galleryItem, { width: itemWidth as any }]}
                        onPress={() => onItemPress?.(item)}
                    >
                        <Image
                            source={{ uri: item.thumbnailUrl }}
                            style={sectionStyles.galleryImage}
                            resizeMode="cover"
                        />
                    </Pressable>
                ))}
            </View>
        </View>
    );
});

GalleryGridSection.displayName = 'GalleryGridSection';

// ============================================
// SECTION: TIMELINE
// ============================================
interface TimelineSectionProps {
    title?: string;
    items: TimelineItem[];
}

const TimelineSection = memo(({ title, items }: TimelineSectionProps) => {
    const { theme } = useUnistyles();

    return (
        <View style={sectionStyles.timeline}>
            {title && <Text style={sectionStyles.sectionTitle}>{title}</Text>}
            <View style={sectionStyles.timelineContainer}>
                {items.map((item, index) => (
                    <View key={index} style={sectionStyles.timelineItem}>
                        <View style={sectionStyles.timelineDot}>
                            <View style={[sectionStyles.dot, { backgroundColor: theme.colors.primary }]} />
                            {index < items.length - 1 && (
                                <View style={[sectionStyles.line, { backgroundColor: theme.colors.borderMuted }]} />
                            )}
                        </View>
                        <View style={sectionStyles.timelineContent}>
                            <Text style={sectionStyles.timelineYear}>{item.year}</Text>
                            <Text style={sectionStyles.timelineTitle}>{item.title}</Text>
                            {item.description && (
                                <Text style={sectionStyles.timelineDesc}>{item.description}</Text>
                            )}
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
});

TimelineSection.displayName = 'TimelineSection';

// ============================================
// MAIN COMPONENT: BrandStorySections
// ============================================
interface BrandStorySectionsProps {
    brandStory: BrandStory;
    onVideoPress?: (url: string) => void;
    onImagePress?: (url: string) => void;
    onGalleryItemPress?: (item: GalleryGridItem) => void;
}

export const BrandStorySections = memo(({
    brandStory,
    onVideoPress,
    onImagePress,
    onGalleryItemPress,
}: BrandStorySectionsProps) => {
    // Sort sections by order
    const sortedSections = [...brandStory.sections].sort((a, b) => a.order - b.order);

    const renderSection = useCallback((section: BrandStorySection, index: number) => {
        try {
            if (isTextBlockSection(section)) {
                const data = section.data as { title?: string; content: string };
                return (
                    <TextBlockSection
                        key={`section-${index}`}
                        title={section.title || data.title}
                        content={data.content}
                    />
                );
            }

            if (isRichTextSection(section)) {
                const data = section.data as { spans: RichTextSpan[] };
                return (
                    <RichTextSection
                        key={`section-${index}`}
                        spans={data.spans}
                    />
                );
            }

            if (isImageHeroSection(section)) {
                const data = section.data as { thumbnailUrl: string; originalUrl: string; aspectRatio?: number };
                return (
                    <ImageHeroSection
                        key={`section-${index}`}
                        thumbnailUrl={data.thumbnailUrl}
                        originalUrl={data.originalUrl}
                        aspectRatio={data.aspectRatio}
                        onPress={() => onImagePress?.(data.originalUrl)}
                    />
                );
            }

            if (isVideoIntroSection(section)) {
                const data = section.data as { url: string; posterUrl?: string; duration?: number; aspectRatio?: number };
                return (
                    <VideoIntroSection
                        key={`section-${index}`}
                        posterUrl={data.posterUrl}
                        duration={data.duration}
                        aspectRatio={data.aspectRatio}
                        onPress={() => onVideoPress?.(data.url)}
                    />
                );
            }

            if (isGalleryGridSection(section)) {
                const data = section.data as { columnCount?: number; items: GalleryGridItem[] };
                return (
                    <GalleryGridSection
                        key={`section-${index}`}
                        title={section.title}
                        columnCount={data.columnCount}
                        items={data.items}
                        onItemPress={onGalleryItemPress}
                    />
                );
            }

            if (isTimelineSection(section)) {
                const data = section.data as { items: TimelineItem[] };
                return (
                    <TimelineSection
                        key={`section-${index}`}
                        title={section.title}
                        items={data.items}
                    />
                );
            }

            // Unknown section type - graceful degradation (skip)
            return null;
        } catch {
            // Error rendering section - skip
            return null;
        }
    }, [onVideoPress, onImagePress, onGalleryItemPress]);

    if (!sortedSections.length) return null;

    return (
        <View style={sectionStyles.container}>
            {sortedSections.map(renderSection)}
        </View>
    );
});

BrandStorySections.displayName = 'BrandStorySections';

// ============================================
// STYLES
// ============================================
const sectionStyles = StyleSheet.create((theme) => ({
    container: {
        gap: theme.margins.md,
    },

    // Common
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.typography,
        marginBottom: theme.margins.sm,
    },
    expandText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
        marginTop: theme.margins.xs,
    },

    // TEXT_BLOCK
    textBlock: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.m,
        padding: theme.margins.md,
    },
    textContent: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        lineHeight: 20,
    },

    // RICH_TEXT
    richText: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.m,
        padding: theme.margins.md,
    },
    richTextContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },

    // IMAGE_HERO
    imageHero: {
        width: '100%',
        borderRadius: theme.radius.m,
        overflow: 'hidden',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },

    // VIDEO_INTRO
    videoIntro: {
        width: '100%',
        borderRadius: theme.radius.m,
        overflow: 'hidden',
        position: 'relative',
    },
    videoPoster: {
        width: '100%',
        height: '100%',
    },
    playOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    playButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    durationBadge: {
        position: 'absolute',
        bottom: theme.margins.sm,
        right: theme.margins.sm,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: theme.margins.sm,
        paddingVertical: 2,
        borderRadius: theme.radius.s,
    },
    durationText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '600',
    },

    // GALLERY_GRID
    galleryGrid: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.m,
        padding: theme.margins.md,
    },
    galleryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -2,
    },
    galleryItem: {
        padding: 2,
        aspectRatio: 1,
    },
    galleryImage: {
        width: '100%',
        height: '100%',
        borderRadius: theme.radius.s,
    },

    // TIMELINE
    timeline: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.m,
        padding: theme.margins.md,
    },
    timelineContainer: {
        paddingLeft: theme.margins.xs,
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: theme.margins.md,
    },
    timelineDot: {
        alignItems: 'center',
        width: 20,
        marginRight: theme.margins.sm,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    line: {
        width: 2,
        flex: 1,
        marginTop: 4,
    },
    timelineContent: {
        flex: 1,
        paddingBottom: theme.margins.sm,
    },
    timelineYear: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.primary,
        marginBottom: 2,
    },
    timelineTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
        marginBottom: 2,
    },
    timelineDesc: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
        lineHeight: 18,
    },
}));

export default BrandStorySections;
