import { BrowserWindow, Rectangle, screen, ipcMain, net } from 'electron';
import { MainWindowId, IViewController, SingleViewController } from './views';
import { WindowStateManager } from './windowStateManager';
import {
    MainWindowState,
    MainWindowStateProperties,
    ngRoute
} from './windowStateProperties';
import { ILogger, LSAClient, RemoteExecuteEventModel } from '@lenovo-software/lsa-clients-common';
import { LogSeverity } from '../logSeverity';
import { SaveLogs } from './saveLogs';
import { IShellExecutor } from '../shellExecutor';
import { IFullScreenEventPublisher, IFullScreenEventSubscriber } from '../fullScreenEvent';
import { ITitlebarCommandWindow, TitlebarCommandProcessor } from './titlebarCommandProcessor';

export interface IMainWindowEventSubscriber {
    onMainWindowMinimize(): boolean;
}

export interface LogMessageFromUI {
    severity: LogSeverity;
    msg: string;
}

const baseRectWidth = 600;
const baseRectHeight = 400;

export const titleBarHeight = 35;

export const miniMeHeight = 62;
export const miniMeWidth = 300;

export const windowMinWidth = 1;
export const windowMinHeight = 1;

export const windowMaxWidth = 5000;
export const windowMaxHeight = 5000;

class WindowMoveDetection {
    private _moveStarted = false;
    private _startingX = 0;
    private _startingY = 0;

    public startMove(x: number, y: number): void {
        if (!this._moveStarted) {
            this._startingX = x;
            this._startingY = y;
            this._moveStarted = true;
        }
    }

