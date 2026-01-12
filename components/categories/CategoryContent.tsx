import { IconSymbol, IconSymbolName } from '@/components/ui/Icon';
import type {
    CategoryContentData,
    CategoryItem,
    FlattenedCategoryItem,
    SubCategory,
} from '@/types/category';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface CategoryContentProps {
    data: CategoryContentData | null | undefined;
    isLoading?: boolean;
}

// Constants
const NUM_COLUMNS = 3;

/**
 * CategoryContent - Nội dung chính bên phải
 * 
 * Features:
 * - Banner với aspect ratio cố định (tránh layout shift)
 * - Grid 3 cột cho items
 * - Featured brands section
 */
export const CategoryContent: React.FC<CategoryContentProps> = ({
    data,
    isLoading = false,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { t } = useTranslation('category');

    /**
     * Flatten data thành list items cho FlashList
     * Tách thành các row để render grid 3 cột
     */
    const flattenedData = useMemo((): FlattenedCategoryItem[] => {
        if (!data) return [];

        const items: FlattenedCategoryItem[] = [];

        // 2. SubCategories với items
        data.subCategories.forEach((subCategory: SubCategory) => {
            // Section header
            items.push({
                type: 'section-header',
                id: `header-${subCategory.id}`,
                title: subCategory.title,
                showSeeAll: subCategory.showSeeAll,
            });

            // Grid items
            subCategory.items.forEach((item: CategoryItem) => {
                items.push({
                    type: 'grid-item',
                    id: item.id,
                    data: item,
                    sectionId: subCategory.id,
                });
            });
        });

        // Featured Brands
        if (data.featuredBrands && data.featuredBrands.length > 0) {
            items.push({
                type: 'brands',
                id: 'featured-brands',
                brands: data.featuredBrands,
            });
        }

        return items;
    }, [data]);



    const renderSectionHeader = useCallback(
        (title: string, showSeeAll?: boolean) => (
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{title}</Text>
                {showSeeAll && (
                    <TouchableOpacity style={styles.seeAllBtn} activeOpacity={0.7}>
                        <Text style={styles.seeAllText}>{t('content.seeAll')}</Text>
                        <IconSymbol
                            name="chevron-right"
                            size={14}
                            color={theme.colors.primary}
                        />
                    </TouchableOpacity>
                )}
            </View>
        ),
        [styles, theme.colors.primary]
    );

    const renderGridItem = useCallback(
        (item: CategoryItem) => (
            <TouchableOpacity style={styles.gridItem} activeOpacity={0.7}>
                <View style={styles.gridItemImageContainer}>
                    {item.image ? (
                        <Image
                            source={{ uri: item.image }}
                            style={styles.gridItemImage}
                            contentFit="cover"
                            transition={200}
                        />
                    ) : (
                        <View style={styles.gridItemIconContainer}>
                            <IconSymbol
                                name={(item.icon ?? 'star') as IconSymbolName}
                                size={32}
                                color={theme.colors.primarySoft}
                            />
                        </View>
                    )}
                </View>
                <Text style={styles.gridItemText} numberOfLines={2}>
                    {item.name}
                </Text>
            </TouchableOpacity>
        ),
        [styles, theme.colors.primarySoft]
    );

    const renderBrands = useCallback(
        (brands: CategoryContentData['featuredBrands']) => {
            if (!brands || brands.length === 0) return null;

            return (
                <View style={styles.brandsSection}>
                    <Text style={styles.sectionTitle}>{t('content.featuredBrands')}</Text>
                    <View style={styles.brandsGrid}>
                        {brands.map((brand) => (
                            <View key={brand.id} style={styles.brandItem}>
                                <Text style={styles.brandName}>{brand.name}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            );
        },
        [styles]
    );

    const renderItem = useCallback(
        ({ item }: { item: FlattenedCategoryItem }) => {
            switch (item.type) {
                case 'section-header':
                    return renderSectionHeader(item.title, item.showSeeAll);
                case 'grid-item':
                    return renderGridItem(item.data);
                case 'brands':
                    return renderBrands(item.brands);
                default:
                    return null;
            }
        },
        [renderSectionHeader, renderGridItem, renderBrands]
    );

    const keyExtractor = useCallback((item: FlattenedCategoryItem) => item.id, []);

    const getItemType = useCallback((item: FlattenedCategoryItem) => item.type, []);

    if (isLoading) {
        return <CategoryContentSkeleton />;
    }

    if (!data) {
        return (
            <View style={styles.emptyContainer}>
                <IconSymbol name="category" size={48} color={theme.colors.secondary} />
                <Text style={styles.emptyText}>{t('content.selectPrompt')}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlashList
                data={flattenedData}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                getItemType={getItemType}
                showsVerticalScrollIndicator={false}
                numColumns={NUM_COLUMNS}
                // Override span cho các item không phải grid-item
                overrideItemLayout={(layout, item) => {
                    if (item.type !== 'grid-item') {
                        layout.span = NUM_COLUMNS;
                    }
                }}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

/**
 * Skeleton Component cho CategoryContent
 * Hiển thị ngay lập tức khi chuyển category
 */
const CategoryContentSkeleton: React.FC = () => {
    const styles = stylesheet;

    return (
        <View style={styles.container}>

            {/* Section Header Skeleton */}
            <View style={styles.skeletonSectionHeader}>
                <View style={styles.skeletonTitle} />
                <View style={styles.skeletonSeeAll} />
            </View>

            {/* Grid Items Skeleton */}
            <View style={styles.skeletonGrid}>
                {Array.from({ length: 6 }).map((_, index) => (
                    <View key={index} style={styles.skeletonGridItem}>
                        <View style={styles.skeletonCircle} />
                        <View style={styles.skeletonText} />
                    </View>
                ))}
            </View>

            {/* Divider */}
            <View style={styles.skeletonDivider} />

            {/* Another Section Skeleton */}
            <View style={styles.skeletonSectionHeader}>
                <View style={styles.skeletonTitle} />
            </View>

            <View style={styles.skeletonGrid}>
                {Array.from({ length: 6 }).map((_, index) => (
                    <View key={`second-${index}`} style={styles.skeletonGridItem}>
                        <View style={styles.skeletonCircle} />
                        <View style={styles.skeletonText} />
                    </View>
                ))}
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    listContent: {
        paddingBottom: 80, // Safe area cho bottom tab
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.margins.md,
    },
    emptyText: {
        fontSize: 14,
        color: theme.colors.secondary,
    },

    // Section Header styles
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.smd,
        paddingTop: theme.margins.md,
        paddingBottom: theme.margins.sm,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    seeAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    seeAllText: {
        fontSize: 12,
        color: theme.colors.primary,
    },

    // Grid Item styles
    gridItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: theme.margins.sm,
        paddingHorizontal: 4,
    },
    gridItemImageContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
        padding: 4,
    },
    gridItemImage: {
        width: '100%',
        height: '100%',
        borderRadius: 28,
    },
    gridItemIconContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gridItemText: {
        fontSize: 11,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
        marginTop: 6,
        lineHeight: 14,
        paddingHorizontal: 4,
    },

    // Brands Section
    brandsSection: {
        paddingHorizontal: theme.margins.smd,
        paddingTop: theme.margins.md,
        paddingBottom: theme.margins.lg,
    },
    brandsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.margins.sm,
        marginTop: theme.margins.smd,
    },
    brandItem: {
        width: '48%',
        height: 48,
        backgroundColor: theme.colors.background,
        borderRadius: theme.radius.s,
        alignItems: 'center',
        justifyContent: 'center',
    },
    brandName: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.secondary,
    },

    // Skeleton styles
    skeletonSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.smd,
        paddingTop: theme.margins.md,
        paddingBottom: theme.margins.sm,
    },
    skeletonTitle: {
        width: 80,
        height: 14,
        backgroundColor: theme.colors.background,
        borderRadius: theme.radius.s,
    },
    skeletonSeeAll: {
        width: 60,
        height: 12,
        backgroundColor: theme.colors.background,
        borderRadius: theme.radius.s,
    },
    skeletonGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: theme.margins.smd,
    },
    skeletonGridItem: {
        width: '33.33%',
        alignItems: 'center',
        paddingVertical: theme.margins.sm,
    },
    skeletonCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: theme.colors.background,
    },
    skeletonText: {
        width: 48,
        height: 10,
        backgroundColor: theme.colors.background,
        borderRadius: theme.radius.s,
        marginTop: 8,
    },
    skeletonDivider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginHorizontal: theme.margins.smd,
        marginVertical: theme.margins.sm,
    },
}));
