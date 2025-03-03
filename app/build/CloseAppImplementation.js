"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloseAppImplementation = void 0;
const clientutils_1 = require("./clientutils");
const execAndSpawn_1 = require("./execAndSpawn");
class CloseAppImplementation {
    async closeApp(data) {
        let appPath = clientutils_1.ClientUtils.exePathForApp('runningapps');
        var cmd = `\"${appPath}\" /close \"${data.closeKey}\"`;
        const { stderr } = await (0, execAndSpawn_1.execAndSpawn)(cmd);
        if (stderr) {
            throw new Error('Error closing running app : ' + stderr.toString());
        }
    }
}
exports.CloseAppImplementation = CloseAppImplementation;
//# sourceMappingURL=CloseAppImplementation.js.map