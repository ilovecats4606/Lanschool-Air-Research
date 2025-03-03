"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputLimiting_Win = void 0;
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
const nativeClient_1 = require("../native/nativeClient");
const child_process_1 = require("child_process");
const clientutils_1 = require("../clientutils");
class InputLimiting_Win {
    constructor() {
        this.blockProcess = null;
    }
    startBlockInput() {
        lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('starting windows input limit');
        const nativeClient = nativeClient_1.NativeClient.getInstance();
        nativeClient.startInputLimiting();
        let appPath = clientutils_1.ClientUtils.exePathForApp('MuteAudio.exe');
        this.blockProcess = (0, child_process_1.spawn)(appPath, []);
    }
    stopBlockInput() {
        var _a, _b;
        lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('stopping windows input limit');
        const nativeClient = nativeClient_1.NativeClient.getInstance();
        nativeClient.stopInputLimiting();
        (_b = (_a = this.blockProcess) === null || _a === void 0 ? void 0 : _a.stdin) === null || _b === void 0 ? void 0 : _b.write('EXIT\r\n');
    }
    setShouldBlockInput(block) { }
}
exports.InputLimiting_Win = InputLimiting_Win;
//# sourceMappingURL=inputLimiting.js.map