import { LSAClient } from '@lenovo-software/lsa-clients-common';
import { BrowserWindow, Event, Input } from 'electron';
import * as path from "path";
const url = require('url');

export interface IViewController {
    getBrowserWindow(width?: number, height?: number): BrowserWindow | null;
    init(): Promise<void>;
    resizeWindow(width: number, height: number, titleBarVisible: boolean): void;
    sendMessageToUIView(msg: string, param: any): void;
    sendMessageToTitleBar(msg: string, param: any): void;
    getUIViewCurrentRoute(): string;
    loadRoute(route: string, query?: any): void;
    showTitleBar(): Promise<void>;
    hideTitleBar(): Promise<void>;
}

export const MainWindowId = 'mainWindow';

export class SingleViewController implements IViewController {
    private width: number = 0;
    private height: number = 0;
    private browserWindow: BrowserWindow | null = null;

    constructor(private canClose?: boolean) {

    }

    public static Log_17296(message: string) {
        LSAClient.getInstance().logger.logDebug(`17296: SingleViewController ${message}`);
    }

    public getBrowserWindow(width?: number, height?: number): BrowserWindow | null {
        SingleViewController.Log_17296(`getBrowserWindow(+)`);
        if (!this.browserWindow) {
            SingleViewController.Log_17296(`getBrowserWindow(+1)`);
            if (!width || width <= 0 || !height || height <= 0) {
                throw new Error('SingleViewController.getBrowserWindow(): Invalid parameter.');
            }

            SingleViewController.Log_17296(`getBrowserWindow(+2)`);
            this.width = width;
            this.height = height;
            this.browserWindow = new BrowserWindow({
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
            this.browserWindow.webContents?.setWindowOpenHandler( () => {
                return { action: 'deny' };
            });
    
            SingleViewController.Log_17296(`getBrowserWindow(+4)`);
            this.browserWindow?.webContents.on('will-navigate', (event) => {
                SingleViewController.Log_17296(`on will-navigate`);
                event.preventDefault();
            });

            // ***
            this.browserWindow?.webContents.on('did-finish-load', () => {
                SingleViewController.Log_17296(`on did-finish-load`);
            });

            // ***
            this.browserWindow?.webContents.on('did-fail-load', (event: Event, errorCode: number, errorDescription: string, validatedURL: string, isMainFrame: boolean, frameProcessId: number, frameRoutingId: number) => {
                SingleViewController.Log_17296(`on did-fail-load: errorCode: ${errorCode}, errorDescription: ${errorDescription}, validatedURL: ${validatedURL}`);
            });

            // ***
            this.browserWindow?.webContents.on('did-fail-provisional-load', (event: Event, errorCode: number, errorDescription: string, validatedURL: string, isMainFrame: boolean, frameProcessId: number, frameRoutingId: number) => {
                SingleViewController.Log_17296(`on did-fail-provisional-load: errorCode: ${errorCode}, errorDescription: ${errorDescription}, validatedURL: ${validatedURL}`);
            });

            // ***
            this.browserWindow?.webContents.on('did-frame-finish-load', (event: Event, isMainFrame: boolean, frameProcessId: number, frameRoutingId: number) => {
                SingleViewController.Log_17296(`on did-frame-finish-load: isMainFrame: ${isMainFrame}, frameProcessId: ${frameProcessId}, frameRoutingId: ${frameRoutingId}`);
            });

            // ***
            this.browserWindow?.webContents.on('did-start-loading', () => {
                SingleViewController.Log_17296(`on did-start-loading`);
            });

            // ***
            this.browserWindow?.webContents.on('did-stop-loading', () => {
                SingleViewController.Log_17296(`on did-stop-loading`);
            });

            // ***
            this.browserWindow?.webContents.on('dom-ready', () => {
                SingleViewController.Log_17296(`on dom-ready`);
            });

            SingleViewController.Log_17296(`getBrowserWindow(+5)`);
            this.browserWindow.on('close', (e: any) => {
                // TODO: The canClose thing is temporary. Once the common client library
                // is put in charge of all windowing, it can decide whether or not closing
                // the window is OK.
                if (!this.canClose)
                    e.preventDefault();
            });

            SingleViewController.Log_17296(`getBrowserWindow(+6)`);
            this.browserWindow?.webContents?.on('before-input-event', (event: Event, input: Input) => {
                if (input)  {
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

            //this.browserWindow.webContents.openDevTools({ mode: 'detach' });

            // Menu.setApplicationMenu(null);
        }

        SingleViewController.Log_17296(`getBrowserWindow(-)`);
        return this.browserWindow;
    }

    public async init() {
        SingleViewController.Log_17296(`init(+)`);
        await this.loadRoute('chat');
        SingleViewController.Log_17296(`init(-)`);
    }

    public resizeWindow(width: number, height: number, titleBarVisible: boolean): void {
        // No op
    }

    public sendMessageToUIView(msg: string, param: any): void {
        if (param) {
            this.browserWindow?.webContents.send(msg, param);
        }
        else {
            this.browserWindow?.webContents.send(msg);
        }
    }

    public sendMessageToTitleBar(msg: string, param: any): void {
        // Because the UI and the titlebar are the same IPC object, just send stuff to the UI.
        this.sendMessageToUIView(msg, param);
    }

    public getUIViewCurrentRoute(): string {
        let route = this.browserWindow?.webContents.getURL();
        return route ?? '';
    }

    public loadRoute(route: string, query?: any): Promise<void> {
        return new Promise(async (resolve, reject) => {
            SingleViewController.Log_17296(`loadRoute(+)`);
            const currentURL = this.browserWindow?.webContents?.getURL();
            if (currentURL && currentURL.length > 0) {
                this.browserWindow?.webContents.executeJavaScript("location.assign('#" + route + "');");
                SingleViewController.Log_17296(`loadRoute(+1)`);
                resolve();
            }
            else {
                SingleViewController.Log_17296(`loadRoute(+2)`);
                // The ui/ folder contains the output of the Angular app build from callling "yarn electron".
                const indexHTML = url.format({
                    pathname: path.join(__dirname + '/../ui/index.html'),
                    protocol: "file",
                    slashes: true,
                    hash: route,
                    query: query || { windowId: MainWindowId }
                });

                try {
                    SingleViewController.Log_17296(`loadRoute(+3)`);
                    await this.browserWindow?.webContents.loadURL(indexHTML);
                    SingleViewController.Log_17296(`loadRoute(+4)`);
                    resolve();
                }
                catch(e) {
                    SingleViewController.Log_17296(`loadRoute(+5)`);
                    reject(e);
                }            
            }
        });
    }

    // WARNING: We don't wait for a return from ipcRenderer so if you're
    // counting on the await to make sure it's completed on return, you won't
    // get a true resolution. This is because there isn't really a convenient way
    // (that I know of) to ensure synchronicity between ipcMain and ipcRenderer
    // when the message originates at ipcMain.

    public async showTitleBar() {    
        this.sendMessageToTitleBar('restoreTitlebar', null);
    }

    public async hideTitleBar() {
        this.sendMessageToTitleBar('removeTitlebar', null);
    }
}
