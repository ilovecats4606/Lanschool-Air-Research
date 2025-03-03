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
exports.HeartbeatNotificationRecipient = void 0;
const electron_1 = require("electron");
const mainWindow_1 = require("./window/mainWindow");
const windowPingHeartbeat_1 = require("./window/windowPingHeartbeat");
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
const registrationHandler_1 = require("./registrationHandler");
const logger_1 = require("./logger");
const storage_1 = require("./storage/storage");
const EventHandlers = __importStar(require("./eventHandlers"));
const thumbnailCapture_1 = require("./thumbnailCapture");
const nativeMessaging_1 = require("./nativeMessaging");
const webhistory_1 = require("./webhistory");
const conferenceController_1 = require("./conferencing/conferenceController");
const blankscreen_1 = require("./blankscreen");
const trayItem_1 = require("./trayItem");
const nativeClient_1 = require("./native/nativeClient");
const autoUpdate_1 = require("./autoUpdate");
const unverifiedOrgOption_1 = require("./unverifiedOrgOption");
const studentScreenShareController_1 = require("./studentScreenShareController");
const statusLight_1 = require("./statusLight");
const fusManager_1 = require("./fusManager");
const clientProtector_1 = require("./clientProtector");
const i18next_config_1 = require("./i18n/configs/i18next.config");
const config_1 = __importDefault(require("./i18n/configs/config"));
const menu_builder_1 = require("./i18n/system-tray/menu.builder");
const localeHandlerClient_1 = require("./i18n/handler/localeHandlerClient");
const batteryInstrumentation_1 = require("./batteryInstrumentation");
const csp_1 = require("./csp");
const electronInterfaceImpl_1 = require("./electronInterfaceImpl");
const shellExecutor_1 = require("./shellExecutor");
const RunningAppsImplementation_1 = require("./RunningAppsImplementation");
const knownClientStatus_1 = require("./knownClientStatus");
const pkcsUtils_1 = require("./pkcsUtils");
const routableWindow_1 = require("./window/routableWindow");
const views_1 = require("./window/views");
const CloseAppImplementation_1 = require("./CloseAppImplementation");
const appLimiter_1 = require("./appLimiter");
const webExtensionCommands_1 = require("./webExtensionCommands");
const logFileWriter_1 = require("./logFileWriter");
const webLimiting_1 = require("./webLimiting");
const SafariMonitor_1 = require("./Mac/SafariMonitor");
const otmTabInstrumentation_1 = require("./otmTabInstrumentation");
const meetingController_1 = require("./meetings/meetingController");
async function logAndBailOut(message, logger, logFileWriter, restart) {
    restart = restart !== null && restart !== void 0 ? restart : true;
    if (logger)
        logger.logMessage(message);
    if (process.platform !== 'win32')
        return;
    if (logFileWriter)
        await logFileWriter.writeLog();
    if (restart === true)
        electron_1.app.relaunch();
    electron_1.app.exit();
}
class HeartbeatNotificationRecipient {
    constructor(mainWindowController, ipcMain, logger, logFileWriter) {
        this.mainWindowController = mainWindowController;
        this.ipcMain = ipcMain;
        this.logger = logger;
        this.logFileWriter = logFileWriter;
        this.windowPingHeartbeat = new windowPingHeartbeat_1.WindowPingHeartbeat(mainWindowController, this, ipcMain);
    }
    async onHeartbeatResponse() {
        this.logger.logDebug('Received window ping');
    }
    async onHeartbeatExpired() {
        await logAndBailOut('Window heartbeat expired!', this.logger, this.logFileWriter, false);
    }
    startHeartbeats() {
        this.windowPingHeartbeat.start();
    }
}
exports.HeartbeatNotificationRecipient = HeartbeatNotificationRecipient;
async function asyncCallWithTimeout(asyncPromise, timeLimit) {
    let timeoutHandle;
    const timeoutPromise = new Promise((_resolve, reject) => {
        timeoutHandle = setTimeout(() => reject(new Error('MainWindowController creation timeout')), timeLimit);
    });
    return Promise.race([asyncPromise, timeoutPromise]).then(result => {
        clearTimeout(timeoutHandle);
        return result;
    });
}
async function instantiateMainWindowController() {
    const mainWindow = mainWindow_1.MainWindowController.getInstance();
    await mainWindow.init();
    return mainWindow;
}
const lsaClient = lsa_clients_common_1.LSAClient.getInstance();
let fusManager = null;
let autoUpdate = null;
let trayInstance;
electron_1.app.commandLine.appendSwitch('disable-renderer-backgrounding');
const singleInstanceLock = electron_1.app.requestSingleInstanceLock();
if (!singleInstanceLock) {
    electron_1.app.exit();
}
else {
}
electron_1.app === null || electron_1.app === void 0 ? void 0 : electron_1.app.whenReady().then(async () => {
    var _a;
    if (process.platform === 'darwin') {
        if (process.argv.length >= 2) {
            let command = process.argv[1];
            if (command === '/install') {
                electron_1.app.exit(0);
                return;
            }
            else if (command === '/version') {
                lsaClient.logger.logInfo(electron_1.app.getVersion());
                electron_1.app.exit(0);
                return;
            }
        }
    }
    const nativeClient = nativeClient_1.NativeClient.getInstance();
    const localeHandler = new localeHandlerClient_1.LocaleHandlerClient(electron_1.app);
    const myStorage = new storage_1.Storage(nativeClient);
    lsaClient.logger = new logger_1.logger(myStorage, lsaClient.logExporter, []);
    const hookStd = require('hook-std');
    hookStd.stderr((output) => {
        lsaClient.logger.logMessage(output);
    });
    try {
        lsaClient.logger.logDebug(`Electron: Initializing IStorage implementation...`);
        await myStorage.init();
        lsaClient.logger.logDebug(`Electron: IStorage initialization complete.`);
    }
    catch (e) {
        lsaClient.logger.logError('Electron: LSAirClient is unable to initialize' + e);
        electron_1.app.exit(1);
        return;
    }
    lsaClient.logger.logDebug(`Electron: Initializing lsaClient...`);
    await lsaClient.init(myStorage, localeHandler);
    lsaClient.logger.logDebug(`Electron: initialization complete.`);
    const provisioningCode = await myStorage.loadProvisioningCode();
    lsaClient.logger.logDebug(`provisioningCode: ${provisioningCode}`);
    const hotProvisioningCode = await myStorage.loadHotProvisioningCode();
    lsaClient.logger.logDebug(`hotProvisioningCode: ${hotProvisioningCode}`);
    lsaClient.logger.logDebug(`Electron: Gathering private key...`);
    const privateKeyString = await myStorage.loadPrivateKey();
    if (privateKeyString) {
        if (typeof privateKeyString === 'object')
            lsaClient.logger.logDebug(`Electron: Private key gathered (object).`);
        else if (typeof privateKeyString === 'string')
            lsaClient.logger.logDebug(`Electron: Private key gathered (string length ${privateKeyString.length}).`);
        else
            lsaClient.logger.logDebug(`Electron: Private key gathered but unknown type.`);
    }
    else
        lsaClient.logger.logDebug(`Electron: Private key gathering returned undefined or empty string.`);
    if (privateKeyString && typeof privateKeyString === 'string' && privateKeyString.startsWith('-----BEGIN RSA PRIVATE KEY')) {
        try {
            var pkcs8 = pkcsUtils_1.PKCSUtils.pkcs1ToPkcs8(privateKeyString);
            var jwkString = await new lsa_clients_common_1.CryptoUtil().pkcs8ToJWKString(pkcs8);
            myStorage.savePrivateKey(JSON.parse(jwkString));
            lsaClient.logger.logInfo('Success! Got private JWK.');
        }
        catch (e) {
            lsaClient.logger.logError('pkcs8ToJWKString converstion exception: ' + e);
            console.error(e);
        }
    }
    if (!i18next_config_1.i18next.isInitialized) {
        try {
            lsaClient.logger.logDebug(`Electron: Initializing i18next...`);
            await i18next_config_1.i18next.init(i18next_config_1.i18nextOptions);
            lsaClient.logger.logInfo('Electron: i18next is Initialized');
        }
        catch (err) {
            lsaClient.logger.logError('Electron: i18next failed to initialize: ' + err);
        }
    }
    lsaClient.logger.logDebug(`Electron: Initializing trayMenuBuilder...`);
    const trayItem = trayItem_1.TrayItemController.getInstance();
    trayItem.setStorage(myStorage);
    trayInstance = trayItem.create();
    const trayMenuBuilder = menu_builder_1.TrayMenuBuilder.getInstance(trayInstance);
    trayMenuBuilder.buildTrayMenu();
    lsaClient.logger.logDebug(`Electron: trayMenuBuilder complete.`);
    const errorLogWriter = new logFileWriter_1.LogFileWriter(lsaClient.logExporter, { fileDir: electron_1.app.getPath('temp') });
    try {
        lsaClient.logger.logDebug(`Electron: Updating CSP headers...`);
        csp_1.CSPGenerator.getInstance().updateHeaders();
        lsaClient.logger.logDebug(`Electron: CSP headers updated.`);
    }
    catch (err) {
        lsaClient.logger.logError(err);
    }
    lsaClient.logger.logDebug(`Electron: Instantiating ShellExecutor...`);
    const shellExecutor = new shellExecutor_1.ShellExecutor(new electronInterfaceImpl_1.ElectronShell());
    lsaClient.logger.logDebug(`Electron: ShellExecutor instantiated.`);
    let mainWindow;
    try {
        lsaClient.logger.logDebug(`Electron: starting main window creation...`);
        mainWindow = await asyncCallWithTimeout(instantiateMainWindowController(), 55000);
        lsaClient.logger.logDebug(`Electron: window creation succeeded`);
    }
    catch (e) {
        if (e === null || e === void 0 ? void 0 : e.message.includes('MainWindowController creation timeout'))
            await logAndBailOut('Window instantiation timeout!', lsaClient.logger, errorLogWriter, false);
        else
            await logAndBailOut('Error instantiating window!', lsaClient.logger, errorLogWriter, false);
        return;
    }
    const heartbeatRecipient = new HeartbeatNotificationRecipient(mainWindow, electron_1.ipcMain, lsaClient.logger, errorLogWriter);
    heartbeatRecipient.startHeartbeats();
    mainWindow.shellExecutor = shellExecutor;
    i18next_config_1.i18next.on('languageChanged', (lang) => {
        lsaClient.logger.logInfo('i18n languageChanged:' + lang);
        mainWindow.sendToUI("UI_LanguageChanged", lang);
        notifyTitleBar(mainWindow, lang);
        trayMenuBuilder.buildTrayMenu();
    });
    const locale = electron_1.app.getLocale();
    (_a = mainWindow.webContents) === null || _a === void 0 ? void 0 : _a.on('did-finish-load', () => {
        notifyTitleBar(mainWindow, locale);
    });
    lsaClient.logger.logInfo('App is ready');
    fusManager = new fusManager_1.FUSManager();
    fusManager.init();
    let isForegroundLogin = await fusManager.isForegroundLogin();
    if (!isForegroundLogin) {
        lsaClient.logger.logInfo('background login, nothing to do.');
        return;
    }
    lsaClient.logger.logInfo('Foreground login, creating windows...');
    const electronIpcMain = new electronInterfaceImpl_1.ElectronIpcMain();
    const classroomEventHandler = new EventHandlers.ClassroomEventHandler(mainWindow, myStorage, shellExecutor, electronIpcMain);
    const conferenceController = new conferenceController_1.ConferenceController(mainWindow, classroomEventHandler);
    const meetingController = new meetingController_1.MeetingController(mainWindow, classroomEventHandler);
    lsaClient.eventSubscribers.genericEventHandler =
        new EventHandlers.AnyEventHandler();
    lsaClient.eventSubscribers.classroomEventHandler =
        classroomEventHandler;
    lsaClient.telemetryInstrumentation.screenCapture =
        new thumbnailCapture_1.ThumbnailCapture();
    lsaClient.telemetryInstrumentation.browserInstrumentation = webhistory_1.WebHistory.getInstance();
    webhistory_1.WebHistory.getInstance().setClassroomEventHandler(classroomEventHandler);
    lsaClient.telemetryInstrumentation.batteryInstrumentation =
        new batteryInstrumentation_1.BatteryInstrumentation();
    lsaClient.conferenceDirectiveHandler =
        conferenceController.conferenceDirectiveHandler;
    lsaClient.meetingDirectiveHandler =
        meetingController.meetingDirectiveHandler;
    lsaClient.otmBrowserInstrumentation = otmTabInstrumentation_1.OtmTabsInstrumentation.getInstance();
    const lev = blankscreen_1.LimitingEventHandler.getInstance();
    lsaClient.clientLimiting = lev;
    lsaClient.telemetryInstrumentation.runningAppInstrumentation = new RunningAppsImplementation_1.RunningAppsImplementation();
    trayItem.setClassroomEventHandler(classroomEventHandler);
    let safariMonitor;
    if (process.platform === 'darwin') {
        safariMonitor = new SafariMonitor_1.SafariMonitor(classroomEventHandler);
    }
    lsaClient.unverifiedOrgOption = new unverifiedOrgOption_1.UnverifiedOrgOption([lev, mainWindow]);
    lsaClient.studentScreenShareController = new studentScreenShareController_1.StudentScreenShareController(mainWindow);
    lsaClient.statusLight = new statusLight_1.StatusLight(mainWindow);
    lsaClient.contextMenu = trayMenuBuilder;
    autoUpdate = new autoUpdate_1.AutoUpdate(myStorage, myStorage);
    lsaClient.eventSubscribers.registrationEventHandler =
        new registrationHandler_1.RegistrationHandler(myStorage, lsaClient.logger, mainWindow, autoUpdate, lsaClient.logExporter);
    let appLimiter = appLimiter_1.AppLimiter.getInstance();
    appLimiter.setRunningAppsImpl(lsaClient.telemetryInstrumentation.runningAppInstrumentation);
    appLimiter.setCloseAppImpl(new CloseAppImplementation_1.CloseAppImplementation());
    const webExtensionCommands = new webExtensionCommands_1.WebExtensionCommands(classroomEventHandler, shellExecutor, webLimiting_1.WebLimiter.getInstance());
    let nativeMessaging = new nativeMessaging_1.NativeMessaging(webExtensionCommands, webLimiting_1.WebLimiter.getInstance(), shellExecutor, lsaClient.otmBrowserInstrumentation);
    nativeMessaging.connect();
    classroomEventHandler.setTabCloser(nativeMessaging);
    var lang = localeHandler.getLocale();
    lsaClient.logger.logInfo('changing language to ' + lang);
    i18next_config_1.i18next.changeLanguage(lang);
    if (process.platform === 'darwin') {
        let protector = new clientProtector_1.ClientProtector();
        protector.protectClient();
    }
    if (process.platform === 'win32') {
        autoUpdate.deleteOldAutoUpdateFiles();
    }
    lsaClient.knownClientStatus = new knownClientStatus_1.KnownClientStatus(myStorage);
    lsaClient.routableWindowFactory = new routableWindow_1.RoutableWindowFactory(electronIpcMain, new views_1.SingleViewController(true));
    try {
        lsaClient.logger.logDebug(`Beginning lsaClient connection...`);
        await lsaClient.connect();
        lsaClient.logger.logDebug(`lsaClient connect complete.`);
    }
    catch (error) {
        lsaClient.logger.logInfo('Error from lsaClient.connect(): ' + error);
    }
    lsaClient.logger.logInfo('Ready to receive events and callbacks.');
    if (process.platform === 'darwin') {
        electron_1.app.on('before-quit', (event) => {
            lsaClient.logger.logInfo('Before Quit is called and we are prventing the app to quit.');
            event.preventDefault();
        });
    }
    electron_1.app.on('quit', (event) => {
        electron_1.app.releaseSingleInstanceLock();
    });
    if (process.env.TEST_FILEPATH) {
        const testMessage = require('./testMessage');
        testMessage.listenForTestMessages((message) => {
            if (message.action === 'maximizeWindow') {
                mainWindow.maximize();
            }
        });
    }
});
const notifyTitleBar = (mainWindow, lang) => {
    try {
        let langCode = (0, lsa_clients_common_1.i18nLocaleMapper)(lang);
        if (!i18next_config_1.i18next.hasResourceBundle(langCode, config_1.default.namespace))
            langCode = config_1.default.fallbackLng;
        const translations = i18next_config_1.i18next.getResourceBundle(langCode, config_1.default.namespace).title_bar;
        const isMaximized = mainWindow.isWindowMaximized();
        const data = Object.assign(Object.assign({}, translations), { isMaximized });
        mainWindow.sendToTitlebar('i18nLanguageChanged', data);
    }
    catch (error) {
        lsaClient.logger.logError('notifyTitleBar:' + error);
    }
};
//# sourceMappingURL=index.js.map