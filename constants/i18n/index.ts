import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import tài nguyên
import { PRODUCT_STRINGS as productEn } from './en/product';
import { PRODUCT_STRINGS as productVi } from './vi/product';

const resources = {
    vi: { product: productVi },
    en: { product: productEn },
} as const;

i18n.use(initReactI18next).init({
    resources,
    lng: Localization.getLocales()[0].languageCode ?? 'vi',
    fallbackLng: 'vi',
    ns: ['product'],
    defaultNS: 'product',
    interpolation: {
        escapeValue: false, // React already does escaping
    },
    compatibilityJSON: 'v4', // Required for latest i18next versions
});

export default i18n;
