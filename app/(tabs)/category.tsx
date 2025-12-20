import {
    CategoryContent,
    CategoryHeader,
    CategorySidebar,
} from '@/components/categories';
import { useCategoryContent, useParentCategories } from '@/hooks/api/useCategories';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

/**
 * Category Screen - Master-Detail Layout
 * 
 * Layout: Sidebar (25-30%) | Content (70-75%)
 * 
 * UX Features:
 * - Sidebar auto scroll to center khi select
 * - Skeleton loading tức thì khi chuyển category
 * - Seamless connection giữa Sidebar và Content
 */
export default function CategoryScreen() {
    const styles = stylesheet;

    // State: Selected category ID
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

    // Fetch parent categories cho Sidebar
    const { data: categories, isLoading: isCategoriesLoading } = useParentCategories();

    // Fetch content cho selected category
    const { data: categoryContent, isLoading: isContentLoading } = useCategoryContent(
        selectedCategoryId
    );

    // Set default selected category khi data load xong
    useEffect(() => {
        if (categories && categories.length > 0 && !selectedCategoryId) {
            // Chọn category đầu tiên có children (bỏ qua "Gợi ý" nếu rỗng)
            const firstValidCategory = categories.find((c) => c.children.length > 0);
            if (firstValidCategory) {
                setSelectedCategoryId(firstValidCategory.id);
            } else {
                setSelectedCategoryId(categories[0].id);
            }
        }
    }, [categories, selectedCategoryId]);

    // Handler: Select category từ Sidebar
    const handleCategorySelect = useCallback((categoryId: string, _index: number) => {
        // TODO: Add Haptic Feedback (expo-haptics)
        setSelectedCategoryId(categoryId);
    }, []);

    // Handler: Cart press
    const handleCartPress = useCallback(() => {
        router.push('/(tabs)/cart');
    }, []);

    return (
        <View style={styles.container}>
            {/* Header với Search */}
            <CategoryHeader
                cartCount={3}
                onCartPress={handleCartPress}
            />

            {/* Main Content: Sidebar + Content */}
            <View style={styles.mainContent}>
                {/* Sidebar (96px width như HTML) */}
                <View style={styles.sidebar}>
                    <CategorySidebar
                        categories={categories ?? []}
                        selectedId={selectedCategoryId}
                        onSelect={handleCategorySelect}
                        isLoading={isCategoriesLoading}
                    />
                </View>

                {/* Content Area */}
                <View style={styles.content}>
                    <CategoryContent
                        data={categoryContent}
                        isLoading={isContentLoading}
                    />
                </View>
            </View>
        </View>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    mainContent: {
        flex: 1,
        flexDirection: 'row',
    },
    sidebar: {
        width: 96, // Fixed width như HTML design
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
}));
