import { Image } from 'expo-image';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { LayoutAnimation, Pressable, Text, useWindowDimensions, View } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { IconSymbol } from '../ui/Icon';

const COLLAPSED_HEIGHT = 200;
const GRADIENT_HEIGHT = 60;

interface ProductDescriptionProps {
    description: string | null;
    descriptionImages?: string[];
    onViewMore?: () => void;
}


const isHtml = (str: string): boolean => {
    const htmlPattern = /<\s*([a-z][a-z0-9]*)\b[^>]*>/i;
    return htmlPattern.test(str);
};


/**
 * ProductDescription - Hiển thị mô tả sản phẩm
 * 
 * Performance Optimizations:
 * 1. React.memo - chỉ re-render khi props thay đổi
 * 2. useMemo cho source object - tránh RenderHtml re-parse
 * 3. useMemo cho htmlStyles - tránh tạo object mới mỗi render
 * 4. useCallback cho handleToggle - stable reference
 * 5. useRef để track contentHeight - ĐO MỘT LẦN DUY NHẤT, tránh layout loop
 */
export const ProductDescription = memo<ProductDescriptionProps>(({
    description,
    descriptionImages = [],
    onViewMore,
}) => {
    const { theme } = useUnistyles();
    const { width } = useWindowDimensions();

    // State quản lý expand/collapse
    const [isExpanded, setIsExpanded] = useState(false);
    const [contentHeight, setContentHeight] = useState(0);

    const measuredHeightRef = useRef<number | null>(null);


    useEffect(() => {

        measuredHeightRef.current = null;
        setContentHeight(0);
        setIsExpanded(false);
    }, [description]);

    const hasHtml = useMemo(() => {
        return description ? isHtml(description) : false;
    }, [description]);
    const htmlSource = useMemo(() => {
        if (!description || !hasHtml) return null;
        return { html: description };
    }, [description, hasHtml]);
    const htmlStyles = useMemo(() => ({
        body: {
            fontSize: 14,
            lineHeight: 22,
            color: theme.colors.typography,
            margin: 0,
            padding: 0,
        },
        p: {
            marginBottom: 8,
        },
        strong: {
            fontWeight: '700' as const,
        },
        em: {
            fontStyle: 'italic' as const,
        },
        h1: {
            fontSize: 18,
            fontWeight: '700' as const,
            marginBottom: 8,
        },
        h2: {
            fontSize: 16,
            fontWeight: '700' as const,
            marginBottom: 6,
        },
        h3: {
            fontSize: 15,
            fontWeight: '600' as const,
            marginBottom: 6,
        },
        ul: {
            marginBottom: 8,
            paddingLeft: 20,
        },
        ol: {
            marginBottom: 8,
            paddingLeft: 20,
        },
        li: {
            marginBottom: 4,
        },
        a: {
            color: theme.colors.primary,
            textDecorationLine: 'underline' as const,
        },
    }), [theme.colors.typography, theme.colors.primary]);

    const contentWidth = useMemo(() => width - 32, [width]);

    const needsExpansion = contentHeight > COLLAPSED_HEIGHT;

    const handleToggle = useCallback(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(prev => !prev);
        onViewMore?.();
    }, [onViewMore]);


    const handleContentLayout = useCallback((e: LayoutChangeEvent) => {
        const newHeight = e.nativeEvent.layout.height;

        if (measuredHeightRef.current === null) {
            measuredHeightRef.current = newHeight;
            setContentHeight(newHeight);
        }

    }, []);

    // ============================================
    // EARLY RETURN - Empty state
    // ============================================

    if (!description && descriptionImages.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Mô tả sản phẩm</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Chưa có mô tả</Text>
                </View>
            </View>
        );
    }

    // ============================================
    // MEMOIZED CONTENT - Tách riêng để control render
    // ============================================

    /**
     * Memoize rendered content
     * Tránh re-render HTML/Text khi chỉ expand/collapse thay đổi
     */
    const renderedContent = useMemo(() => {
        if (!description || description.length === 0) return null;

        // Render HTML nếu có tags
        if (hasHtml && htmlSource) {
            return (
                <RenderHtml
                    contentWidth={contentWidth}
                    source={htmlSource}
                    tagsStyles={htmlStyles}
                    enableExperimentalMarginCollapsing={true}
                />
            );
        }

        // Render plain text
        return <Text style={styles.descriptionText}>{description}</Text>;
    }, [description, hasHtml, htmlSource, contentWidth, htmlStyles]);

    /**
     * Memoize description images
     * Chỉ re-render khi images array thay đổi
     */
    const renderedImages = useMemo(() => {
        if (descriptionImages.length === 0) return null;

        return (
            <View style={styles.imagesContainer}>
                {descriptionImages.map((imageUrl, index) => (
                    <Image
                        key={`desc-img-${index}`}
                        source={{ uri: imageUrl }}
                        style={styles.descriptionImage}
                        contentFit="contain"
                    />
                ))}
            </View>
        );
    }, [descriptionImages]);

    // ============================================
    // RENDER
    // ============================================

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Mô tả sản phẩm</Text>
            </View>

            {/* Content */}
            <View
                style={[
                    styles.contentWrapper,
                    !isExpanded && needsExpansion && { maxHeight: COLLAPSED_HEIGHT },
                ]}
            >
                <View
                    onLayout={handleContentLayout}
                    style={styles.content}
                >
                    {/* Text Description - Sử dụng memoized content */}
                    {renderedContent}

                    {/* Description Images - Sử dụng memoized images */}
                    {renderedImages}
                </View>

                {/* Gradient Overlay (when collapsed) */}
                {!isExpanded && needsExpansion && (
                    <View style={styles.gradientOverlay} pointerEvents="none">
                        <View style={styles.gradient} />
                    </View>
                )}
            </View>

            {/* Expand/Collapse Button */}
            {needsExpansion && (
                <Pressable style={styles.toggleButton} onPress={handleToggle}>
                    <Text style={styles.toggleText}>
                        {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                    </Text>
                    <IconSymbol
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={theme.colors.primary}
                    />
                </Pressable>
            )}
        </View>
    );
});

// Display name cho React DevTools debugging
ProductDescription.displayName = 'ProductDescription';
const styles = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        marginTop: theme.margins.sm,
    },
    header: {
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.smd,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    contentWrapper: {
        position: 'relative',
        overflow: 'hidden',
    },
    content: {
        padding: theme.margins.md,
    },
    descriptionText: {
        fontSize: 14,
        lineHeight: 22,
        color: theme.colors.typography,
    },
    imagesContainer: {
        marginTop: theme.margins.md,
        gap: theme.margins.sm,
    },
    descriptionImage: {
        width: '100%',
        height: 300,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.background,
    },
    gradientOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: GRADIENT_HEIGHT,
    },
    gradient: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        opacity: 0.9,
    },
    toggleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.margins.smd,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        gap: 4,
    },
    toggleText: {
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: '500',
    },
    emptyContainer: {
        padding: theme.margins.lg,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: theme.colors.secondary,
    },
}));

export default ProductDescription;
