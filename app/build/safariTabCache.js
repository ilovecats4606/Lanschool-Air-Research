"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafariTabCache = void 0;
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
class SafariTabCache {
    constructor() {
        this.maxTabLists = 32;
        this.tabCache = new Array();
        this.currentTabs = new Array();
    }
    generateUniqueTabId() {
        return Math.random() * (2147483647 - 1) + 1;
    }
    cacheCurrentTabs(tabs, browser) {
        var _a;
        const transformedTabs = Array();
        const newTabList = new Array();
        for (const tab of tabs) {
            if (tab.id) {
                const newTabId = this.generateUniqueTabId();
                const currentTab = {
                    tabId: newTabId,
                    originalTabId: tab.id,
                    windowId: tab.windowId,
                    browser: browser,
                    url: (_a = tab.url) !== null && _a !== void 0 ? _a : ''
                };
                lsa_clients_common_1.LSAClient.getInstance().logger.logMessage('cacheCurrentTabs: saving originalTabId: ' + currentTab.originalTabId + ' for tab with url: ' + currentTab.url);
                newTabList.push(currentTab);
                const newTab = JSON.parse(JSON.stringify(tab));
                newTab.id = newTabId;
                transformedTabs.push(newTab);
            }
            else {
                lsa_clients_common_1.LSAClient.getInstance().logger.logMessage('SafariTabCache: tab has no tabId?');
            }
        }
        if (this.tabCache.push(newTabList) > this.maxTabLists) {
            this.tabCache.splice(0, 1);
        }
        this.currentTabs = transformedTabs;
    }
    async getCurrentBrowserTabs() {
        return this.currentTabs;
    }
    getClosingTabFromCache(tabId) {
        var _a, _b;
        for (const tabList of this.tabCache) {
            for (const tab of tabList) {
                if ((tab === null || tab === void 0 ? void 0 : tab.tabId) === tabId) {
                    lsa_clients_common_1.LSAClient.getInstance().logger.logMessage('SafariTabCache: tab:' + tabId + ' windowId:' + tab.windowId + ' found in cache has url: ' + tab.url);
                    return {
                        tabId: tab.tabId,
                        originalTabId: (_a = tab.originalTabId) !== null && _a !== void 0 ? _a : 0,
                        windowId: tab.windowId,
                        browser: tab.browser,
                        url: (_b = tab.url) !== null && _b !== void 0 ? _b : ''
                    };
                }
            }
            ;
        }
        ;
        lsa_clients_common_1.LSAClient.getInstance().logger.logMessage('SafariTabCache: Failed to find tabId in cache: ' + tabId);
        return null;
    }
    removeTabFromTabCache(tabId) {
        for (const tabList of this.tabCache) {
            for (let i = 0; i < tabList.length; i++) {
                const tab = tabList[i];
                if ((tab === null || tab === void 0 ? void 0 : tab.tabId) === tabId) {
                    lsa_clients_common_1.LSAClient.getInstance().logger.logMessage('SafariTabCache: tab ' + tabId + ' removed from cache has url: ' + tab.url);
                    tabList.splice(i, 1);
                    return true;
                }
            }
            ;
        }
        ;
        lsa_clients_common_1.LSAClient.getInstance().logger.logMessage('SafariTabCache: Failed to remove tab: ' + tabId);
        return false;
    }
    removeTabFromCurrentTabs(tabId) {
        for (let i = 0; i < this.currentTabs.length; i++) {
            const tab = this.currentTabs[i];
            if ((tab === null || tab === void 0 ? void 0 : tab.id) === tabId) {
                lsa_clients_common_1.LSAClient.getInstance().logger.logMessage('SafariTabCache: tab ' + tabId + ' removed from currentTabs has url: ' + tab.url);
                this.currentTabs.splice(i, 1);
                return true;
            }
        }
        ;
        lsa_clients_common_1.LSAClient.getInstance().logger.logMessage('SafariTabCache: tab could not find tabId ' + tabId);
        return false;
    }
    removeTab(tabId) {
        return (this.removeTabFromCurrentTabs(tabId) && this.removeTabFromTabCache(tabId));
    }
    clear() {
        this.tabCache = [];
        this.currentTabs = [];
    }
}
exports.SafariTabCache = SafariTabCache;
//# sourceMappingURL=safariTabCache.js.map