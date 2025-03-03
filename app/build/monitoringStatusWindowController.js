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
exports.MonitoringStatusWindowController = exports.JoinClassOptOutUserChoice = void 0;
const electron_1 = require("electron");
const path = __importStar(require("path"));
const url = require('url');
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
const i18next_config_1 = require("./i18n/configs/i18next.config");
const config_1 = __importDefault(require("./i18n/configs/config"));
const localeHandlerClient_1 = require("./i18n/handler/localeHandlerClient");
var JoinClassOptOutUserChoice;
(function (JoinClassOptOutUserChoice) {
    JoinClassOptOutUserChoice[JoinClassOptOutUserChoice["Reject"] = 0] = "Reject";
    JoinClassOptOutUserChoice[JoinClassOptOutUserChoice["Accept"] = 1] = "Accept";
})(JoinClassOptOutUserChoice = exports.JoinClassOptOutUserChoice || (exports.JoinClassOptOutUserChoice = {}));
class MonitoringStatusWindowController {
    constructor(eventHandler) {
        this.myWindow = null;
        this.myState = 'None';
        this.isWindowOpen = false;
        this.myEventHandler = eventHandler;
        electron_1.ipcMain.handle('getMonitoringWindowLocalizedStings', async (event, args) => {
            try {
                const lang = new localeHandlerClient_1.LocaleHandlerClient(electron_1.app).getLocale();
                let langCode = (0, lsa_clients_common_1.i18nLocaleMapper)(lang);
                if (!i18next_config_1.i18next.hasResourceBundle(langCode, config_1.default.namespace))
                    langCode = config_1.default.fallbackLng;
                const retObj = i18next_config_1.i18next.getResourceBundle(langCode, config_1.default.namespace).monitoringWindow;
                return JSON.stringify(retObj);
            }
            catch (err) {
                lsa_clients_common_1.LSAClient.getInstance().logger.logError('MonitoringStatusWindowController.getMonitoringWindowLocalizedStings: Failed: ' + err);
            }
        });
        electron_1.ipcMain.handle('RequestMonitoringWindowState', async (event, args) => {
            const retObj = {
                presentation: this.myState,
                param: eventHandler.getTeacherName()
            };
            return JSON.stringify(retObj);
        });
        electron_1.ipcMain.on('resizeMe', (event, arg) => {
            var _a;
            if (!arg) {
                throw new Error('resizeMe handler missing argument.');
            }
            const rectObj = JSON.parse(arg);
            (_a = this.myWindow) === null || _a === void 0 ? void 0 : _a.setBounds(rectObj);
        });
        electron_1.ipcMain.on('MonitoringWindowState', (event, arg) => {
            if (!arg) {
                throw new Error('MonitoringWindowState handler missing argument.');
            }
            const stateObj = JSON.parse(arg);
            const presentation = stateObj.presentation;
            this.myState = presentation;
        });
        electron_1.ipcMain.on('UserAllowsMonitoring', (event, arg) => {
            this.myEventHandler.onClassOptOut(JoinClassOptOutUserChoice.Accept);
        });
        electron_1.ipcMain.on('UserRejectsMonitoring', (event, arg) => {
            this.myEventHandler.onClassOptOut(JoinClassOptOutUserChoice.Reject);
        });
        electron_1.ipcMain.on('logMonitoringWindowMessage', (event, arg) => {
            if (!arg) {
                throw new Error('logMonitoringWindowMessage handler missing argument.');
            }
            lsa_clients_common_1.LSAClient.getInstance().logger.logInfo(arg);
        });
        try {
            eventHandler.getFullScreenEventPublishers().forEach((element) => {
                try {
                    element.addFullScreenEventSubscriber(this);
                }
                catch (e) { }
            });
        }
        catch (e) { }
    }
    onFullScreenStart() {
        var _a;
        (_a = this.myWindow) === null || _a === void 0 ? void 0 : _a.moveTop();
    }
    onFullScreenEnd() {
    }
    async displayJoinClassOptOut() {
        if (this.myState !== 'None') {
            return;
        }
        this.myState = 'UserRequest';
        return this.displayMonitoringWindow(this.myState);
    }
    async displayWeAreActiveMonitoring() {
        this.myState = 'ActiveMonitoring';
        return this.displayMonitoringWindow(this.myState);
    }
    async displayMonitoringWindow(state) {
        var _a;
        this.myWindow = new electron_1.BrowserWindow({
            width: 600,
            height: 400,
            frame: false,
            show: false,
            movable: true,
            resizable: false,
            alwaysOnTop: true,
            webPreferences: {
                preload: path.join(__dirname, '/window/monitoringStatusWindow/monitoringStatusWindow.js'),
                contextIsolation: true,
                nodeIntegration: false,
                disableBlinkFeatures: "Auxclick",
                sandbox: true
            }
        });
        this.myWindow.on('closed', () => {
            this.isWindowOpen = false;
            this.myState = 'None';
        });
        this.myWindow.once('ready-to-show', () => {
            var _a, _b;
            this.isWindowOpen = true;
            (_a = this.myWindow) === null || _a === void 0 ? void 0 : _a.setAlwaysOnTop(true, 'screen-saver', 1);
            (_b = this.myWindow) === null || _b === void 0 ? void 0 : _b.show();
        });
        (_a = this.myWindow.webContents) === null || _a === void 0 ? void 0 : _a.setWindowOpenHandler(() => {
            return { action: 'deny' };
        });
        this.myWindow.webContents.on('will-navigate', (event) => {
            event.preventDefault();
        });
        const monitoringStatusWindowUrl = url.format({
            pathname: path.join(__dirname + '/window/monitoringStatusWindow/monitoringStatusWindow.html'),
            protocol: "file",
            slashes: true
        });
        this.myWindow.loadURL(monitoringStatusWindowUrl);
    }
    closeWindow() {
        var _a;
        if (this.isWindowOpen) {
            (_a = this.myWindow) === null || _a === void 0 ? void 0 : _a.webContents.send('closeWindow');
        }
        this.myState = 'None';
    }
}
exports.MonitoringStatusWindowController = MonitoringStatusWindowController;
//# sourceMappingURL=monitoringStatusWindowController.js.map