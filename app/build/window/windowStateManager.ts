import { 
    MainWindowController, 
    miniMeHeight, 
    miniMeWidth,
    windowMinWidth,
    windowMinHeight,
    windowMaxWidth,
    windowMaxHeight } 
    from "./mainWindow";
import { 
    frameSizeType, 
    frameState, 
    IMainWindowStateProperties, 
    MainWindowState, 
    MainWindowStateProperties, 
    ngRoute } 
    from "./windowStateProperties";

interface EncapsulatedPromise {
    p: Function;
    resolve: Function;
    reject: Function;
}

class PromiseQueueRunner {
    private queue = new Array<EncapsulatedPromise>();
    private _queueRunning = false;
    private _holdQueue = false;
    private queueSizeLimit = 1;

    public get queueSize() {
        return this.queue.length;
    }

    public get queueRunning() {
        return this._queueRunning;
    }
    
    private run(): void {
        this._queueRunning = true;
        if (this.queue.length > 0) {
            let callMe = this.queue[0];
            if (callMe) {
                callMe.p()
                .then(() => {
                    this.queue.shift();
                    callMe.resolve();
                    this.run();
                })
                .catch((err: any) => {
                    this.queue.shift();
                    callMe.reject(err);
                    this.run();
                });
            }
        }
        else {
            this._queueRunning = false;
            this.releaseQueue();
        }
    }

    public enqueue(p: Function, resolve: Function, reject: Function) {
        if (this._holdQueue ||
            this.queueSize >= this.queueSizeLimit) {
            resolve();
            return;
        }

        this.queue.push({
            p: p,
            resolve: resolve,
            reject: reject
        });

        if (!this._queueRunning) {
            this.run();
        }
    }

    public holdQueue() {
        // Don't queue anything new until we're told to release the queue.
        // Any new items will automatically run the resolve.
        this._holdQueue = true;
    }

    public releaseQueue() {
        this._holdQueue = false;
    }
}

export class WindowStateManager {
    private mainWindowController: MainWindowController;
    private currentWindowState: MainWindowState;

    private stateCheckerQueue = new PromiseQueueRunner();

    constructor(_mainWindowController: MainWindowController) {
        this.currentWindowState = MainWindowState.Normal;
        this.mainWindowController = _mainWindowController;
    }

    private get mainWindowStateProperties() {
        const props: IMainWindowStateProperties = {
            frameState: this.currentFrameState,
            titleBarVisible: this.titleBarVisible,
            route: this.currentRoute,
            forcedSize: this.currentlyForcedSize,
            frameSizeType: this.currentFrameSizeType
        };

        return props;
    }

    // Current route
    private get currentRoute(): ngRoute {
        const currentURL = this.mainWindowController.getUIViewCurrentRoute();
        if (currentURL?.includes('speaker-audio')) {
            return 'speaker-audio';
        }

        return 'chat';
    }

    // Current frame state
    private get currentFrameState(): frameState {
        if (this.mainWindowController.isWindowFrameNormal()) {
            return 'normal';
        }

        if (this.mainWindowController.isWindowFrameMinimized()) {
            return 'minimized';
        }

        if (this.mainWindowController.isWindowMaximized()) {
            return 'maximized';
        }

        if (this.mainWindowController.isWindowFrameFullScreen()) {
            return 'fullScreen';
        }

        return 'unknown';
    }

    public getCurrentFrameState(): Promise<frameState> {
        return Promise.resolve(this.currentFrameState);
    }

    // Forced size
    private get currentlyForcedSize(): boolean {
        const winMinSize = this.mainWindowController.getWindowMinimumSize();
        const winMaxSize = this.mainWindowController.getWindowMaximumSize();

        if (!Array.isArray(winMinSize) || !Array.isArray(winMaxSize) ||
            winMinSize.length !== 2 || winMaxSize.length !== 2) {

            throw new Error('WindowStateManager.currentlyForcedSize(): Size arrays non-compliant.');
        }

        return (winMaxSize[0] > 0 && 
                winMaxSize[1] > 0 && 
                winMinSize[0] === winMaxSize[0] && 
                winMaxSize[1] === winMaxSize[1]);
    }

    public getCurrentlyForcedSize(): Promise<boolean> {
        return Promise.resolve(this.currentlyForcedSize);
    }

    // Current title bar visibility
    private get titleBarVisible(): boolean {
        return this.mainWindowController.isTitleBarVisible();
    }

    public getTitleBarVisibility(): Promise<boolean> {
        return Promise.resolve(this.titleBarVisible);
    }

    // Current frame size type
    private get currentFrameSizeType(): frameSizeType {
        const bounds = this.mainWindowController.getWindowBounds();
        if (bounds?.width === miniMeWidth && bounds?.height === miniMeHeight) {
            return 'mini-me';
        }

        if (this.mainWindowController.isWindowFrameFullScreen()) {
            return 'fullScreen';
        }

        return 'normal';
    }

