"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtmTabsInstrumentation = void 0;
const events_1 = require("events");
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
class OtmTabsInstrumentation {
    constructor() {
        this.currentOTMTabs = { tabs: [] };
        this.events = new events_1.EventEmitter();
    }
    static getInstance() {
        if (!OtmTabsInstrumentation.instance) {
            OtmTabsInstrumentation.instance = new OtmTabsInstrumentation();
        }
        return OtmTabsInstrumentation.instance;
    }
    setExtensionChannel(extChannel) {
        this.extensionChannel = extChannel;
    }
    handleCurrentOTMTabsPost(currentOTMTabs) {
        var _a;
        if (process.platform === 'win32' && ((_a = currentOTMTabs.windows) === null || _a === void 0 ? void 0 : _a.count) === 0) {
            lsa_clients_common_1.LSAClient.getInstance().logger.logWarning('Discarding response from extension as it reports that no browser window is open.');
        }
        else {
            this.currentOTMTabs = currentOTMTabs;
            this.events.emit(OtmTabsInstrumentation.updateCurrentOTMTabsEvent);
        }
    }
    async getCurrentBrowserTabs() {
        var _a;
        (_a = this.extensionChannel) === null || _a === void 0 ? void 0 : _a.sendGetOTMTabsRequest();
        try {
            await lsa_clients_common_1.Utils.waitForEvent(OtmTabsInstrumentation.updateCurrentOTMTabsEvent, this.events, 4000);
            lsa_clients_common_1.store.dispatch({ type: 'ExtensionConnected', payload: true });
        }
        catch (error) {
            this.currentOTMTabs = { tabs: [] };
            lsa_clients_common_1.store.dispatch({ type: 'ExtensionConnected', payload: false });
            const err = error;
            lsa_clients_common_1.LSAClient.getInstance().logger.logWarning('getCurrentBrowserTabs timed out waiting for response: ' + err.message);
        }
        return this.currentOTMTabs;
    }
    async updateSpecialSites() {
        var _a;
        (_a = this.extensionChannel) === null || _a === void 0 ? void 0 : _a.sendUpdateSpecialSitesRequest();
    }
}
exports.OtmTabsInstrumentation = OtmTabsInstrumentation;
OtmTabsInstrumentation.updateCurrentOTMTabsEvent = 'updateCurrentOTMTabs';
//# sourceMappingURL=otmTabInstrumentation.js.map