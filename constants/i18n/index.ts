import { getDeviceLanguage } from '@/utils/language';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import resources - EN
import { AUTH_STRINGS as authEn } from './en/auth';
import { CART_STRINGS as cartEn } from './en/cart';
import { CATEGORY_STRINGS as categoryEn } from './en/category';
import { CHAT_STRINGS as chatEn } from './en/chat';
import { CHECKOUT_STRINGS as checkoutEn } from './en/checkout';
import { COMMON_STRINGS as commonEn } from './en/common';
import { HOME_STRINGS as homeEn } from './en/home';
import { myReviews as myReviewsEn } from './en/myReviews';
import { NOTIFICATION_STRINGS as notificationEn } from './en/notification';
import { ORDER_STRINGS as orderEn } from './en/order';
import { PRODUCT_STRINGS as productEn } from './en/product';
import { PROFILE_STRINGS as profileEn } from './en/profile';
import { SEARCH_STRINGS as searchEn } from './en/search';
import { VOUCHER_STRINGS as voucherEn } from './en/voucher';

// Import resources - VI
import { AUTH_STRINGS as authVi } from './vi/auth';
import { CART_STRINGS as cartVi } from './vi/cart';
import { CATEGORY_STRINGS as categoryVi } from './vi/category';
import { CHAT_STRINGS as chatVi } from './vi/chat';
import { CHECKOUT_STRINGS as checkoutVi } from './vi/checkout';
import { COMMON_STRINGS as commonVi } from './vi/common';
import { HOME_STRINGS as homeVi } from './vi/home';
import { myReviews as myReviewsVi } from './vi/myReviews';
import { NOTIFICATION_STRINGS as notificationVi } from './vi/notification';
import { ORDER_STRINGS as orderVi } from './vi/order';
import { PRODUCT_STRINGS as productVi } from './vi/product';
import { PROFILE_STRINGS as profileVi } from './vi/profile';
import { SEARCH_STRINGS as searchVi } from './vi/search';
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
        search: searchVi,
        notification: notificationVi,
        checkout: checkoutVi,
        myReviews: myReviewsVi,
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
        search: searchEn,
        notification: notificationEn,
        checkout: checkoutEn,
        myReviews: myReviewsEn,
    },
} as const;

i18n.use(initReactI18next).init({
    resources,
    lng: getDeviceLanguage(),
    fallbackLng: 'en',
    ns: ['common', 'auth', 'product', 'voucher', 'cart', 'order', 'chat', 'profile', 'home', 'category', 'search', 'notification', 'checkout', 'myReviews'],
    defaultNS: 'common',
    interpolation: {
        escapeValue: false,
    },
    compatibilityJSON: 'v4',
});

export default i18n;