    public getCurrentFrameSizeType(): Promise<frameSizeType> {
        return Promise.resolve(this.currentFrameSizeType);
    }

    // Check to determine if in mini-me mode
    public isInMiniMeMode(): Promise<boolean> {
        return Promise.resolve(MainWindowStateProperties.isMiniMe(this.mainWindowStateProperties));
    }

    public getMainWindowState(): Promise<MainWindowState> {
        return Promise.resolve(this.currentWindowState);
    }

    public myConsoleLog(msg: string) {
        this.mainWindowController.myConsoleLog(msg);
    }

    private async alignRoute(props: IMainWindowStateProperties, i: number) {
        // Route
        if (this.currentRoute !== props.route) {
            this.myConsoleLog('(' + i + ') route DOES NOT match.');
            await this.mainWindowController.loadRoute(props.route);
        }
        else {
            this.myConsoleLog('(' + i + ') route matches.');
        }
    }

    private async alignFrameState(props: IMainWindowStateProperties, i: number) {
        // Frame state
        if (this.currentFrameState !== props.frameState) {
            this.myConsoleLog('(' + i + ') currentFrameState DOES NOT match.');
            await this.setFrameState(props.frameState);
        }
        else {
            this.myConsoleLog('(' + i + ') currentFrameState matches.');
        }
    }

    private async alignFrameSize(props: IMainWindowStateProperties, i: number) {
        // Frame size
        if (this.currentFrameSizeType !== props.frameSizeType) {
            this.myConsoleLog('(' + i + ') currentFrameSizeType DOES NOT match.');
            await this.setFrameSizeProperty(props.frameSizeType);
        }
        else {
            this.myConsoleLog('(' + i + ') currentFrameSizeType matches.');
        }
    }

    private async alignForcedSize(props: IMainWindowStateProperties, i: number) {
        // Forced Size (must come after setting the frame size)
        if (this.currentlyForcedSize !== props.forcedSize) {
            this.myConsoleLog('(' + i + ') forced size DOES NOT match.');
            const windowBounds = this.mainWindowController.getWindowBounds();
            await this.setForcedSize(props.forcedSize, windowBounds.width, windowBounds.height);
        }
        else {
            this.myConsoleLog('(' + i + ') forced size matches.');
        }
    }

    private async alignTitlebar(props: IMainWindowStateProperties, i: number) {
        // Titlebar
        if (this.titleBarVisible !== props.titleBarVisible) {
            this.myConsoleLog('(' + i + ') titleBarVisible DOES NOT match.');
            await this.setTitlebarVisible(props.titleBarVisible);
        }
        else {
            this.myConsoleLog('(' + i + ') titleBarVisible matches.');
        }
    }

    private _enqueueStateAdoption(state: MainWindowState): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                const props = MainWindowStateProperties.fromStateEnum(state);
                let i = 0;

                await this.alignRoute(props, ++i);

                if (this.currentlyForcedSize) {
                    this.myConsoleLog('_enqueueStateAdoption(): we are currently forced size');
                    await this.alignForcedSize(props, ++i);
                    await this.alignFrameState(props, ++i);
                    await this.alignFrameSize(props, ++i);
                }
                else {
                    this.myConsoleLog('_enqueueStateAdoption(): we are currently NOT forced size');
                    await this.alignFrameState(props, ++i);
                    await this.alignFrameSize(props, ++i);
                    await this.alignForcedSize(props, ++i);
                }

                await this.alignTitlebar(props, ++i);

