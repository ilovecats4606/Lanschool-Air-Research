"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Storage = void 0;
const fs_1 = require("fs");
const electron_1 = require("electron");
const fsSync = __importStar(require("fs"));
const logSeverity_1 = require("../logSeverity");
const userInfoWindows_1 = require("../win/userInfoWindows");
const path = __importStar(require("path"));
class StorageModel {
    constructor() {
        this.apiServer = null;
        this.provisioningCode = null;
        this.hotProvisioningCode = null;
        this.provisioningData = null;
        this.provisioningParams = null;
        this.token = null;
        this.privateKey = null;
        this.publicKey = null;
        this.initialAutoUpdateMinutes = 0;
        this.lastAutoUpdateCheck = null;
        this.deviceType = null;
        this.osType = null;
        this.osVersion = null;
        this.displayName = null;
        this.loginName = null;
        this.forceReprovision = false;
    }
}
class StorageImpl_Generic {
    constructor() {
        this.filePath = (process.env.TEST_FILEPATH || '.') + '/test.json';
        this.logLocation = ((process.env.TEST_FILEPATH || '.')) + '/logs.log';
    }
    async init() {
        let s = new StorageModel();
        try {
            const found = fsSync.existsSync(this.filePath);
            if (found) {
                try {
                    const buff = await fs_1.promises.readFile(this.filePath, 'utf8');
                    if (buff) {
                        const str = buff.toString();
                        if (str.length > 0) {
                            try {
                                s = JSON.parse(str);
                            }
                            catch (err) {
                                console.error('Opened storage file but failed to parse ', this.filePath);
                            }
                        }
                    }
                }
                catch (err) {
                    console.error('Error reading file: ', err);
                }
            }
            else {
                await this.writeStorage(s);
            }
        }
        catch (err) {
            console.error('Error in storage.init(): ', err);
            return Promise.reject(err);
        }
        await populateUserInfoOnWindows(s);
        return s;
    }
    async writeStorage(s) {
        const str = JSON.stringify(s);
        await fs_1.promises.writeFile(this.filePath, str);
    }
    writeLog(severity, msg) {
        switch (severity) {
            case logSeverity_1.LogSeverity.DEBUG: {
                this.writeTestLog(severity, msg);
                console.debug(msg);
                break;
            }
            case logSeverity_1.LogSeverity.INFO: {
                this.writeTestLog(severity, msg);
                console.log(msg);
                break;
            }
            case logSeverity_1.LogSeverity.WARNING: {
                this.writeTestLog(severity, msg);
                console.warn(msg);
                break;
            }
            case logSeverity_1.LogSeverity.ERROR: {
                this.writeTestLog(severity, msg);
                console.error(msg);
                break;
            }
        }
        return Promise.resolve();
    }
    writeTestLog(severity, msg) {
        if (process.env.TEST_FILEPATH) {
            fsSync.appendFileSync(this.logLocation, `${msg}\n`, (err) => {
                console.log('err', err);
            });
        }
    }
}
class StorageImpl_Platform {
    constructor(_nativeClient) {
        this.nativeClient = _nativeClient;
    }
    async init() {
        let s = new StorageModel();
        try {
            let storageJson = await this.nativeClient.readStorage();
            if (!storageJson || storageJson.length == 0) {
                storageJson = '{}';
            }
            s = JSON.parse(storageJson);
        }
        catch (err) {
            console.error("StorageImpl_Platform.init() blew up: ", err);
            return Promise.reject(err);
        }
        return s;
    }
    async writeStorage(s) {
        try {
            const str = JSON.stringify(s);
            await this.nativeClient.writeStorage(str);
            return Promise.resolve();
        }
        catch (err) {
            console.log("StorageImpl_Platform.writeStorage() blew up: ", err);
            return Promise.reject();
        }
    }
    async writeLog(severity, msg) {
        if (process.platform === 'win32')
            return Promise.resolve();
        try {
            await this.nativeClient.writeLog(severity, msg);
        }
        catch (err) {
            return Promise.reject();
        }
    }
}
class Storage {
    constructor(_nativeClient) {
        this.s = new StorageModel();
        this.persistence = null;
        this.deviceId = '';
        this.deviceName = '';
        this.deviceType = '';
        this.osType = '';
        this.osVersion = '';
        this.nativeClient = _nativeClient;
    }
    async logDebug(severity, logThis) {
        if (this.persistence === null) {
            return;
        }
        try {
            await this.persistence.writeLog(severity, logThis);
        }
        catch (err) {
        }
    }
    async fixMissingProvisioning() {
        if (process.platform === 'win32') {
            var env = process.env;
            let profPath = env.ALLUSERSPROFILE || '';
            profPath = path.join(profPath, 'LenovoSoftware', 'LanSchoolAir', 'bootstrap_bu.json');
            const found = fsSync.existsSync(profPath);
            if (found) {
                try {
                    const buff = await fs_1.promises.readFile(profPath, 'utf8');
                    if (buff) {
                        const str = buff.toString();
                        if (str.length > 0) {
                            try {
                                const s = JSON.parse(str);
                                this.s.provisioningCode = s.org_provisioning_code.Value;
                                this.s.apiServer = s.api_server.Value;
                                this.logDebug(logSeverity_1.LogSeverity.INFO, "fixMissingProvisioning: loaded the backup data: " + str);
                                this.logDebug(logSeverity_1.LogSeverity.INFO, "fixMissingProvisioning: updated provisioning code: " + this.s.provisioningCode);
                                this.logDebug(logSeverity_1.LogSeverity.INFO, "fixMissingProvisioning: updated api server: " + this.s.apiServer);
                            }
                            catch (err) {
                                this.logDebug(logSeverity_1.LogSeverity.INFO, "fixMissingProvisioning - failed to parse bootstrap backup");
                            }
                        }
                    }
                }
                catch (err) {
                    this.logDebug(logSeverity_1.LogSeverity.INFO, "fixMissingProvisioning - unable to read backup file");
                }
            }
            else {
                this.logDebug(logSeverity_1.LogSeverity.INFO, "No backup provisioning data found");
            }
        }
        return;
    }
    async init() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        if (this.persistence !== null) {
            return;
        }
        this.persistence = new StorageImpl_Platform(this.nativeClient);
        try {
            this.s = await this.persistence.init();
            if (!this.s.provisioningCode || !this.s.apiServer) {
                this.logDebug(logSeverity_1.LogSeverity.INFO, "No provisioning information found in settings - attempting to load bootstrap backup");
                await this.fixMissingProvisioning();
            }
            this.deviceId = await this.nativeClient.readDeviceProperty('deviceId');
            this.deviceName = await this.nativeClient.readDeviceProperty('deviceName');
            this.deviceType = await this.nativeClient.readDeviceProperty('deviceType');
            this.osType = await this.nativeClient.readDeviceProperty('osType');
            this.osVersion = await this.nativeClient.readDeviceProperty('osVersion');
            this.s.displayName = await this.nativeClient.getUserInfo('studentName');
            this.s.loginName = await this.nativeClient.getUserInfo('loginName');
            await populateUserInfoOnWindows(this.s);
            this.logDeviceProperties();
        }
        catch (error) {
            this.logDebug(logSeverity_1.LogSeverity.ERROR, "Storage init() exception: " + error);
            this.persistence = null;
        }
        if (this.persistence !== null) {
            return;
        }
        if (electron_1.app.isPackaged && !process.env.TEST_FILEPATH) {
            throw new Error('Storage.init(): Failed to reach platform storage.');
        }
        this.persistence = new StorageImpl_Generic();
        try {
            this.s = await this.persistence.init();
            this.deviceId = (_d = (_b = (_a = this.s.provisioningParams) === null || _a === void 0 ? void 0 : _a.deviceId) !== null && _b !== void 0 ? _b : (_c = this.s.provisioningData) === null || _c === void 0 ? void 0 : _c.deviceID) !== null && _d !== void 0 ? _d : '';
            this.deviceName = (_f = (_e = this.s.provisioningParams) === null || _e === void 0 ? void 0 : _e.deviceName) !== null && _f !== void 0 ? _f : '';
            this.deviceType = (_g = this.s.deviceType) !== null && _g !== void 0 ? _g : '';
            this.osType = (_h = this.s.osType) !== null && _h !== void 0 ? _h : '';
            this.osVersion = (_j = this.s.osVersion) !== null && _j !== void 0 ? _j : '';
        }
        catch (e) {
            this.persistence = null;
            throw new Error('Storage.init(): Could not init generic persistence: ' + e);
        }
    }
    async writeStorage() {
        if (this.persistence === null) {
            throw new Error('Storage.writeStorage(): No persistence layer.');
        }
        await this.persistence.writeStorage(this.s);
    }
    loadProvisioningData() {
        return this.s.provisioningData;
    }
    getEnvironmentFromApiServerURL(serverUrl) {
        let defaultApiServer = "api-lsa";
        let environment = null;
        try {
            if (serverUrl.length > 0) {
                if (serverUrl.toLowerCase().startsWith('http') === false) {
                    serverUrl = "https://" + serverUrl;
                }
                let apiServerUrl = new URL(serverUrl);
                let server = apiServerUrl === null || apiServerUrl === void 0 ? void 0 : apiServerUrl.host;
                let comps = server === null || server === void 0 ? void 0 : server.split(".", 3);
                let serverPart = comps[0];
                environment = serverPart === null || serverPart === void 0 ? void 0 : serverPart.replace(defaultApiServer, "");
                if ((environment === null || environment === void 0 ? void 0 : environment.length) == 0) {
                    environment = "prod";
                }
                else if ((environment === null || environment === void 0 ? void 0 : environment.startsWith("-"))) {
                    environment = environment === null || environment === void 0 ? void 0 : environment.slice(1);
                }
            }
        }
        catch (error) {
            this.logDebug(logSeverity_1.LogSeverity.ERROR, 'getEnvironmentFromApiServerURL exception: ' + error);
        }
        return environment !== null && environment !== void 0 ? environment : "prod";
    }
    environment() {
        let env = '';
        if (this.s && this.s.apiServer) {
            env = this.getEnvironmentFromApiServerURL(this.s.apiServer);
        }
        return env;
    }
    orgId() {
        var _a, _b;
        let org = '';
        if (this.s && this.s.provisioningData && (this.s.provisioningData.orgId.length > 0 || this.s.provisioningData.orgID.length > 0)) {
            org = this.s.provisioningData.orgId.length > 0 ? (_a = this.s.provisioningData) === null || _a === void 0 ? void 0 : _a.orgId : (_b = this.s.provisioningData) === null || _b === void 0 ? void 0 : _b.orgID;
        }
        return org;
    }
    async saveProvisioningData(data) {
        this.s.provisioningData = data;
        let org = this.orgId();
        if (this.s.apiServer && this.s.apiServer.length > 0 && org.length > 0) {
            let env = this.getEnvironmentFromApiServerURL(this.s.apiServer);
            this.logDebug(logSeverity_1.LogSeverity.INFO, 'saveProvisioningData env is ' + env + ' org is ' + org);
            await this.nativeClient.writeProvisioningFiles(env, org);
        }
        return this.writeStorage();
    }
    loadProvisioningParams() {
        return this.s.provisioningParams;
    }
    saveProvisioningParams(data) {
        this.s.provisioningParams = data;
        return this.writeStorage();
    }
    loadToken() {
        return this.s.token;
    }
    saveToken(data) {
        this.s.token = data;
        return this.writeStorage();
    }
    loadPrivateKey() {
        var _a;
        return (_a = this.s.privateKey) !== null && _a !== void 0 ? _a : '';
    }
    savePrivateKey(data) {
        this.s.privateKey = data;
        return this.writeStorage();
    }
    loadPublicKey() {
        var _a;
        return (_a = this.s.publicKey) !== null && _a !== void 0 ? _a : '';
    }
    savePublicKey(data) {
        this.s.publicKey = data;
        return this.writeStorage();
    }
    loadAPIServer() {
        var _a;
        let server = ((_a = this.s.apiServer) !== null && _a !== void 0 ? _a : '');
        return server;
    }
    saveAPIServer(serverUrl) {
        this.s.apiServer = serverUrl;
    }
    loadProvisioningCode() {
        var _a;
        return ((_a = this.s.provisioningCode) !== null && _a !== void 0 ? _a : '');
    }
    saveProvisioningCode(provisioningCode) {
        this.s.provisioningCode = provisioningCode;
        return this.writeStorage();
    }
    saveHotProvisioningCode(hotProvisioningCode) {
        this.s.hotProvisioningCode = hotProvisioningCode;
        return this.writeStorage();
    }
    loadHotProvisioningCode() {
        var _a;
        return ((_a = this.s.hotProvisioningCode) !== null && _a !== void 0 ? _a : '');
    }
    loadDeviceName() {
        return this.deviceName;
    }
    loadEmailAddr() {
        return this.loadLoginName();
    }
    loadDeviceId() {
        return this.deviceId;
    }
    loadDeviceType() {
        return this.deviceType;
    }
    loadOsString() {
        return this.osType;
    }
    forceReprovision() {
        return this.s.forceReprovision;
    }
    saveForceReprovision(force) {
        this.s.forceReprovision = force;
    }
    getClientVersion() {
        return electron_1.app.getVersion();
    }
    loadDisplayName() {
        var _a;
        return ((_a = this.s.displayName) !== null && _a !== void 0 ? _a : '');
    }
    loadLoginName() {
        var _a;
        return ((_a = this.s.loginName) !== null && _a !== void 0 ? _a : '');
    }
    loadInitialAutoUpdateMinutes() {
        var _a;
        return (_a = this.s.initialAutoUpdateMinutes) !== null && _a !== void 0 ? _a : 0;
    }
    loadLastAutoUpdateCheck() {
        return this.s.lastAutoUpdateCheck;
    }
    saveLastAutoUpdateCheck(date) {
        this.s.lastAutoUpdateCheck = date;
        this.writeStorage();
    }
    loadOsVersion() {
        return this.osVersion;
    }
    logDeviceProperties() {
        this.logDebug(logSeverity_1.LogSeverity.INFO, 'deviceId = ' + this.deviceId);
        this.logDebug(logSeverity_1.LogSeverity.INFO, 'deviceName = ' + this.deviceName);
        this.logDebug(logSeverity_1.LogSeverity.INFO, 'deviceType = ' + this.deviceType);
        this.logDebug(logSeverity_1.LogSeverity.INFO, 'osType = ' + this.osType);
        this.logDebug(logSeverity_1.LogSeverity.INFO, 'osVersion = ' + this.osVersion);
        this.logDebug(logSeverity_1.LogSeverity.INFO, 'displayName = ' + this.s.displayName);
        this.logDebug(logSeverity_1.LogSeverity.INFO, 'loginName = ' + this.s.loginName);
    }
}
exports.Storage = Storage;
async function populateUserInfoOnWindows(s) {
    if (process.platform === 'win32') {
        const userInfo = await userInfoWindows_1.UserInfoWindows.getInfo();
        if (!s.loginName) {
            s.loginName = userInfo.loginName;
        }
        if (!s.displayName) {
            s.displayName = userInfo.displayName;
        }
    }
}
//# sourceMappingURL=storage.js.map