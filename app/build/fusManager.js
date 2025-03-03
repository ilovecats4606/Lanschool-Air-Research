"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FUSManager_Mac = exports.FUSManager = void 0;
const nativeClient_1 = require("./native/nativeClient");
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
const electron_1 = require("electron");
const fs = require("fs");
class FUSManager {
    constructor() {
        this.impl = null;
        if (process.platform === 'darwin') {
            this.impl = new FUSManager_Mac();
        }
    }
    init() {
        if (this.impl) {
            this.impl.init();
        }
    }
    async isForegroundLogin() {
        if (this.impl) {
            return this.impl.isForegroundLogin();
        }
        return true;
    }
}
exports.FUSManager = FUSManager;
class FUSManager_Mac {
    constructor() {
        this.currentUserId = '';
        this.foregroundLogin = true;
    }
    getWatchPath() {
        return '/dev/console';
    }
    async init() {
        this.currentUserId = await this.getUserId();
        this.foregroundLogin = await this.isForegroundLogin();
        this.startWatchingFile();
    }
    async startWatchingFile() {
        fs.watchFile(this.getWatchPath(), (currStats, prevStats) => {
            let changed = false;
            if (currStats.hasOwnProperty('uid') &&
                prevStats.hasOwnProperty('uid')) {
                changed = currStats.uid != prevStats.uid;
            }
            if (changed) {
                let consoleOwner = currStats.uid.toString();
                lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('console owner changed to ' + consoleOwner);
                if (!(consoleOwner === '0')) {
                    if (consoleOwner === this.currentUserId &&
                        !this.foregroundLogin) {
                        this.onLoginMovedToForeground(consoleOwner);
                    }
                    else if (consoleOwner !== this.currentUserId &&
                        this.foregroundLogin) {
                        this.onLoginMovedToBackground(consoleOwner);
                    }
                }
            }
        });
    }
    onLoginMovedToForeground(loggedInUserId) {
        lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('Restarting because login moved to foreground for uid ' +
            this.currentUserId +
            ' versus (' +
            loggedInUserId +
            ')');
        electron_1.app.exit(0);
    }
    onLoginMovedToBackground(loggedInUserId) {
        lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('Restarting because login moved to BACKGROUND for uid ' +
            this.currentUserId +
            ' versus (' +
            loggedInUserId +
            ')');
        electron_1.app.exit(0);
    }
    async isForegroundLogin() {
        return nativeClient_1.NativeClient.getInstance().isForegroundLogin();
    }
    async getUserId() {
        return await nativeClient_1.NativeClient.getInstance().readDeviceProperty('UID');
    }
}
exports.FUSManager_Mac = FUSManager_Mac;
//# sourceMappingURL=fusManager.js.map