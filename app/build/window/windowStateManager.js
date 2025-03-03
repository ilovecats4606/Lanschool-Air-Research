"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindowStateManager = void 0;
const mainWindow_1 = require("./mainWindow");
const windowStateProperties_1 = require("./windowStateProperties");
class PromiseQueueRunner {
    constructor() {
        this.queue = new Array();
        this._queueRunning = false;
        this._holdQueue = false;
        this.queueSizeLimit = 1;
    }
    get queueSize() {
        return this.queue.length;
    }
    get queueRunning() {
        return this._queueRunning;
    }
    run() {
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
                    .catch((err) => {
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
    enqueue(p, resolve, reject) {
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
    holdQueue() {
        this._holdQueue = true;
    }
    releaseQueue() {
        this._holdQueue = false;
    }
}
class WindowStateManager {
    constructor(_mainWindowController) {
        this.stateCheckerQueue = new PromiseQueueRunner();
        this.currentWindowState = windowStateProperties_1.MainWindowState.Normal;
        this.mainWindowController = _mainWindowController;
    }
    get mainWindowStateProperties() {
        const props = {
            frameState: this.currentFrameState,
            titleBarVisible: this.titleBarVisible,
            route: this.currentRoute,
            forcedSize: this.currentlyForcedSize,
            frameSizeType: this.currentFrameSizeType
        };
        return props;
    }
    get currentRoute() {
        const currentURL = this.mainWindowController.getUIViewCurrentRoute();
        if (currentURL === null || currentURL === void 0 ? void 0 : currentURL.includes('speaker-audio')) {
            return 'speaker-audio';
        }
        return 'chat';
    }
    get currentFrameState() {
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
    getCurrentFrameState() {
        return Promise.resolve(this.currentFrameState);
    }
    get currentlyForcedSize() {
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
    getCurrentlyForcedSize() {
        return Promise.resolve(this.currentlyForcedSize);
    }
    get titleBarVisible() {
        return this.mainWindowController.isTitleBarVisible();
    }
    getTitleBarVisibility() {
        return Promise.resolve(this.titleBarVisible);
    }
    get currentFrameSizeType() {
        const bounds = this.mainWindowController.getWindowBounds();
        if ((bounds === null || bounds === void 0 ? void 0 : bounds.width) === mainWindow_1.miniMeWidth && (bounds === null || bounds === void 0 ? void 0 : bounds.height) === mainWindow_1.miniMeHeight) {
            return 'mini-me';
        }
        if (this.mainWindowController.isWindowFrameFullScreen()) {
            return 'fullScreen';
        }
        return 'normal';
    }
    getCurrentFrameSizeType() {
        return Promise.resolve(this.currentFrameSizeType);
    }
    isInMiniMeMode() {
        return Promise.resolve(windowStateProperties_1.MainWindowStateProperties.isMiniMe(this.mainWindowStateProperties));
    }
    getMainWindowState() {
        return Promise.resolve(this.currentWindowState);
    }
    myConsoleLog(msg) {
        this.mainWindowController.myConsoleLog(msg);
    }
    async alignRoute(props, i) {
        if (this.currentRoute !== props.route) {
            this.myConsoleLog('(' + i + ') route DOES NOT match.');
            await this.mainWindowController.loadRoute(props.route);
        }
        else {
            this.myConsoleLog('(' + i + ') route matches.');
        }
    }
    async alignFrameState(props, i) {
        if (this.currentFrameState !== props.frameState) {
            this.myConsoleLog('(' + i + ') currentFrameState DOES NOT match.');
            await this.setFrameState(props.frameState);
        }
        else {
            this.myConsoleLog('(' + i + ') currentFrameState matches.');
        }
    }
    async alignFrameSize(props, i) {
        if (this.currentFrameSizeType !== props.frameSizeType) {
            this.myConsoleLog('(' + i + ') currentFrameSizeType DOES NOT match.');
            await this.setFrameSizeProperty(props.frameSizeType);
        }
        else {
            this.myConsoleLog('(' + i + ') currentFrameSizeType matches.');
        }
    }
    async alignForcedSize(props, i) {
        if (this.currentlyForcedSize !== props.forcedSize) {
            this.myConsoleLog('(' + i + ') forced size DOES NOT match.');
            const windowBounds = this.mainWindowController.getWindowBounds();
            await this.setForcedSize(props.forcedSize, windowBounds.width, windowBounds.height);
        }
        else {
            this.myConsoleLog('(' + i + ') forced size matches.');
        }
    }
    async alignTitlebar(props, i) {
        if (this.titleBarVisible !== props.titleBarVisible) {
            this.myConsoleLog('(' + i + ') titleBarVisible DOES NOT match.');
            await this.setTitlebarVisible(props.titleBarVisible);
        }
        else {
            this.myConsoleLog('(' + i + ') titleBarVisible matches.');
        }
    }
    _enqueueStateAdoption(state) {
        return new Promise(async (resolve, reject) => {
            try {
                const props = windowStateProperties_1.MainWindowStateProperties.fromStateEnum(state);
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
    holdQueue() {
        this.myConsoleLog('WindowStatemanager.holdQueue (+)');
        this.stateCheckerQueue.holdQueue();
    }
    releaseQueue() {
        this.myConsoleLog('WindowStatemanager.releaseQueue (+)');
        this.stateCheckerQueue.releaseQueue();
    }
    adoptState(state, onSuccess, onError) {
        this.myConsoleLog('Queueing. Queue size is currently ' + this.stateCheckerQueue.queueSize +
            ' and queue is ' + (this.stateCheckerQueue.queueRunning ? 'RUNNING' : 'STOPPED'));
        this.stateCheckerQueue.enqueue(() => this._enqueueStateAdoption(state), () => {
            if (onSuccess) {
                onSuccess();
            }
        }, (err) => {
            if (onError) {
                onError(err);
            }
        });
    }
    getPrimaryDisplayWorkArea() {
        return this.mainWindowController.getPrimaryDisplayWorkArea();
    }
    setFrameSizeProperty(fSizeType) {
        return new Promise((resolve, reject) => {
            let windowBoundsRect = this.mainWindowController.chatWindowRectBoundsNormal;
            if (fSizeType === 'mini-me' && this.currentFrameSizeType !== 'mini-me') {
                const primaryDisplayBounds = this.getPrimaryDisplayWorkArea();
                this.mainWindowController.setWindowBounds({
                    x: primaryDisplayBounds.width - mainWindow_1.miniMeWidth,
                    y: primaryDisplayBounds.height - mainWindow_1.miniMeHeight,
                    width: mainWindow_1.miniMeWidth,
                    height: mainWindow_1.miniMeHeight
                });
            }
            else if (fSizeType === 'fullScreen') {
                this.mainWindowController.setFullScreen(true);
            }
            else {
                this.mainWindowController.setWindowMinimumSize(mainWindow_1.windowMinWidth, mainWindow_1.windowMinWidth);
                this.mainWindowController.setWindowMaximumSize(mainWindow_1.windowMaxWidth, mainWindow_1.windowMaxHeight);
                this.mainWindowController.setWindowBounds(windowBoundsRect);
            }
            this._checkWait(() => { return this.currentFrameSizeType; }, fSizeType, resolve, reject, 10);
        });
    }
    async setTitlebarVisible(visible) {
        if (visible === true) {
            await this.mainWindowController.showTitleBar();
        }
        else {
            await this.mainWindowController.hideTitleBar();
        }
    }
    setFrameState(s) {
        let skipCheckWait = false;
        return new Promise((resolve, reject) => {
            let acceptableState = new Array();
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
                case 'fullScreen':
                    {
                        if (this.currentFrameState !== 'normal') {
                            this.holdQueue();
                            this.setFrameState('normal')
                                .then(() => {
                                this.releaseQueue();
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
                this._checkWait(() => { return this.currentFrameState; }, acceptableState, resolve, reject, 10);
            }
            else {
                this.myConsoleLog('WindowStateManager.setFrameState(): Skipping _checkWait');
                resolve();
            }
        });
    }
    setForcedSize(forcedSize, forcedWidth, forcedHeight) {
        return new Promise((resolve, reject) => {
            if (forcedSize === false) {
                this.mainWindowController.setWindowMinimumSize(mainWindow_1.windowMinWidth, mainWindow_1.windowMinHeight);
                this.mainWindowController.setWindowMaximumSize(mainWindow_1.windowMaxWidth, mainWindow_1.windowMaxHeight);
            }
            else {
                if (!forcedWidth || !forcedHeight) {
                    throw new Error('WindowStateManager.setForcedSize(): Width or height not specified.');
                }
                this.mainWindowController.setWindowMinimumSize(forcedWidth, forcedHeight);
                this.mainWindowController.setWindowMaximumSize(forcedWidth, forcedHeight);
            }
            this._checkWait(() => { return this.currentlyForcedSize; }, forcedSize, resolve, reject, 10);
        });
    }
    _checkWait(compare, compareAgainst, resolve, reject, retry) {
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
exports.WindowStateManager = WindowStateManager;
//# sourceMappingURL=windowStateManager.js.map