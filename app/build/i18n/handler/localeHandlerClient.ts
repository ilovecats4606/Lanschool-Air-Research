import { App } from 'electron';
import { ILocaleHandler, i18nLocaleMapper, LSAClient } from '@lenovo-software/lsa-clients-common';

export class LocaleHandlerClient implements ILocaleHandler {
    private appInstance: App | undefined;
    constructor(app: App){
        this.appInstance = app;
    }

    getLocale(): string {
		let langCode = "en";
        if(this.appInstance){
            // get OS locale
            const locale = this.appInstance.getLocale();
            langCode = i18nLocaleMapper(locale);
            LSAClient.getInstance().logger.logInfo(
                '####### *********** :' + langCode
            );
        }
        return langCode;
    }
}
