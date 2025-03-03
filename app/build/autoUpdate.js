"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoUpdate = void 0;
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
const nativeClient_1 = require("./native/nativeClient");
const clientutils_1 = require("./clientutils");
const fs = require("fs");
class AutoUpdate {
    constructor(storage, settings) {
        this.clientUtils = new clientutils_1.ClientUtils();
        this.nativeClient = null;
        this.started = false;
        this.windowsUpdateFilePrepend = "LSAAU_";
        this.updateWait = (2 * 1000);
        const lsaClient = lsa_clients_common_1.LSAClient.getInstance();
        this.logger = lsaClient.logger;
        this.storage = storage;
        this.settings = settings;
    }
    log(message) {
        this.logger.logInfo(message);
    }
    setNativeClient(_nativeClient) {
        this.nativeClient = _nativeClient;
    }
    setClientUtils(_clientUtils) {
        this.clientUtils = _clientUtils;
    }
    randomWaitMinutes() {
        let max = Math.floor(30);
        let min = 10;
        return Math.floor(Math.random() * (max - min) + min);
    }
    resetDailyCheck() {
        this.log('AutoUpdate starting 24-hour clock reset countdown');
        setTimeout(() => {
            this.started = false;
            this.log('AutoUpdate resetting 24-hour update check');
        }, 24 * 60 * 60 * 1000);
    }
    deleteOldAutoUpdateFiles() {
        let tempPath = clientutils_1.ClientUtils.getTempPath();
        var files = fs.readdirSync(tempPath).filter(fn => fn.endsWith(this.getUpdatePathExtensionStr())).
            filter(fn => fn.startsWith(this.windowsUpdateFilePrepend));
        files.forEach(file => {
            fs.unlink(tempPath + "\\" + file, (err) => {
            });
        });
    }
    start() {
        if (this.started === false) {
            this.started = true;
            if (this.shouldCheckForUpdate()) {
                try {
                    let waitMins = this.settings.loadInitialAutoUpdateMinutes();
                    if (!waitMins) {
                        waitMins = this.randomWaitMinutes();
                    }
                    let waitMs = waitMins * 60 * 1000;
                    this.log('AutoUpdate start check in ' + waitMins + ' minutes.');
                    setTimeout(() => {
                        this.checkForUpdate().then((download_path) => {
                            this.downloadUpdate(download_path).then((local_path) => {
                                if (local_path.length > 0) {
                                    this.log('Autoupdate local path for update is ' + local_path);
                                    this.startUpdate(local_path);
                                }
                                else {
                                    this.log('Autoupdate no local path');
                                }
                            }).catch((err) => {
                                this.log('Autoupdate no update to download.');
                            });
                        }).catch((err) => {
                            if (err) {
                                this.log('Autoupdate error checking for update: ' + err);
                            }
                        });
                    }, waitMs);
                }
                catch (err) {
                    this.log('AutoUpdate start error: ' + err);
                }
            }
            this.resetDailyCheck();
        }
    }
    shouldCheckForUpdate() {
        var result = false;
        let now = new Date();
        let lastCheck = this.settings.loadLastAutoUpdateCheck();
        if (!lastCheck || (new Date(lastCheck).getDate() != now.getDate())) {
            this.log('Autoupdate should check because last autoUpdateCheck was ' + (lastCheck === null || lastCheck === void 0 ? void 0 : lastCheck.toString()));
            result = true;
        }
        else {
            this.log('Autoupdate already checked for update today.');
        }
        return result;
    }
    getClientTypeStr() {
        let result = '';
        if (process.platform === 'darwin') {
            result = 'mac';
        }
        else if (process.platform === 'win32') {
            result = 'win';
        }
        return result;
    }
    getOperatingSystemVersion() {
        return this.storage.loadOsVersion();
    }
    getUpdateCheckUrl() {
        let apiServer = this.storage.loadAPIServer();
        let typeStr = this.getClientTypeStr();
        let systemVersion = this.getOperatingSystemVersion();
        let clientVersion = this.storage.getClientVersion();
        let url = '';
        if (apiServer.length && typeStr.length && systemVersion.length && clientVersion.length) {
            if (!apiServer.startsWith('https://')) {
                url = 'https://';
            }
            url += apiServer + '/0/lsa/lanschool/clientInstaller/updateData/' + typeStr + '/' + systemVersion + '/' + clientVersion;
        }
        else {
            this.log('Autoupdate failed to get needed info for update check: apiServer=' + apiServer + ' type=' + typeStr + ' systemVersion=' + systemVersion + ' clientVersion=' + clientVersion);
        }
        return url;
    }
    async checkForUpdate() {
        var downloadPath = '';
        this.log('Autoupdate checking for update...');
        let token = this.storage.loadToken();
        if (!token || !token.access_token) {
            this.log('Autoupdate failed to get access token for update check');
            return Promise.reject();
        }
        let url = this.getUpdateCheckUrl();
        if (!url || url.length == 0) {
            this.log('Autoupdate failed to get url for update check');
            return Promise.reject();
        }
        this.log('Autoupdate update url: ' + url);
        let response = await fetch(url, {
            method: 'GET',
            headers: {
                'authorization': token.access_token
            }
        });
        if (response.status == 200 && response.ok) {
            let replyObj = await response.text();
            this.settings.saveLastAutoUpdateCheck(new Date());
            if (replyObj.length) {
                let json = JSON.parse(replyObj);
                downloadPath = json.download_server.Value;
                this.log('Autoupdate: an update is available at ' + downloadPath);
                return downloadPath;
            }
            else {
                this.log('Autoupdate the current client version is the latest.');
            }
        }
        else {
            this.log('Autoupdate failed to check for update: ' + response.status);
        }
        return Promise.reject();
    }
    getUpdatePathExtensionStr() {
        let result = '';
        if (process.platform === 'darwin') {
            result = '.pkg';
        }
        else if (process.platform === 'win32') {
            result = '.exe';
        }
        return result;
    }
    getRandomFilename() {
        var result = [];
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < 20; i++) {
            result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
        }
        var prependFile = '';
        if (process.platform === 'win32') {
            prependFile = this.windowsUpdateFilePrepend;
        }
        return prependFile + result.join('') + this.getUpdatePathExtensionStr();
    }
    async downloadUpdate(downloadPath) {
        try {
            let response = await fetch(downloadPath);
            if (response.ok) {
                let data = await response.arrayBuffer();
                if (data) {
                    this.log('Autoupdate downloaded update file ' + data.byteLength + ' bytes');
                    var extraPathSep = '';
                    if (process.platform === 'win32') {
                        extraPathSep = '\\';
                    }
                    let localPath = clientutils_1.ClientUtils.getTempPath() + extraPathSep + this.getRandomFilename();
                    this.log('Autoupdate local path will be ' + localPath);
                    fs.appendFileSync(localPath, new Uint8Array(data));
                    return localPath;
                }
                else {
                    this.logger.logError('Autoupdate no data from download');
                }
            }
            else {
                this.logger.logError('Autoupdate failed to download update.');
            }
        }
        catch (err) {
            this.logger.logError('Autoupdate error downloading update: ' + err);
        }
        return Promise.reject();
    }
    startUpdate(localfile) {
        try {
            if (!this.nativeClient) {
                this.nativeClient = nativeClient_1.NativeClient.getInstance();
            }
            this.nativeClient.updateClient(localfile);
        }
        catch (err) {
            this.log('startUpdate error: ' + err);
        }
    }
}
exports.AutoUpdate = AutoUpdate;
//# sourceMappingURL=autoUpdate.js.map