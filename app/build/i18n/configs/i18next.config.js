"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.i18nextOptions = exports.i18next = void 0;
const i18next_1 = __importDefault(require("i18next"));
exports.i18next = i18next_1.default;
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
const en = __importStar(require("../translations/en/translation.json"));
const de = __importStar(require("../translations/de/translation.json"));
const es = __importStar(require("../translations/es/translation.json"));
const fr = __importStar(require("../translations/fr/translation.json"));
const it = __importStar(require("../translations/it/translation.json"));
const ja = __importStar(require("../translations/ja/translation.json"));
const pt = __importStar(require("../translations/pt/translation.json"));
const ko = __importStar(require("../translations/ko/translation.json"));
const id = __importStar(require("../translations/id/translation.json"));
const ar = __importStar(require("../translations/ar/translation.json"));
const i18nextOptions = {
    debug: lsa_clients_common_1.i18nCommonConfig.env !== 'production',
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
    lng: lsa_clients_common_1.i18nCommonConfig.fallbackLng,
    supportedLngs: lsa_clients_common_1.i18nCommonConfig.languages,
    load: 'currentOnly',
    fallbackLng: 'en',
    ns: [lsa_clients_common_1.i18nCommonConfig.namespace],
    defaultNS: lsa_clients_common_1.i18nCommonConfig.namespace
};
exports.i18nextOptions = i18nextOptions;
//# sourceMappingURL=i18next.config.js.map