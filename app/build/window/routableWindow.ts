import { BrowserWindow } from 'electron';
import { IViewController } from './views';
import { ILogger, IRoutableWindow, IRoutableWindowFactory, RoutableWindowParameters, WindowBounds } from '@lenovo-software/lsa-clients-common';
import { IpcMain } from "electron";
import { IAsyncTitlebarMessage, ITitlebarCommandWindow, TitlebarCommandProcessor } from './titlebarCommandProcessor';
import { RoutableWindowTitleBarParameters2TitlebarOptions } from './webpack/titlebarParameterTranslator';

// TODO: Need to pull this list from the same location preload.js does
const validChannelsFromRenderer = [
    'FromUI_RaiseHand', 
    'FromUI_ChatMessage',
    'FromUI_ConferenceParamsSet',
    'FromUI_ConferenceError',
    'FromUI_ConferenceAttachComplete',
    'FromUI_ConferenceDetachComplete',
    'FromUI_ConferenceAttendeeId',
    'FromUI_WindowMoving',
    'FromUI_WindowMoved',
    'FromUI_LogMessage',
    'FromUI_DownloadLogs',
    'FromUI_LearnMoreAboutStatus',
    'FromUI_CloseWindow',
    'FromUI_ElementSizeNotification'
];

export class RoutableWindowFactory implements IRoutableWindowFactory {
    constructor(private ipcMain: IpcMain, private viewController: IViewController) {

    }

    public getNewRoutableWindow(logger: ILogger): IRoutableWindow {
        return new RoutableWindow(logger, this.ipcMain, this.viewController);
    }
}

interface CallbackMap {
    titlebarMessage: IAsyncTitlebarMessage;
    cb: Function;
}

export class RoutableWindow implements IRoutableWindow, ITitlebarCommandWindow {
    private win: BrowserWindow | null;
    private routableWindowParameters: RoutableWindowParameters;
    private callbackMap: CallbackMap[] = new Array<CallbackMap>();
    private titlebarCommandProcessor: TitlebarCommandProcessor;

    constructor(
        private logger: ILogger,
        private ipcMain: IpcMain,
        private viewController: IViewController
    ) {
        validChannelsFromRenderer.forEach((channel: string) => {
            try {
                this.registerHandler(channel);
            }
            catch(e) {
            }
        });

        this.titlebarCommandProcessor = new TitlebarCommandProcessor(this, ipcMain);
    }

    public getWindowId(): string {
        return this.routableWindowParameters?.windowId;
    }

    private registerHandler(channel: string) {
        this.ipcMain.handle(channel, async (event, arg) => {
            try {
//                this.logger.logInfo(`ipcMain Handler: ${channel} - ${JSON.stringify(arg)}`);
                await this.routableWindowParameters?.me.onMessage(channel, arg?.data);
            }
            catch(e) {
            }
        });
    }

    public init(parameters: RoutableWindowParameters): Promise<void> {
        this.routableWindowParameters = parameters;
        return Promise.resolve();
    }

    public destroy(): Promise<void> {
        this.titlebarCommandProcessor.destroy();
        return Promise.resolve();
    }

    public async show(bounds: WindowBounds): Promise<void> {
        this.win = this.viewController.getBrowserWindow(
            bounds.size.x,
            bounds.size.y
        );

        if (this.win) {
            this.win.resizable = this.routableWindowParameters?.resizable;
            if (this.routableWindowParameters?.titlebar.canMoveWindow !== undefined)
                this.win.movable = this.routableWindowParameters?.titlebar.canMoveWindow;
        }

        await this.viewController.loadRoute(this.routableWindowParameters.leafRoute + '/' + 
            this.routableWindowParameters?.windowId,
            RoutableWindowTitleBarParameters2TitlebarOptions.toTitlebarParametersForPreload(this.routableWindowParameters));
    }

    public getCurrentWindowBounds(): Promise<WindowBounds> {
        if (!this.win)
            return Promise.reject('RoutableWindow.getCurrentWindowBounds(): No window.');

        const windowBounds = this.win.getBounds();
        return Promise.resolve({
            top: windowBounds.y,
            left: windowBounds.x,
            size: {
                x: windowBounds.width,
                y: windowBounds.height
            }
        });
    }
    
    public onTitlebarHeightInPxResponse(response: IAsyncTitlebarMessage) {
        for (let i = 0; i < this.callbackMap.length; i++) {
            if (this.callbackMap[i].titlebarMessage.windowId === response.windowId &&
                this.callbackMap[i].titlebarMessage.cookie === response.cookie) {
                this.callbackMap[i].cb(response.data);
                this.callbackMap.splice(i, 1);
                break;
            }
        }
    }

    private createCallbackMapEntry(windowId: string, cookie: string, cb: Function) {
        this.callbackMap.push({
            titlebarMessage: {
                windowId,
                cookie
            },
            cb: (data: any) => { cb(data) }
        });
    }

    public getTitlebarHeightInPx(): Promise<number> {
        return new Promise((resolve) => {
            const windowId = this.getWindowId();
            const cookie = '';
            this.createCallbackMapEntry(windowId, cookie, resolve);
            this.viewController.sendMessageToTitleBar('getTitlebarHeightInPx', {
                windowId: windowId,
                cookie: ''
            });
        });
    }
    
    public resize(bounds: WindowBounds): Promise<void> {
        if (!this.win)
            return Promise.reject('RoutableWindow.resize(): No window.');

        this.win.setBounds({
            x: bounds.left,
            y: bounds.top,
            width: bounds.size.x,
            height: bounds.size.y
        });

        return Promise.resolve();
    }

    public close(): Promise<void> {
        this.win?.close();
        return Promise.resolve();
    }

    public onTitlebarCommandClose(): void {
        this.close();
    }
}