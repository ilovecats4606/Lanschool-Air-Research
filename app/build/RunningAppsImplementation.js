"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunningAppsImplementation = void 0;
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
const clientutils_1 = require("./clientutils");
const execAndSpawn_1 = require("./execAndSpawn");
class RunningAppsImplementation {
    async getRunningApps() {
        return this.getRunningAppsEx(true);
    }
    async getRunningAppsEx(includeIconData) {
        let appPath = clientutils_1.ClientUtils.exePathForApp('runningapps');
        var cmd = `\"${appPath}\" /list`;
        if (includeIconData === false) {
            cmd += ' /noicondata';
        }
        const { stdout, stderr } = await (0, execAndSpawn_1.execAndSpawn)(cmd);
        if (stderr) {
            return Promise.reject('Error retrieving running apps: ' + stderr.toString());
        }
        if (!stdout) {
            return Promise.reject('Error retrieving running apps: Empty buffer.');
        }
        var list = new Array();
        try {
            let appList = JSON.parse(stdout.toString());
            if (Array.isArray(appList) && appList.length > 0) {
                for (let i = 0; i < appList.length; i++) {
                    var app = new lsa_clients_common_1.RunningAppModel();
                    let runningApp = appList[i];
                    if (runningApp.appName) {
                        app.appName = runningApp.appName;
                    }
                    if (runningApp.closeKey) {
                        app.closeKey = runningApp.closeKey;
                    }
                    if (includeIconData && runningApp.icon && runningApp.icon.data && runningApp.icon.type) {
                        app.icon.data = runningApp.icon.data;
                        app.icon.type = runningApp.icon.type;
                    }
                    list.push(app);
                }
            }
        }
        catch (err) {
            return Promise.reject('Error parsing running apps data: ' + err);
        }
        return Promise.resolve(list);
    }
}
exports.RunningAppsImplementation = RunningAppsImplementation;
//# sourceMappingURL=RunningAppsImplementation.js.map