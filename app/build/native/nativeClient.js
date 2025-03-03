"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NativeClient = void 0;
var nativeClient = require('bindings')('nativeClient');
class NativeClient {
    static getInstance() {
        if (!NativeClient.instance) {
            NativeClient.instance = new NativeClient();
        }
        return NativeClient.instance;
    }
    constructor() {
    }
    readStorage() {
        return new Promise((resolve, reject) => {
            try {
                nativeClient.readStorage((storageJson) => {
                    resolve(storageJson);
                });
            }
            catch (err) {
                reject(err);
            }
        });
    }
    writeStorage(str) {
        return new Promise((resolve, reject) => {
            try {
                nativeClient.writeStorage(str, () => {
                    resolve();
                });
            }
            catch (err) {
                reject(err);
            }
        });
    }
    writeLog(severity, msg) {
        return new Promise((resolve, reject) => {
            try {
                nativeClient.writeLog(severity, msg, () => {
                    resolve();
                });
            }
            catch (err) {
                reject(err);
            }
        });
    }
    initLimitWeb(browser) {
        return new Promise((resolve, reject) => {
            try {
                nativeClient.initLimitWeb(browser, () => {
                    resolve();
                });
            }
            catch (err) {
                reject(err);
            }
        });
    }
    readDeviceProperty(name) {
        return new Promise((resolve, reject) => {
            try {
                nativeClient.readDeviceProperty(name, (value) => {
                    resolve(value);
                });
            }
            catch (err) {
                reject(err);
            }
        });
    }
    updateClient(updatepath) {
        return new Promise((resolve, reject) => {
            try {
                nativeClient.updateClient(updatepath, () => {
                    resolve();
                });
            }
            catch (err) {
                reject(err);
            }
        });
    }
    isForegroundLogin() {
        return new Promise((resolve, reject) => {
            try {
                nativeClient.isForegroundLogin((value) => {
                    resolve(value ? true : false);
                });
            }
            catch (err) {
                reject(err);
            }
        });
    }
    startInputLimiting() {
        return new Promise((resolve, reject) => {
            try {
                nativeClient.startInputLimiting(() => {
                    resolve();
                });
            }
            catch (err) {
                reject(err);
            }
        });
    }
    stopInputLimiting() {
        return new Promise((resolve, reject) => {
            try {
                nativeClient.stopInputLimiting(() => {
                    resolve();
                });
            }
            catch (err) {
                reject(err);
            }
        });
    }
    getUserInfo(valueName) {
        return new Promise((resolve, reject) => {
            try {
                nativeClient.getUserInfo(valueName, (value) => {
                    resolve(value);
                });
            }
            catch (err) {
                reject(err);
            }
        });
    }
    writeProvisioningFiles(apiServer, orgId) {
        return new Promise((resolve, reject) => {
            try {
                nativeClient.writeProvisioningFiles(apiServer, orgId, () => {
                    resolve();
                });
            }
            catch (err) {
                reject(err);
            }
        });
    }
    getDefaultBrowser(protocol) {
        return new Promise((resolve, reject) => {
            try {
                nativeClient.getDefaultBrowser(protocol, (value) => {
                    resolve(value);
                });
            }
            catch (err) {
                reject(err);
            }
        });
    }
}
exports.NativeClient = NativeClient;
//# sourceMappingURL=nativeClient.js.map