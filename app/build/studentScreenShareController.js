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
exports.StudentScreenShareController = void 0;
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
const config_1 = __importDefault(require("./i18n/configs/config"));
const electron_1 = require("electron");
const i18next_1 = __importDefault(require("i18next"));
const localeHandlerClient_1 = require("./i18n/handler/localeHandlerClient");
const dialogWindow_1 = require("./window/dialogWindow");
const path = __importStar(require("path"));
const url = __importStar(require("url"));
class StudentScreenShareController {
    constructor(win) {
        this.win = win;
        this.shareRequestWindow = null;
        this.windowType = 'None';
        electron_1.ipcMain.handle('ShareWindowType', (event, arg) => {
            return this.windowType;
        });
        electron_1.ipcMain.handle('getShareRequestPromptLocalizedStings', (event, args) => {
            lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('StudentScreenShareController.getShareRequestPromptLocalizedStings(+)');
            try {
                const lang = new localeHandlerClient_1.LocaleHandlerClient(electron_1.app).getLocale();
                const langCode = (0, lsa_clients_common_1.i18nLocaleMapper)(lang);
                const retObj = i18next_1.default.getResourceBundle(langCode, config_1.default.namespace).shareRequestWindow;
                return JSON.stringify(retObj);
            }
            catch (err) {
                lsa_clients_common_1.LSAClient.getInstance().logger.logError('StudentScreenShareController.getShareRequestPromptLocalizedStings: Failed: ' + err);
            }
        });
        electron_1.ipcMain.on('logShareRequestPromptMessage', (event, arg) => {
            if (!arg) {
                throw new Error('StudentScreenShareController.logShareRequestPromptMessage: missing arg');
            }
            lsa_clients_common_1.LSAClient.getInstance().logger.logInfo(arg);
        });
        electron_1.ipcMain.on('AcceptStudentScreenShare', () => {
            this.acceptStudentScreenShare();
        });
        electron_1.ipcMain.handle('FromUI_ShareStudentScreenResponse', (event, arg) => {
            var _a;
            lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('StudentScreenShareController.FromUI_ShareStudentScreenResponse(+)');
            lsa_clients_common_1.LSAClient.getInstance().studentScreenShare.postShareStudentScreenResponse(arg.data);
            if ((_a = arg === null || arg === void 0 ? void 0 : arg.data) === null || _a === void 0 ? void 0 : _a.accepted) {
                this.windowType = 'active-sharing';
                this.displayShareRequestWindow();
            }
        });
        electron_1.ipcMain.on('RejectStudentScreenShare', () => {
            this.rejectStudentScreenShare();
        });
        electron_1.ipcMain.on('StopStudentScreenBroadcast', () => {
            lsa_clients_common_1.LSAClient.getInstance().logger.logMessage('StudentScreenShareController.onStopStudentScreenBroadcast(+)');
            this.win.sendToUI('UI_StopStudentScreenBroadcast', {});
        });
        electron_1.ipcMain.handle('FromUI_StopStudentScreenBroadcast', (event, arg) => {
            var _a, _b;
            lsa_clients_common_1.LSAClient.getInstance().logger.logMessage('StudentScreenShareController.FromUI_StopStudentScreenBroadcast(+)');
            if (!((_a = arg.data) === null || _a === void 0 ? void 0 : _a.byTeacher)) {
                (_b = lsa_clients_common_1.LSAClient.getInstance().studentScreenShare) === null || _b === void 0 ? void 0 : _b.postStopStudentScreenBroadcast();
            }
            lsa_clients_common_1.LSAClient.getInstance().studentScreenShare.onStopStudentScreenShare();
            this.closeWindow();
        });
    }
    displayShareRequestWindow() {
        lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('StudentScreenShareController.displayShareRequestWindow(+)');
        let options = {};
        switch (this.windowType) {
            case 'share-request-prompt':
                options = {
                    width: 600,
                    height: 200,
                    position: {
                        vertical: 'top',
                        horizontal: 'center'
                    }
                };
                break;
            case 'active-sharing':
                options = {
                    width: 450,
                    height: 50,
                    position: {
                        vertical: 'bottom',
                        horizontal: 'center'
                    }
                };
                break;
        }
        const windowOptions = Object.assign(Object.assign({}, options), { frame: false, show: false, movable: true, resizable: false, alwaysOnTop: true, webPreferences: {
                preload: path.join(__dirname, '/window/shareRequestPrompt/shareRequestPrompt.js'),
                contextIsolation: true,
                nodeIntegration: false,
                disableBlinkFeatures: "Auxclick",
                sandbox: true
            } });
        const shareRequestWindowUrl = url.format({
            pathname: path.join(__dirname + '/window/shareRequestPrompt/shareRequestPrompt.html'),
            protocol: "file",
            slashes: true
        });
        const otherOptions = {
            finalUrl: shareRequestWindowUrl,
            preventNavigate: true
        };
        this.shareRequestWindow = new dialogWindow_1.DialogWindow(windowOptions, otherOptions);
        this.shareRequestWindow.loadWindow();
        this.shareRequestWindow.onWindowLoad(() => {
            var _a, _b;
            (_a = this.shareRequestWindow) === null || _a === void 0 ? void 0 : _a.makeModal(true, 'screen-saver', 1);
            (_b = this.shareRequestWindow) === null || _b === void 0 ? void 0 : _b.show();
        });
    }
    acceptStudentScreenShare() {
        lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('StudentScreenShareController.acceptStudentScreenShare(+)');
        const primaryDisplayId = electron_1.screen.getPrimaryDisplay().id.toString();
        lsa_clients_common_1.LSAClient.getInstance().logger.logMessage('StudentScreenShareController.acceptStudentScreenShare: Primary display Id: ' + primaryDisplayId);
        electron_1.desktopCapturer.getSources({ types: ['screen'] }).then((sources) => {
            lsa_clients_common_1.LSAClient.getInstance().logger.logMessage('StudentScreenShareController.acceptStudentScreenShare: List of screen sources: ' + JSON.stringify(sources));
            for (const source of sources) {
                if (primaryDisplayId === source.display_id) {
                    lsa_clients_common_1.LSAClient.getInstance().logger.logMessage('StudentScreenShareController.acceptStudentScreenShare: screen share sourceId: ' + source.id);
                    this.win.sendToUI('UI_SetFullScreenSourceId', source.id);
                    lsa_clients_common_1.LSAClient.getInstance().studentScreenShare.onAcceptStudentScreenShare();
                    break;
                }
            }
        }).catch((err) => {
            lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('StudentScreenShareController.acceptStudentScreenShare: desktopCapturer.getSources: ' + err);
        });
    }
    rejectStudentScreenShare() {
        lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('StudentScreenShareController.rejectStudentScreenShare(+)');
        const shareStudentScreenData = { accepted: false };
        lsa_clients_common_1.LSAClient.getInstance().studentScreenShare.postShareStudentScreenResponse(shareStudentScreenData);
    }
    requestStudentScreenShare() {
        lsa_clients_common_1.LSAClient.getInstance().logger.logMessage('StudentScreenShareController.requestStudentScreenShare(+)');
        this.windowType = 'share-request-prompt';
        this.displayShareRequestWindow();
    }
    cancelStudentScreenShareRequest() {
        lsa_clients_common_1.LSAClient.getInstance().logger.logMessage('StudentScreenShareController.cancelStudentScreenShareRequest(+): ');
        this.closeWindow();
    }
    endStudentScreenViewBroadcast() {
        lsa_clients_common_1.LSAClient.getInstance().logger.logMessage('StudentScreenShareController.endStudentScreenViewBroadcast(+)');
        this.win.sendToUI('UI_EndStudentScreenViewBroadcast', {});
    }
    closeWindow() {
        var _a, _b;
        lsa_clients_common_1.LSAClient.getInstance().logger.logMessage('StudentScreenShareController.closeWindow(+)');
        (_b = (_a = this.shareRequestWindow) === null || _a === void 0 ? void 0 : _a.w) === null || _b === void 0 ? void 0 : _b.close();
    }
}
exports.StudentScreenShareController = StudentScreenShareController;
//# sourceMappingURL=studentScreenShareController.js.map