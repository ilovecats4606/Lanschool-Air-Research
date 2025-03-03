"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputLimiting_Mac = void 0;
const electron_1 = require("electron");
const child_process_1 = require("child_process");
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
const nativeClient_1 = require("../native/nativeClient");
const logSeverity_1 = require("../logSeverity");
class InputLimiting_Mac {
    constructor() {
        this.blockProcess = null;
        this.blocking = false;
        this.shouldBlockInput = false;
        const lsaClient = lsa_clients_common_1.LSAClient.getInstance();
        this.logger = lsaClient.logger;
        this.nativeClient = nativeClient_1.NativeClient.getInstance();
    }
    ExecutablePathForApp(appName) {
        let the_url = electron_1.app.getPath('exe');
        var the_arr = the_url.split('/');
        the_arr.pop();
        the_arr.push(appName);
        return (the_arr.join('/'));
    }
    onProcessExit(code, signal) {
        if (this.blocking) {
            this.startBlockInput();
        }
    }
    startBlockInput() {
        this.blocking = true;
        try {
            let appPath = this.ExecutablePathForApp('telemetry');
            let args = ['/mute'];
            this.nativeClient.writeLog(logSeverity_1.LogSeverity.INFO, 'InputLimiting_Mac shouldBlockInput =  ' + this.shouldBlockInput);
            if (this.shouldBlockInput === true) {
                args.unshift('/blockinput');
            }
            this.blockProcess = (0, child_process_1.spawn)(appPath, args);
            this.nativeClient.writeLog(logSeverity_1.LogSeverity.INFO, 'spawning ' + appPath + ' ' + args + ' returned: ' + this.blockProcess);
            this.blockProcess.on('close', this.onProcessExit);
        }
        catch (err) {
            this.nativeClient.writeLog(logSeverity_1.LogSeverity.INFO, 'startBlockInput exception: ' + err);
        }
    }
    stopBlockInput() {
        var _a, _b;
        this.blocking = false;
        this.nativeClient.writeLog(logSeverity_1.LogSeverity.INFO, 'restoring input');
        (_b = (_a = this.blockProcess) === null || _a === void 0 ? void 0 : _a.stdin) === null || _b === void 0 ? void 0 : _b.write('EXIT\r\n');
        this.blockProcess = null;
    }
    setShouldBlockInput(block) {
        this.shouldBlockInput = block;
    }
}
exports.InputLimiting_Mac = InputLimiting_Mac;
//# sourceMappingURL=inputLimiting.js.map