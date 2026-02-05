/**
 * ==============================================
 * SHOP CATEGORIES TAB - Category List for Shop
 * ==============================================
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { CategoryNode } from '@/types/category';
import { Image } from 'expo-image';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
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
    const { t } = useTranslation(['shop']);
    const { theme } = useUnistyles();

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.colors.buttonActive} />
            </View>
        );
    }

    if (categories.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <View style={styles.emptyIconWrapper}>
                    <IconSymbol name="category" size={40} color={theme.colors.border} />
                </View>
                <Text style={styles.emptyText}>{t('categories.empty')}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.glassCard}>
                {categories.map((category, index) => (
                    <Pressable
                        key={category.id}
                        style={({ pressed }) => [
                            styles.categoryItem,
                            index === categories.length - 1 && styles.lastItem,
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
                                        contentFit="cover"
                                        transition={200}
                                    />
                                ) : (
                                    <IconSymbol name="category" size={20} color={theme.colors.typographySecondary} />
                                )}
                            </View>
                            <Text style={styles.categoryName} numberOfLines={1}>
                                {category.name}
                            </Text>
                        </View>
                        <View style={styles.chevronWrapper}>
                            <IconSymbol name="chevron.right" size={16} color={theme.colors.typographySecondary} />
                        </View>
                    </Pressable>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create((theme) => ({
    container: {
        paddingHorizontal: theme.margins.md,
        paddingVertical: 8,
    },
    glassCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyIconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typographySecondary,
        textAlign: 'center',
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderMuted,
    },
    lastItem: {
        borderBottomWidth: 0,
    },
    categoryItemPressed: {
        backgroundColor: theme.colors.activeSoft,
    },
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    categoryIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.borderMuted,
    },
    categoryImage: {
        width: '100%',
        height: '100%',
    },
    categoryName: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.typography,
        flex: 1,
        letterSpacing: -0.3,
    },
    chevronWrapper: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.borderMuted,
    },
}));

