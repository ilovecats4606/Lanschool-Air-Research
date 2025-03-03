"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutableWindow = exports.RoutableWindowFactory = void 0;
const titlebarCommandProcessor_1 = require("./titlebarCommandProcessor");
const titlebarParameterTranslator_1 = require("./webpack/titlebarParameterTranslator");
const validChannelsFromRenderer = [
    'FromUI_RaiseHand',
    'FromUI_ChatMessage',
    'FromUI_ConferenceParamsSet',
    'FromUI_ConferenceError',
    'FromUI_ConferenceAttachComplete',
    'FromUI_ConferenceDetachComplete',
    'FromUI_ConferenceAttendeeId',
    'FromUI_WindowMoving',
    'FromUI_WindowMoved',
    'FromUI_LogMessage',
    'FromUI_DownloadLogs',
    'FromUI_LearnMoreAboutStatus',
    'FromUI_CloseWindow',
    'FromUI_ElementSizeNotification'
];
class RoutableWindowFactory {
    constructor(ipcMain, viewController) {
        this.ipcMain = ipcMain;
        this.viewController = viewController;
    }
    getNewRoutableWindow(logger) {
        return new RoutableWindow(logger, this.ipcMain, this.viewController);
    }
}
exports.RoutableWindowFactory = RoutableWindowFactory;
class RoutableWindow {
    constructor(logger, ipcMain, viewController) {
        this.logger = logger;
        this.ipcMain = ipcMain;
        this.viewController = viewController;
        this.callbackMap = new Array();
        validChannelsFromRenderer.forEach((channel) => {
            try {
                this.registerHandler(channel);
            }
            catch (e) {
            }
        });
        this.titlebarCommandProcessor = new titlebarCommandProcessor_1.TitlebarCommandProcessor(this, ipcMain);
    }
    getWindowId() {
        var _a;
        return (_a = this.routableWindowParameters) === null || _a === void 0 ? void 0 : _a.windowId;
    }
    registerHandler(channel) {
        this.ipcMain.handle(channel, async (event, arg) => {
            var _a;
            try {
                await ((_a = this.routableWindowParameters) === null || _a === void 0 ? void 0 : _a.me.onMessage(channel, arg === null || arg === void 0 ? void 0 : arg.data));
            }
            catch (e) {
            }
        });
    }
    init(parameters) {
        this.routableWindowParameters = parameters;
        return Promise.resolve();
    }
    destroy() {
        this.titlebarCommandProcessor.destroy();
        return Promise.resolve();
    }
    async show(bounds) {
        var _a, _b, _c, _d;
        this.win = this.viewController.getBrowserWindow(bounds.size.x, bounds.size.y);
        if (this.win) {
            this.win.resizable = (_a = this.routableWindowParameters) === null || _a === void 0 ? void 0 : _a.resizable;
            if (((_b = this.routableWindowParameters) === null || _b === void 0 ? void 0 : _b.titlebar.canMoveWindow) !== undefined)
                this.win.movable = (_c = this.routableWindowParameters) === null || _c === void 0 ? void 0 : _c.titlebar.canMoveWindow;
        }
        await this.viewController.loadRoute(this.routableWindowParameters.leafRoute + '/' +
            ((_d = this.routableWindowParameters) === null || _d === void 0 ? void 0 : _d.windowId), titlebarParameterTranslator_1.RoutableWindowTitleBarParameters2TitlebarOptions.toTitlebarParametersForPreload(this.routableWindowParameters));
    }
    getCurrentWindowBounds() {
        if (!this.win)
            return Promise.reject('RoutableWindow.getCurrentWindowBounds(): No window.');
        const windowBounds = this.win.getBounds();
        return Promise.resolve({
            top: windowBounds.y,
            left: windowBounds.x,
            size: {
                x: windowBounds.width,
                y: windowBounds.height
            }
        });
    }
    onTitlebarHeightInPxResponse(response) {
        for (let i = 0; i < this.callbackMap.length; i++) {
            if (this.callbackMap[i].titlebarMessage.windowId === response.windowId &&
                this.callbackMap[i].titlebarMessage.cookie === response.cookie) {
                this.callbackMap[i].cb(response.data);
                this.callbackMap.splice(i, 1);
                break;
            }
        }
    }
    createCallbackMapEntry(windowId, cookie, cb) {
        this.callbackMap.push({
            titlebarMessage: {
                windowId,
                cookie
            },
            cb: (data) => { cb(data); }
        });
    }
    getTitlebarHeightInPx() {
        return new Promise((resolve) => {
            const windowId = this.getWindowId();
            const cookie = '';
            this.createCallbackMapEntry(windowId, cookie, resolve);
            this.viewController.sendMessageToTitleBar('getTitlebarHeightInPx', {
                windowId: windowId,
                cookie: ''
            });
        });
    }
    resize(bounds) {
        if (!this.win)
            return Promise.reject('RoutableWindow.resize(): No window.');
        this.win.setBounds({
            x: bounds.left,
            y: bounds.top,
            width: bounds.size.x,
            height: bounds.size.y
        });
        return Promise.resolve();
    }
    close() {
        var _a;
        (_a = this.win) === null || _a === void 0 ? void 0 : _a.close();
        return Promise.resolve();
    }
    onTitlebarCommandClose() {
        this.close();
    }
}
exports.RoutableWindow = RoutableWindow;
//# sourceMappingURL=routableWindow.js.map