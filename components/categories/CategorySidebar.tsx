import { IconSymbol, IconSymbolName } from '@/components/ui/Icon';
import type { ParentCategory } from '@/types/category';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import React, { useCallback, useEffect, useRef } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface CategorySidebarProps {
    categories: ParentCategory[];
    selectedId: string | null;
    onSelect: (categoryId: string, index: number) => void;
    isLoading?: boolean;
}

/**
 * CategorySidebar - Thanh điều hướng danh mục bên trái
 * 
 * Features:
 * - FlashList vertical cho performance
 * - Auto scroll to center khi select item
 * - Seamless connection với Content (border phải biến mất khi active)
 */
export const CategorySidebar: React.FC<CategorySidebarProps> = ({
    categories,
    selectedId,
    onSelect,
    isLoading = false,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const listRef = useRef<FlashListRef<ParentCategory>>(null);

    // Auto scroll to center khi selectedId thay đổi
    useEffect(() => {
        if (selectedId && listRef.current) {
            const index = categories.findIndex((c) => c.id === selectedId);
            if (index !== -1) {
                // Delay nhỏ để đảm bảo layout đã ready
                setTimeout(() => {
                    listRef.current?.scrollToIndex({
                        index,
                        animated: true,
                        viewPosition: 0.5, // 0.5 = center of visible area
                    });
                }, 100);
            }
        }
    }, [selectedId, categories]);

    const handlePress = useCallback(
        (categoryId: string, index: number) => {
            onSelect(categoryId, index);
        },
        [onSelect]
    );

    const renderItem = useCallback(
        ({ item, index }: { item: ParentCategory; index: number }) => {
            const isActive = item.id === selectedId;

            return (
                <TouchableOpacity
                    style={[
                        styles.item,
                        isActive && styles.itemActive,
                    ]}
                    onPress={() => handlePress(item.id, index)}
                    activeOpacity={0.7}
                >
                    {/* Vạch indicator bên trái khi active */}
                    {isActive && <View style={styles.activeIndicator} />}

                    {/* Icon (nếu có) */}
                    {item.icon && (
                        <IconSymbol
                            name={item.icon as IconSymbolName}
                            size={20}
                            color={item.iconColor ?? (isActive ? theme.colors.buttonActive : theme.colors.secondary)}
                        />
                    )}

                    {/* Tên danh mục */}
                    <Text
                        style={[
                            styles.itemText,
                            isActive && styles.itemTextActive,
                        ]}
                        numberOfLines={2}
                    >
                        {item.name}
                    </Text>
                </TouchableOpacity>
            );
        },
        [selectedId, handlePress, styles, theme.colors]
    );

    const keyExtractor = useCallback((item: ParentCategory) => item.id, []);

    if (isLoading) {
        return (
            <View style={styles.container}>
                {/* Skeleton items */}
                {Array.from({ length: 10 }).map((_, index) => (
                    <View key={index} style={styles.skeletonItem}>
                        <View style={styles.skeletonText} />
                    </View>
                ))}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlashList
                ref={listRef}
                data={categories}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                showsVerticalScrollIndicator={false}
                extraData={selectedId}
            />
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        borderRightWidth: 1,
        borderRightColor: theme.colors.border,
    },
    item: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: theme.margins.md,
        paddingHorizontal: 4,
        minHeight: 72,
        borderRightWidth: 1,
        borderRightColor: theme.colors.border,
    },
    itemActive: {
        backgroundColor: theme.colors.activeLight,
        borderRightWidth: 0,
        borderRightColor: 'transparent',
    },
    activeIndicator: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
        backgroundColor: theme.colors.buttonActive,
        borderTopRightRadius: 2,
        borderBottomRightRadius: 2,
    },
    itemText: {
        fontSize: 11,
        fontWeight: '500',
        color: theme.colors.typographySecondary,
        textAlign: 'center',
        lineHeight: 14,
    },
    itemTextActive: {
        color: theme.colors.buttonActive,
        fontWeight: '700',
    },
    // Skeleton styles
    skeletonItem: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.margins.md,
        paddingHorizontal: 4,
        minHeight: 72,
    },
    skeletonText: {
        width: 60,
        height: 12,
        backgroundColor: theme.colors.border,
        borderRadius: theme.radius.s,
    },
}));
