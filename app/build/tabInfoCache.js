"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TabInfoCache = void 0;
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
const safariTabCache_1 = require("./safariTabCache");
class TabInfoCache {
    constructor() {
        this.tabMap = new Map();
        this.safariTabCache = new safariTabCache_1.SafariTabCache();
    }
    cacheCurrentTabs(currentTabs, browser) {
        if (browser.startsWith('chrome') || browser.startsWith('edge')) {
            this.tabMap.set(browser, currentTabs);
        }
        else if (browser.startsWith('safari')) {
            this.safariTabCache.cacheCurrentTabs(currentTabs, browser);
        }
        else {
            lsa_clients_common_1.LSAClient.getInstance().logger.logError('TabInfoCache: cacheCurrentTabs unknown browser ' + browser);
        }
    }
    async getCurrentBrowserTabs() {
        let tabs = [];
        for (let list of this.tabMap.values()) {
            tabs = tabs.concat(list);
        }
        return tabs.concat(await this.safariTabCache.getCurrentBrowserTabs());
    }
    getClosingTabFromCache(tabId, aTabMap) {
        var _a;
        for (let entry of aTabMap.entries()) {
            const tab = entry[1].find(tab => tabId === tab.id);
            if (!tab) {
                continue;
            }
            return {
                tabId: tab.id,
                windowId: tab.windowId,
                browser: entry[0],
                url: (_a = tab.url) !== null && _a !== void 0 ? _a : ''
            };
        }
        return null;
    }
    getClosingTab(tabId) {
        let closingTab = this.getClosingTabFromCache(tabId, this.tabMap);
        if (!closingTab) {
            closingTab = this.safariTabCache.getClosingTabFromCache(tabId);
        }
        return closingTab;
    }
    removeTabFromTabs(tabId) {
        for (let entry of this.tabMap.entries()) {
            const index = entry[1].findIndex(tab => tabId === tab.id);
            if (index >= 0) {
                entry[1].splice(index, 1);
                lsa_clients_common_1.LSAClient.getInstance().logger.logMessage('TabInfoCache: removeTabFromTabs removed tab ' + index);
                return true;
            }
        }
        return false;
    }
    removeTab(tabId) {
        let removedChrome = this.removeTabFromTabs(tabId);
        let removedEdge = this.removeTabFromTabs(tabId);
        let removedSafari = this.safariTabCache.removeTab(tabId);
        lsa_clients_common_1.LSAClient.getInstance().logger.logMessage('TabInfoCache: removeTab  removedChrome: ' + removedChrome + ' removedEdge: ' + removedEdge + ' removedSafari: ' + removedSafari);
        return (removedChrome || removedEdge || removedSafari);
    }
    clearCache() {
        this.tabMap.clear();
        this.safariTabCache.clear();
    }
}
exports.TabInfoCache = TabInfoCache;
//# sourceMappingURL=tabInfoCache.js.map