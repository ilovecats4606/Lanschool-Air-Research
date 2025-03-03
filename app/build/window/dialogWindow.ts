import { BrowserWindow, shell, Input, screen } from 'electron';
import fs = require('fs');
import { LSAClient, ILogger, CommonWindow, Position } from '@lenovo-software/lsa-clients-common';

export interface WindowOptions {
    show?: boolean;
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    title?: string;
    position?: {
        vertical: Position;
        horizontal: Position;
    }
    frame?: boolean;
    movable?: boolean;
    resizable?: boolean;
    alwaysOnTop?: boolean;
    enableLargerThanScreen?: boolean;
    closable?: boolean;
    backgroundColor?: string;
    focusable?: boolean;
    webPreferences?: any;
    maximizable?: boolean;
    center?: boolean;
}

export interface OtherOptions {
    finalUrl?: string;
    preventClose?: boolean;
    preventNavigate?: boolean;
    preventSpecialCommands?: boolean;
    devTools?: boolean;
}

export class DialogWindow extends CommonWindow {
    //@ts-ignore
    private logger: ILogger | null;

    /**
    windowOptions is the first param to BrowserWindow https://www.electronjs.org/docs/latest/api/browser-window#new-browserwindowoptions
     */
    constructor(private windowOptions: WindowOptions, private otherOptions: OtherOptions = {}) {
        super();

        //@ts-ignore
        this.logger = LSAClient.getInstance().logger;
    }

    /**
     * @override
     */
    public get isWindowOpen(): boolean {
        return !this?.w.isDestroyed() && !this.w?.isVisible();
    };

    /**
     * @override
     */
    public getCurrentUrl() {
        return this.w?.webContents?.getURL();
    }

    /**
     * @override
     */
    public getWebContents() {
        return this.w?.webContents;
    }

    /**
     * @override
     */
    public loadWindow() {
        if(!this.w) {
            this.w = new BrowserWindow(this.windowOptions);
            this.setupHandlers();
            this.w.setMenu(null);
        }
    }

    /**
     * @override
     */
    public getBrowserWindow(): BrowserWindow {
        return this.w;
    }

    /**
     * @override
     */
    public setFullscreen(setFullscreen: boolean) {
        this.w.setFullscreen(setFullscreen);
    }

    /**
     * @override
     */
    public isFullscreen() {
        return this.w.fullScreen;
    }

    /**
     * @override
     */
    public makeModal(...args: any[]) {
        const flag = args?.[0] || true,
            level = args?.[1] || 'normal',
            relativeLevel = args?.[2] || 0;
        this.w?.setAlwaysOnTop(flag, level, relativeLevel); //NOTE - 3rd param does not actually work as expected, so workarounds are necessary
    }

    /**
     * @override
     */
    public getBounds() {
        return this.w.getBounds();
    }

    /**
     * @override
     */
    public setBounds(bounds: any) {
        return this.w.setBounds(bounds);
    }

    /**
     * @override
     */
    public setSize(x: number, y: number) {
        return this.w.setSize(x, y);
    }

    /**
     * @override
     */
    public setPosition(x: number, y: number) {
        return this.w.setPosition(x, y);
    }

    /**
     * @override
     */
    public onWindowLoad(fnc: any) {
        this.handleEvent('ready-to-show', () => {
            fnc()
        });
    }

    /**
     * @override
     */
    public onClosed(fnc: any) {
        this.w?.on('closed', () => {
            fnc();
        })
    }

    /**
     * @override
     */
    public onWindowMinimized(fnc: any) {
        this.handleEvent('minimized', fnc);
    }

    /**
     * @override
     */
    public sendMessage(channel: string, message: any) {
        if (message) {
            this.w?.webContents.send(channel, message);
        }
        else {
            this.w?.webContents.send(channel);
        }
    }

    /**
     * @override
     */
    public close() {
        if (this.isWindowOpen) {
            this.w?.webContents.send('closeWindow');
        }
    }

    public convertPositionOptionToBounds() {
        const primaryScreen = screen.getPrimaryDisplay();
        let width = this.windowOptions.width || 800;
        let height = this.windowOptions.height || 600;
        let top = this.getBoundCoordinate(this.windowOptions.position?.vertical, primaryScreen.bounds.height, height, this.windowOptions.y);
        let left = this.getBoundCoordinate(this.windowOptions.position?.horizontal, primaryScreen.bounds.width, width, this.windowOptions.x);

        return {
            width: width,
            height: height,
            x: left,
            y: top
        };
    }

    // only exists for Electron, so this is not an override from the base class
    public onWindowNavigate(fnc: any) {
        this.w?.on('will-navigate', () => {
            fnc();
        })
    }

    // only exists for Electron, so this is not an override from the base class
    public unmaximize() {
        this.w.unmaximize();
    }

    // only exists for Electron, so this is not an override from the base class
    public onWindowFinishLoad(func: any) {
        this.handleEvent('did-finish-load', func);
    }

    // only used in Electron, so this is not an override from the base class
    public destroy() {
        this.w.destroy();
    }

    private setupHandlers() {
        this.onWindowLoad(()=>{
            const bounds = this.convertPositionOptionToBounds();
            this.setBounds(bounds);
        });
        this.onClosed(() => {
            // @ts-ignore
            this.w = null;
        });

        this.w?.webContents?.setWindowOpenHandler( () => {
            return { action: 'deny' };
        });

        if(this.otherOptions?.finalUrl) {
            this.w.loadURL(this.otherOptions.finalUrl)
                .then(() => {
                    this.logger?.logInfo(this.otherOptions.finalUrl + ' is loaded');
                })
                .catch((e: any) => {
                    this.logger?.logError(e);
                });
        }

        if(this.otherOptions.preventClose) {
            this.w.on('close', (e: any) => {
                e.preventDefault();
            });
        }

        if(this.otherOptions.preventNavigate) {
            this.w?.webContents?.on('will-navigate', (e: any) => {
                e.preventDefault();
            });
        }

        if(this.otherOptions.preventSpecialCommands) {
            this.w?.webContents?.on('before-input-event', (event: Event, input: Input) => {
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
        }

        if(this.otherOptions.devTools) {
            this.w.webContents.openDevTools({ mode: 'detach' });
        }
    }
}
