import 'i18next';
import { ProductTranslation } from './types';

declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: 'product';
        resources: {
            product: ProductTranslation;
        };
    }
}
