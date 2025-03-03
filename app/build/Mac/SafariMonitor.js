"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafariMonitor = void 0;
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
const child_process_1 = require("child_process");
const clientutils_1 = require("../clientutils");
class SafariMonitor {
    constructor(classroomEventHandler) {
        this.inClass = false;
        this.historyProcess = null;
        classroomEventHandler.addSubscriber(this);
    }
    start() {
        var _a;
        if (this.historyProcess === null) {
            try {
                let appPath = clientutils_1.ClientUtils.exePathForApp('safarimonitor');
                let args = ['/history', '/limiting'];
                this.historyProcess = (0, child_process_1.spawn)(appPath, args);
                (_a = this.historyProcess) === null || _a === void 0 ? void 0 : _a.on('close', (code, signal) => {
                    setTimeout(() => {
                        this.onMonitorTerminated();
                    }, 2000);
                });
            }
            catch (err) {
                lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('SafariMonitor start exception: ' + err);
            }
        }
    }
    onMonitorTerminated() {
        this.historyProcess = null;
        if (this.inClass) {
            lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('SafariMonitor restarting because in class');
            this.start();
        }
        else {
            lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('SafariMonitor restarting BUT NOT IN CLASS?????');
        }
    }
    stop() {
        var _a, _b, _c, _d;
        lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('SafariMonitor stopping Safari history');
        try {
            if (((_b = (_a = this.historyProcess) === null || _a === void 0 ? void 0 : _a.stdin) === null || _b === void 0 ? void 0 : _b.writable) === true) {
                (_d = (_c = this.historyProcess) === null || _c === void 0 ? void 0 : _c.stdin) === null || _d === void 0 ? void 0 : _d.write('EXIT\r\n');
            }
        }
        catch (e) {
            lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('SafariMonitor exception stopping: ' + e);
        }
        this.historyProcess = null;
    }
    onJoinClass(data) {
        var _a;
        this.inClass = true;
        this.start();
        lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('SafariMonitor joined class: ' + ((_a = this.historyProcess) === null || _a === void 0 ? void 0 : _a.pid));
    }
    onLeaveClass(data) {
        var _a;
        this.inClass = false;
        lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('SafariMonitor LEFT class: ' + ((_a = this.historyProcess) === null || _a === void 0 ? void 0 : _a.pid));
        this.stop();
    }
    onOrgVerification(isVerified) { }
    onTelemetryRequest(data) { }
}
exports.SafariMonitor = SafariMonitor;
//# sourceMappingURL=SafariMonitor.js.map