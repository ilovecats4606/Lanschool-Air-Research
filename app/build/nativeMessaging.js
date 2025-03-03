"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NativeMessaging = void 0;
const child_process_1 = require("child_process");
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
const clientutils_1 = require("./clientutils");
const webhistory_1 = require("./webhistory");
const otmTabInstrumentation_1 = require("./otmTabInstrumentation");
const util = require('util');
const exec = util.promisify(require('child_process').exec);
class NativeMessaging {
    constructor(webExtensionCommands, webLimiter, shellExecutor, otm) {
        var _a;
        this.webExtensionCommands = webExtensionCommands;
        this.webLimiter = webLimiter;
        this.shellExecutor = shellExecutor;
        this.otm = otm;
        this.chromeConnected = false;
        this.edgeConnected = false;
        this.usingNativeMessaging = true;
        webLimiter.setExtensionChannel(this);
        (_a = otm === null || otm === void 0 ? void 0 : otm.setExtensionChannel) === null || _a === void 0 ? void 0 : _a.call(otm, this);
        shellExecutor.addSubscriber(this);
    }
    isInActiveClass() {
        var _a, _b;
        const currentState = this.webExtensionCommands.getCurrentState();
        if (!!currentState && (currentState === null || currentState === void 0 ? void 0 : currentState.classInfo)) {
            return !!((_b = (_a = currentState === null || currentState === void 0 ? void 0 : currentState.classInfo) === null || _a === void 0 ? void 0 : _a.activeClassID) === null || _b === void 0 ? void 0 : _b.length);
        }
        return false;
    }
    send(message) {
        var _a, _b, _c, _d, _e, _f;
        try {
            if (((_b = (_a = this.childProcess) === null || _a === void 0 ? void 0 : _a.stdin) === null || _b === void 0 ? void 0 : _b.writable) && ((_d = (_c = this.childProcess) === null || _c === void 0 ? void 0 : _c.stdin) === null || _d === void 0 ? void 0 : _d.closed) === false) {
                var strBuf = Buffer.from(message, 'utf8');
                const sendBuf = Buffer.allocUnsafe(4 + strBuf.length);
                sendBuf.writeUint32LE(message.length);
                sendBuf.write(message, 4, 'utf8');
                (_f = (_e = this.childProcess) === null || _e === void 0 ? void 0 : _e.stdin) === null || _f === void 0 ? void 0 : _f.write(sendBuf, 'binary');
            }
            else {
                lsa_clients_common_1.LSAClient.getInstance().logger.logError('NativeMessaging: stdin was not writable');
            }
        }
        catch (e) {
            lsa_clients_common_1.LSAClient.getInstance().logger.logError('NativeMessaging: send exception: ' + e);
        }
    }
    handleWebLimitingRequest(obj) {
        var _a, _b;
        lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('NativeMessaging: handleWebLimitingRequest');
        if (((_a = obj === null || obj === void 0 ? void 0 : obj.body) === null || _a === void 0 ? void 0 : _a.url) &&
            (obj === null || obj === void 0 ? void 0 : obj.browser) &&
            ((_b = obj === null || obj === void 0 ? void 0 : obj.body) === null || _b === void 0 ? void 0 : _b.tabId)) {
            let info = this.webLimiter.shouldBlock(obj.body.url);
            if ((info === null || info === void 0 ? void 0 : info.shouldBlock) === false) {
                lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('NativeMessaging: allowed: ' + JSON.stringify(obj.body.url));
                this.send(`{ \"message\": \"WebLimit\", \"browser\": \"${obj.browser}\", \"block\": \"false\", \"url\": \"${obj.body.url}\", \"tabId\": \"${obj.body.tabId}\" }`);
            }
            else if ((info === null || info === void 0 ? void 0 : info.shouldBlock) && (info === null || info === void 0 ? void 0 : info.redirectUrl) && (info === null || info === void 0 ? void 0 : info.redirectUrl.length)) {
                lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('NativeMessaging: shouldBlock ? ' + info.shouldBlock + ' : ' + JSON.stringify(obj.body.url));
                this.send(`{ \"message\": \"WebLimit\", \"browser\": \"${obj.browser}\", \"block\": \"true\", \"redirectUrl\": \"${info.redirectUrl}\", \"url\": \"${obj.body.url}\", \"tabId\": \"${obj.body.tabId}\" }`);
            }
            else {
                lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('NativeMessaging: web limit request not understood: ' + JSON.stringify(obj));
            }
        }
        else {
            lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('NativeMessaging: web limit request not enough info: ' + JSON.stringify(obj));
        }
    }
    sendCheckinRequest() {
        if (!this.usingNativeMessaging)
            return;
        lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('NativeMessaging: sendCheckinRequest');
        try {
            const currentState = JSON.stringify(this.webExtensionCommands.getCurrentState());
            if (currentState) {
                this.send(`{ \"message\": \"checkin\", \"browser\": \"all\", \"body\": ${currentState} }`);
            }
        }
        catch (e) {
            lsa_clients_common_1.LSAClient.getInstance().logger.logError('NativeMessaging: handleCheckinRequest exception: ' + e);
            lsa_clients_common_1.store.dispatch({ type: 'ExtensionConnected', payload: false });
        }
    }
    sendGetOTMTabsRequest() {
        if (!this.usingNativeMessaging)
            return;
        lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('NativeMessaging: sendGetOTMTabsRequest');
        try {
            if (this.isInActiveClass()) {
                const request = {
                    message: 'GetOTMTabs',
                    body: {
                        captureMode: lsa_clients_common_1.store.getState().captureMode
                    },
                    browser: 'all'
                };
                this.send(JSON.stringify(request));
            }
        }
        catch (e) {
            lsa_clients_common_1.LSAClient.getInstance().logger.logError('NativeMessaging: sendGetOTMTabsRequest exception: ' + e);
        }
    }
    sendUpdateSpecialSitesRequest() {
        if (!this.usingNativeMessaging)
            return;
        lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('NativeMessaging: sendUpdateSpecialSitesRequest');
        try {
            const intelliTaskSpecialSites = lsa_clients_common_1.store.getState().intelliTaskSpecialSites;
            if (this.isInActiveClass() && intelliTaskSpecialSites.length > 0) {
                const request = {
                    message: 'UpdateSpecialSites',
                    body: {
                        intelliTaskSpecialSites: intelliTaskSpecialSites
                    },
                    browser: 'all'
                };
                this.send(JSON.stringify(request));
            }
        }
        catch (e) {
            lsa_clients_common_1.LSAClient.getInstance().logger.logError('NativeMessaging: UpdateSpecialSites exception: ' + e);
        }
    }
    handleHistoryRequest(request) {
        var _a, _b, _c;
        if (((_a = request === null || request === void 0 ? void 0 : request.body) === null || _a === void 0 ? void 0 : _a.url) &&
            (request === null || request === void 0 ? void 0 : request.browser) &&
            ((_b = request === null || request === void 0 ? void 0 : request.body) === null || _b === void 0 ? void 0 : _b.title)) {
            webhistory_1.WebHistory.getInstance().handleHistoryPostForBrowser(request.body.url, request.body.title, request.browser, new Date().getTime(), (_c = request.body.tabId) !== null && _c !== void 0 ? _c : 0);
        }
        else {
            lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('NativeMessaging: Web History missing data: ' + JSON.stringify(request));
        }
    }
    handleCurrentTabs(request, browser) {
        var _a;
        if (browser && ((_a = request === null || request === void 0 ? void 0 : request.body) === null || _a === void 0 ? void 0 : _a.currentTabs)) {
            lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('NativeMessaging: currentTabs');
            webhistory_1.WebHistory.getInstance().handleCurrentTabsPost(request.body.currentTabs, browser);
        }
    }
    handleCurrentOTMTabs(request) {
        var _a;
        if ((_a = request === null || request === void 0 ? void 0 : request.body) === null || _a === void 0 ? void 0 : _a.currentOTMTabs) {
            lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('NativeMessaging: currentOTMTabs');
            otmTabInstrumentation_1.OtmTabsInstrumentation.getInstance().handleCurrentOTMTabsPost(request.body.currentOTMTabs);
        }
    }
    handleTabInfo(request) {
        lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('NativeMessaging: tabInfo');
        lsa_clients_common_1.LSAClient.getInstance().webHistory.postWebHistory(request.body);
    }
    handlePing(browser) {
        lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('NativeMessaging: ' + browser + ' extension connected');
        this.send(`{ \"message\": \"pong\", \"browser\": \"${browser}\" }`);
        if (browser.startsWith('chrome')) {
            this.chromeConnected = true;
        }
        else if (browser.startsWith('edge')) {
            this.edgeConnected = true;
        }
        lsa_clients_common_1.store.dispatch({ type: 'ExtensionConnected', payload: true });
        if (this.isInActiveClass()) {
            this.sendCheckinRequest();
            this.sendUpdateSpecialSitesRequest();
        }
    }
    handleLog(browser, request) {
        if ((request === null || request === void 0 ? void 0 : request.level) && (request === null || request === void 0 ? void 0 : request.text)) {
            switch (request.level) {
                case 'INFO':
                    lsa_clients_common_1.LSAClient.getInstance().logger.logInfo(browser.toUpperCase() + ' Extension [Info]: ' + request.text);
                    break;
                case 'WARN':
                    lsa_clients_common_1.LSAClient.getInstance().logger.logInfo(browser.toUpperCase() + ' Extension [Warn]: ' + request.text);
                    break;
                case 'ERROR':
                    lsa_clients_common_1.LSAClient.getInstance().logger.logInfo(browser.toUpperCase() + ' Extension [Error]: ' + request.text);
                    break;
            }
        }
    }
    handleExtensionExit(browser) {
        webhistory_1.WebHistory.getInstance().clearWebHistory(browser);
    }
    handleMessage(message) {
        try {
            let obj = JSON.parse(message);
            if ((obj === null || obj === void 0 ? void 0 : obj.body) &&
                (obj === null || obj === void 0 ? void 0 : obj.browser) &&
                (obj === null || obj === void 0 ? void 0 : obj.message)) {
                if (obj.message === 'WebLimit') {
                    this.handleWebLimitingRequest(obj);
                }
                else if (obj.message === 'History') {
                    this.handleHistoryRequest(obj);
                }
                else if (obj.message === 'currentTabs') {
                    this.handleCurrentTabs(obj, obj.browser);
                }
                else if (obj.message === 'currentOTMTabs') {
                    this.handleCurrentOTMTabs(obj);
                }
                else if (obj.message === 'tabinfo') {
                    this.handleTabInfo(obj);
                }
                else if (obj.message === 'Log') {
                    this.handleLog(obj.browser, obj.body);
                }
                else if (obj.message === 'ping') {
                    this.handlePing(obj.browser);
                }
                else if (obj.message === 'exit') {
                    lsa_clients_common_1.LSAClient.getInstance().logger.logError('NativeMessaging: ' + obj.browser + ' extension exited');
                    this.handleExtensionExit(obj.browser);
                }
                else {
                    let str = JSON.stringify(obj);
                    lsa_clients_common_1.LSAClient.getInstance().logger.logError('NativeMessaging: unhandled message ' + str.length + ' bytes: ' + str);
                }
            }
            else {
                lsa_clients_common_1.LSAClient.getInstance().logger.logError('NativeMessaging: incoming data missing elements.');
            }
        }
        catch (e) {
            lsa_clients_common_1.LSAClient.getInstance().logger.logError('NativeMessaging: exception in handleMessage:' + e);
        }
    }
    onDataReady(currentData) {
        var data = currentData;
        if (this.leftoverData && this.leftoverData.length > 0) {
            const list = [this.leftoverData, data];
            data = Buffer.concat(list);
        }
        if (data.length < 4) {
            lsa_clients_common_1.LSAClient.getInstance().logger.logError('NativeMessaging: not enough data to process');
            return;
        }
        var index = 0;
        var curMsgIndex = 0;
        while (curMsgIndex + 4 < data.length) {
            let len = data.readUint32LE(curMsgIndex);
            if (curMsgIndex + len + 4 > data.length) {
                this.leftoverData = data.subarray(curMsgIndex, data.length);
                break;
            }
            this.leftoverData = null;
            let subData = data.subarray(curMsgIndex + 4, curMsgIndex + len + 4);
            this.handleMessage(subData);
            index += 1;
            curMsgIndex += len + 4;
        }
    }
    connect() {
        try {
            let productFolder = clientutils_1.ClientUtils.productFolder();
            let appPath = '';
            if (process.platform === 'darwin') {
                appPath = productFolder + "/lsanmserver.app/Contents/MacOS/lsanmserver";
            }
            else if (process.platform === 'win32') {
                appPath = productFolder + "\\WinNativeMessagingServer.exe";
            }
            else {
                lsa_clients_common_1.LSAClient.getInstance().logger.logError('NativeMessaging: unknown platform: ' + process.platform);
                return;
            }
            this.childProcess = (0, child_process_1.spawn)(appPath, []);
            this.childProcess.stdout.on('data', (currentData) => {
                if (currentData instanceof Buffer) {
                    this.onDataReady(currentData);
                }
            });
            this.childProcess.stderr.on('data', (data) => {
                lsa_clients_common_1.LSAClient.getInstance().logger.logError('NativeMessaging: stderr: ' + data.toString());
            });
            this.childProcess.on('close', (code) => {
                lsa_clients_common_1.LSAClient.getInstance().logger.logError('NativeMessaging: server closed with exit code: ' + code);
                this.childProcess = null;
                setTimeout(() => {
                    this.connect();
                }, 10 * 1000);
            });
            this.childProcess.on('error', (error) => {
                lsa_clients_common_1.LSAClient.getInstance().logger.logError('NativeMessaging: server error: ' + error);
            });
        }
        catch (error) {
            lsa_clients_common_1.LSAClient.getInstance().logger.logError('NativeMessaging: Connect error: ' + error);
        }
    }
    closeTabs(data) {
        var _a;
        lsa_clients_common_1.LSAClient.getInstance().logger.logMessage('NativeMessaging: closeTab(+)');
        (_a = data.tabIds) === null || _a === void 0 ? void 0 : _a.forEach((tabId) => {
            var _a, _b, _c;
            const closingTab = webhistory_1.WebHistory.getInstance().getTabClosingInfoForTab(tabId);
            if (closingTab === null || closingTab === void 0 ? void 0 : closingTab.tabId) {
                if (!closingTab.windowId) {
                    closingTab.windowId = 0;
                }
                const msg = { message: 'CloseTabs',
                    browser: closingTab.browser,
                    body: [{
                            tabId: closingTab.tabId,
                            windowId: closingTab.windowId,
                            url: (_a = closingTab.url) !== null && _a !== void 0 ? _a : '',
                            originalTabId: (_b = closingTab.originalTabId) !== null && _b !== void 0 ? _b : 0
                        }] };
                const msgStr = JSON.stringify(msg);
                this.send(msgStr);
                lsa_clients_common_1.LSAClient.getInstance().logger.logMessage('NativeMessaging: asking browser to close tab: ' + msgStr);
                webhistory_1.WebHistory.getInstance().removeTabFromHistory(tabId, (_c = closingTab === null || closingTab === void 0 ? void 0 : closingTab.url) !== null && _c !== void 0 ? _c : '');
            }
        });
    }
    async onBeforeShellExecution(data) { }
    async onAfterShellExecution(data, shellExecutionSuccess) {
        if (this.usingNativeMessaging && shellExecutionSuccess) {
            lsa_clients_common_1.LSAClient.getInstance().logger.logMessage('NativeMessaging: onAfterShellExecution sending checkin request');
            this.sendCheckinRequest();
        }
    }
}
exports.NativeMessaging = NativeMessaging;
//# sourceMappingURL=nativeMessaging.js.map