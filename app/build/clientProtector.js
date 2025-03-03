"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientProtector = void 0;
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
const nativeClient_1 = require("./native/nativeClient");
const electron_1 = require("electron");
const fs = require("fs");
class ClientProtector {
    constructor() {
        this.watcher = null;
        this.logger = lsa_clients_common_1.LSAClient.getInstance().logger;
    }
    getMaliciousFilename() {
        return 'com.lenovo.lsair.Client.plist';
    }
    getWatchPath() {
        var _a;
        try {
            var path = (_a = electron_1.app.getPath('documents')) !== null && _a !== void 0 ? _a : '';
            if (path.length > 0) {
                return path + '/';
            }
        }
        catch (error) {
            this.logger.logError('clientProtector getWatchPath exception: ' + error);
        }
        return '';
    }
    fileExists(atPath) {
        return fs.existsSync(atPath);
    }
    deleteFile(atPath) {
        fs.unlinkSync(atPath);
    }
    findMaliciousFile(filepath) {
        var found = false;
        try {
            var path = this.getWatchPath();
            if (path.length > 0) {
                path += this.getMaliciousFilename();
                if (this.fileExists(path)) {
                    this.logger.logInfo('clientProtector found malicious file: ' + path);
                    found = true;
                }
            }
        }
        catch (error) {
            this.logger.logError('clientProtector findMaliciousFile exception: ' + error);
        }
        return found;
    }
    watchForMaliciousFiles() {
        let path = this.getWatchPath();
        try {
            if (this.fileExists(path)) {
                this.watcher = fs.watch(path, { recursive: false }, (event, trigger) => {
                    if (!trigger)
                        return;
                    if (event === 'rename' || event === 'change') {
                        let filePath = path + trigger;
                        if (trigger.endsWith(this.getMaliciousFilename()) && fs.existsSync(filePath)) {
                            this.deleteMaliciousFile(filePath);
                        }
                    }
                });
                this.logger.logInfo("clientProtector watching for filesystem changes at " + path);
            }
            else {
                this.logger.logError("clientProtector not protecting client because path doesn't exist: " + path);
            }
        }
        catch (error) {
            this.logger.logError("clientProtector watchForMaliciousFiles exception: " + error);
        }
    }
    deleteMaliciousFile(filePath) {
        let deleted = false;
        try {
            if (filePath.length > 0) {
                this.logger.logInfo('clientProtector deleteFile trying to delete: ' + filePath);
                this.deleteFile(filePath);
                deleted = true;
            }
        }
        catch (error) {
            this.logger.logError('clientProtector deleteFile exception: ' + error);
        }
        return deleted;
    }
    async protectClient() {
        let approved = await nativeClient_1.NativeClient.getInstance().readDeviceProperty('fullDiskAccessApproved');
        if (approved === 'true') {
            try {
                let path = this.getWatchPath() + this.getMaliciousFilename();
                if (this.findMaliciousFile(path)) {
                    {
                        this.deleteFile(path);
                    }
                }
            }
            catch (error) {
                this.logger.logInfo('clientProtector protectClient exception: ' + error);
            }
            this.watchForMaliciousFiles();
            this.logger.logInfo('clientProtector is protecting client');
        }
        else {
            this.logger.logInfo('clientProtector cannot proceed, full disk access NOT approved.');
        }
    }
    stopProtectingClient() {
        if (this.watcher) {
            this.watcher.close();
        }
    }
}
exports.ClientProtector = ClientProtector;
//# sourceMappingURL=clientProtector.js.map