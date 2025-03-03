"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TitlebarCommandProcessor = exports.channels = void 0;
exports.channels = [
    'onMaximize',
    'onHide',
    'onRestore',
    'onClose',
    'onMinimize',
    'onTitlebarHeightInPx',
    'onTitlebarVisibility'
];
class TitlebarCommandRouter {
    constructor(ipcMain) {
        this.ipcMain = ipcMain;
        exports.channels.forEach((value) => {
            this.ipcMain.on(value, (event, arg) => {
                this.processTitlebarCommand(value, event, arg);
            });
        });
        this.commandWindows = new Array();
    }
    static getInstance(ipcMain) {
        if (!TitlebarCommandRouter.instance) {
            TitlebarCommandRouter.instance = new TitlebarCommandRouter(ipcMain);
        }
        return TitlebarCommandRouter.instance;
    }
    processTitlebarCommand(channel, event, arg) {
        const window = this.getHandlerWindow(event, arg);
        if (!window)
            return;
        switch (channel) {
            case 'onMaximize': {
                if (window.onTitlebarCommandMaximize) {
                    window.onTitlebarCommandMaximize();
                }
                break;
            }
            case 'onHide': {
                if (window.onTitlebarCommandHide) {
                    window.onTitlebarCommandHide();
                }
                break;
            }
            case 'onRestore': {
                if (window.onTitlebarCommandRestore)
                    window.onTitlebarCommandRestore();
                break;
            }
            case 'onClose': {
                if (window.onTitlebarCommandClose)
                    window.onTitlebarCommandClose();
                break;
            }
            case 'onMinimize': {
                if (window.onTitlebarCommandMinimize)
                    window.onTitlebarCommandMinimize();
                break;
            }
            case 'onTitlebarHeightInPx': {
                if (window.onTitlebarHeightInPxResponse)
                    window.onTitlebarHeightInPxResponse(arg);
            }
            case 'onTitlebarVisibility': {
                if (window.onTitlebarVisibility)
                    window.onTitlebarVisibility(arg.visible);
            }
        }
    }
    getHandlerWindow(event, arg) {
        for (let i = 0; i < this.commandWindows.length; i++) {
            if (arg.windowId === this.commandWindows[i].getWindowId())
                return this.commandWindows[i];
        }
        return undefined;
    }
    addWindow(window) {
        this.commandWindows.push(window);
    }
    removeWindow(window) {
        const windowId = window.getWindowId();
        for (let i = 0; i < this.commandWindows.length; i++) {
            if (windowId === this.commandWindows[i].getWindowId()) {
                this.commandWindows.splice(i, 1);
                break;
            }
        }
    }
    static destroyInstance() {
        TitlebarCommandRouter.instance = undefined;
    }
}
class TitlebarCommandProcessor {
    constructor(window, ipcMain) {
        this.window = window;
        this.titlebarCommandRouter = TitlebarCommandRouter.getInstance(ipcMain);
        this.titlebarCommandRouter.addWindow(window);
    }
    destroy() {
        this.titlebarCommandRouter.removeWindow(this.window);
    }
    static destroyCommandRouterInstance() {
        TitlebarCommandRouter.destroyInstance();
    }
}
exports.TitlebarCommandProcessor = TitlebarCommandProcessor;
//# sourceMappingURL=titlebarCommandProcessor.js.map