"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebExtensionCommands = void 0;
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
function sanitizeUrl(url) {
    return new URL(url).toString();
}
function thisHappenedReallyRecently(eventTime) {
    const rightNow = Date.now();
    if (eventTime > rightNow)
        return false;
    return (rightNow - 10000 < eventTime);
}
class WebExtensionState {
    constructor() {
        this.initState();
    }
    initState() {
        this.currentState = {
            classInfo: undefined,
            pushedSites: [],
            lastStateChangeTimestamp: Date.now(),
            intellitaskEnabled: false,
        };
    }
    addPushedSite(sanitizedUrl) {
        this.currentState.pushedSites.push({
            url: sanitizedUrl,
            pushedTime: Date.now()
        });
        this.currentState.lastStateChangeTimestamp = Date.now();
    }
    removePushedSite(sanitizedUrl) {
        for (let i = 0; i < this.currentState.pushedSites.length; i++) {
            if (this.currentState.pushedSites[i].url === sanitizedUrl &&
                thisHappenedReallyRecently(this.currentState.pushedSites[i].pushedTime)) {
                this.currentState.pushedSites.splice(i, 1);
                this.currentState.lastStateChangeTimestamp = Date.now();
                break;
            }
        }
    }
    getCurrentState() {
        lsa_clients_common_1.LSAClient.getInstance().logger.logDebug(`WebExtensionState.getCurrentState(): ${JSON.stringify(this.currentState)}`);
        return this.currentState;
    }
    onJoinClass(data) {
        try {
            this.currentState.classInfo = structuredClone(data);
            this.currentState.lastStateChangeTimestamp = Date.now();
        }
        catch (e) {
            lsa_clients_common_1.LSAClient.getInstance().logger.logError(`WebExtensionState.onJoinClass(): Error cloning join class info: ${e === null || e === void 0 ? void 0 : e.message}`);
        }
    }
    onTelemetryRequest(data) {
        try {
            this.currentState.intellitaskEnabled = data.sendIntelliTaskInfo;
            this.currentState.lastStateChangeTimestamp = Date.now();
        }
        catch (e) {
            lsa_clients_common_1.LSAClient.getInstance().logger.logError(`WebExtensionState.onTelemetryRequest(): Error cloning intellitask info: ${e === null || e === void 0 ? void 0 : e.message}`);
        }
    }
    onLeaveClass(data) {
        this.initState();
    }
}
class WebExtensionCommands {
    constructor(classroomEventHandler, shellExecutor, webLimiter) {
        this.classroomEventHandler = classroomEventHandler;
        this.shellExecutor = shellExecutor;
        this.webLimiter = webLimiter;
        this.classroomEventHandler.addSubscriber(this);
        this.shellExecutor.addSubscriber(this);
        this.currentState = new WebExtensionState();
    }
    async onBeforeShellExecution(data) {
        try {
            lsa_clients_common_1.LSAClient.getInstance().logger.logDebug(`WebExtensionCommands.onBeforeShellExecution(+): data = ${JSON.stringify(data)}`);
            const sanitizedUrl = sanitizeUrl(data.path);
            this.currentState.addPushedSite(sanitizedUrl);
        }
        catch (e) {
            lsa_clients_common_1.LSAClient.getInstance().logger.logWarning(`WebExtensionState.onBeforeShellExecution(): Adding URL failed: ${e === null || e === void 0 ? void 0 : e.message}`);
        }
    }
    async onAfterShellExecution(data, shellExecutionSuccess) {
        lsa_clients_common_1.LSAClient.getInstance().logger.logDebug(`WebExtensionCommands.onAfterShellExecution(+): data = ${JSON.stringify(data)}, shellExecutionSuccess = ${shellExecutionSuccess}`);
        if (shellExecutionSuccess === true) {
            return;
        }
        let sanitizedUrl = '';
        try {
            sanitizedUrl = sanitizeUrl(data.path);
        }
        catch (e) {
            lsa_clients_common_1.LSAClient.getInstance().logger.logWarning(`WebExtensionState.onAfterShellExecution(): Sanitizing URL failed: ${e === null || e === void 0 ? void 0 : e.message}`);
            return;
        }
        this.currentState.removePushedSite(sanitizedUrl);
    }
    getCurrentState() {
        return structuredClone(this.currentState.getCurrentState());
    }
    onJoinClass(data) {
        this.currentState.onJoinClass(data);
        this.webLimiter.sendWakeupKeystroke();
    }
    onLeaveClass(data) {
        this.currentState.onLeaveClass(data);
        this.webLimiter.sendWakeupKeystroke();
    }
    onTelemetryRequest(data) {
        if (data.sendIntelliTaskInfo !== this.currentState.getCurrentState().intellitaskEnabled) {
            this.currentState.onTelemetryRequest(data);
            this.webLimiter.sendWakeupKeystroke();
        }
    }
    onOrgVerification(isVerified) {
    }
}
exports.WebExtensionCommands = WebExtensionCommands;
//# sourceMappingURL=webExtensionCommands.js.map