                this.currentWindowState = state;
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
    }

    private holdQueue() {
        this.myConsoleLog('WindowStatemanager.holdQueue (+)');
        this.stateCheckerQueue.holdQueue();
    }

    private releaseQueue() {
        this.myConsoleLog('WindowStatemanager.releaseQueue (+)');
        this.stateCheckerQueue.releaseQueue();
    }

    public adoptState(state: MainWindowState, onSuccess: Function, onError: Function) {
        this.myConsoleLog('Queueing. Queue size is currently ' + this.stateCheckerQueue.queueSize +
            ' and queue is ' + (this.stateCheckerQueue.queueRunning ? 'RUNNING' : 'STOPPED'));

        this.stateCheckerQueue.enqueue(() => this._enqueueStateAdoption(state), 
            () => { 
                if (onSuccess) {
                    onSuccess();
                }
            }, 
            (err: any) => { 
                if (onError) {
                    onError(err);
                }
            });
    }

    private getPrimaryDisplayWorkArea(): Electron.Rectangle {
        return this.mainWindowController.getPrimaryDisplayWorkArea();
    }
    
    private setFrameSizeProperty(fSizeType: frameSizeType): Promise<void> {
        return new Promise((resolve, reject) => {
            let windowBoundsRect = this.mainWindowController.chatWindowRectBoundsNormal;
            if (fSizeType === 'mini-me' && this.currentFrameSizeType !== 'mini-me') {
                const primaryDisplayBounds = this.getPrimaryDisplayWorkArea();
                this.mainWindowController.setWindowBounds({
                    x: primaryDisplayBounds.width - miniMeWidth, 
                    y: primaryDisplayBounds.height - miniMeHeight,
                    width: miniMeWidth,
                    height: miniMeHeight
                });
            }
            else if (fSizeType === 'fullScreen') {
                this.mainWindowController.setFullScreen(true);
            }
            else {

                this.mainWindowController.setWindowMinimumSize(windowMinWidth, windowMinWidth);
                this.mainWindowController.setWindowMaximumSize(windowMaxWidth, windowMaxHeight);
                this.mainWindowController.setWindowBounds(windowBoundsRect); 
            }
            
            this._checkWait( () => { return this.currentFrameSizeType }, fSizeType, resolve, reject, 10);
        });
    }

    private async setTitlebarVisible(visible: boolean) {
        if (visible === true) {
            await this.mainWindowController.showTitleBar();
        }
        else {
            await this.mainWindowController.hideTitleBar();
        }
    }

    private setFrameState(s: frameState): Promise<void> {
        let skipCheckWait = false;
        return new Promise((resolve, reject) => {
            let acceptableState = new Array<frameState>();
            this.myConsoleLog('setFrameState trying to go to ' + s);
            acceptableState.push(s);
            switch (s) {
                case 'maximized': {
                    this.mainWindowController.maximize();
                    break;
                }
                case 'minimized': {
                    this.mainWindowController.minimize();
                    break;
                }
                case 'normal': {
                    const current = this.currentFrameState;
                    this.myConsoleLog('WindowStateManager.setFrameState(): Seeking normalcy... Current frame state: ' + current);
                    if (current === 'maximized') {
                        this.mainWindowController.unmaximize();
                    }
                    else if (current === 'minimized') {
                        this.mainWindowController.restore();
                    }
                    else if (current === 'fullScreen') {
                        this.mainWindowController.setFullScreen(false);
                        acceptableState.push('maximized');
                    }
                    break;
                }
                case 'fullScreen': {
                    if (this.currentFrameState !== 'normal') {
                        // Don't queue new actions while we adjust the frame state ourselves.
                        // We need to hold the queue because Electron will automatically send us an
                        // 'onRestore' event that will get queued and cause us to go back to a 'normal state'
                        this.holdQueue();
                        this.setFrameState('normal')
                        .then(() => {
                            this.releaseQueue();    // Allow new states to be queued again
                            this.myConsoleLog('WindowStateManager.setFrameState(): Minimize => Normal completed.');
                            this.setFrameState('fullScreen');
                        });

                        skipCheckWait = true;
                    }
                    else {
                        this.mainWindowController.setFullScreen(true);
                    }
                }
                break;
            }
            
            if (!skipCheckWait) {
                this.myConsoleLog('WindowStateManager.setFrameState(): Calling _checkWait ' +
                    this.currentFrameState + ' vs. ' + s);
                this._checkWait(() => { return this.currentFrameState }, acceptableState, resolve, reject, 10);
            }
            else {
                this.myConsoleLog('WindowStateManager.setFrameState(): Skipping _checkWait');
                resolve();
            }
        });
    }

    private setForcedSize(forcedSize: boolean, forcedWidth?: number, forcedHeight?: number): Promise<void> {
        return new Promise((resolve, reject) => {
            if (forcedSize === false) {
                this.mainWindowController.setWindowMinimumSize(windowMinWidth, windowMinHeight);
                this.mainWindowController.setWindowMaximumSize(windowMaxWidth, windowMaxHeight);
            } 
            else {
                if (!forcedWidth || !forcedHeight) {
                    throw new Error('WindowStateManager.setForcedSize(): Width or height not specified.');
                }

                this.mainWindowController.setWindowMinimumSize(forcedWidth, forcedHeight);
                this.mainWindowController.setWindowMaximumSize(forcedWidth, forcedHeight);
            }

            this._checkWait( () => { return this.currentlyForcedSize }, forcedSize, resolve, reject, 10);
        });
    }

    private _checkWait(compare: Function, compareAgainst: any, resolve: Function, reject: Function, retry: number) {
        if (retry <= 0) {
            this.myConsoleLog('FAILED to set state to \'' + compareAgainst + '\'. Current state is \'' + compare() + '\'');
            resolve();
            return;
        }

        if (Array.isArray(compareAgainst)) {
            for (let i = 0; i < compareAgainst.length; i++) {
                if (compare() === compareAgainst[i]) {
                    resolve();
                    return;
                }
            }
        }
        else {
            if (compare() === compareAgainst) {
                resolve();
                return;
            }
        }

        setTimeout(() => {
            this._checkWait(compare, compareAgainst, resolve, reject, --retry);
        }, 100);
    }
}

    
