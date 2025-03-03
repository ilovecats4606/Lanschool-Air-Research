"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElectronIpcMain = exports.ElectronSessionForCSPGenerator = exports.ElectronShell = void 0;
const electron_1 = require("electron");
class ElectronShell {
    async openExternal(path) {
        await electron_1.shell.openExternal(path);
    }
}
exports.ElectronShell = ElectronShell;
class ElectronSessionForCSPGenerator {
    sessionReady() {
        return (electron_1.session) ? true : false;
    }
    setHeaders(headerString) {
        electron_1.session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
            callback({
                responseHeaders: Object.assign(Object.assign({}, details.responseHeaders), { 'Content-Security-Policy': [headerString] })
            });
        });
    }
}
exports.ElectronSessionForCSPGenerator = ElectronSessionForCSPGenerator;
class ElectronIpcMain {
    handle(channel, listener) {
        electron_1.ipcMain.handle(channel, listener);
    }
    handleOnce(channel, listener) {
        electron_1.ipcMain.handleOnce(channel, listener);
    }
    on(channel, listener) {
        electron_1.ipcMain.on(channel, listener);
        return this;
    }
    once(channel, listener) {
        electron_1.ipcMain.once(channel, listener);
        return this;
    }
    removeAllListeners(channel) {
        electron_1.ipcMain.removeAllListeners(channel);
        return this;
    }
    removeHandler(channel) {
        electron_1.ipcMain.removeHandler(channel);
    }
    removeListener(channel, listener) {
        electron_1.ipcMain.removeListener(channel, listener);
        return this;
    }
    addListener(event, listener) {
        electron_1.ipcMain.addListener(event, listener);
        return this;
    }
    off(event, listener) {
        electron_1.ipcMain.off(event, listener);
        return this;
    }
    setMaxListeners(n) {
        electron_1.ipcMain.setMaxListeners(n);
        return this;
    }
    getMaxListeners() {
        return electron_1.ipcMain.getMaxListeners();
    }
    listeners(event) {
        return electron_1.ipcMain.listeners(event);
    }
    rawListeners(event) {
        return electron_1.ipcMain.rawListeners(event);
    }
    emit(event, ...args) {
        return electron_1.ipcMain.emit(event, args);
    }
    listenerCount(event) {
        return electron_1.ipcMain.listenerCount(event);
    }
    prependListener(event, listener) {
        electron_1.ipcMain.prependListener(event, listener);
        return this;
    }
    prependOnceListener(event, listener) {
        electron_1.ipcMain.prependOnceListener(event, listener);
        return this;
    }
    eventNames() {
        return electron_1.ipcMain.eventNames();
    }
}
exports.ElectronIpcMain = ElectronIpcMain;
//# sourceMappingURL=electronInterfaceImpl.js.map