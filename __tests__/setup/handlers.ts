import { authHandlers } from './handlers/auth.handlers';
import { cartHandlers } from './handlers/cart.handlers';

export const handlers = [
    ...authHandlers,
    ...cartHandlers,
];
