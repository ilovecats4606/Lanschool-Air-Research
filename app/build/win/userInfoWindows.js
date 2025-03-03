"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserInfoWindows = void 0;
const clientutils_1 = require("../clientutils");
const execAndSpawn_1 = require("../execAndSpawn");
class UserInfoWindows {
    static async getInfo(args = 'all') {
        if (UserInfoWindows.userInfo) {
            return Promise.resolve(UserInfoWindows.userInfo);
        }
        const appPath = clientutils_1.ClientUtils.exePathForApp('UserInfo.exe');
        const cmd = `\"${appPath}\" "${args}"`;
        try {
            const { stdout, stderr } = await (0, execAndSpawn_1.execAndSpawn)(cmd);
            if (stderr) {
                return Promise.reject('Error retrieving user information from windows student: ' +
                    stderr);
            }
            if (!stdout) {
                return Promise.reject('Error retrieving user information from windows student: Empty buffer.');
            }
            const obj = JSON.parse(stdout.toString());
            UserInfoWindows.userInfo = {
                displayName: obj.displayName,
                loginName: obj.loginName
            };
            return Promise.resolve(UserInfoWindows.userInfo);
        }
        catch (err) {
            return Promise.reject('Error retrieving user info from windows student: ' + err);
        }
    }
}
exports.UserInfoWindows = UserInfoWindows;
//# sourceMappingURL=userInfoWindows.js.map