import type {
    InventoryStatus,
    PriceBreakdown,
    PriceDisplay,
    ProductDetailUI,
    ProductOptionWithAvailability,
    SelectedOptions,
    VariantMatrixValue,
    VariantOptionPromotionState,
    VariantSelectionResult,
    VoucherUI,
} from '@/types/product/productDetail';
import { createKeyFromSelection } from '@/utils/adapter/product/productDetailAdapter';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LOW_STOCK_THRESHOLD = 5;
const TACTICAL_CAMPAIGN_TYPES = new Set([
    'FLASH_SALE',
    'DAILY_DEAL',
    'MEGA_SALE',
    'SHOP_SALE',
    'SHOP_PROMOTION',
]);

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Determine inventory status from stock
 */
const getInventoryStatus = (stock: number): InventoryStatus => {
    if (stock === 0) return 'out_of_stock';
    if (stock <= LOW_STOCK_THRESHOLD) return 'low_stock';
    return 'in_stock';
};

/**
 * Create summary string from selected options
 * Example: "Size L, Color Black"
 */
const createSelectionSummary = (selectedOptions: SelectedOptions): string => {
    const values = Object.entries(selectedOptions)
        .filter(([_, value]) => value !== '')
        .map(([_, value]) => value);

    return values.join(', ');
};

/**
 * Normalize string for comparison (lowercase, trim, single space)
 * Must match logic in productDetailAdapter.ts
 */
const normalizeString = (str: string): string => {
    return str.trim().replace(/\s+/g, ' ').toLowerCase();
};

/**
 * Parse variant matrix key từ JSON format
 * Key format: '{"optionname1":"valuename1","optionname2":"valuename2"}'
 * @returns Record<optionName, valueName> normalized
 */
const parseVariantMatrixKey = (key: string): Record<string, string> => {
    try {
        return JSON.parse(key) as Record<string, string>;
    } catch {
        // Fallback if parse error
        return {};
    }
};

interface UseProductVariantOptions {
    /** Auto select first available variant */
    autoSelectFirst?: boolean;
}

interface UseProductVariantReturn {
    // State
    selectedOptions: SelectedOptions;

    // Derived data
    selectionResult: VariantSelectionResult;

    // Actions
    selectOption: (optionName: string, valueName: string) => void;
    resetSelection: () => void;

    // Helpers
    isOptionValueSelected: (optionName: string, valueName: string) => boolean;
    isOptionValueAvailable: (optionName: string, valueName: string) => boolean;
    getOptionsWithAvailability: () => ProductOptionWithAvailability[];
}

/**
 * Hook managing product variant selection logic
 */
