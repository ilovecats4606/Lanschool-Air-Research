"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocaleHandlerClient = void 0;
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
class LocaleHandlerClient {
    constructor(app) {
        this.appInstance = app;
    }
    getLocale() {
        let langCode = "en";
        if (this.appInstance) {
            const locale = this.appInstance.getLocale();
            langCode = (0, lsa_clients_common_1.i18nLocaleMapper)(locale);
            lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('####### *********** :' + langCode);
        }
        return langCode;
    }
}
exports.LocaleHandlerClient = LocaleHandlerClient;
//# sourceMappingURL=localeHandlerClient.js.map