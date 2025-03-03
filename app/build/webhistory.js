"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebHistory = void 0;
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
const tabInfoCache_1 = require("./tabInfoCache");
class WebHistory {
    constructor() {
        this.lastUrl = "";
        this.lastTitle = "";
        this.lastBrowser = '';
        this.lastTabId = 0;
        this.lastUpdateTime = 0;
        this.tabCache = new tabInfoCache_1.TabInfoCache();
    }
    static getInstance() {
        if (!WebHistory.instance) {
            WebHistory.instance = new WebHistory();
        }
        return WebHistory.instance;
    }
    setClassroomEventHandler(classroomEventHandler) {
        this.classroomEventHandler = classroomEventHandler;
        this.classroomEventHandler.addSubscriber(this);
    }
    handleHistoryPostForBrowser(url, title, browser, time, tabId) {
        lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('web history: ' + url + ', title: ' + title + ', browser: ' + browser + ', tabId: ' + tabId);
        if (time > this.lastUpdateTime) {
            this.lastUrl = url;
            this.lastTitle = title;
            this.lastTabId = tabId;
            this.lastBrowser = browser;
            this.lastUpdateTime = new Date().getTime();
        }
    }
    handleCurrentTabsPost(currentTabs, browser) {
        this.tabCache.cacheCurrentTabs(currentTabs, browser);
    }
    supportsBrowserTabsToTelemetry() {
        return true;
    }
    getCurrentWebsite() {
        return new Promise((resolve, reject) => {
            try {
                let cw = new lsa_clients_common_1.CurrentWebsite();
                cw.windowTitle = this.lastTitle;
                cw.url = this.lastUrl;
                cw.lang = "en";
                resolve(cw);
            }
            catch (err) {
                reject(err);
            }
        });
    }
    async getCurrentBrowserTabs() {
        return this.tabCache.getCurrentBrowserTabs();
    }
    getTabClosingInfoForTab(tabId) {
        return this.tabCache.getClosingTab(tabId);
    }
    clearSavedHistory() {
        this.lastUrl = '';
        this.lastTitle = '';
        this.lastBrowser = '';
        this.lastTabId = 0;
        this.lastUpdateTime = 0;
    }
    clearWebHistory(browser) {
        if (browser === this.lastBrowser) {
            this.clearSavedHistory();
        }
        this.tabCache.cacheCurrentTabs([], browser);
    }
    removeTabFromHistory(tabId, url) {
        lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('webHistory: LOOKING to remove this tab from history: ' + tabId);
        this.tabCache.removeTab(tabId);
        if (this.lastTabId === tabId || ((url === null || url === void 0 ? void 0 : url.length) > 0 && url === this.lastUrl)) {
            this.clearSavedHistory();
            lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('webHistory: removed tab from history: ' + tabId);
        }
        else {
            lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('webHistory: did NOT REMOVE tab from history: ' + tabId);
        }
    }
    onJoinClass(data) { }
    onLeaveClass(data) {
        this.tabCache.clearCache();
        this.clearSavedHistory();
        lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('webHistory: cleared cache at end of class ');
    }
    onOrgVerification(isVerified) { }
    onTelemetryRequest(data) { }
}
exports.WebHistory = WebHistory;
//# sourceMappingURL=webhistory.js.map