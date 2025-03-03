import i18next, { InitOptions } from 'i18next';
import { i18nCommonConfig } from '@lenovo-software/lsa-clients-common';

import * as en from '../translations/en/translation.json';
import * as de from '../translations/de/translation.json';
import * as es from '../translations/es/translation.json';
import * as fr from '../translations/fr/translation.json';
import * as it from '../translations/it/translation.json';
import * as ja from '../translations/ja/translation.json';
import * as pt from '../translations/pt/translation.json';
import * as ko from '../translations/ko/translation.json';
import * as id from '../translations/id/translation.json';
import * as ar from '../translations/ar/translation.json';

const i18nextOptions: InitOptions = {
	debug: i18nCommonConfig.env !== 'production',
	// bundle translation
    resources: {
        en: { translation: en },
        de: { translation: de },
        es: { translation: es },
        fr: { translation: fr },
        it: { translation: it },
        ja: { translation: ja },
        pt: { translation: pt },
        ko: { translation: ko },
        id: { translation: id },
        ar: { translation: ar }
    },

    initImmediate: true,
    interpolation: {
        escapeValue: false
    },
    saveMissing: false,
    lng: i18nCommonConfig.fallbackLng,
    supportedLngs: i18nCommonConfig.languages,
    load: 'currentOnly',
    fallbackLng: 'en',
    ns: [i18nCommonConfig.namespace],
    defaultNS: i18nCommonConfig.namespace
};

export { i18next, i18nextOptions };
