"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatteryInstrumentation_Win = void 0;
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
const util = require('util');
const clientutils_1 = require("../clientutils");
const execAndSpawn_1 = require("../execAndSpawn");
class BatteryInstrumentation_Win {
    async getCurrentBatteryStatus() {
        let cmd = '';
        let appPath = clientutils_1.ClientUtils.exePathForApp('BatteryInformation.exe');
        cmd = `\"${appPath}\"`;
        try {
            const { stdout, stderr } = await (0, execAndSpawn_1.execAndSpawn)(cmd);
            if (stderr) {
                return Promise.reject('Error retrieving battery information from windows student: ' +
                    stderr);
            }
            if (!stdout) {
                return Promise.reject('Error retrieving battery information from windows student: Empty buffer.');
            }
            let obj = JSON.parse(stdout.toString());
            const ret = new lsa_clients_common_1.BatteryStatus();
            ret.charging = obj.charging;
            ret.level = +obj.percentRemaining;
            ret.dischargingTime = +obj.secondsRemaining;
            return Promise.resolve(ret);
        }
        catch (err) {
            return Promise.reject('Error retrieving battery info from windows student: ' + err);
        }
    }
}
exports.BatteryInstrumentation_Win = BatteryInstrumentation_Win;
//# sourceMappingURL=batteryInstrumentation.js.map