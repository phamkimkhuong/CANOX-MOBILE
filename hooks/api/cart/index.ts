/**
 * ==============================================
 * CART HOOKS - Barrel Export
 * ==============================================
 */

// Query hooks
export { useAddToCart, useCart } from './useCart';
export type { AddToCartInput } from './useCart';

// Mutation hooks (quantity, remove, clear)
export {
    useClearCart,
    useRemoveCartItem,
    useUpdateCartItemQuantity
} from './useCartMutations';

// Calculation hooks (client-side selection logic)
export * from './useCartCalculations';

