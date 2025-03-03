"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatteryInstrumentation_Mac = void 0;
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
const clientutils_1 = require("../clientutils");
const execAndSpawn_1 = require("../execAndSpawn");
class BatteryInstrumentation_Mac {
    async getCurrentBatteryStatus() {
        var _a;
        let appPath = clientutils_1.ClientUtils.exePathForApp('telemetry');
        appPath = `\"${appPath}\" "/batterystatus" `;
        let cmd = appPath;
        try {
            const { stdout, stderr } = await (0, execAndSpawn_1.execAndSpawn)(cmd);
            if (stderr) {
                return Promise.reject('Error retrieving battery information from Mac student: ' +
                    stderr);
            }
            if (!stdout) {
                return Promise.reject('Error retrieving battery information from Mac student: Empty buffer.');
            }
            let obj = JSON.parse(stdout.toString());
            if (obj === null) {
                lsa_clients_common_1.LSAClient.getInstance().logger.logInfo(obj + 'Error : battery object from Mac is null');
                return Promise.reject('Error : battery object from Mac is null');
            }
            else {
                const ret = new lsa_clients_common_1.BatteryStatus();
                ret.charging = obj.charging;
                ret.level = obj.level;
                ret.dischargingTime = obj.dischargingTime;
                let charging = (_a = ret.charging) !== null && _a !== void 0 ? _a : "false";
                lsa_clients_common_1.LSAClient.getInstance().logger.logInfo("battery charging level: " + ret.level + ", discharge time: " + ret.dischargingTime + ",charging: " + charging);
                return Promise.resolve(ret);
            }
        }
        catch (err) {
            return Promise.reject('Error retrieving battery info from Mac student: ' + err);
        }
    }
}
exports.BatteryInstrumentation_Mac = BatteryInstrumentation_Mac;
//# sourceMappingURL=batteryInstrumentation.js.map