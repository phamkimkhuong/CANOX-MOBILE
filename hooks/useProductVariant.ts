import type {
    InventoryStatus,
    PriceDisplay,
    ProductDetailUI,
    ProductOptionUI,
    SelectedOptions,
    VariantMatrixValue,
    VariantSelectionResult,
} from '@/types/productDetail';
import { createKeyFromSelection } from '@/utils/adapter/productDetailAdapter';
import { useCallback, useMemo, useState } from 'react';

const LOW_STOCK_THRESHOLD = 5;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Xác định inventory status từ stock
 */
const getInventoryStatus = (stock: number): InventoryStatus => {
    if (stock === 0) return 'out_of_stock';
    if (stock <= LOW_STOCK_THRESHOLD) return 'low_stock';
    return 'in_stock';
};

/**
 * Tạo summary string từ selected options
 * Ví dụ: "Size L, Màu Đen"
 */
const createSelectionSummary = (selectedOptions: SelectedOptions): string => {
    const values = Object.entries(selectedOptions)
        .filter(([_, value]) => value !== '')
        .map(([_, value]) => value);

    return values.join(', ');
};

/**
 * Normalize string để so sánh (lowercase, trim, single space)
 * Phải match với logic trong productDetailAdapter.ts
 */
const normalizeString = (str: string): string => {
    return str.trim().replace(/\s+/g, ' ').toLowerCase();
};

/**
 * Parse variant matrix key từ JSON format
 * Key format: '{"optionname1":"valuename1","optionname2":"valuename2"}'
 * @returns Record<optionName, valueName> đã normalized
 */
const parseVariantMatrixKey = (key: string): Record<string, string> => {
    try {
        return JSON.parse(key) as Record<string, string>;
    } catch {
        // Fallback nếu parse lỗi
        return {};
    }
};

/**
 * Kiểm tra value có available không dựa trên current selection
 * Dùng để disable các option không khả dụng
 * 
 * Logic:
 * 1. Nếu chưa chọn đủ options → check xem có ít nhất 1 variant chứa value này còn hàng
 * 2. Nếu đã chọn đủ → check variant cụ thể
 */
const isValueAvailable = (
    optionName: string,
    valueName: string,
    currentSelection: SelectedOptions,
    product: ProductDetailUI
): boolean => {
    // Normalize để so sánh chính xác
    const normalizedOptionName = normalizeString(optionName);
    const normalizedValueName = normalizeString(valueName);

    // Tạo selection giả với value này
    const testSelection = {
        ...currentSelection,
        [optionName]: valueName,
    };

    // Đếm số options đã chọn (không tính empty string)
    const selectedCount = Object.values(testSelection).filter(v => v !== '').length;
    
    // Nếu chưa chọn đủ các option khác
    if (selectedCount < product.options.length) {
        // Kiểm tra xem có ít nhất 1 variant match không
        for (const [key, variantValue] of product.variantMatrix) {
            // Parse key từ JSON format
            const parsedKey = parseVariantMatrixKey(key);
            
            // Check xem variant này có chứa option value đang test không
            const hasMatchingValue = parsedKey[normalizedOptionName] === normalizedValueName;
            
            if (!hasMatchingValue) continue;
            
            // Check xem variant có match với các options đã chọn khác không
            let matchesOtherSelections = true;
            for (const [selOptName, selOptValue] of Object.entries(testSelection)) {
                if (selOptValue === '') continue; // Skip empty selections
                
                const normalizedSelOptName = normalizeString(selOptName);
                const normalizedSelOptValue = normalizeString(selOptValue);
                
                if (parsedKey[normalizedSelOptName] !== normalizedSelOptValue) {
                    matchesOtherSelections = false;
                    break;
                }
            }
            
            // Nếu variant match và còn hàng → available
            if (matchesOtherSelections && variantValue.isAvailable) {
                return true;
            }
        }
        return false;
    }

    // Đã chọn đủ → check variant cụ thể
    const key = createKeyFromSelection(testSelection);
    const variant = product.variantMatrix.get(key);
    return variant?.isAvailable ?? false;
};

// ============================================
// MAIN HOOK
// ============================================

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

interface ProductOptionWithAvailability extends ProductOptionUI {
    values: Array<{
        id: string;
        name: string;
        displayOrder?: number;
        image?: string | null;
        isSelected: boolean;
        isAvailable: boolean;
    }>;
}

/**
 * Hook quản lý logic chọn variant sản phẩm
 * 
 * Features:
 * - Quản lý state selected options
 * - Tính toán variant hiện tại từ selection
 * - Xác định giá hiển thị (range hoặc cụ thể)
 * - Check inventory status
 * - Disable options không khả dụng
 * 
 * @example
 * ```tsx
 * const {
 *   selectedOptions,
 *   selectionResult,
 *   selectOption,
 *   getOptionsWithAvailability,
 * } = useProductVariant(productData);
 * 
 * // Render options
 * const options = getOptionsWithAvailability();
 * options.map(option => (
 *   option.values.map(value => (
 *     <TouchableOpacity
 *       disabled={!value.isAvailable}
 *       onPress={() => selectOption(option.name, value.name)}
 *     />
 *   ))
 * ));
 * 
 * // Check if can add to cart
 * if (selectionResult.canAddToCart) {
 *   addToCart(selectionResult.selectedVariant.id);
 * }
 * ```
 */
