import {
    AuthTranslation,
    CartTranslation,
    CategoryTranslation,
    ChatTranslation,
    CommonTranslation,
    HomeTranslation,
    OrderTranslation,
    ProductTranslation,
    ProfileTranslation,
    VoucherTranslation
} from './types';

declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: 'common';
        resources: {
            common: CommonTranslation;
            auth: AuthTranslation;
            product: ProductTranslation;
            voucher: VoucherTranslation;
            cart: CartTranslation;
            order: OrderTranslation;
            chat: ChatTranslation;
            profile: ProfileTranslation;
            home: HomeTranslation;
            category: CategoryTranslation;
        };
    }
}
