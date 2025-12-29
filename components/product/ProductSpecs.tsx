import type { ProductSpec } from '@/types/productDetail';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LayoutAnimation, Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { IconSymbol } from '../ui/Icon';
interface ProductSpecsProps {
    specifications: ProductSpec[];
    initialVisibleCount?: number;
}

interface SpecRowProps {
    label: string;
    value: string;
    isEven: boolean;
}

// ============================================
// SPEC ROW - Memoized
// ============================================

/**
 */
const SpecRow = memo<SpecRowProps>(({ label, value, isEven }) => {
    return (
        <View style={[specRowStyles.container, isEven && specRowStyles.even]}>
            <Text style={specRowStyles.label}>{label}</Text>
            <Text style={specRowStyles.value} numberOfLines={2}>
                {value}
            </Text>
        </View>
    );
});

SpecRow.displayName = 'SpecRow';

const specRowStyles = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        paddingVertical: theme.margins.smd,
        paddingHorizontal: theme.margins.md,
    },
    even: {
        backgroundColor: theme.colors.background,
    },
    label: {
        flex: 1,
        fontSize: 13,
        color: theme.colors.typographySecondary,
    },
    value: {
        flex: 2,
        fontSize: 13,
        color: theme.colors.typography,
        textAlign: 'right',
    },
}));

// ============================================
// MAIN COMPONENT - Memoized
// ============================================

/**
 */
export const ProductSpecs = memo<ProductSpecsProps>(({
    specifications,
    initialVisibleCount = 5,
}) => {
    const { theme } = useUnistyles();
    const [isExpanded, setIsExpanded] = useState(false);

    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const hasMore = specifications.length > initialVisibleCount;

    // Memoize visible specs để tránh tính lại mỗi render
    const visibleSpecs = useMemo(() => {
        return isExpanded
            ? specifications
            : specifications.slice(0, initialVisibleCount);
    }, [isExpanded, specifications, initialVisibleCount]);

    const handleToggle = useCallback(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (isMountedRef.current) {
            setIsExpanded(prev => !prev);
        }
    }, []);

    if (specifications.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Thông tin chi tiết</Text>
            </View>

            {/* Specs List */}
            <View style={styles.specsList}>
                {visibleSpecs.map((spec, index) => (
                    <SpecRow
                        key={`${spec.label}-${index}`}
                        label={spec.label}
                        value={spec.value}
                        isEven={index % 2 === 0}
                    />
                ))}
            </View>

            {/* Expand/Collapse Button */}
            {hasMore && (
                <Pressable style={styles.toggleButton} onPress={handleToggle}>
                    <Text style={styles.toggleText}>
                        {isExpanded ? 'Thu gọn' : 'Xem chi tiết'}
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

ProductSpecs.displayName = 'ProductSpecs';

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
    specsList: {
        // Specs render inside
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
}));

export default ProductSpecs;
