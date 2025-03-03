"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatteryInstrumentation = void 0;
const batteryInstrumentation_1 = require("./win/batteryInstrumentation");
const batteryInstrumentation_2 = require("./Mac/batteryInstrumentation");
class BatteryInstrumentation {
    constructor() {
        if (process.platform === 'win32') {
            this.batteryInstrumentationImpl = new batteryInstrumentation_1.BatteryInstrumentation_Win();
        }
        else {
            this.batteryInstrumentationImpl = new batteryInstrumentation_2.BatteryInstrumentation_Mac();
        }
    }
    getCurrentBatteryStatus() {
        return this.batteryInstrumentationImpl.getCurrentBatteryStatus();
    }
}
exports.BatteryInstrumentation = BatteryInstrumentation;
//# sourceMappingURL=batteryInstrumentation.js.map