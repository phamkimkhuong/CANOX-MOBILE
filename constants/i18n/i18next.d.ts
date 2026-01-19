import { I18nResources } from './types';

declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: 'common';
        resources: I18nResources;
    }
}
