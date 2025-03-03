"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputLimiting = void 0;
const inputLimiting_1 = require("./win/inputLimiting");
const inputLimiting_2 = require("./Mac/inputLimiting");
class InputLimiting {
    constructor() {
        if (process.platform === 'win32') {
            this.blockInputImpl = new inputLimiting_1.InputLimiting_Win();
        }
        else {
            this.blockInputImpl = new inputLimiting_2.InputLimiting_Mac();
        }
    }
    startBlockInput() {
        this.blockInputImpl.startBlockInput();
    }
    stopBlockInput() {
        this.blockInputImpl.stopBlockInput();
    }
    setShouldBlockInput(block) {
        this.blockInputImpl.setShouldBlockInput(block);
    }
}
exports.InputLimiting = InputLimiting;
//# sourceMappingURL=inputLimiting.js.map