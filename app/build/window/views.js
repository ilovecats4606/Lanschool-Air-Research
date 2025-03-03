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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleViewController = exports.MainWindowId = void 0;
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
const electron_1 = require("electron");
const path = __importStar(require("path"));
const url = require('url');
exports.MainWindowId = 'mainWindow';
class SingleViewController {
    constructor(canClose) {
        this.canClose = canClose;
        this.width = 0;
        this.height = 0;
        this.browserWindow = null;
    }
    static Log_17296(message) {
        lsa_clients_common_1.LSAClient.getInstance().logger.logDebug(`17296: SingleViewController ${message}`);
    }
    getBrowserWindow(width, height) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        SingleViewController.Log_17296(`getBrowserWindow(+)`);
        if (!this.browserWindow) {
            SingleViewController.Log_17296(`getBrowserWindow(+1)`);
            if (!width || width <= 0 || !height || height <= 0) {
                throw new Error('SingleViewController.getBrowserWindow(): Invalid parameter.');
            }
            SingleViewController.Log_17296(`getBrowserWindow(+2)`);
            this.width = width;
            this.height = height;
            this.browserWindow = new electron_1.BrowserWindow({
                width: this.width,
                height: this.height,
                frame: false,
                enableLargerThanScreen: true,
                webPreferences: {
                    preload: path.join(__dirname, 'preload.js'),
                    nodeIntegration: false,
                    contextIsolation: true,
                    disableBlinkFeatures: "Auxclick",
                    sandbox: true
                }
            });
            SingleViewController.Log_17296(`getBrowserWindow(+3)`);
            (_a = this.browserWindow.webContents) === null || _a === void 0 ? void 0 : _a.setWindowOpenHandler(() => {
                return { action: 'deny' };
            });
            SingleViewController.Log_17296(`getBrowserWindow(+4)`);
            (_b = this.browserWindow) === null || _b === void 0 ? void 0 : _b.webContents.on('will-navigate', (event) => {
                SingleViewController.Log_17296(`on will-navigate`);
                event.preventDefault();
            });
            (_c = this.browserWindow) === null || _c === void 0 ? void 0 : _c.webContents.on('did-finish-load', () => {
                SingleViewController.Log_17296(`on did-finish-load`);
            });
            (_d = this.browserWindow) === null || _d === void 0 ? void 0 : _d.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame, frameProcessId, frameRoutingId) => {
                SingleViewController.Log_17296(`on did-fail-load: errorCode: ${errorCode}, errorDescription: ${errorDescription}, validatedURL: ${validatedURL}`);
            });
            (_e = this.browserWindow) === null || _e === void 0 ? void 0 : _e.webContents.on('did-fail-provisional-load', (event, errorCode, errorDescription, validatedURL, isMainFrame, frameProcessId, frameRoutingId) => {
                SingleViewController.Log_17296(`on did-fail-provisional-load: errorCode: ${errorCode}, errorDescription: ${errorDescription}, validatedURL: ${validatedURL}`);
            });
            (_f = this.browserWindow) === null || _f === void 0 ? void 0 : _f.webContents.on('did-frame-finish-load', (event, isMainFrame, frameProcessId, frameRoutingId) => {
                SingleViewController.Log_17296(`on did-frame-finish-load: isMainFrame: ${isMainFrame}, frameProcessId: ${frameProcessId}, frameRoutingId: ${frameRoutingId}`);
            });
            (_g = this.browserWindow) === null || _g === void 0 ? void 0 : _g.webContents.on('did-start-loading', () => {
                SingleViewController.Log_17296(`on did-start-loading`);
            });
            (_h = this.browserWindow) === null || _h === void 0 ? void 0 : _h.webContents.on('did-stop-loading', () => {
                SingleViewController.Log_17296(`on did-stop-loading`);
            });
            (_j = this.browserWindow) === null || _j === void 0 ? void 0 : _j.webContents.on('dom-ready', () => {
                SingleViewController.Log_17296(`on dom-ready`);
            });
            SingleViewController.Log_17296(`getBrowserWindow(+5)`);
            this.browserWindow.on('close', (e) => {
                if (!this.canClose)
                    e.preventDefault();
            });
            SingleViewController.Log_17296(`getBrowserWindow(+6)`);
            (_l = (_k = this.browserWindow) === null || _k === void 0 ? void 0 : _k.webContents) === null || _l === void 0 ? void 0 : _l.on('before-input-event', (event, input) => {
                if (input) {
                    if ((process.platform === 'darwin' &&
                        (input.key === 'r' && input.meta === true) ||
                        (input.key === '=' && input.meta === true) ||
                        (input.key === '-' && input.meta === true)) ||
                        (process.platform === 'win32' &&
                            (input.key === 'r' && input.control === true) ||
                            (input.key === '+' && input.shift === true && input.control === true) ||
                            (input.key === '-' && input.control === true))) {
                        event.preventDefault();
                    }
                }
            });
            this.browserWindow.on('ready-to-show', () => {
                SingleViewController.Log_17296(`on ready-to-show`);
            });
            SingleViewController.Log_17296(`getBrowserWindow(+7)`);
            this.browserWindow.on('closed', () => {
                this.browserWindow = null;
            });
        }
        SingleViewController.Log_17296(`getBrowserWindow(-)`);
        return this.browserWindow;
    }
    async init() {
        SingleViewController.Log_17296(`init(+)`);
        await this.loadRoute('chat');
        SingleViewController.Log_17296(`init(-)`);
    }
    resizeWindow(width, height, titleBarVisible) {
    }
    sendMessageToUIView(msg, param) {
        var _a, _b;
        if (param) {
            (_a = this.browserWindow) === null || _a === void 0 ? void 0 : _a.webContents.send(msg, param);
        }
        else {
            (_b = this.browserWindow) === null || _b === void 0 ? void 0 : _b.webContents.send(msg);
        }
    }
    sendMessageToTitleBar(msg, param) {
        this.sendMessageToUIView(msg, param);
    }
    getUIViewCurrentRoute() {
        var _a;
        let route = (_a = this.browserWindow) === null || _a === void 0 ? void 0 : _a.webContents.getURL();
        return route !== null && route !== void 0 ? route : '';
    }
    loadRoute(route, query) {
        return new Promise(async (resolve, reject) => {
            var _a, _b, _c, _d;
            SingleViewController.Log_17296(`loadRoute(+)`);
            const currentURL = (_b = (_a = this.browserWindow) === null || _a === void 0 ? void 0 : _a.webContents) === null || _b === void 0 ? void 0 : _b.getURL();
            if (currentURL && currentURL.length > 0) {
                (_c = this.browserWindow) === null || _c === void 0 ? void 0 : _c.webContents.executeJavaScript("location.assign('#" + route + "');");
                SingleViewController.Log_17296(`loadRoute(+1)`);
                resolve();
            }
            else {
                SingleViewController.Log_17296(`loadRoute(+2)`);
                const indexHTML = url.format({
                    pathname: path.join(__dirname + '/../ui/index.html'),
                    protocol: "file",
                    slashes: true,
                    hash: route,
                    query: query || { windowId: exports.MainWindowId }
                });
                try {
                    SingleViewController.Log_17296(`loadRoute(+3)`);
                    await ((_d = this.browserWindow) === null || _d === void 0 ? void 0 : _d.webContents.loadURL(indexHTML));
                    SingleViewController.Log_17296(`loadRoute(+4)`);
                    resolve();
                }
                catch (e) {
                    SingleViewController.Log_17296(`loadRoute(+5)`);
                    reject(e);
                }
            }
        });
    }
    async showTitleBar() {
        this.sendMessageToTitleBar('restoreTitlebar', null);
    }
    async hideTitleBar() {
        this.sendMessageToTitleBar('removeTitlebar', null);
    }
}
exports.SingleViewController = SingleViewController;
//# sourceMappingURL=views.js.map