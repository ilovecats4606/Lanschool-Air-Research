"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MacMainWindowController = exports.MainWindowController = exports.windowMaxHeight = exports.windowMaxWidth = exports.windowMinHeight = exports.windowMinWidth = exports.miniMeWidth = exports.miniMeHeight = exports.titleBarHeight = void 0;
const electron_1 = require("electron");
const views_1 = require("./views");
const windowStateManager_1 = require("./windowStateManager");
const windowStateProperties_1 = require("./windowStateProperties");
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
const logSeverity_1 = require("../logSeverity");
const saveLogs_1 = require("./saveLogs");
const titlebarCommandProcessor_1 = require("./titlebarCommandProcessor");
const baseRectWidth = 600;
const baseRectHeight = 400;
exports.titleBarHeight = 35;
exports.miniMeHeight = 62;
exports.miniMeWidth = 300;
exports.windowMinWidth = 1;
exports.windowMinHeight = 1;
exports.windowMaxWidth = 5000;
exports.windowMaxHeight = 5000;
class WindowMoveDetection {
    constructor() {
        this._moveStarted = false;
        this._startingX = 0;
        this._startingY = 0;
    }
    startMove(x, y) {
        if (!this._moveStarted) {
            this._startingX = x;
            this._startingY = y;
            this._moveStarted = true;
        }
    }
    didMove(x, y) {
        if (!this._moveStarted) {
            return false;
        }
        let ret = this._startingX !== x || this._startingY !== y;
        this._moveStarted = false;
        this._startingX = 0;
        this._startingY = 0;
        return ret;
    }
}
class UIMessageQueue {
    constructor(viewController) {
        this.viewController = viewController;
        this.msgQueue = new Array();
        this.windowReadyForMessage = false;
    }
    onDidFinishLoading() {
        this.windowReadyForMessage = true;
        this.sendMessageToUIView(null);
    }
    sendMessageToUIView(uiMsg) {
        if (uiMsg) {
            lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('Queuing: ' + uiMsg.msg);
            this.msgQueue.push(uiMsg);
        }
        if (this.windowReadyForMessage) {
            while (this.msgQueue.length > 0) {
                const toSend = this.msgQueue.shift();
                if (toSend === null || toSend === void 0 ? void 0 : toSend.msg) {
                    lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('Sending: ' + toSend.msg);
                    this.viewController.sendMessageToUIView(toSend.msg, toSend.param);
                }
            }
        }
    }
}
class MainWindowController {
    get webContents() {
        var _a;
        return (_a = this.win) === null || _a === void 0 ? void 0 : _a.webContents;
    }
    set shellExecutor(executor) {
        this._executor = executor;
    }
    static Log_17296(message) {
        lsa_clients_common_1.LSAClient.getInstance().logger.logDebug(`17296: MainWindowController ${message}`);
    }
    constructor() {
        this.win = null;
        this.mainWindowEventSubscribers = new Array();
        this.fullScreenEventSubscribers = new Array();
        this.moveDetection = new WindowMoveDetection();
        this.ignoreMessagesFromTitlebar = false;
        this.chatWindowRectBoundsNormal = {
            width: baseRectWidth,
            height: baseRectHeight,
            x: 0,
            y: 0
        };
        this.titlebarVisible = false;
        MainWindowController.Log_17296(`constructor(+)`);
        this.viewController = new views_1.SingleViewController();
        MainWindowController.Log_17296(`constructor(+1)`);
        this.uiMessageQueue = new UIMessageQueue(this.viewController);
        MainWindowController.Log_17296(`constructor(+2)`);
        this.currentWindowStateMgr = new windowStateManager_1.WindowStateManager(this);
        MainWindowController.Log_17296(`constructor(+3)`);
        this.logger = lsa_clients_common_1.LSAClient.getInstance().logger;
        this.saveLogsDialog = saveLogs_1.SaveLogs.getInstance(lsa_clients_common_1.LSAClient.getInstance().logExporter);
        MainWindowController.Log_17296(`constructor(+4)`);
        new titlebarCommandProcessor_1.TitlebarCommandProcessor(this, electron_1.ipcMain);
        MainWindowController.Log_17296(`constructor(-)`);
    }
    static getInstance() {
        MainWindowController.Log_17296(`getInstance(+)`);
        if (!MainWindowController.instance) {
            if (process.platform === 'darwin') {
                MainWindowController.instance = new MacMainWindowController();
            }
            else {
                MainWindowController.instance = new MainWindowController();
            }
        }
        MainWindowController.Log_17296(`getInstance(-)`);
        return MainWindowController.instance;
    }
    getWindowId() {
        return views_1.MainWindowId;
    }
    executeTitlebarCommand(cb) {
        if (!this.ignoreMessagesFromTitlebar && cb) {
            cb();
        }
    }
    onTitlebarCommandHide() {
        var _a;
        this.executeTitlebarCommand((_a = this.win) === null || _a === void 0 ? void 0 : _a.hide());
    }
    onTitlebarCommandClose() {
        var _a;
        this.executeTitlebarCommand((_a = this.win) === null || _a === void 0 ? void 0 : _a.hide());
    }
    onTitlebarCommandRestore() {
        this.executeTitlebarCommand(this.windowRestore());
    }
    onTitlebarCommandMaximize() {
        this.executeTitlebarCommand(this.windowMaximize());
    }
    onTitlebarVisibility(visible) {
        this.titlebarVisible = visible;
    }
    onTitlebarCommandMinimize() {
        this.executeTitlebarCommand(() => {
            let execDefault = true;
            for (let i = 0; i < this.mainWindowEventSubscribers.length; i++) {
                if (this.mainWindowEventSubscribers[i].onMainWindowMinimize()) {
                    execDefault = false;
                }
            }
            if (execDefault) {
                this.setWindowState(windowStateProperties_1.MainWindowState.Minimized).catch((err) => {
                    this.myConsoleError('MainWindowController.ipcMain.onMinimize: ' +
                        'Failed to set window state to minimized: ' +
                        err);
                });
            }
        });
    }
    async init() {
        var _a, _b;
        MainWindowController.Log_17296(`init(+)`);
        this.win = this.viewController.getBrowserWindow(baseRectWidth, baseRectHeight);
        MainWindowController.Log_17296(`init(+1)`);
        if (process.env.NODE_ENV && process.env.NODE_ENV === 'development') {
            (_a = this.win) === null || _a === void 0 ? void 0 : _a.webContents.openDevTools({ mode: 'detach' });
        }
        MainWindowController.Log_17296(`init(+2)`);
        if (!this.win) {
            throw new Error('MainWindowController.init(): Unable to obtain browser window.');
        }
        MainWindowController.Log_17296(`init(+3)`);
        this.win.hide();
        MainWindowController.Log_17296(`init(+4)`);
        (_b = this.webContents) === null || _b === void 0 ? void 0 : _b.on('did-finish-load', () => {
            this.uiMessageQueue.onDidFinishLoading();
            this.sendToUI('UI_SetState', {
                state: {
                    supportsConnectivityStatus: true,
                    supportsConnectivityDetail: true,
                    supportsDownloadLogs: true,
                    supportsLearnMoreAboutStatus: true
                }
            });
            this.sendToUI('UI_AgentVersionString', {
                versionString: lsa_clients_common_1.LSAClient.getInstance().getAgentVersionHeaderString()
            });
        });
        MainWindowController.Log_17296(`init(+5)`);
        this.win.setMinimizable(false);
        MainWindowController.Log_17296(`init(+6)`);
        electron_1.ipcMain.on('onLogMessage', (event, arg) => {
            this.logFromUI(arg);
        });
        electron_1.ipcMain.on('FromRenderer_offline', async (event, arg) => {
            setTimeout(() => {
                if (electron_1.net.isOnline() === false) {
                    lsa_clients_common_1.LSAClient.getInstance().onDeviceOnlineStatusChanged(false);
                }
            }, 5 * 1000);
        });
        electron_1.ipcMain.on('FromRenderer_online', async (event, arg) => {
            lsa_clients_common_1.LSAClient.getInstance().onDeviceOnlineStatusChanged(true);
        });
        MainWindowController.Log_17296(`init(+7)`);
        electron_1.ipcMain.handle('FromUI_LogMessage', (event, arg) => {
            var _a;
            if (!arg) {
                return;
            }
            const logMessage = '[' + ((_a = arg.subCategory) !== null && _a !== void 0 ? _a : 'ANGULAR') + '] ' + arg.message;
            let severity;
            switch (arg.severity) {
                case 'DEBUG': {
                    severity = logSeverity_1.LogSeverity.DEBUG;
                    break;
                }
                case 'INFO': {
                    severity = logSeverity_1.LogSeverity.INFO;
                    break;
                }
                case 'WARN': {
                    severity = logSeverity_1.LogSeverity.WARNING;
                    break;
                }
                case 'ERROR': {
                    severity = logSeverity_1.LogSeverity.ERROR;
                    break;
                }
                default: {
                    severity = logSeverity_1.LogSeverity.INFO;
                    break;
                }
            }
            const logArg = {
                severity: severity,
                msg: logMessage
            };
            this.logFromUI(logArg);
        });
        MainWindowController.Log_17296(`init(+8)`);
        electron_1.ipcMain.handle('FromUI_DownloadLogs', async (event, arg) => {
            this.myConsoleLog('Got FromUI_DownloadLogs');
            try {
                let browserWindow = this.viewController.getBrowserWindow();
                if (browserWindow !== null) {
                    try {
                        const saveLogResult = await this.saveLogsDialog.saveLog(browserWindow);
                        if (saveLogResult === true) {
                            this.sendToUI('UI_LogSaveStatus', {
                                success: true
                            });
                        }
                    }
                    catch (err) {
                        this.sendToUI('UI_LogSaveStatus', {
                            success: false,
                            error: err !== null && err !== void 0 ? err : 'Unknown'
                        });
                    }
                }
                else {
                    this.myConsoleError('MainWindowController - FromUI_DownloadLogs: Unable to retrieve browser window.');
                }
            }
            catch (err) {
                this.myConsoleError('MainWindowController - FromUI_DownloadLogs: viewController.getBrowserWindow() threw: ' +
                    err);
            }
        });
        MainWindowController.Log_17296(`init(+9)`);
        electron_1.ipcMain.handle('FromUI_LearnMoreAboutStatus', (event, arg) => {
            var _a;
            if (((_a = arg === null || arg === void 0 ? void 0 : arg.data) === null || _a === void 0 ? void 0 : _a.length) && this._executor) {
                let executorParam = new lsa_clients_common_1.RemoteExecuteEventModel();
                executorParam.path = arg.data;
                this._executor.execute(executorParam);
            }
            else {
                this.myConsoleError('MainWindowController - FromUI_LearnMoreAboutStatus: arg was ' + (arg === null || arg === void 0 ? void 0 : arg.data) + ', _executor was ' + this._executor);
            }
        });
        MainWindowController.Log_17296(`init(+10)`);
        electron_1.ipcMain.handle('isMaximized', async (event, arg) => {
            const frameState = await this.currentWindowStateMgr.getCurrentFrameState();
            return frameState === 'maximized';
        });
        MainWindowController.Log_17296(`init(+11)`);
        this.win.on('maximize', (e) => {
            this.myConsoleLog('MainWindow maximize');
            this.windowMaximize();
        });
        this.win.on('enter-full-screen', (e) => {
            this.myConsoleLog('MainWindow enter-full-screen');
        });
        this.win.on('leave-full-screen', (e) => {
            this.myConsoleLog('MainWindow leave-full-screen');
        });
        this.win.on('unmaximize', (e) => {
            this.myConsoleLog('MainWindow unmaximize');
            this.windowRestore();
        });
        this.win.on('restore', (e) => {
            this.myConsoleLog('MainWindow restore');
            this.windowRestore();
        });
        this.win.on('resize', (e) => {
            var _a;
            this.windowResize((_a = this.win) === null || _a === void 0 ? void 0 : _a.getContentSize());
        });
        this.win.on('resized', () => {
            this.myConsoleLog('MainWindow resized');
            this.currentWindowStateMgr.getMainWindowState().then((state) => {
                if (state !== windowStateProperties_1.MainWindowState.Normal) {
                    return;
                }
                else if (this.win) {
                    this.chatWindowRectBoundsNormal = this.win.getBounds();
                }
            });
        });
        this.win.on('moved', () => {
            this.currentWindowStateMgr.getMainWindowState().then((state) => {
                if (state !== windowStateProperties_1.MainWindowState.Normal) {
                    return;
                }
                else if (this.win) {
                    this.chatWindowRectBoundsNormal = this.win.getBounds();
                }
            });
        });
        MainWindowController.Log_17296(`init(+12)`);
        await this.viewController.init();
        MainWindowController.Log_17296(`init(+13)`);
        this.chatWindowRectBoundsNormal = this.win.getBounds();
        MainWindowController.Log_17296(`init(-)`);
    }
    logFromUI(arg) {
        switch (arg.severity) {
            case logSeverity_1.LogSeverity.INFO: {
                this.myConsoleLog(arg.msg);
                break;
            }
            case logSeverity_1.LogSeverity.DEBUG: {
                this.myConsoleLog(arg.msg);
                break;
            }
            case logSeverity_1.LogSeverity.WARNING: {
                this.myConsoleError(arg.msg);
                break;
            }
            case logSeverity_1.LogSeverity.ERROR: {
                this.myConsoleError(arg.msg);
                break;
            }
        }
    }
    windowResize(size) {
        if (!size || !Array.isArray(size) || size.length < 2) {
            return;
        }
        const x = size[0];
        const y = size[1];
        this.currentWindowStateMgr
            .getMainWindowState()
            .then((state) => {
            var _a;
            this.viewController.resizeWindow(x, y, ((_a = windowStateProperties_1.MainWindowStateProperties.fromStateEnum(state)) === null || _a === void 0 ? void 0 : _a.titleBarVisible) || false);
        });
    }
    chatMessageReceived() {
        this.windowRestoreIfMinimized(true);
    }
    addBrowserView(bv) {
        var _a;
        (_a = this.win) === null || _a === void 0 ? void 0 : _a.addBrowserView(bv);
    }
    setWindowState(state) {
        return new Promise((resolve, reject) => {
            this.ignoreMessagesFromTitlebar = true;
            this.setWindowState_Wrapped(state)
                .then(() => {
                resolve();
            })
                .catch(() => {
                reject();
            })
                .finally(() => {
                this.ignoreMessagesFromTitlebar = false;
            });
        });
    }
    setWindowState_Wrapped(state) {
        this.myConsoleLog('(+)setWindowState: ' + state);
        return new Promise((resolve, reject) => {
            this.currentWindowStateMgr.adoptState(state, () => {
                if (state === windowStateProperties_1.MainWindowState.Maximized) {
                    this.sendToTitlebar('onMaximize', null);
                }
                else if (state === windowStateProperties_1.MainWindowState.Normal) {
                    this.sendToTitlebar('onRestore', null);
                }
                resolve();
            }, reject);
        });
    }
    myConsoleLog(msg) {
        this.logger.logDebug('[MainWindow] ' + msg);
    }
    myConsoleError(msg) {
        this.logger.logError('[MainWindow] ' + msg);
    }
    addSubscriber(sub) {
        this.mainWindowEventSubscribers.push(sub);
    }
    addFullScreenEventSubscriber(sub) {
        this.fullScreenEventSubscribers.push(sub);
    }
    async windowMaximize() {
        try {
            await this.setWindowState(windowStateProperties_1.MainWindowState.Maximized);
        }
        catch (err) {
            this.myConsoleError('MainWindowController.windowMaximize(): ' +
                'Failed to maximize window: ' +
                err);
        }
    }
    async windowRestore() {
        try {
            await this.setWindowState(windowStateProperties_1.MainWindowState.Normal);
        }
        catch (err) {
            this.myConsoleError('MainWindowController.windowRestore(): ' +
                'Failed to restore window: ' +
                err);
        }
    }
    async windowRestoreIfMinimized(showWindowRegardless = false) {
        this.currentWindowStateMgr.getCurrentFrameState().then((frameState) => {
            var _a, _b;
            if (frameState === 'minimized') {
                return this.windowRestore();
            }
            else if (showWindowRegardless) {
                if (process.platform === 'win32') {
                    (_a = this.win) === null || _a === void 0 ? void 0 : _a.setAlwaysOnTop(true);
                    this.show();
                    (_b = this.win) === null || _b === void 0 ? void 0 : _b.setAlwaysOnTop(false);
                }
                else {
                    this.show();
                }
            }
        });
    }
    async positionMinimizedAudioOnly() {
        try {
            await this.setWindowState(windowStateProperties_1.MainWindowState.MiniMe);
        }
        catch (err) {
            this.myConsoleError('MainWindowController.positionMinimizedAudioOnly(): ' +
                'Failed to put window into mini-me: ' +
                err);
        }
    }
    async setFullScreenShowTeacher(fullScreen) {
        if (fullScreen) {
            try {
                await this.setWindowState(windowStateProperties_1.MainWindowState.FullScreenShowTeacher);
                this.fullScreenEventSubscribers.forEach((sub) => {
                    try {
                        sub.onFullScreenStart();
                    }
                    catch (e) { }
                });
            }
            catch (err) {
                this.myConsoleError('MainWindowController.setFullScreenShowTeacher(): ' +
                    'Failed to put window into full screen: ' +
                    err);
            }
        }
        else {
            try {
                await this.setWindowState(windowStateProperties_1.MainWindowState.Normal);
                this.fullScreenEventSubscribers.forEach((sub) => {
                    try {
                        sub.onFullScreenEnd();
                    }
                    catch (e) { }
                });
            }
            catch (err) {
                this.myConsoleError('MainWindowController.setFullScreenShowTeacher(): ' +
                    'Failed to put window into normal: ' +
                    err);
            }
        }
    }
    windowResponseToUIMessage(msg) {
        switch (msg) {
            case 'UI_ChatMessage': {
                this.chatMessageReceived();
                break;
            }
        }
    }
    sendToUI(msg, param) {
        this.uiMessageQueue.sendMessageToUIView({
            msg: msg,
            param: param
        });
        this.windowResponseToUIMessage(msg);
    }
    sendToTitlebar(msg, param) {
        this.viewController.sendMessageToTitleBar(msg, param);
    }
    handleWindowMovingNotification(coordinates) {
        this.currentWindowStateMgr.isInMiniMeMode().then((inMiniMeMode) => {
            var _a;
            if (!inMiniMeMode) {
                return;
            }
            const { x, y } = electron_1.screen.getCursorScreenPoint();
            (_a = this.win) === null || _a === void 0 ? void 0 : _a.setPosition(x - (coordinates === null || coordinates === void 0 ? void 0 : coordinates.mouseX), y - (coordinates === null || coordinates === void 0 ? void 0 : coordinates.mouseY));
            this.moveDetection.startMove(x, y);
        });
    }
    handleWindowMovedNotification() {
        this.currentWindowStateMgr.isInMiniMeMode().then((inMiniMeMode) => {
            if (!inMiniMeMode) {
                return;
            }
            const { x, y } = electron_1.screen.getCursorScreenPoint();
            if (!this.moveDetection.didMove(x, y)) {
                this.setWindowState(windowStateProperties_1.MainWindowState.Normal)
                    .then(() => { })
                    .catch((err) => {
                    this.myConsoleError('MainWindowController.handleWindowMovedNotification(): ' +
                        'Failed to set window state to normal: ' +
                        err);
                });
            }
        });
    }
    getPrimaryDisplayWorkArea() {
        let mainScreen = electron_1.screen.getPrimaryDisplay();
        let workAreaRect = {
            x: mainScreen.bounds.x,
            y: mainScreen.bounds.y,
            width: mainScreen.workAreaSize.width,
            height: mainScreen.workAreaSize.height
        };
        return workAreaRect;
    }
    getUIViewCurrentRoute() {
        return this.viewController.getUIViewCurrentRoute();
    }
    isWindowFrameNormal() {
        if (!this.win) {
            throw new Error('MainWindowController.isNormal(): Missing window.');
        }
        return this.win.isNormal();
    }
    isWindowFrameMinimized() {
        if (!this.win) {
            throw new Error('MainWindowController.isWindowFrameMinimized(): Missing window.');
        }
        return this.win.isMinimized();
    }
    isWindowMaximized() {
        if (!this.win) {
            throw new Error('MainWindowController.isWindowMaximized(): Missing window.');
        }
        if (this.win.isMaximized()) {
            return true;
        }
        return false;
    }
    isWindowFrameFullScreen() {
        if (!this.win) {
            throw new Error('MainWindowController.isWindowFrameFullScreen(): Missing window.');
        }
        return this.win.isFullScreen();
    }
    getWindowMinimumSize() {
        if (!this.win) {
            throw new Error('MainWindowController.getWindowMinimumSize(): Missing window.');
        }
        return this.win.getMinimumSize();
    }
    setWindowMinimumSize(width, height) {
        if (!this.win) {
            throw new Error('MainWindowController.setWindowMaximumSize(): Missing window.');
        }
        this.win.setMinimumSize(width, height);
    }
    getWindowMaximumSize() {
        if (!this.win) {
            throw new Error('MainWindowController.getWindowMinimumSize(): Missing window.');
        }
        return this.win.getMaximumSize();
    }
    setWindowMaximumSize(width, height) {
        if (!this.win) {
            throw new Error('MainWindowController.setWindowMaximumSize(): Missing window.');
        }
        this.win.setMaximumSize(width, height);
    }
    getWindowBounds() {
        if (!this.win) {
            throw new Error('MainWindowController.getWindowBounds(): Missing window.');
        }
        return this.win.getBounds();
    }
    setWindowBounds(bounds) {
        if (!this.win) {
            throw new Error('MainWindowController.setWindowBounds(): Missing window.');
        }
        this.win.setBounds(bounds);
    }
    setFullScreen(flag) {
        if (!this.win) {
            throw new Error('MainWindowController.setFullScreen(): Missing window.');
        }
        this.win.setFullScreen(flag);
    }
    minimize() {
        if (!this.win) {
            throw new Error('MainWindowController.minimize(): Missing window.');
        }
        this.win.minimize();
    }
    maximize() {
        if (!this.win) {
            throw new Error('MainWindowController.maximize(): Missing window.');
        }
        this.win.maximize();
        setTimeout(() => {
            this.myConsoleLog('MainWindowController.maximize(): Bounds: ' +
                JSON.stringify(this.getWindowBounds()));
        }, 100);
    }
    unmaximize() {
        if (!this.win) {
            throw new Error('MainWindowController.maximize(): Missing window.');
        }
        this.win.unmaximize();
    }
    restore() {
        if (!this.win) {
            throw new Error('MainWindowController.restore(): Missing window.');
        }
        this.win.restore();
    }
    isTitleBarVisible() {
        return this.titlebarVisible;
    }
    async loadRoute(route) {
        this.viewController.loadRoute(route);
    }
    async showTitleBar() {
        await this.viewController.showTitleBar();
    }
    async hideTitleBar() {
        await this.viewController.hideTitleBar();
    }
    async show() {
        var _a;
        let currentState = await this.currentWindowStateMgr.getMainWindowState();
        if (currentState === windowStateProperties_1.MainWindowState.MiniMe) {
            await this.setWindowState(windowStateProperties_1.MainWindowState.Normal);
        }
        if (this.win) {
            (_a = this.win) === null || _a === void 0 ? void 0 : _a.show();
        }
    }
    async showConnectivityStatusWindow() {
        await this.show();
        this.sendToUI('UI_DisplayConnectivityStatus', '');
    }
}
exports.MainWindowController = MainWindowController;
MainWindowController.instance = null;
class MacMainWindowController extends MainWindowController {
    constructor() {
        super();
        this.macFullScreen = false;
        this.macMaximized = false;
        this.previousBounds = { width: 0, height: 0, x: 0, y: 0 };
    }
    async windowMaximize() {
        try {
            super.windowMaximize();
            this.macMaximized = true;
        }
        catch (err) {
            this.myConsoleError('Mac MainWindowController.windowMaximize() failed: ' + err);
        }
    }
    isWindowMaximized() {
        return this.macMaximized;
    }
    unmaximize() {
        try {
            super.unmaximize();
            this.macMaximized = false;
        }
        catch (err) {
            this.myConsoleError('MacMainWindowController.unmaximize() failed: ' + err);
        }
    }
    isWindowFrameFullScreen() {
        return this.macFullScreen;
    }
    setFullScreen(flag) {
        var _a, _b, _c;
        try {
            if (flag) {
                let bounds = (_a = this.win) === null || _a === void 0 ? void 0 : _a.getBounds();
                if (bounds) {
                    this.previousBounds = bounds;
                }
            }
            (_b = this.win) === null || _b === void 0 ? void 0 : _b.setSimpleFullScreen(flag);
            if (!flag && this.previousBounds.height > 0 && this.previousBounds.width > 0) {
                (_c = this.win) === null || _c === void 0 ? void 0 : _c.setBounds(this.previousBounds, false);
            }
            this.macFullScreen = flag;
        }
        catch (err) {
            this.myConsoleError('MacMainWindowController.setFullScreen() failed: ' + err);
        }
    }
}
exports.MacMainWindowController = MacMainWindowController;
//# sourceMappingURL=mainWindow.js.map