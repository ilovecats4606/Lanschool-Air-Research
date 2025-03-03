"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutableWindowTitleBarParameters2TitlebarOptions = void 0;
const color_1 = require("./titlebar/common/color");
const defaultBackgroundColor = '#2f3241';
const defaultForegroundColor = '#ffffff';
class RoutableWindowTitleBarParameters2TitlebarOptions {
    static toTitlebarParametersForPreload(rwParams) {
        let ret = {
            windowId: rwParams.windowId,
            hasTitlebar: rwParams.titlebar.hasTitlebar,
            titlebarTitle: rwParams.titlebar.titlebarTitle || '',
            displayTitle: rwParams.titlebar.displayTitle || false,
            backgroundColor: rwParams.titlebar.backgroundColor || '',
            foregroundColor: rwParams.titlebar.foregroundColor || '',
            canClose: false,
            canMinimize: false,
            canMaximize: false
        };
        if (rwParams.titlebar.controlOptions) {
            rwParams.titlebar.controlOptions.forEach((value) => {
                switch (value.controlOption) {
                    case 'close': {
                        ret.canClose = true;
                        break;
                    }
                    case 'minimize': {
                        ret.canMinimize = true;
                        break;
                    }
                    case 'maximize': {
                        ret.canMaximize = true;
                        break;
                    }
                }
            });
        }
        else {
            ret.canClose = true;
            ret.canMinimize = true;
            ret.canMinimize = true;
        }
        return ret;
    }
    static strToBool(test, defaultVal) {
        if (!test)
            return defaultVal;
        return (test === 'true') ? true : false;
    }
    static toTitlebarParametersForPreloadFromQueryString(urlsp) {
        return {
            windowId: urlsp.get('windowId') || '',
            hasTitlebar: RoutableWindowTitleBarParameters2TitlebarOptions.strToBool(urlsp.get('hasTitlebar'), true),
            titlebarTitle: urlsp.get('titlebarTitle') || '',
            displayTitle: RoutableWindowTitleBarParameters2TitlebarOptions.strToBool(urlsp.get('displayTitle'), true),
            backgroundColor: urlsp.get('backgroundColor') || defaultBackgroundColor,
            foregroundColor: urlsp.get('forgroundColor') || defaultForegroundColor,
            canClose: RoutableWindowTitleBarParameters2TitlebarOptions.strToBool(urlsp.get('canClose'), true),
            canMinimize: RoutableWindowTitleBarParameters2TitlebarOptions.strToBool(urlsp.get('canMinimize'), true),
            canMaximize: RoutableWindowTitleBarParameters2TitlebarOptions.strToBool(urlsp.get('canMaximize'), true)
        };
    }
    static toTitlebarOptions(preloadParams) {
        return {
            windowId: preloadParams.windowId,
            foregroundColor: color_1.Color.fromHex(preloadParams.foregroundColor),
            backgroundColor: color_1.Color.fromHex(preloadParams.backgroundColor),
            minimizable: preloadParams.canMinimize,
            maximizable: preloadParams.canMaximize,
            closeable: preloadParams.canClose,
            displayTitle: preloadParams.displayTitle,
            title: preloadParams.titlebarTitle
        };
    }
}
exports.RoutableWindowTitleBarParameters2TitlebarOptions = RoutableWindowTitleBarParameters2TitlebarOptions;
//# sourceMappingURL=titlebarParameterTranslator.js.map