export const useProductVariant = (
    product: ProductDetailUI | undefined,
    options: UseProductVariantOptions = {}
): UseProductVariantReturn => {
    const { autoSelectFirst = false } = options;

    // ===== STATE =====
    const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>(() => {
        if (!product?.options) return {};

        // Initialize empty selection
        const initial: SelectedOptions = {};
        for (const option of product.options) {
            initial[option.name] = '';
        }

        // Auto select first available if enabled
        if (autoSelectFirst && product.options.length > 0) {
            // Find first available variant
            for (const [_, value] of product.variantMatrix) {
                if (value.isAvailable) {
                    // Get option values from this variant
                    // This is simplified - in real app, need to parse the key
                    break;
                }
            }
        }

        return initial;
    });

    // ===== DERIVED: Current Variant =====
    const currentVariant = useMemo((): VariantMatrixValue | null => {
        if (!product) return null;

        const selectedCount = Object.values(selectedOptions).filter(v => v !== '').length;
        if (selectedCount < product.options.length) {
            return null; // Not fully selected
        }

        const key = createKeyFromSelection(selectedOptions);
        return product.variantMatrix.get(key) ?? null;
    }, [product, selectedOptions]);

    // ===== DERIVED: Is Fully Selected =====
    const isFullySelected = useMemo(() => {
        if (!product) return false;
        const selectedCount = Object.values(selectedOptions).filter(v => v !== '').length;
        return selectedCount === product.options.length;
    }, [product, selectedOptions]);

    // ===== DERIVED: Display Price =====
    const displayPrice = useMemo((): PriceDisplay => {
        if (!product) {
            return { currentPrice: 0, isRange: false };
        }

        if (currentVariant) {
            return {
                currentPrice: currentVariant.price,
                originalPrice: currentVariant.originalPrice,
                discountPercentage: currentVariant.originalPrice
                    ? Math.round(
                        ((currentVariant.originalPrice - currentVariant.price) /
                            currentVariant.originalPrice) *
                        100
                    )
                    : undefined,
                isRange: false,
            };
        }

        return product.priceDisplay;
    }, [product, currentVariant]);

    // ===== DERIVED: Inventory Status =====
    const inventoryStatus = useMemo((): InventoryStatus => {
        if (currentVariant) {
            return getInventoryStatus(currentVariant.stock);
        }

        // Chưa chọn đủ -> check tổng stock
        if (!product) return 'out_of_stock';

        let totalStock = 0;
        for (const [_, value] of product.variantMatrix) {
            totalStock += value.stock;
        }

        return getInventoryStatus(totalStock);
    }, [product, currentVariant]);

    // ===== DERIVED: Available Stock =====
    const availableStock = useMemo((): number => {
        if (currentVariant) {
            return currentVariant.stock;
        }

        if (!product) return 0;

        let total = 0;
        for (const [_, value] of product.variantMatrix) {
            total += value.stock;
        }
        return total;
    }, [product, currentVariant]);

    // ===== DERIVED: Can Add To Cart =====
    const canAddToCart = useMemo(() => {
        if (!product?.hasVariants) {
            // Sản phẩm không có variant -> check isAvailable
            return product?.isAvailable ?? false;
        }

        // Có variant -> phải chọn đủ và còn hàng
        return isFullySelected && currentVariant !== null && currentVariant.stock > 0;
    }, [product, isFullySelected, currentVariant]);

    // ===== DERIVED: Selection Summary =====
    const selectionSummary = useMemo(() => {
        return createSelectionSummary(selectedOptions);
    }, [selectedOptions]);

    // ===== DERIVED: Selection Result (Bundled) =====
    const selectionResult = useMemo((): VariantSelectionResult => ({
        selectedVariant: currentVariant,
        isFullySelected,
        displayPrice,
        inventoryStatus,
        availableStock,
        canAddToCart,
        selectionSummary,
    }), [
        currentVariant,
        isFullySelected,
        displayPrice,
        inventoryStatus,
        availableStock,
        canAddToCart,
        selectionSummary,
    ]);

    // ===== ACTIONS =====
    const selectOption = useCallback((optionName: string, valueName: string) => {
        setSelectedOptions(prev => ({
            ...prev,
            [optionName]: prev[optionName] === valueName ? '' : valueName, // Toggle if same
        }));
    }, []);

    const resetSelection = useCallback(() => {
        if (!product?.options) return;

        const reset: SelectedOptions = {};
        for (const option of product.options) {
            reset[option.name] = '';
        }
        setSelectedOptions(reset);
    }, [product?.options]);

    // ===== HELPERS =====
    const isOptionValueSelected = useCallback(
        (optionName: string, valueName: string): boolean => {
            return selectedOptions[optionName] === valueName;
        },
        [selectedOptions]
    );

    const isOptionValueAvailable = useCallback(
        (optionName: string, valueName: string): boolean => {
            if (!product) return false;
            return isValueAvailable(optionName, valueName, selectedOptions, product);
        },
        [product, selectedOptions]
    );

    const getOptionsWithAvailability = useCallback((): ProductOptionWithAvailability[] => {
        if (!product) return [];

        return product.options.map(option => ({
            ...option,
            values: option.values.map(value => ({
                ...value,
                isSelected: selectedOptions[option.name] === value.name,
                isAvailable: isValueAvailable(
                    option.name,
                    value.name,
                    selectedOptions,
                    product
                ),
            })),
        }));
    }, [product, selectedOptions]);

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
