import type { ProductSpec, Manufacturer, Warranty } from '@/types/product/productDetail';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutAnimation, Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { IconSymbol } from '../ui/Icon';

interface ProductSpecsProps {
    specifications: ProductSpec[];
    initialVisibleCount?: number;
    brandName?: string | null;
    origin?: string | null;
    manufacturers?: Manufacturer[] | null;
    isMadeToOrder?: boolean | null;
    warranty?: Warranty | null;
}

interface SpecRowProps {
    label: string;
    value: string;
    isEven: boolean;
}

const SpecRow = memo<SpecRowProps>(({ label, value, isEven }) => {
    return (
        <View style={[specRowStyles.container, isEven && specRowStyles.even]}>
            <Text style={specRowStyles.label}>{label}</Text>
            <Text style={specRowStyles.value} numberOfLines={3}>
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
        alignItems: 'center',
    },
    even: {
        backgroundColor: theme.colors.background,
    },
    label: {
        flex: 1.2,
        fontSize: 13,
        color: theme.colors.typographySecondary,
        fontWeight: '500',
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

export const ProductSpecs = memo<ProductSpecsProps>(({
    specifications,
    initialVisibleCount = 5,
    brandName,
    origin,
    manufacturers,
    isMadeToOrder,
    warranty,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('product');
    const [isSpecsExpanded, setIsSpecsExpanded] = useState(false);
    const [isWarrantyExpanded, setIsWarrantyExpanded] = useState(false);

    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Merge static product specs with dynamic ones
    const allSpecifications = useMemo(() => {
        const specs: ProductSpec[] = [];

        if (brandName) {
            specs.push({ label: t('specs.brandName', 'Thương hiệu'), value: brandName });
        }
        if (origin) {
            specs.push({ label: t('specs.origin', 'Xuất xứ'), value: origin });
        }
        if (manufacturers && manufacturers.length > 0) {
            const manufacturerNames = manufacturers
                .map((m) => m.name)
                .filter(Boolean)
                .join(', ');
            if (manufacturerNames) {
                specs.push({ label: t('specs.manufacturers', 'Nhà sản xuất'), value: manufacturerNames });
            }
        }
        if (isMadeToOrder !== undefined && isMadeToOrder !== null) {
            specs.push({
                label: t('specs.productType', 'Loại sản phẩm'),
                value: isMadeToOrder ? t('specs.madeToOrder', 'Hàng đặt trước (Pre-order)') : t('specs.inStock', 'Hàng có sẵn'),
            });
        }

        return [...specs, ...specifications];
    }, [brandName, origin, manufacturers, isMadeToOrder, specifications, t]);

    const hasMoreSpecs = allSpecifications.length > initialVisibleCount;

    const visibleSpecs = useMemo(() => {
        return isSpecsExpanded
            ? allSpecifications
            : allSpecifications.slice(0, initialVisibleCount);
    }, [isSpecsExpanded, allSpecifications, initialVisibleCount]);

    const handleToggleSpecs = useCallback(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (isMountedRef.current) {
            setIsSpecsExpanded((prev) => !prev);
        }
    }, []);

    const handleToggleWarranty = useCallback(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (isMountedRef.current) {
            setIsWarrantyExpanded((prev) => !prev);
        }
    }, []);

    // Format Warranty Type name
    const getWarrantyTypeLabel = (type?: string | null) => {
        switch (type) {
            case 'MANUFACTURER':
                return t('specs.typeManufacturer', 'Hãng bảo hành');
            case 'SHOP':
                return t('specs.typeShop', 'Shop bảo hành');
            case 'NONE':
                return t('specs.typeNone', 'Không bảo hành');
            default:
                return type || t('specs.typeDefault', 'Bảo hành tiêu chuẩn');
        }
    };

    // Format Warranty Activation
    const getActivationLabel = (method?: string | null) => {
        switch (method) {
            case 'INVOICE':
                return t('specs.activationInvoice', 'Qua hóa đơn mua hàng');
            case 'ELECTRONIC':
                return t('specs.activationElectronic', 'Bảo hành điện tử');
            default:
                return method || t('specs.activationDefault', 'Liên hệ cửa hàng');
        }
    };

    const hasWarrantyData = !!warranty && (!!warranty.type || !!warranty.durationDays || (!!warranty.conditions && warranty.conditions.length > 0));

    if (allSpecifications.length === 0 && !hasWarrantyData) {
        return null;
    }

    return (
        <View style={styles.container}>
            {/* 1. PRODUCT SPECIFICATIONS SECTION */}
            {allSpecifications.length > 0 && (
                <View>
                    <View style={styles.header}>
                        <Text style={styles.title}>{t('specs.title')}</Text>
                    </View>

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

                    {hasMoreSpecs && (
                        <Pressable style={styles.toggleButton} onPress={handleToggleSpecs}>
                            <Text style={styles.toggleText}>
                                {isSpecsExpanded ? t('specs.collapse') : t('specs.viewMore')}
                            </Text>
                            <IconSymbol
                                name={isSpecsExpanded ? 'chevron-up' : 'chevron-down'}
                                size={18}
                                color={theme.colors.primary}
                            />
                        </Pressable>
                    )}
                </View>
            )}

            {/* Separator if both sections present */}
            {allSpecifications.length > 0 && hasWarrantyData && (
                <View style={styles.separator} />
            )}

            {/* 2. PREMIUM WARRANTY & INSPECTION POLICY SECTION */}
            {hasWarrantyData && warranty && (
                <View style={styles.warrantySection}>
                    <View style={styles.header}>
                        <View style={styles.headerTitleWithIcon}>
                            <IconSymbol name="shield-checkmark-outline" size={18} color={theme.colors.primary} />
                            <Text style={styles.title}>{t('specs.warrantyTitle', 'Chính sách bảo hành & Đồng kiểm')}</Text>
                        </View>
                    </View>

                    {/* Warranty Quick Parameters Grid */}
                    <View style={styles.warrantyGrid}>
                        {/* Column 1: Warranty Type */}
                        {warranty.type && (
                            <View style={styles.gridItem}>
                                <View style={styles.iconContainer}>
                                    <IconSymbol name="business-outline" size={16} color={theme.colors.primary} />
                                </View>
                                <Text style={styles.gridLabel}>{t('specs.warrantyType', 'Loại bảo hành')}</Text>
                                <Text style={styles.gridValue} numberOfLines={1}>
                                    {getWarrantyTypeLabel(warranty.type)}
                                </Text>
                            </View>
                        )}

                        {/* Column 2: Duration */}
                        {warranty.durationDays !== undefined && warranty.durationDays !== null && (
                            <View style={styles.gridItem}>
                                <View style={styles.iconContainer}>
                                    <IconSymbol name="time-outline" size={16} color={theme.colors.primary} />
                                </View>
                                <Text style={styles.gridLabel}>{t('specs.warrantyDuration', 'Thời hạn')}</Text>
                                <Text style={styles.gridValue}>
                                    {t('shop.durationDays', { count: warranty.durationDays })}
                                </Text>
                            </View>
                        )}

                        {/* Column 3: Activation */}
                        {warranty.activationMethod && (
                            <View style={styles.gridItem}>
                                <View style={styles.iconContainer}>
                                    <IconSymbol name="receipt-outline" size={16} color={theme.colors.primary} />
                                </View>
                                <Text style={styles.gridLabel}>{t('specs.warrantyActivation', 'Kích hoạt')}</Text>
                                <Text style={styles.gridValue} numberOfLines={1}>
                                    {getActivationLabel(warranty.activationMethod)}
                                </Text>
                            </View>
                        )}

                        {/* Column 4: Inspection */}
                        {warranty.inspectionOnDelivery !== undefined && warranty.inspectionOnDelivery !== null && (
                            <View style={styles.gridItem}>
                                <View style={styles.iconContainer}>
                                    <IconSymbol name="checkmark-circle-outline" size={16} color={theme.colors.primary} />
                                </View>
                                <Text style={styles.gridLabel}>{t('specs.warrantyInspection', 'Đồng kiểm')}</Text>
                                <Text style={styles.gridValue}>
                                    {warranty.inspectionOnDelivery ? t('specs.inspectionAllowed', 'Được đồng kiểm') : t('specs.inspectionNotAllowed', 'Không đồng kiểm')}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Collapsible Warranty Conditions */}
                    {warranty.conditions && warranty.conditions.length > 0 && (
                        <View style={styles.conditionsWrapper}>
                            <Pressable style={styles.conditionsHeader} onPress={handleToggleWarranty}>
                                <Text style={styles.conditionsTitle}>{t('specs.conditionsTitle', 'Điều kiện bảo hành & Đổi trả')}</Text>
                                <IconSymbol
                                    name={isWarrantyExpanded ? 'chevron-up' : 'chevron-down'}
                                    size={16}
                                    color={theme.colors.typographySecondary}
                                />
                            </Pressable>

                            {isWarrantyExpanded && (
                                <View style={styles.conditionsList}>
                                    {warranty.conditions.map((condition, index) => (
                                        <View key={index} style={styles.conditionRow}>
                                            <View style={styles.bulletPoint}>
                                                <IconSymbol name="checkmark-done" size={12} color={theme.colors.forestGreen || '#2E7D32'} />
                                            </View>
                                            <Text style={styles.conditionText}>{condition}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    )}
                </View>
            )}
        </View>
    );
});

ProductSpecs.displayName = 'ProductSpecs';

const styles = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        marginTop: theme.margins.sm,
        paddingBottom: theme.margins.xs,
    },
    header: {
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.smd,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerTitleWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.xs,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    specsList: {
        // Render specs list rows
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
        fontSize: 13,
        color: theme.colors.primary,
        fontWeight: '500',
    },
    separator: {
        height: 8,
        backgroundColor: theme.colors.background,
    },
    warrantySection: {
        // Styles for warranty section
    },
    warrantyGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: theme.margins.md,
        justifyContent: 'space-between',
        rowGap: theme.margins.sm,
    },
    gridItem: {
        width: '48%',
        backgroundColor: theme.colors.background,
        borderRadius: theme.radius.m,
        padding: theme.margins.sm,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E8F5E9', // Light green hint for security/warranty feel
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.margins.xs,
    },
    gridLabel: {
        fontSize: 11,
        color: theme.colors.typographySecondary,
        marginBottom: 2,
    },
    gridValue: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.typography,
        textAlign: 'center',
    },
    conditionsWrapper: {
        marginHorizontal: theme.margins.md,
        marginBottom: theme.margins.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.m,
        overflow: 'hidden',
    },
    conditionsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.margins.sm,
        backgroundColor: theme.colors.background,
    },
    conditionsTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    conditionsList: {
        padding: theme.margins.sm,
        gap: theme.margins.xs,
        backgroundColor: theme.colors.surface,
    },
    conditionRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: theme.margins.xs,
    },
    bulletPoint: {
        marginTop: 2,
    },
    conditionText: {
        flex: 1,
        fontSize: 12,
        color: theme.colors.typographySecondary,
        lineHeight: 18,
    },
}));

export default ProductSpecs;
