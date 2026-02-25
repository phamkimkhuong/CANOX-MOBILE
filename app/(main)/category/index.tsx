import {
    CategoryContent,
    CategoryHeader,
    CategorySidebar,
} from '@/components/categories';
import { useCategoryContent, useParentCategories } from '@/hooks/api/useCategories';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

/**
 * Category Screen - Master-Detail Layout
 *
 * - Sidebar auto scroll to center khi select
 * - Skeleton loading tức thì khi chuyển category
 * - Seamless connection giữa Sidebar và Content
 */
export default function CategoryScreen() {
    // Unlock navigation when screen gains focus
    useNavigationUnlockOnFocus();
    const styles = stylesheet;

    // Deferred Rendering: Only render heavy content after transition
    const [isReady, setIsReady] = useState(false);
    useFocusEffect(
        useCallback(() => {
            const task = setTimeout(() => setIsReady(true), 50);
            return () => clearTimeout(task);
        }, [])
    );

    // Shared Animation Pattern: One loop for all Skeletons
    const shimmerValue = useSharedValue(0.4);
    useEffect(() => {
        shimmerValue.value = withRepeat(
            withTiming(1, { duration: 1000 }),
            -1,
            true
        );
    }, [shimmerValue]);

    const shimmerAnimatedStyle = useAnimatedStyle(() => ({
        opacity: shimmerValue.value,
    }));

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

    return (
        <View style={styles.container}>
            {/* Header với Search */}
            <CategoryHeader />

            {/* Main Content: Sidebar + Content */}
            <View style={styles.mainContent}>
                {/* Sidebar (96px width như HTML) */}
                <View style={styles.sidebar}>
                    <CategorySidebar
                        categories={categories ?? []}
                        selectedId={selectedCategoryId}
                        onSelect={handleCategorySelect}
                        isLoading={isCategoriesLoading || !isReady}
                        shimmerAnimatedStyle={shimmerAnimatedStyle}
                    />
                </View>

                {/* Content Area */}
                <View style={styles.content}>
                    <CategoryContent
                        data={categoryContent}
                        isLoading={isContentLoading || !isReady}
                        categoryId={selectedCategoryId}
                        shimmerAnimatedStyle={shimmerAnimatedStyle}
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
        width: 96,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
}));
