import type { VariantDimensions } from '@/types/product/productDetail';
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { IconSymbol } from '../ui/Icon';

interface ProductPackagingInfoProps {
    dimensions: VariantDimensions;
}

/**
 * Format dimensions to display string: "50 × 50 × 50 cm"
 */
const formatSize = (d: VariantDimensions): string | null => {
    const l = d.lengthCm;
    const w = d.widthCm;
    const h = d.heightCm;

    if (l == null && w == null && h == null) return null;

    const parts = [l, w, h].filter((v): v is number => v != null && v > 0);
    if (parts.length === 0) return null;

    return `${parts.join(' × ')} cm`;
};

/**
 * Format weight: grams → kg if >= 1000g
 */
const formatWeight = (grams: number | null | undefined): string | null => {
    if (grams == null || grams <= 0) return null;

    if (grams >= 1000) {
        const kg = grams / 1000;
        // Avoid trailing zeros: 5.00 → "5", 2.50 → "2.5"
        return `${parseFloat(kg.toFixed(2))} kg`;
    }

    return `${grams} g`;
};

/**
 * Row component for packaging info (label + value)
 */
const PackagingRow = memo<{ label: string; value: string; isEven: boolean }>(
    ({ label, value, isEven }) => (
        <View style={[rowStyles.container, isEven && rowStyles.even]}>
            <Text style={rowStyles.label}>{label}</Text>
            <Text style={rowStyles.value}>{value}</Text>
        </View>
    )
);

PackagingRow.displayName = 'PackagingRow';

const rowStyles = StyleSheet.create((theme) => ({
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
// MAIN COMPONENT
// ============================================

/**
 * ProductPackagingInfo - Quy cách đóng gói
 * Hiển thị kích thước và trọng lượng của variant đang chọn
 */
export const ProductPackagingInfo = memo<ProductPackagingInfoProps>(({ dimensions }) => {
    const { t } = useTranslation('product');

    const rows = useMemo(() => {
        const result: { label: string; value: string }[] = [];

        const sizeStr = formatSize(dimensions);
        if (sizeStr) {
            result.push({ label: t('packaging.dimensions'), value: sizeStr });
        }

        const weightStr = formatWeight(dimensions.weightGrams);
        if (weightStr) {
            result.push({ label: t('packaging.weight'), value: weightStr });
        }

        return result;
    }, [dimensions, t]);

    // Don't render empty section
    if (rows.length === 0) return null;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <IconSymbol name="cube" size={15} color="#78909C" />
                <Text style={styles.title}>{t('packaging.title')}</Text>
            </View>

            {/* Rows */}
            <View style={styles.rowsList}>
                {rows.map((row, index) => (
                    <PackagingRow
                        key={row.label}
                        label={row.label}
                        value={row.value}
                        isEven={index % 2 === 0}
                    />
                ))}
            </View>
        </View>
    );
});

ProductPackagingInfo.displayName = 'ProductPackagingInfo';

const styles = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        marginTop: theme.margins.sm,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
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
    rowsList: {
        // Rows render inside
    },
}));

export default ProductPackagingInfo;
