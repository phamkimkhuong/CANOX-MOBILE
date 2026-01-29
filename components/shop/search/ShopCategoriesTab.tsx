/**
 * ==============================================
 * SHOP CATEGORIES TAB - Category List for Shop
 * ==============================================
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { CategoryNode } from '@/types/category';
import React from 'react';
import {
    ActivityIndicator,
    Image,
    Pressable,
    Text,
    View,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ShopCategoriesTabProps {
    categories: CategoryNode[];
    isLoading: boolean;
    onCategoryPress: (category: CategoryNode) => void;
}

export const ShopCategoriesTab = ({
    categories,
    isLoading,
    onCategoryPress,
}: ShopCategoriesTabProps) => {
    const { theme } = useUnistyles();

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (categories.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <IconSymbol name="category" size={64} color={theme.colors.border} />
                <Text style={styles.emptyText}>Shop chưa phân loại danh mục sản phẩm</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {categories.map((category) => (
                <Pressable
                    key={category.id}
                    style={({ pressed }) => [
                        styles.categoryItem,
                        pressed && styles.categoryItemPressed,
                    ]}
                    onPress={() => onCategoryPress(category)}
                >
                    <View style={styles.categoryInfo}>
                        <View style={styles.categoryIconWrapper}>
                            {category.imagePath ? (
                                <Image
                                    source={{ uri: category.imagePath }}
                                    style={styles.categoryImage}
                                />
                            ) : (
                                <IconSymbol name="category" size={24} color={theme.colors.secondary} />
                            )}
                        </View>
                        <Text style={styles.categoryName} numberOfLines={1}>
                            {category.name}
                        </Text>
                    </View>
                    <IconSymbol name="chevron.right" size={20} color={theme.colors.borderMuted} />
                </Pressable>
            ))}
        </View>
    );
};

const styles = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        paddingVertical: theme.margins.sm,
    },
    loadingContainer: {
        padding: theme.margins.xxl,
        alignItems: 'center',
    },
    emptyContainer: {
        padding: theme.margins.xxl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        marginTop: theme.margins.md,
        fontSize: 14,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.margins.md,
        paddingHorizontal: theme.margins.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.borderMuted,
    },
    categoryItemPressed: {
        backgroundColor: theme.colors.activeSurface,
    },
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    categoryIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.margins.md,
        overflow: 'hidden',
    },
    categoryImage: {
        width: '100%',
        height: '100%',
    },
    categoryName: {
        fontSize: 15,
        fontWeight: '500',
        color: theme.colors.typography,
        flex: 1,
    },
}));