    public didMove(x: number, y: number): boolean {
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

interface UIMsg {
    msg: string;
    param: any;
}

class UIMessageQueue {
    private msgQueue = new Array<UIMsg>();
    private windowReadyForMessage = false;

    constructor(private viewController: IViewController) {}

    public onDidFinishLoading(): void {
        this.windowReadyForMessage = true;
        this.sendMessageToUIView(null); // Dequeue if there is anything queued
    }

    public sendMessageToUIView(uiMsg: UIMsg | null) {
        if (uiMsg) {
            LSAClient.getInstance().logger.logInfo('Queuing: ' + uiMsg.msg);
            this.msgQueue.push(uiMsg);
        }

        if (this.windowReadyForMessage) {
            while (this.msgQueue.length > 0) {
                const toSend = this.msgQueue.shift();
                if (toSend?.msg) {
                    LSAClient.getInstance().logger.logInfo('Sending: ' + toSend.msg);
                    this.viewController.sendMessageToUIView(
                        toSend.msg,
                        toSend.param
                    );
                }
            }
        }
    }
}

export interface IMainWindowController {
    sendToUI(msg: string, param: any): void;
}



export class MainWindowController implements 
    IMainWindowController, 
    IFullScreenEventPublisher, 
    ITitlebarCommandWindow {
    private static instance: MainWindowController | null = null;
    protected win: BrowserWindow | null = null;
    private viewController: IViewController;
    private mainWindowEventSubscribers = new Array<IMainWindowEventSubscriber>();
    private fullScreenEventSubscribers = new Array<IFullScreenEventSubscriber>();

    private moveDetection = new WindowMoveDetection();

    private uiMessageQueue: UIMessageQueue;

    private currentWindowStateMgr: WindowStateManager;

    private logger: ILogger;

    private ignoreMessagesFromTitlebar = false;

    private saveLogsDialog;

    public chatWindowRectBoundsNormal = {
        width: baseRectWidth,
        height: baseRectHeight,
        x: 0,
        y: 0
    };

    private _executor?: IShellExecutor;

    public get webContents() {
        return this.win?.webContents;
    }

    public set shellExecutor(executor: IShellExecutor) {
        this._executor = executor;
    }

    private titlebarVisible: boolean = false;

    public static Log_17296(message: string) {
        LSAClient.getInstance().logger.logDebug(`17296: MainWindowController ${message}`);
    }

    protected constructor() {
        MainWindowController.Log_17296(`constructor(+)`);
        //this.viewController = new BrowserViewController();
        this.viewController = new SingleViewController();
        MainWindowController.Log_17296(`constructor(+1)`);

        this.uiMessageQueue = new UIMessageQueue(this.viewController);
        MainWindowController.Log_17296(`constructor(+2)`);

        this.currentWindowStateMgr = new WindowStateManager(this);
        MainWindowController.Log_17296(`constructor(+3)`);

        this.logger = LSAClient.getInstance().logger;
        this.saveLogsDialog = SaveLogs.getInstance(
            LSAClient.getInstance().logExporter
        );
        MainWindowController.Log_17296(`constructor(+4)`);
        
        new TitlebarCommandProcessor(this, ipcMain);
        MainWindowController.Log_17296(`constructor(-)`);
    }

    public static getInstance() {
        MainWindowController.Log_17296(`getInstance(+)`);
        if (!MainWindowController.instance) {
            if (process.platform === 'darwin') {
                MainWindowController.instance = new MacMainWindowController();
            } else {
                MainWindowController.instance = new MainWindowController();
            }
        }

        MainWindowController.Log_17296(`getInstance(-)`);
        return MainWindowController.instance;
    }

    public getWindowId(): string {
        return MainWindowId;    
    }

    private executeTitlebarCommand(cb: any) {
        if (!this.ignoreMessagesFromTitlebar && cb) {
            cb();
        }
    }

    public onTitlebarCommandHide(): void {
        this.executeTitlebarCommand(this.win?.hide());
    }

    public onTitlebarCommandClose(): void {
        this.executeTitlebarCommand(this.win?.hide());    
    }

    public onTitlebarCommandRestore(): void {
        this.executeTitlebarCommand(this.windowRestore());
    }

    public onTitlebarCommandMaximize(): void {
        this.executeTitlebarCommand(this.windowMaximize());
    }

    public onTitlebarVisibility(visible: boolean): void {
        this.titlebarVisible = visible;    
    }

    public onTitlebarCommandMinimize(): void {
        this.executeTitlebarCommand(() => {
            let execDefault = true;
            for (let i = 0; i < this.mainWindowEventSubscribers.length; i++) {
                if (this.mainWindowEventSubscribers[i].onMainWindowMinimize()) {
                    execDefault = false;
                }
            }

            if (execDefault) {
                this.setWindowState(MainWindowState.Minimized).catch(
                    (err) => {
                        this.myConsoleError(
                            'MainWindowController.ipcMain.onMinimize: ' +
                                'Failed to set window state to minimized: ' +
                                err
                        );
                    }
                );
            }
        });
    }

    public async init() {
        MainWindowController.Log_17296(`init(+)`);
        this.win = this.viewController.getBrowserWindow(
            baseRectWidth,
            baseRectHeight
        );

        MainWindowController.Log_17296(`init(+1)`);
        if (process.env.NODE_ENV && process.env.NODE_ENV === 'development') {
            this.win?.webContents.openDevTools({ mode: 'detach' });
        }

        MainWindowController.Log_17296(`init(+2)`);
        if (!this.win) {
            throw new Error(
                'MainWindowController.init(): Unable to obtain browser window.'
            );
        }

        MainWindowController.Log_17296(`init(+3)`);
        this.win.hide();

        MainWindowController.Log_17296(`init(+4)`);
        this.webContents?.on('did-finish-load', () => {
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
                versionString: LSAClient.getInstance().getAgentVersionHeaderString()
            });
        });

        MainWindowController.Log_17296(`init(+5)`);
        // Only allow minimizing through our custom taskbar
        this.win.setMinimizable(false);

        MainWindowController.Log_17296(`init(+6)`);

        // IPC-triggered window commands
        ipcMain.on('onLogMessage', (event, arg: LogMessageFromUI) => {
            this.logFromUI(arg);
        });

        ipcMain.on('FromRenderer_offline', async (event, arg) => {
            setTimeout( () => {
                // This notification happens very quickly, we should slow
                // down just a bit in case it's a short outage.  Also
                // let's get a second opinion after the wait.
                if (net.isOnline() === false) {
                    LSAClient.getInstance().onDeviceOnlineStatusChanged(false);
                }    
            }, 5 * 1000);
        });

        ipcMain.on('FromRenderer_online', async (event, arg) => {
            LSAClient.getInstance().onDeviceOnlineStatusChanged(true);
        });

        MainWindowController.Log_17296(`init(+7)`);
        ipcMain.handle('FromUI_LogMessage', (event, arg) => {
            // TODO: Define type of "arg" between Angular and here
            if (!arg) {
                return;
            }

            const logMessage =
                '[' + (arg.subCategory ?? 'ANGULAR') + '] ' + arg.message;
            let severity: LogSeverity;
            switch (arg.severity) {
                case 'DEBUG': {
                    severity = LogSeverity.DEBUG;
                    break;
                }
                case 'INFO': {
                    severity = LogSeverity.INFO;
                    break;
                }
                case 'WARN': {
                    severity = LogSeverity.WARNING;
                    break;
                }
                case 'ERROR': {
                    severity = LogSeverity.ERROR;
                    break;
                }
                default: {
                    severity = LogSeverity.INFO;
                    break;
                }
            }

            const logArg: LogMessageFromUI = {
                severity: severity,
                msg: logMessage
            };

            this.logFromUI(logArg);
        });

        MainWindowController.Log_17296(`init(+8)`);
        ipcMain.handle('FromUI_DownloadLogs', async (event, arg) => {
            this.myConsoleLog('Got FromUI_DownloadLogs');
            try {
                let browserWindow = this.viewController.getBrowserWindow();
                if (browserWindow !== null) {
                    try {
                        const saveLogResult = await this.saveLogsDialog.saveLog(
                            browserWindow
                        );
                        if (saveLogResult === true) {
                            this.sendToUI('UI_LogSaveStatus', {
                                success: true
                            });
                        }
                    } catch (err) {
                        this.sendToUI('UI_LogSaveStatus', {
                            success: false,
                            error: err ?? 'Unknown'
                        });
                    }
                } else {
                    this.myConsoleError(
                        'MainWindowController - FromUI_DownloadLogs: Unable to retrieve browser window.'
                    );
                }
            } catch (err) {
                this.myConsoleError(
                    'MainWindowController - FromUI_DownloadLogs: viewController.getBrowserWindow() threw: ' +
                        err
                );
            }
        });

        MainWindowController.Log_17296(`init(+9)`);
        ipcMain.handle('FromUI_LearnMoreAboutStatus', (event, arg) => {
            if (arg?.data?.length && this._executor) {
                let executorParam = new RemoteExecuteEventModel();
                executorParam.path = arg.data;
                this._executor.execute(executorParam);
            } else {
                this.myConsoleError(
                        'MainWindowController - FromUI_LearnMoreAboutStatus: arg was ' + arg?.data + ', _executor was ' + this._executor
                    );
            }
        });

        MainWindowController.Log_17296(`init(+10)`);
        // IPC-triggered queries
        ipcMain.handle('isMaximized', async (event, arg) => {
            const frameState =
                await this.currentWindowStateMgr.getCurrentFrameState();
            return frameState === 'maximized';
        });

        MainWindowController.Log_17296(`init(+11)`);
        // Window handlers
        this.win.on('maximize', (e: any) => {
            this.myConsoleLog('MainWindow maximize');

            // Yes, this will cause our windowMaximize() to get called twice if they clicked the button but who cares.
            this.windowMaximize();
        });

        this.win.on('enter-full-screen', (e: any) => {
            this.myConsoleLog('MainWindow enter-full-screen');
        });

        this.win.on('leave-full-screen', (e: any) => {
            this.myConsoleLog('MainWindow leave-full-screen');
        });

        this.win.on('unmaximize', (e: any) => {
            this.myConsoleLog('MainWindow unmaximize');

            // Yes, this will cause our windowMaximize() to get called twice if they clicked the button but who cares.
            this.windowRestore();
        });

        this.win.on('restore', (e: any) => {
            this.myConsoleLog('MainWindow restore');
            this.windowRestore();
        });

        this.win.on('resize', (e: any) => {
            this.windowResize(this.win?.getContentSize());
        });

        this.win.on('resized', () => {
            this.myConsoleLog('MainWindow resized');
            this.currentWindowStateMgr.getMainWindowState().then((state) => {
                if (state !== MainWindowState.Normal) {
                    return;
                } else if (this.win) {
                    this.chatWindowRectBoundsNormal = this.win.getBounds();
                }
            });
        });

        this.win.on('moved', () => {
            this.currentWindowStateMgr.getMainWindowState().then((state) => {
                if (state !== MainWindowState.Normal) {
                    return;
                } else if (this.win) {
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

    private logFromUI(arg: LogMessageFromUI) {
        switch (arg.severity) {
            case LogSeverity.INFO: {
                this.myConsoleLog(arg.msg);
                break;
            }
            case LogSeverity.DEBUG: {
                this.myConsoleLog(arg.msg);
                break;
            }
            case LogSeverity.WARNING: {
                this.myConsoleError(arg.msg);
                break;
            }
            case LogSeverity.ERROR: {
                this.myConsoleError(arg.msg);
                break;
            }
        }
    }

    private windowResize(size: number[] | undefined) {
        if (!size || !Array.isArray(size) || size.length < 2) {
            return;
        }

        const x = size[0];
        const y = size[1];

        this.currentWindowStateMgr
            .getMainWindowState()
            .then((state: MainWindowState) => {
                this.viewController.resizeWindow(
                    x,
                    y,
                    MainWindowStateProperties.fromStateEnum(state)
                        ?.titleBarVisible || false
                );
            });
    }

    public chatMessageReceived() {
        this.windowRestoreIfMinimized(true);
    }

    public addBrowserView(bv: Electron.BrowserView) {
        this.win?.addBrowserView(bv);
    }

    public setWindowState(state: MainWindowState): Promise<void> {
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

    protected setWindowState_Wrapped(state: MainWindowState): Promise<void> {
        this.myConsoleLog('(+)setWindowState: ' + state);
        return new Promise((resolve, reject) => {
            this.currentWindowStateMgr.adoptState(
                state,
                () => {
                    if (state === MainWindowState.Maximized) {
                        this.sendToTitlebar('onMaximize', null);
                    } else if (state === MainWindowState.Normal) {
                        this.sendToTitlebar('onRestore', null);
                    }
                    resolve();
                },
                reject
            );
        });
    }

    public myConsoleLog(msg: string) {
        this.logger.logDebug('[MainWindow] ' + msg);
    }

    public myConsoleError(msg: string) {
        this.logger.logError('[MainWindow] ' + msg);
    }

    public addSubscriber(sub: IMainWindowEventSubscriber) {
        this.mainWindowEventSubscribers.push(sub);
    }

    public addFullScreenEventSubscriber(sub: IFullScreenEventSubscriber) {
        this.fullScreenEventSubscribers.push(sub);
    }

    public async windowMaximize() {
        try {
            await this.setWindowState(MainWindowState.Maximized);
        } catch (err) {
            this.myConsoleError(
                'MainWindowController.windowMaximize(): ' +
                    'Failed to maximize window: ' +
                    err
            );
        }
    }

    public async windowRestore() {
        try {
            await this.setWindowState(MainWindowState.Normal);
        } catch (err) {
            this.myConsoleError(
                'MainWindowController.windowRestore(): ' +
                    'Failed to restore window: ' +
                    err
            );
        }
    }

    public async windowRestoreIfMinimized(
        showWindowRegardless: boolean = false
    ): Promise<void> {
        this.currentWindowStateMgr.getCurrentFrameState().then((frameState) => {
            if (frameState === 'minimized') {
                return this.windowRestore();
            } else if (showWindowRegardless) {
                if (process.platform === 'win32') {
                    // Windows does not want to allow windows to be forced to the top by the program
                    // However the electron community has found that calling setAlwaysOnTop(true) followed
                    // by setAlwaysOnTop(false) will work correctly.  Without this, the app will flash in
                    // the taskbar, but the window will not be brought to the front
                    this.win?.setAlwaysOnTop(true);
                    this.show();
                    this.win?.setAlwaysOnTop(false); 
                } else {
                   this.show();
                }
            }
        });
    }

    public async positionMinimizedAudioOnly() {
        try {
            await this.setWindowState(MainWindowState.MiniMe);
        } catch (err) {
            this.myConsoleError(
                'MainWindowController.positionMinimizedAudioOnly(): ' +
                    'Failed to put window into mini-me: ' +
                    err
            );
        }
    }

    public async setFullScreenShowTeacher(fullScreen: boolean) {
        if (fullScreen) {
            try {
                await this.setWindowState(
                    MainWindowState.FullScreenShowTeacher
                );
                    this.fullScreenEventSubscribers.forEach((sub) => {
                        try {
                            sub.onFullScreenStart();
                        }
                        catch(e) { }
                    });
            } catch (err) {
                this.myConsoleError(
                    'MainWindowController.setFullScreenShowTeacher(): ' +
                        'Failed to put window into full screen: ' +
                        err
                );
            }
        } else {
            try {
                await this.setWindowState(MainWindowState.Normal);
                this.fullScreenEventSubscribers.forEach((sub) => {
                    try {
                        sub.onFullScreenEnd();
                    }
                    catch(e) {}
                });
            } catch (err) {
                this.myConsoleError(
                    'MainWindowController.setFullScreenShowTeacher(): ' +
                        'Failed to put window into normal: ' +
                        err
                );
            }
        }
    }

    private windowResponseToUIMessage(msg: string): void {
        switch (msg) {
            case 'UI_ChatMessage': {
                this.chatMessageReceived();
                break;
            }
        }
    }

    public sendToUI(msg: string, param: any) {
        this.uiMessageQueue.sendMessageToUIView({
            msg: msg,
            param: param
        });

        this.windowResponseToUIMessage(msg);
    }

    public sendToTitlebar(msg: string, param: any) {
        this.viewController.sendMessageToTitleBar(msg, param);
    }

    public handleWindowMovingNotification(coordinates: {
        mouseX: number;
        mouseY: number;
    }) {
        this.currentWindowStateMgr.isInMiniMeMode().then((inMiniMeMode) => {
            if (!inMiniMeMode) {
                return;
            }

            const { x, y } = screen.getCursorScreenPoint();
            this.win?.setPosition(
                x - coordinates?.mouseX,
                y - coordinates?.mouseY
            );
            this.moveDetection.startMove(x, y);
        });
    }

    public handleWindowMovedNotification() {
        this.currentWindowStateMgr.isInMiniMeMode().then((inMiniMeMode) => {
            if (!inMiniMeMode) {
                return;
            }

            const { x, y } = screen.getCursorScreenPoint();
            if (!this.moveDetection.didMove(x, y)) {
                this.setWindowState(MainWindowState.Normal)
                    .then(() => {})
                    .catch((err) => {
                        this.myConsoleError(
                            'MainWindowController.handleWindowMovedNotification(): ' +
                                'Failed to set window state to normal: ' +
                                err
                        );
                    });
            }
        });
    }

    public getPrimaryDisplayWorkArea(): Electron.Rectangle {
        let mainScreen = screen.getPrimaryDisplay();
        let workAreaRect = {
            x: mainScreen.bounds.x,
            y: mainScreen.bounds.y,
            width: mainScreen.workAreaSize.width,
            height: mainScreen.workAreaSize.height
        };

        return workAreaRect;
    }

    public getUIViewCurrentRoute(): string {
        return this.viewController.getUIViewCurrentRoute();
    }

    public isWindowFrameNormal(): boolean {
        if (!this.win) {
            throw new Error('MainWindowController.isNormal(): Missing window.');
        }

        return this.win.isNormal();
    }

    public isWindowFrameMinimized(): boolean {
        if (!this.win) {
            throw new Error(
                'MainWindowController.isWindowFrameMinimized(): Missing window.'
            );
        }

        return this.win.isMinimized();
    }

    public isWindowMaximized(): boolean {
        if (!this.win) {
            throw new Error(
                'MainWindowController.isWindowMaximized(): Missing window.'
            );
        }

        if (this.win.isMaximized()) {
            return true;
        }

        return false;
    }

    public isWindowFrameFullScreen(): boolean {
        if (!this.win) {
            throw new Error(
                'MainWindowController.isWindowFrameFullScreen(): Missing window.'
            );
        }

        return this.win.isFullScreen();
    }

    public getWindowMinimumSize(): number[] {
        if (!this.win) {
            throw new Error(
                'MainWindowController.getWindowMinimumSize(): Missing window.'
            );
        }

        return this.win.getMinimumSize();
    }

    public setWindowMinimumSize(width: number, height: number) {
        if (!this.win) {
            throw new Error(
                'MainWindowController.setWindowMaximumSize(): Missing window.'
            );
        }

        this.win.setMinimumSize(width, height);
    }

    public getWindowMaximumSize(): number[] {
        if (!this.win) {
            throw new Error(
                'MainWindowController.getWindowMinimumSize(): Missing window.'
            );
        }

        return this.win.getMaximumSize();
    }

    public setWindowMaximumSize(width: number, height: number) {
        if (!this.win) {
            throw new Error(
                'MainWindowController.setWindowMaximumSize(): Missing window.'
            );
        }

        this.win.setMaximumSize(width, height);
    }

    public getWindowBounds(): Rectangle {
        if (!this.win) {
            throw new Error(
                'MainWindowController.getWindowBounds(): Missing window.'
            );
        }

        return this.win.getBounds();
    }

    public setWindowBounds(bounds: Rectangle) {
        if (!this.win) {
            throw new Error(
                'MainWindowController.setWindowBounds(): Missing window.'
            );
        }

        this.win.setBounds(bounds);
    }

    public setFullScreen(flag: boolean) {
        if (!this.win) {
            throw new Error(
                'MainWindowController.setFullScreen(): Missing window.'
            );
        }

        this.win.setFullScreen(flag);
    }

    public minimize() {
        if (!this.win) {
            throw new Error('MainWindowController.minimize(): Missing window.');
        }

        this.win.minimize();
    }

    public maximize() {
        if (!this.win) {
            throw new Error('MainWindowController.maximize(): Missing window.');
        }

        this.win.maximize();

        setTimeout(() => {
            this.myConsoleLog(
                'MainWindowController.maximize(): Bounds: ' +
                    JSON.stringify(this.getWindowBounds())
            );
        }, 100);
    }

    public unmaximize() {
        if (!this.win) {
            throw new Error('MainWindowController.maximize(): Missing window.');
        }

        this.win.unmaximize();
    }

    public restore() {
        if (!this.win) {
            throw new Error('MainWindowController.restore(): Missing window.');
        }

        this.win.restore();
    }


    public isTitleBarVisible(): boolean {
        return this.titlebarVisible;
    }

    public async loadRoute(route: ngRoute) {
        this.viewController.loadRoute(route);
    }

    public async showTitleBar() {
        await this.viewController.showTitleBar();
    }

    public async hideTitleBar() {
        await this.viewController.hideTitleBar();
    }

    public async show() {
        let currentState =
            await this.currentWindowStateMgr.getMainWindowState();
        if (currentState === MainWindowState.MiniMe) {
            await this.setWindowState(MainWindowState.Normal);
        }

        if (this.win) {
            this.win?.show();
        }
    }

    public async showConnectivityStatusWindow() {
        await this.show();

        // Window is in a suitable state to display the status box
        this.sendToUI('UI_DisplayConnectivityStatus', '');
    }
}

export class MacMainWindowController extends MainWindowController {
    private macFullScreen = false;
    private macMaximized = false;
    private previousBounds: Rectangle = { width: 0, height: 0, x:0, y:0 };
   

    public constructor() {
        super();
    }

    public async windowMaximize() {
        try {
            super.windowMaximize();
            this.macMaximized = true;
        } catch (err) {
            this.myConsoleError(
                'Mac MainWindowController.windowMaximize() failed: ' + err
            );
        }
    }

    public isWindowMaximized(): boolean {
        return this.macMaximized;
    }

    public unmaximize() {
        try {
            super.unmaximize();
            this.macMaximized = false;
        } catch (err) {
            this.myConsoleError(
                'MacMainWindowController.unmaximize() failed: ' + err
            );
        }
    }

    public isWindowFrameFullScreen(): boolean {
        return this.macFullScreen;
    }

    public setFullScreen(flag: boolean) {
        try {

            if (flag)
            {
                let bounds = this.win?.getBounds();
                if (bounds) {
                    this.previousBounds = bounds;
                }
            }

            this.win?.setSimpleFullScreen(flag);

            // restore the position of the window before we went full screen
            if (!flag && this.previousBounds.height > 0 && this.previousBounds.width > 0) {
                this.win?.setBounds(this.previousBounds, false);
            }

            this.macFullScreen = flag;
        } catch (err) {
            this.myConsoleError(
                'MacMainWindowController.setFullScreen() failed: ' + err
            );
        }
    }
}
