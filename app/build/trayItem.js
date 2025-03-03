"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrayItemController = exports.ModuleVersion = void 0;
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
const mainWindow_1 = require("./window/mainWindow");
const clientutils_1 = require("./clientutils");
const electron_1 = require("electron");
const webcrypto_1 = require("@peculiar/webcrypto");
const fs = require("fs");
const i18next_config_1 = require("./i18n/configs/i18next.config");
const config_1 = __importDefault(require("./i18n/configs/config"));
const localeHandlerClient_1 = require("./i18n/handler/localeHandlerClient");
const saveLogs_1 = require("./window/saveLogs");
const path = require('path');
const url = require('url');
class ModuleVersion {
    constructor() {
        this.module = "";
        this.version = "";
        this.displayName = "";
    }
}
exports.ModuleVersion = ModuleVersion;
class TrayItemController {
    static getInstance() {
        if (!TrayItemController.instance) {
            TrayItemController.instance = new TrayItemController();
        }
        return TrayItemController.instance;
    }
    constructor() {
        this.aboutWindow = null;
        this.onLanguageChanged = (lang) => {
            var _a;
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.logInfo('Tray Item - languageChanged ' + lang);
            const langCode = (0, lsa_clients_common_1.i18nLocaleMapper)(lang);
            this.sendTranslationByLang(langCode);
        };
        this.onGetTranslations = (event, lang) => {
            var _a;
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.logInfo('TrayItem.onGetTranslations : ' + lang);
            let userLang = 'en';
            if (lang) {
                userLang = lang;
            }
            else {
                const localeHandler = new localeHandlerClient_1.LocaleHandlerClient(electron_1.app);
                userLang = localeHandler.getLocale();
            }
            const langCode = (0, lsa_clients_common_1.i18nLocaleMapper)(userLang);
            this.sendTranslationByLang(langCode);
        };
        this.sendTranslationByLang = (langCode) => {
            if (!i18next_config_1.i18next.hasResourceBundle(langCode, config_1.default.namespace))
                langCode = config_1.default.fallbackLng;
            const translations = i18next_config_1.i18next.getResourceBundle(langCode, config_1.default.namespace);
            this.sendMessageToUIView('UI_TranslationsReceived', translations.aboutDialogue);
        };
        this.tray = null;
        this.logger = lsa_clients_common_1.LSAClient.getInstance().logger;
        i18next_config_1.i18next === null || i18next_config_1.i18next === void 0 ? void 0 : i18next_config_1.i18next.on('languageChanged', this.onLanguageChanged);
        electron_1.ipcMain === null || electron_1.ipcMain === void 0 ? void 0 : electron_1.ipcMain.handle('FromUI_GetTranslations', this.onGetTranslations);
    }
    setStorage(storage) {
        this._storage = storage;
    }
    sendMessageToUIView(msg, param) {
        var _a, _b;
        if (param) {
            (_a = this.aboutWindow) === null || _a === void 0 ? void 0 : _a.webContents.send(msg, param);
        }
        else {
            (_b = this.aboutWindow) === null || _b === void 0 ? void 0 : _b.webContents.send(msg);
        }
    }
    onJoinClass(data) { }
    onLeaveClass(data) { }
    onOrgVerification(isVerified) { }
    setClassroomEventHandler(classroomEventHandler) {
        this._classroomEventHandler = classroomEventHandler;
        this._classroomEventHandler.addSubscriber(this);
    }
    create() {
        this.tray = new electron_1.Tray(path.join(__dirname, '/icons/AppIcon.png'));
        return this.tray;
    }
    showMainWindow() {
        mainWindow_1.MainWindowController.getInstance().show();
    }
    showStatusWindow() {
        mainWindow_1.MainWindowController.getInstance().showConnectivityStatusWindow();
    }
    downloadLogs() {
        saveLogs_1.SaveLogs.getInstance(lsa_clients_common_1.LSAClient.getInstance().logExporter).saveLog();
    }
    aboutQueryFromObject(modules) {
        var _a;
        var query = "module=";
        try {
            for (let i = 0; i < modules.length; i++) {
                let mod = modules[i];
                if (i != 0) {
                    query += "&module=";
                }
                let entry = mod.module + "," + mod.version;
                query += entry;
            }
        }
        catch (err) {
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.logError('aboutQueryFromObject exception: ' + err);
        }
        return query;
    }
    createAboutWindow(modules) {
        var _a, _b, _c, _d, _e, _f;
        if (this.aboutWindow === null) {
            this.aboutWindow = new electron_1.BrowserWindow({
                width: 500,
                height: 324,
                show: false,
                frame: true,
                closable: true,
                movable: true,
                resizable: false,
                maximizable: false,
                center: true,
                title: 'About LanSchool Air',
                webPreferences: {
                    sandbox: true,
                    disableBlinkFeatures: 'Auxclick',
                    nodeIntegration: false,
                    contextIsolation: true,
                    disableDialogs: true,
                    spellcheck: false,
                    preload: path.join(__dirname, '/window/about/about-preload.js')
                }
            });
            this.aboutWindow.setMenu(null);
        }
        else {
            this.aboutWindow.show();
        }
        let queryStr = this.aboutQueryFromObject(modules);
        const aboutHTML = url.format({
            pathname: path.join(__dirname + '/window/about/about.html'),
            protocol: "file",
            slashes: true,
            search: queryStr
        });
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.logInfo('about url: ' + aboutHTML);
        (_b = this.aboutWindow) === null || _b === void 0 ? void 0 : _b.once('ready-to-show', () => {
            var _a;
            (_a = this.aboutWindow) === null || _a === void 0 ? void 0 : _a.show();
        });
        (_c = this.aboutWindow) === null || _c === void 0 ? void 0 : _c.on('close', () => {
            this.aboutWindow = null;
        });
        (_e = (_d = this.aboutWindow) === null || _d === void 0 ? void 0 : _d.webContents) === null || _e === void 0 ? void 0 : _e.setWindowOpenHandler(() => {
            return { action: 'deny' };
        });
        this.aboutWindow.loadURL(aboutHTML)
            .then(() => {
            var _a;
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.logInfo('about.html is loaded');
        })
            .catch((e) => {
            var _a;
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.logError('About window loadURL exception: ' + e);
        });
        (_f = this.aboutWindow) === null || _f === void 0 ? void 0 : _f.webContents.on('will-navigate', async (event, newURL) => {
            var _a;
            let urlToLaunch = "";
            event.preventDefault();
            if (newURL === "https://lenovosoftware.com/legal/lanschool") {
                urlToLaunch = newURL;
                if (urlToLaunch.length > 0) {
                    electron_1.shell.openExternal(urlToLaunch);
                }
            }
            else if (newURL === "file://3rdparty.txt/") {
                try {
                    let filePath = clientutils_1.ClientUtils.productFolder() + '/Notice.txt';
                    await this.openNoticeFileIfHashCorrect(filePath);
                }
                catch (err) {
                    (_a = this.logger) === null || _a === void 0 ? void 0 : _a.logInfo('tried to open Notice.txt: ' + err);
                }
            }
        });
    }
    async showAboutBox() {
        let strVersions = "";
        if (process.platform === 'darwin') {
            strVersions = fs.readFileSync('/Library/Application\ Support/LenovoSoftware/LanSchoolAir/About.json', 'utf8');
        }
        else if (process.platform === 'win32') {
            strVersions = fs.readFileSync('C:/Program Files (x86)/LenovoSoftware/LanSchoolAir/About.json', 'utf8');
        }
        if (strVersions.length) {
            let env = new ModuleVersion();
            env.module = "Environment";
            env.version = this._storage.environment();
            let org = new ModuleVersion();
            org.module = "OrganizationId";
            org.version = this._storage.orgId();
            let modVers = JSON.parse(strVersions);
            if (org.version.length > 0) {
                modVers.unshift(org);
            }
            if (env.version.length > 0) {
                modVers.unshift(env);
            }
            this.createAboutWindow(modVers);
        }
    }
    toHexString(buffer) {
        var byteArray = new Uint8Array(buffer);
        return Array.from(byteArray, function (byte) {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('');
    }
    async getFileHash(hashType, file) {
        var _a, _b;
        var hashStr = '';
        try {
            if (fs.existsSync(file)) {
                const data = fs.readFileSync(file);
                let crypto = new webcrypto_1.Crypto();
                const hash = await crypto.subtle.digest(hashType, data);
                hashStr = this.toHexString(hash);
            }
            else {
                (_a = this.logger) === null || _a === void 0 ? void 0 : _a.logInfo('getFileHash file does not exist: ' + file);
                return Promise.reject('');
            }
        }
        catch (err) {
            (_b = this.logger) === null || _b === void 0 ? void 0 : _b.logInfo('exception in getFileHash: ' + err);
            return Promise.reject('');
        }
        return Promise.resolve(hashStr);
    }
    macNoticeFileHash() {
        return '37046cc31c48460016401e27975f42b9396e5054e4131bbb7793a2f1fb6b52b6';
    }
    windowsNoticeFileHash() {
        return 'ecbe6220074b9bd09fea06938d64c9c11a4147673885b326cc78381b41d7a9f1';
    }
    async openNoticeFileIfHashCorrect(file) {
        var _a, _b, _c, _d;
        try {
            let hashStr = await this.getFileHash('SHA-256', file);
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.logInfo('hash of Notice.txt is ' + hashStr);
            if ((process.platform == 'darwin' && hashStr == this.macNoticeFileHash()) ||
                (process.platform == 'win32' && hashStr == this.windowsNoticeFileHash())) {
                (_b = this.logger) === null || _b === void 0 ? void 0 : _b.logInfo('This is the correct Notice.txt file.');
                electron_1.shell.openExternal('file://' + file);
            }
            else {
                (_c = this.logger) === null || _c === void 0 ? void 0 : _c.logInfo('Hash of Notice.txt was incorrect: ' + hashStr);
            }
        }
        catch (err) {
            (_d = this.logger) === null || _d === void 0 ? void 0 : _d.logInfo('exception verifying Notice.txt file: ' + err);
        }
    }
}
exports.TrayItemController = TrayItemController;
//# sourceMappingURL=trayItem.js.map