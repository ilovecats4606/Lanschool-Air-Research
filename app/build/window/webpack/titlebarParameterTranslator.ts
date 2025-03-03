import { RoutableWindowParameters, RoutableWindowTitlebarControlOptionToMessageMap } from '@lenovo-software/lsa-clients-common';
import { TitlebarOptions } from './titlebar/titlebar';
import { Color } from './titlebar/common/color';

/**
 * Distillation of RoutableWindowTitleBarParameters important for titlebar creation
 * performed in preload.js
 */
export interface TitlebarParametersForPreload {
    windowId: string,
    hasTitlebar: boolean,
    titlebarTitle: string,
    displayTitle: boolean,
    backgroundColor: string,
    foregroundColor: string,
    canClose: boolean,
    canMinimize: boolean,
    canMaximize: boolean
}

const defaultBackgroundColor = '#2f3241';
const defaultForegroundColor = '#ffffff';

export class RoutableWindowTitleBarParameters2TitlebarOptions {
    public static toTitlebarParametersForPreload(rwParams: RoutableWindowParameters): TitlebarParametersForPreload {
        let ret: TitlebarParametersForPreload = {
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
            rwParams.titlebar.controlOptions.forEach((value: RoutableWindowTitlebarControlOptionToMessageMap) => {
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

    private static strToBool(test: string | null, defaultVal: boolean): boolean {
        if (!test)
            return defaultVal;

        return (test === 'true') ? true : false;
    }

    public static toTitlebarParametersForPreloadFromQueryString(urlsp: URLSearchParams): TitlebarParametersForPreload {
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
        }
        
    }

    public static toTitlebarOptions(preloadParams: TitlebarParametersForPreload): TitlebarOptions {
        return {
            windowId: preloadParams.windowId,
            foregroundColor: Color.fromHex(preloadParams.foregroundColor),
            backgroundColor: Color.fromHex(preloadParams.backgroundColor),
            minimizable: preloadParams.canMinimize,
            maximizable: preloadParams.canMaximize,
            closeable: preloadParams.canClose,
            displayTitle: preloadParams.displayTitle,
            title: preloadParams.titlebarTitle
        }
    }
}