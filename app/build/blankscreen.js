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
exports.LimitingEventHandler = void 0;
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
const webLimiting_1 = require("./webLimiting");
const electron_1 = require("electron");
const path = __importStar(require("path"));
const inputLimiting_1 = require("./inputLimiting");
const i18next_config_1 = require("./i18n/configs/i18next.config");
const config_1 = __importDefault(require("./i18n/configs/config"));
const csp_1 = require("./csp");
const appLimiter_1 = require("./appLimiter");
const url = require('url');
class LimitingEventHandler {
    constructor() {
        this.blankWindows = new Array();
        this.blockProcess = null;
        this.blanking = false;
        this.inputLimiting = new inputLimiting_1.InputLimiting();
        this.screenBlankMessage = "Screen blanked by: {className}";
        this.urlForCSP = '';
        this.blankScreenEventSubscribers = new Array();
        const lsaClient = lsa_clients_common_1.LSAClient.getInstance();
        this.logger = lsaClient.logger;
        i18next_config_1.i18next.on('languageChanged', (lang) => {
            var _a;
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.logInfo('Blank screen - languageChanged ' + lang);
            let langCode = (0, lsa_clients_common_1.i18nLocaleMapper)(lang);
            if (!i18next_config_1.i18next.hasResourceBundle(langCode, config_1.default.namespace))
                langCode = config_1.default.fallbackLng;
            const translations = i18next_config_1.i18next.getResourceBundle(langCode, config_1.default.namespace);
            this.screenBlankMessage = translations.blankScreen.screenBlankedBy;
            this.logger.logInfo("blank >>>>>>>> translations" + translations);
        });
    }
    addFullScreenEventSubscriber(subscriber) {
        this.blankScreenEventSubscribers.push(subscriber);
    }
    static getInstance() {
        if (!LimitingEventHandler.instance) {
            LimitingEventHandler.instance = new LimitingEventHandler();
        }
        return LimitingEventHandler.instance;
    }
    getBackgroundImageRetriever() {
        return this;
    }
    async retrieveBackgroundImage() {
        return Promise.resolve(new ArrayBuffer(0));
    }
    blankingQueryFromParams(params) {
        var object = {};
        try {
            if (params.screenMessage) {
                object.msg = encodeURIComponent(params.screenMessage);
            }
            if (params.backgroundUrl) {
                object.url = encodeURIComponent(params.backgroundUrl);
            }
            if (params.className) {
                let tmpMessage = this.screenBlankMessage.replace("{className}", params.className);
                object.by = encodeURIComponent(tmpMessage);
            }
        }
        catch (err) {
            this.logger.logError("blankingQueryFromParams exception: " + err);
        }
        return object;
    }
    isValidURL(url) {
        const testThis = new URL(url);
        return (testThis.protocol.match(/https?:/) &&
            testThis.hostname.length > 0);
    }
    createBlankingWindows(params) {
        var _a;
        if (params.backgroundUrl.length > 0 && this.isValidURL(params.backgroundUrl)) {
            try {
                csp_1.CSPGenerator.getInstance().addImageSrc(params.backgroundUrl);
                this.urlForCSP = params.backgroundUrl;
            }
            catch (err) {
                this.logger.logError(err);
            }
        }
        let queryStr = this.blankingQueryFromParams(params);
        const blankHTML = url.format({
            pathname: path.join(__dirname + '/blankscreen.html'),
            protocol: "file",
            slashes: true,
            query: queryStr
        });
        const secondaryHTML = url.format({
            pathname: path.join(__dirname + '/blankSecondaryScreen.html'),
            protocol: "file",
            slashes: true
        });
        if (this.blankWindows.length === 0) {
            const screens = electron_1.screen.getAllDisplays();
            for (let i = 0; i < screens.length; i++) {
                let window = new electron_1.BrowserWindow({
                    show: false,
                    enableLargerThanScreen: true,
                    frame: false,
                    closable: false,
                    backgroundColor: '#000000',
                    focusable: false,
                    resizable: false,
                    webPreferences: {
                        sandbox: true,
                        disableBlinkFeatures: "Auxclick",
                        nodeIntegration: false,
                        contextIsolation: true,
                        disableDialogs: true,
                        spellcheck: false
                    }
                });
                (_a = window.webContents) === null || _a === void 0 ? void 0 : _a.setWindowOpenHandler(() => {
                    return { action: 'deny' };
                });
                window === null || window === void 0 ? void 0 : window.webContents.on('will-navigate', (event) => {
                    event.preventDefault();
                });
                window.webContents.on('did-finish-load', () => {
                    this.blankScreenEventSubscribers.forEach((subscriber) => {
                        try {
                            subscriber.onFullScreenStart();
                        }
                        catch (e) {
                            this.logger.logError('on did-finish-load onFullScreenStart exception' + e);
                        }
                    });
                });
                this.blankWindows.push(window);
                let s = screens[i];
                window.on('closed', () => {
                    this.blanking = false;
                    this.blankScreenEventSubscribers.forEach((subscriber) => {
                        try {
                            subscriber.onFullScreenEnd();
                        }
                        catch (e) {
                            this.logger.logError('on closed onFullScreenEnd exception' + e);
                        }
                    });
                });
                window.once('ready-to-show', () => {
                    this.blanking = true;
                    window === null || window === void 0 ? void 0 : window.setSize(s.size.width, s.size.height);
                    window === null || window === void 0 ? void 0 : window.setPosition(s.bounds.x, s.bounds.y);
                    if (process.platform === 'darwin') {
                        window === null || window === void 0 ? void 0 : window.setAlwaysOnTop(true, 'status', 0);
                    }
                    else {
                        window === null || window === void 0 ? void 0 : window.setAlwaysOnTop(true, 'screen-saver', 0);
                    }
                    window.show();
                });
                let urlToUse = blankHTML;
                let main = electron_1.screen.getPrimaryDisplay();
                if (main.id !== s.id) {
                    urlToUse = secondaryHTML;
                }
                window.loadURL(urlToUse)
                    .then(() => {
                    this.logger.logInfo('loaded ' + urlToUse);
                })
                    .catch((e) => {
                    this.logger.logError('loadURL exception: ' + e);
                });
            }
        }
        electron_1.session
            .fromPartition('lsa-client-app')
            .setPermissionRequestHandler((webContents, permission, callback) => {
            return callback(false);
        });
    }
    destroyBlankingWindows() {
        for (let window of this.blankWindows) {
            window === null || window === void 0 ? void 0 : window.destroy();
        }
        this.blankWindows = [];
        if (this.urlForCSP.length > 0) {
            try {
                csp_1.CSPGenerator.getInstance().removeImageSrc(this.urlForCSP);
                this.urlForCSP = '';
            }
            catch (err) {
                this.logger.logError('destroyBlankingWindows exception ' + err);
            }
        }
    }
    startBlockInput(block) {
        this.inputLimiting = new inputLimiting_1.InputLimiting();
        this.inputLimiting.setShouldBlockInput(block);
        this.inputLimiting.startBlockInput();
    }
    stopBlockInput() {
        var _a;
        (_a = this.inputLimiting) === null || _a === void 0 ? void 0 : _a.stopBlockInput();
    }
    showBlankScreen(params) {
        if (this.blanking === false) {
            this.createBlankingWindows(params);
            this.startBlockInput(params.shouldBlockInput);
        }
        return Promise.resolve();
    }
    hideBlankScreen() {
        if (this.blanking === true) {
            this.stopBlockInput();
            this.destroyBlankingWindows();
            this.logger.logInfo('UN-blank screen here');
        }
        return Promise.resolve();
    }
    webLimitStart(params) {
        return webLimiting_1.WebLimiter.getInstance().start(params);
    }
    webLimitStop() {
        webLimiting_1.WebLimiter.getInstance().stop();
        return Promise.resolve();
    }
    appLimitStart(params) {
        let limiter = appLimiter_1.AppLimiter.getInstance();
        limiter.stop();
        limiter.setPolicy(params);
        limiter.start();
        this.logger.logInfo('appLimitStart() called with ' + JSON.stringify(params));
        return Promise.resolve();
    }
    appLimitStop() {
        this.logger.logInfo('appLimitStop() called!');
        appLimiter_1.AppLimiter.getInstance().stop();
        return Promise.resolve();
    }
}
exports.LimitingEventHandler = LimitingEventHandler;
//# sourceMappingURL=blankscreen.js.map