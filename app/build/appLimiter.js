"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppLimiter = exports.AppLimitingPolicy = void 0;
const limitingModels_1 = require("@lenovo-software/lsa-clients-common/dist/models/limitingModels");
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
class AppLimitingPolicy {
    constructor() {
        this.regExList = [];
        this.params = new limitingModels_1.AppLimitParams();
        this.params.apps = new Array();
        this.params.blockType = limitingModels_1.AppLimitBlockType.None;
        this.params.className = '';
    }
}
exports.AppLimitingPolicy = AppLimitingPolicy;
class AppLimiter {
    constructor() {
        this.currentPolicy = new AppLimitingPolicy();
        this.logger = lsa_clients_common_1.LSAClient.getInstance().logger;
        this.resetPolicy();
    }
    static getInstance() {
        if (!AppLimiter.instance) {
            AppLimiter.instance = new AppLimiter();
        }
        return AppLimiter.instance;
    }
    setRunningAppsImpl(_runningAppsImpl) {
        this.runningAppsImpl = _runningAppsImpl;
    }
    setCloseAppImpl(_closeAppImpl) {
        this.closeAppImpl = _closeAppImpl;
    }
    resetPolicy() {
        this.currentPolicy = new AppLimitingPolicy();
    }
    async closeApp(info) {
        if (this.closeAppImpl) {
            try {
                await this.closeAppImpl.closeApp(info);
            }
            catch (err) {
                this.logger.logError('AppLimiter killApp failure: ' + err);
            }
        }
    }
    async getRunningAppsList() {
        if (this.runningAppsImpl) {
            try {
                let list = await this.runningAppsImpl.getRunningAppsEx(false);
                return Promise.resolve(list);
            }
            catch (err) {
                this.logger.logError('AppLimiter getRunningAppsList failure: ' + err);
            }
        }
        return Promise.resolve(new Array());
    }
    isAppInList(appName, runningAppList) {
        let rv = false;
        let cnt = runningAppList.length;
        let aName = appName.toLowerCase();
        for (var x = 0; x < cnt; x++) {
            if (aName.match(runningAppList[x])) {
                rv = true;
            }
        }
        return rv;
    }
    shouldBlockApp(name) {
        let block = false;
        let aName = name.toLowerCase();
        if (this.currentPolicy.params.blockType === limitingModels_1.AppLimitBlockType.None) {
            block = false;
        }
        else if (this.currentPolicy.params.blockType === limitingModels_1.AppLimitBlockType.Block && this.currentPolicy.params.apps && this.isAppInList(aName, this.currentPolicy.regExList)) {
            block = true;
        }
        else if (this.currentPolicy.params.blockType === limitingModels_1.AppLimitBlockType.Allow && this.currentPolicy.params.apps && !this.isAppInList(aName, this.currentPolicy.regExList)) {
            block = true;
        }
        return block;
    }
    async enforce() {
        try {
            this.logger.logInfo('AppLimiter enforce');
            let list = await this.getRunningAppsList();
            if (list) {
                await list.forEach(async (appInfo) => {
                    if (this.shouldBlockApp(appInfo.appName)) {
                        let closeInfo = new lsa_clients_common_1.CloseAppEventModel();
                        closeInfo.closeKey = appInfo.closeKey;
                        await this.closeApp(closeInfo);
                    }
                });
            }
        }
        catch (err) {
            this.logger.logError('AppLimiter enforce failure: ' + err);
        }
    }
    removeAppExtension(appName) {
        let result = appName;
        let commonExtensions = ['.exe', '.app', '.bat', '.com'];
        for (var x = 0; x < commonExtensions.length; x++) {
            if (appName.endsWith(commonExtensions[x])) {
                result = result.replace(commonExtensions[x], '');
            }
        }
        return result;
    }
    setPolicy(params) {
        this.currentPolicy.params = params;
        var newList = Array();
        if (params.blockType != limitingModels_1.AppLimitBlockType.None && this.currentPolicy.params.apps) {
            for (var x = 0; x < this.currentPolicy.params.apps.length; x++) {
                var indx = 0;
                let app = this.currentPolicy.params.apps[x].toLowerCase();
                app = this.removeAppExtension(app);
                this.currentPolicy.params.apps[x] = app;
                var entry = app;
                entry = entry.replace(/\*/g, ".*");
                entry = entry.replace(/\?/g, ".");
                newList[x] = new RegExp(entry, 'i');
            }
        }
        this.currentPolicy.regExList = newList;
    }
    limitApps() {
        if (this.currentPolicy.params.blockType !== limitingModels_1.AppLimitBlockType.None) {
            this.enforce();
            this.currentTimerId = setTimeout(() => {
                this.limitApps();
            }, 20 * 1000);
        }
    }
    start() {
        this.limitApps();
        this.logger.logInfo('AppLimiter start');
    }
    stop() {
        if (this.currentTimerId != null) {
            clearTimeout(this.currentTimerId);
        }
        this.resetPolicy();
        this.logger.logInfo('AppLimiter stop');
    }
}
exports.AppLimiter = AppLimiter;
//# sourceMappingURL=appLimiter.js.map