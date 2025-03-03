import { IpcMain } from 'electron';

// Data structure to be passed to the titlebar and back again with data populated.
// Although ipcRenderer can use .invoke to perform asynchronous queries to ipcMain,
// There exists no ability to perform asynchronous requests that originate from ipcMain.
export interface IAsyncTitlebarMessage {
    // Window ID of window (requesting) or titlebar (responding). windowId will be
    // checked by the TitlebarCommandProcessor before the message is forwarded to the
    // requesting window.
    windowId: string;

    // Because the requesting window may send multiples of the same message, the cookie
    // can be passed between main and renderer and main can use this cookie to keep
    // track of which response is associated with which request. TitlebarCommandProcessor
    // will not check this as it's strictly for the requesting class.
    cookie: string;

    // Data is populated by the renderer.
    data?: any;
}

export interface ITitlebarCommandWindow {
    getWindowId(): string;
    onTitlebarCommandMinimize?(): void;
    onTitlebarCommandHide?(): void;
    onTitlebarCommandMaximize?(): void;
    onTitlebarCommandRestore?(): void;
    onTitlebarCommandClose?(): void;
    onTitlebarHeightInPxResponse?(response: IAsyncTitlebarMessage): void;
    onTitlebarVisibility?(visible: boolean): void;
}

export const channels = [
    'onMaximize',
    'onHide',
    'onRestore',
    'onClose',
    'onMinimize',
    'onTitlebarHeightInPx',
    'onTitlebarVisibility'
];

// The singleton to handle all titlebar messages and route them to the appropriate window
class TitlebarCommandRouter {
    private static instance: TitlebarCommandRouter | undefined;
    private commandWindows: Array<ITitlebarCommandWindow>;

    private constructor(private ipcMain: IpcMain) {
        channels.forEach((value: string) => {
            this.ipcMain.on(value, (event, arg) => {
                this.processTitlebarCommand(value, event, arg);
            });
        });

        this.commandWindows = new Array<ITitlebarCommandWindow>();
    }

    public static getInstance(ipcMain: IpcMain): TitlebarCommandRouter {
        if (!TitlebarCommandRouter.instance) {
            TitlebarCommandRouter.instance = new TitlebarCommandRouter(ipcMain);
        }

        return TitlebarCommandRouter.instance;
    }

    private processTitlebarCommand(channel: string, event: any, arg: any) {
        const window = this.getHandlerWindow(event, arg);
        if (!window)
            return;

        switch(channel) {
            case 'onMaximize': {
                if (window.onTitlebarCommandMaximize) {
                    window.onTitlebarCommandMaximize();
                }
                break;
            }
            case 'onHide': {
                if (window.onTitlebarCommandHide) {
                    window.onTitlebarCommandHide();
                }
                break;
            }
            case 'onRestore': {
                if (window.onTitlebarCommandRestore)
                    window.onTitlebarCommandRestore();
                break;
            }
            case 'onClose': {
                if (window.onTitlebarCommandClose)
                    window.onTitlebarCommandClose();
                break;
            }
            case 'onMinimize': {
                if (window.onTitlebarCommandMinimize)
                    window.onTitlebarCommandMinimize();
                break;
            }
            case 'onTitlebarHeightInPx': {
                if (window.onTitlebarHeightInPxResponse)
                    window.onTitlebarHeightInPxResponse((arg as IAsyncTitlebarMessage));
            }
            case 'onTitlebarVisibility': {
                if (window.onTitlebarVisibility)
                    window.onTitlebarVisibility(<boolean>arg.visible);
            }
        }
    }

    private getHandlerWindow(event: any, arg: any): ITitlebarCommandWindow | undefined {
        for (let i = 0; i < this.commandWindows.length; i++) {
            if (arg.windowId === this.commandWindows[i].getWindowId())
                return this.commandWindows[i];
        }
        
        return undefined;
    }

    public addWindow(window: ITitlebarCommandWindow) {
        this.commandWindows.push(window);
    }

    public removeWindow(window: ITitlebarCommandWindow) {
        const windowId = window.getWindowId();
        for (let i = 0; i < this.commandWindows.length; i++) {
            if (windowId === this.commandWindows[i].getWindowId()) {
                this.commandWindows.splice(i, 1);
                break;
            }
        }
    }

    // Probably don't ever need to call this except when performing tests...
    public static destroyInstance() {
        TitlebarCommandRouter.instance = undefined;
    }
}

export class TitlebarCommandProcessor {
    private titlebarCommandRouter: TitlebarCommandRouter;
    constructor(private window: ITitlebarCommandWindow, ipcMain: IpcMain) {
        this.titlebarCommandRouter = TitlebarCommandRouter.getInstance(ipcMain);
        this.titlebarCommandRouter.addWindow(window);
    }

    public destroy() {
        this.titlebarCommandRouter.removeWindow(this.window);
    }

    // Probably don't ever need to call this except when performing tests...
    public static destroyCommandRouterInstance() {
        TitlebarCommandRouter.destroyInstance();
    }
}