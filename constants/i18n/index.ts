import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import resources - EN
import { AUTH_STRINGS as authEn } from './en/auth';
import { CART_STRINGS as cartEn } from './en/cart';
import { CATEGORY_STRINGS as categoryEn } from './en/category';
import { CHAT_STRINGS as chatEn } from './en/chat';
import { COMMON_STRINGS as commonEn } from './en/common';
import { HOME_STRINGS as homeEn } from './en/home';
import { ORDER_STRINGS as orderEn } from './en/order';
import { PRODUCT_STRINGS as productEn } from './en/product';
import { PROFILE_STRINGS as profileEn } from './en/profile';
import { VOUCHER_STRINGS as voucherEn } from './en/voucher';

// Import resources - VI
import { AUTH_STRINGS as authVi } from './vi/auth';
import { CART_STRINGS as cartVi } from './vi/cart';
import { CATEGORY_STRINGS as categoryVi } from './vi/category';
import { CHAT_STRINGS as chatVi } from './vi/chat';
import { COMMON_STRINGS as commonVi } from './vi/common';
import { HOME_STRINGS as homeVi } from './vi/home';
import { ORDER_STRINGS as orderVi } from './vi/order';
import { PRODUCT_STRINGS as productVi } from './vi/product';
import { PROFILE_STRINGS as profileVi } from './vi/profile';
import { VOUCHER_STRINGS as voucherVi } from './vi/voucher';

const resources = {
    vi: {
        common: commonVi,
        auth: authVi,
        product: productVi,
        voucher: voucherVi,
        cart: cartVi,
        order: orderVi,
        chat: chatVi,
        profile: profileVi,
        home: homeVi,
        category: categoryVi,
    },
    en: {
        common: commonEn,
        auth: authEn,
        product: productEn,
        voucher: voucherEn,
        cart: cartEn,
        order: orderEn,
        chat: chatEn,
        profile: profileEn,
        home: homeEn,
        category: categoryEn,
    },
} as const;

/**
 * Get initial language
 * Priority: Persisted store > Device locale > Default 'vi'
 */
const getInitialLanguage = (): string => {
    // Fallback to device locale
    const deviceLocale = Localization.getLocales()[0]?.languageCode;

    // Only support vi and en
    if (deviceLocale === 'en') return 'en';
    return 'vi';
};

i18n.use(initReactI18next).init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'vi',
    ns: ['common', 'auth', 'product', 'voucher', 'cart', 'order', 'chat', 'profile', 'home', 'category'],
    defaultNS: 'common',
    interpolation: {
        escapeValue: false,
    },
    compatibilityJSON: 'v4',
});

export default i18n;