export const useProductVariant = (
    product: ProductDetailUI | undefined,
    options: UseProductVariantOptions = {}
): UseProductVariantReturn => {
    const { autoSelectFirst = false } = options;

    const { t } = useTranslation('product');

    // ===== STATE =====
    const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({});

    // Helper: Calculate initial selection (Cheapest & Available)
    const getInitialSelection = useCallback((prod: ProductDetailUI): SelectedOptions => {
        const initial: SelectedOptions = {};
        for (const option of prod.options) {
            initial[option.name] = '';
        }

        if (autoSelectFirst && prod.variantMatrix && prod.variantMatrix.size > 0) {
            let cheapestVariantKey: string | null = null;
            let lowestPrice = Infinity;

            for (const [key, value] of prod.variantMatrix) {
                if (value.isAvailable && value.price < lowestPrice) {
                    lowestPrice = value.price;
                    cheapestVariantKey = key;
                }
            }

            if (cheapestVariantKey) {
                try {
                    const parsedSelection = JSON.parse(cheapestVariantKey) as Record<string, string>;
                    for (const option of prod.options) {
                        const normalizedOptionName = option.name.trim().replace(/\s+/g, ' ').toLowerCase();
                        const selectedValueName = parsedSelection[normalizedOptionName];
                        if (selectedValueName) {
                            const matchingValue = option.values.find(
                                v => v.name.trim().replace(/\s+/g, ' ').toLowerCase() === selectedValueName
                            );
                            if (matchingValue) {
                                initial[option.name] = matchingValue.name;
                            }
                        }
                    }
                } catch {
                    // Ignore parse error
                }
            }
        }
        return initial;
    }, [autoSelectFirst]);

    // ===== STATE INITIALIZATION =====
    useEffect(() => {
        if (!product?.options || !product.variantMatrix) {
            setSelectedOptions({});
            return;
        }

        setSelectedOptions(getInitialSelection(product));
    }, [product?.id, getInitialSelection, product]);
    // ===== DERIVED: Selection Result =====
    const selectionResult = useMemo((): VariantSelectionResult => {
        if (!product) {
            return {
                selectedVariant: null,
                isFullySelected: false,
                displayPrice: { currentPrice: 0, isRange: false },
                inventoryStatus: 'out_of_stock',
                availableStock: 0,
                canAddToCart: false,
                selectionSummary: '',
            };
        }

        // --- currentVariant ---
        const selectedCount = Object.values(selectedOptions).filter(v => v !== '').length;
        const isFullySelected = selectedCount === product.options.length;

        let currentVariant: VariantMatrixValue | null = null;
        if (isFullySelected) {
            const key = createKeyFromSelection(selectedOptions);
            currentVariant = product.variantMatrix.get(key) ?? null;
        }

        // --- inventoryStatus & availableStock ---
        let availableStock: number;
        if (currentVariant) {
            availableStock = currentVariant.stock;
        } else {
            let total = 0;
            for (const [, value] of product.variantMatrix) {
                total += value.stock;
            }
            availableStock = total;
        }
        const inventoryStatus = getInventoryStatus(availableStock);

        // --- canAddToCart ---
        const canAddToCart = product.hasVariants
            ? isFullySelected && currentVariant !== null && currentVariant.stock > 0
            : product.isAvailable ?? false;

        // --- selectionSummary ---
        const selectionSummary = createSelectionSummary(selectedOptions);

        // --- displayPrice ---
        let displayPrice: PriceDisplay;

        if (currentVariant) {
            let finalPrice = currentVariant.price;
            let totalDiscountAmount = 0;

            const breakdown: PriceBreakdown = {
                basePrice: currentVariant.originalPrice ?? currentVariant.price,
                finalPrice: currentVariant.price,
            };

            if (currentVariant.originalPrice && currentVariant.originalPrice > currentVariant.price) {
                breakdown.productDiscount = {
                    id: currentVariant.promotionId || 'product-discount',
                    name: currentVariant.promotionName || t('priceBreakdown.productDiscount'),
                    amount: currentVariant.originalPrice - currentVariant.price,
                    percentage: currentVariant.promotionPercentage,
                    campaignType: currentVariant.campaignType,
                };
            }

            if (product.vouchers && product.vouchers.length > 0) {
                let bestPlatformVoucher: VoucherUI | null = null;
                let bestPlatformAmount = 0;
                let bestShopVoucher: VoucherUI | null = null;
                let bestShopAmount = 0;

                for (const voucher of product.vouchers) {
                    const discountValue = voucher.discountValue ?? 0;
                    let amount = 0;

                    if (voucher.discountType === 'PERCENTAGE') {
                        const rawDiscount = (currentVariant.price * discountValue) / 100;
                        amount = voucher.maxDiscount
                            ? Math.min(rawDiscount, voucher.maxDiscount)
                            : rawDiscount;
                    } else {
                        amount = discountValue;
                    }

                    const isEligible = !voucher.minOrderValue || currentVariant.price >= voucher.minOrderValue;

                    if (isEligible) {
                        if (voucher.sponsorType === 'PLATFORM') {
                            if (amount > bestPlatformAmount) {
                                bestPlatformAmount = amount;
                                bestPlatformVoucher = voucher;
                            }
                        } else {
                            if (amount > bestShopAmount) {
                                bestShopAmount = amount;
                                bestShopVoucher = voucher;
                            }
                        }
                    }
                }

                if (bestPlatformVoucher) {
                    totalDiscountAmount += bestPlatformAmount;
                    breakdown.platformVoucher = {
                        id: bestPlatformVoucher.id,
                        name: bestPlatformVoucher.name || 'TCano Voucher',
                        amount: bestPlatformAmount,
                        discountType: bestPlatformVoucher.discountType,
                        discountValue: bestPlatformVoucher.discountValue,
                        maxDiscount: bestPlatformVoucher.maxDiscount,
                    };
                }

                if (bestShopVoucher) {
                    totalDiscountAmount += bestShopAmount;
                    breakdown.shopVoucher = {
                        id: bestShopVoucher.id,
                        name: bestShopVoucher.name || 'Shop Voucher',
                        amount: bestShopAmount,
                        discountType: bestShopVoucher.discountType,
                        discountValue: bestShopVoucher.discountValue,
                        maxDiscount: bestShopVoucher.maxDiscount,
                    };
                }

                finalPrice -= totalDiscountAmount;
            }

            breakdown.finalPrice = finalPrice;

            const baseOriginalPrice = currentVariant.originalPrice ?? currentVariant.price;
            const totalDiscountPercent = baseOriginalPrice > finalPrice
                ? Math.round(((baseOriginalPrice - finalPrice) / baseOriginalPrice) * 100)
                : undefined;

            displayPrice = {
                currentPrice: finalPrice,
                originalPrice: baseOriginalPrice > finalPrice ? baseOriginalPrice : undefined,
                discountPercentage: totalDiscountPercent,
                voucherDiscount: totalDiscountAmount,
                shopVoucherDiscount: breakdown.shopVoucher?.amount,
                platformVoucherDiscount: breakdown.platformVoucher?.amount,
                priceAfterVoucher: finalPrice,
                isRange: false,
                breakdown,
            };
        } else {
            displayPrice = product.priceDisplay;
        }

        return {
            selectedVariant: currentVariant,
            isFullySelected,
            displayPrice,
            inventoryStatus,
            availableStock,
            canAddToCart,
            selectionSummary,
        };
    }, [product, selectedOptions, t]);

    // ===== ACTIONS =====
    const selectOption = useCallback((optionName: string, valueName: string) => {
        setSelectedOptions(prev => ({
            ...prev,
            [optionName]: prev[optionName] === valueName ? '' : valueName,
        }));
    }, []);

    const resetSelection = useCallback(() => {
        if (!product?.options || !product.variantMatrix) return;
        setSelectedOptions(getInitialSelection(product));
    }, [product, getInitialSelection]);

    // ===== HELPERS =====
    const isOptionValueSelected = useCallback(
        (optionName: string, valueName: string): boolean => {
            return selectedOptions[optionName] === valueName;
        },
        [selectedOptions]
    );

    const availabilityIndex = useMemo(() => {
        if (!product?.variantMatrix) return null;

        const index = new Map<string, {
            isAvailable: boolean;
            availableMatchCount: number;
            promotedMatchCount: number;
            campaignTypes: string[];
        }>();

        // Normalize current selections once to avoid repeated normalization
        const activeSelections: Array<[string, string]> = [];
        for (const [optName, optValue] of Object.entries(selectedOptions)) {
            if (optValue === '') continue;
            activeSelections.push([normalizeString(optName), normalizeString(optValue)]);
        }
        for (const [key, variant] of product.variantMatrix) {
            const parsedKey = parseVariantMatrixKey(key);
            for (const [optName, optValue] of Object.entries(parsedKey)) {
                let matchesOtherSelections = true;
                for (const [selName, selValue] of activeSelections) {
                    if (selName === optName) continue;
                    if (parsedKey[selName] !== selValue) {
                        matchesOtherSelections = false;
                        break;
                    }
                }

                if (!matchesOtherSelections) continue;

                const compositeKey = `${optName}\0${optValue}`;
                const existing = index.get(compositeKey);
                const isPromoted = variant.isAvailable
                    && !!variant.campaignType
                    && TACTICAL_CAMPAIGN_TYPES.has(variant.campaignType);

                if (!existing) {
                    index.set(compositeKey, {
                        isAvailable: variant.isAvailable,
                        availableMatchCount: variant.isAvailable ? 1 : 0,
                        promotedMatchCount: isPromoted ? 1 : 0,
                        campaignTypes: isPromoted && variant.campaignType ? [variant.campaignType] : [],
                    });
                } else {
                    if (variant.isAvailable) {
                        existing.isAvailable = true;
                        existing.availableMatchCount++;
                    }
                    if (isPromoted && variant.campaignType) {
                        existing.promotedMatchCount++;
                        if (!existing.campaignTypes.includes(variant.campaignType)) {
                            existing.campaignTypes.push(variant.campaignType);
                        }
                    }
                }
            }
        }

        return index;
    }, [product?.variantMatrix, selectedOptions]);

    const isOptionValueAvailable = useCallback(
        (optionName: string, valueName: string): boolean => {
            if (!availabilityIndex) return false;
            const compositeKey = `${normalizeString(optionName)}\0${normalizeString(valueName)}`;
            return availabilityIndex.get(compositeKey)?.isAvailable ?? false;
        },
        [availabilityIndex]
    );

    const getOptionsWithAvailability = useCallback((): ProductOptionWithAvailability[] => {
        if (!product || !availabilityIndex) return [];

        return product.options.map(option => ({
            ...option,
            values: option.values.map(value => {
                const compositeKey = `${normalizeString(option.name)}\0${normalizeString(value.name)}`;
                const entry = availabilityIndex.get(compositeKey);
                const isAvailable = entry?.isAvailable ?? false;

                // Derive promotion signal from pre-computed index
                let promotionState: VariantOptionPromotionState = 'none';
                let promotionType: string | undefined;

                if (isAvailable && entry && entry.promotedMatchCount > 0) {
                    promotionState = entry.promotedMatchCount === entry.availableMatchCount
                        ? 'active'
                        : 'possible';
                    promotionType = entry.campaignTypes.length === 1
                        ? entry.campaignTypes[0]
                        : undefined;
                }

                return {
                    ...value,
                    isSelected: selectedOptions[option.name] === value.name,
                    isAvailable,
                    promotionState,
                    promotionType,
                };
            }),
        }));
    }, [product, availabilityIndex, selectedOptions]);

    return {
        selectedOptions,
        selectionResult,
        selectOption,
        resetSelection,
        isOptionValueSelected,
        isOptionValueAvailable,
        getOptionsWithAvailability,
    };
};
