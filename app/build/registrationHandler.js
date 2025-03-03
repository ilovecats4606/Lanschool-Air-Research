"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationHandler = void 0;
const logFileWriter_1 = require("./logFileWriter");
const electron_1 = require("electron");
class RegistrationHandler {
    constructor(storage, clientLogger, mainWindow, autoUpdate, logExporter) {
        this.storage = storage;
        this.clientLogger = clientLogger;
        this.mainWindow = mainWindow;
        this.autoUpdate = autoUpdate;
        this.logExporter = logExporter;
        if (process.platform === 'win32') {
            this.logFileWriter = new logFileWriter_1.LogFileWriter(logExporter, { fileDir: electron_1.app.getPath('temp'), filenamePrefix: 'LSAClientProv' });
        }
    }
    getOrgId(onComplete, iterations = 10) {
        if (iterations <= 0) {
            onComplete('');
            return;
        }
        let provisioningData = this.storage.loadProvisioningData();
        if (!provisioningData ||
            provisioningData.orgId.length === 0) {
            setTimeout(() => {
                this.getOrgId(onComplete, --iterations);
            }, 100);
        }
        else {
            onComplete(provisioningData.orgId);
        }
    }
    onProvisionedStatus(provisioned) {
        this.onProvisionedStatusPromise(provisioned);
    }
    onProvisionedStatusPromise(provisioned) {
        return new Promise((resolve, reject) => {
            this.clientLogger.logInfo('onProvisionedStatus notification: ' + provisioned);
            if (!provisioned) {
                resolve();
            }
            const apiServer = this.storage.loadAPIServer();
            this.getOrgId((orgId) => {
                if (orgId.length > 0) {
                    this.mainWindow.sendToUI('UI_SetState', {
                        state: {
                            provisioningData: {
                                apiServer: apiServer,
                                orgId: orgId
                            }
                        }
                    });
                    resolve();
                }
                else {
                    this.clientLogger.logError('RegistrationHandler.onProvisionedStatus(): Could not retrieve org ID.');
                    reject();
                }
            });
        });
    }
    onTokenStatus(validToken, error) {
        var _a;
        this.clientLogger.logInfo('onTokenStatus  validToken=' + validToken);
        if (validToken) {
            this.storage.saveForceReprovision(false);
            if (this.autoUpdate) {
                (_a = this.autoUpdate) === null || _a === void 0 ? void 0 : _a.start();
            }
            else {
                this.clientLogger.logInfo('autoUpdate object does not exist');
            }
        }
    }
    onCatchAllProvisioning() {
        var _a;
        this.clientLogger.logInfo('onCatchAllProvisioning  notification!');
        (_a = this.logFileWriter) === null || _a === void 0 ? void 0 : _a.writeLog();
    }
    onProvisioningAttempted() {
        var _a;
        this.clientLogger.logInfo('onProvisioningAttempted  logging provisioning attempt');
        (_a = this.logFileWriter) === null || _a === void 0 ? void 0 : _a.writeLog();
    }
}
exports.RegistrationHandler = RegistrationHandler;
//# sourceMappingURL=registrationHandler.js.map