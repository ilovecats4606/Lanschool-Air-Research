"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogWindow = void 0;
const electron_1 = require("electron");
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
class DialogWindow extends lsa_clients_common_1.CommonWindow {
    constructor(windowOptions, otherOptions = {}) {
        super();
        this.windowOptions = windowOptions;
        this.otherOptions = otherOptions;
        this.logger = lsa_clients_common_1.LSAClient.getInstance().logger;
    }
    get isWindowOpen() {
        var _a;
        return !(this === null || this === void 0 ? void 0 : this.w.isDestroyed()) && !((_a = this.w) === null || _a === void 0 ? void 0 : _a.isVisible());
    }
    ;
    getCurrentUrl() {
        var _a, _b;
        return (_b = (_a = this.w) === null || _a === void 0 ? void 0 : _a.webContents) === null || _b === void 0 ? void 0 : _b.getURL();
    }
    getWebContents() {
        var _a;
        return (_a = this.w) === null || _a === void 0 ? void 0 : _a.webContents;
    }
    loadWindow() {
        if (!this.w) {
            this.w = new electron_1.BrowserWindow(this.windowOptions);
            this.setupHandlers();
            this.w.setMenu(null);
        }
    }
    getBrowserWindow() {
        return this.w;
    }
    setFullscreen(setFullscreen) {
        this.w.setFullscreen(setFullscreen);
    }
    isFullscreen() {
        return this.w.fullScreen;
    }
    makeModal(...args) {
        var _a;
        const flag = (args === null || args === void 0 ? void 0 : args[0]) || true, level = (args === null || args === void 0 ? void 0 : args[1]) || 'normal', relativeLevel = (args === null || args === void 0 ? void 0 : args[2]) || 0;
        (_a = this.w) === null || _a === void 0 ? void 0 : _a.setAlwaysOnTop(flag, level, relativeLevel);
    }
    getBounds() {
        return this.w.getBounds();
    }
    setBounds(bounds) {
        return this.w.setBounds(bounds);
    }
    setSize(x, y) {
        return this.w.setSize(x, y);
    }
    setPosition(x, y) {
        return this.w.setPosition(x, y);
    }
    onWindowLoad(fnc) {
        this.handleEvent('ready-to-show', () => {
            fnc();
        });
    }
    onClosed(fnc) {
        var _a;
        (_a = this.w) === null || _a === void 0 ? void 0 : _a.on('closed', () => {
            fnc();
        });
    }
    onWindowMinimized(fnc) {
        this.handleEvent('minimized', fnc);
    }
    sendMessage(channel, message) {
        var _a, _b;
        if (message) {
            (_a = this.w) === null || _a === void 0 ? void 0 : _a.webContents.send(channel, message);
        }
        else {
            (_b = this.w) === null || _b === void 0 ? void 0 : _b.webContents.send(channel);
        }
    }
    close() {
        var _a;
        if (this.isWindowOpen) {
            (_a = this.w) === null || _a === void 0 ? void 0 : _a.webContents.send('closeWindow');
        }
    }
    convertPositionOptionToBounds() {
        var _a, _b;
        const primaryScreen = electron_1.screen.getPrimaryDisplay();
        let width = this.windowOptions.width || 800;
        let height = this.windowOptions.height || 600;
        let top = this.getBoundCoordinate((_a = this.windowOptions.position) === null || _a === void 0 ? void 0 : _a.vertical, primaryScreen.bounds.height, height, this.windowOptions.y);
        let left = this.getBoundCoordinate((_b = this.windowOptions.position) === null || _b === void 0 ? void 0 : _b.horizontal, primaryScreen.bounds.width, width, this.windowOptions.x);
        return {
            width: width,
            height: height,
            x: left,
            y: top
        };
    }
    onWindowNavigate(fnc) {
        var _a;
        (_a = this.w) === null || _a === void 0 ? void 0 : _a.on('will-navigate', () => {
            fnc();
        });
    }
    unmaximize() {
        this.w.unmaximize();
    }
    onWindowFinishLoad(func) {
        this.handleEvent('did-finish-load', func);
    }
    destroy() {
        this.w.destroy();
    }
    setupHandlers() {
        var _a, _b, _c, _d, _e, _f, _g;
        this.onWindowLoad(() => {
            const bounds = this.convertPositionOptionToBounds();
            this.setBounds(bounds);
        });
        this.onClosed(() => {
            this.w = null;
        });
        (_b = (_a = this.w) === null || _a === void 0 ? void 0 : _a.webContents) === null || _b === void 0 ? void 0 : _b.setWindowOpenHandler(() => {
            return { action: 'deny' };
        });
        if ((_c = this.otherOptions) === null || _c === void 0 ? void 0 : _c.finalUrl) {
            this.w.loadURL(this.otherOptions.finalUrl)
                .then(() => {
                var _a;
                (_a = this.logger) === null || _a === void 0 ? void 0 : _a.logInfo(this.otherOptions.finalUrl + ' is loaded');
            })
                .catch((e) => {
                var _a;
                (_a = this.logger) === null || _a === void 0 ? void 0 : _a.logError(e);
            });
        }
        if (this.otherOptions.preventClose) {
            this.w.on('close', (e) => {
                e.preventDefault();
            });
        }
        if (this.otherOptions.preventNavigate) {
            (_e = (_d = this.w) === null || _d === void 0 ? void 0 : _d.webContents) === null || _e === void 0 ? void 0 : _e.on('will-navigate', (e) => {
                e.preventDefault();
            });
        }
        if (this.otherOptions.preventSpecialCommands) {
            (_g = (_f = this.w) === null || _f === void 0 ? void 0 : _f.webContents) === null || _g === void 0 ? void 0 : _g.on('before-input-event', (event, input) => {
                if (input) {
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
        if (this.otherOptions.devTools) {
            this.w.webContents.openDevTools({ mode: 'detach' });
        }
    }
}
exports.DialogWindow = DialogWindow;
//# sourceMappingURL=dialogWindow.js.map