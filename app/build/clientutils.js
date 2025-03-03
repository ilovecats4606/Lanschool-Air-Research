"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientUtils = void 0;
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
const electron_1 = require("electron");
const path = __importStar(require("path"));
class ClientUtils {
    static exePathForApp(appName) {
        if (electron_1.app) {
            let the_url = electron_1.app.getPath('exe');
            let splitChar = '/';
            if (process.platform === 'win32') {
                splitChar = '\\';
            }
            var the_arr = the_url.split(splitChar);
            if (!process.env.LSA_NATIVE_FILEPATH) {
                the_arr.pop();
            }
            the_arr.push(appName);
            return (the_arr.join(splitChar));
        }
        return '';
    }
    static productFolder() {
        let result = "";
        if (process.platform === 'darwin' && electron_1.app) {
            result = electron_1.app.getPath('exe');
            for (let i = 0; i < 4; i++) {
                result = path.dirname(result);
            }
        }
        else if (process.platform === 'win32' && electron_1.app) {
            let exePath = electron_1.app.getPath('exe');
            result = path.dirname(exePath);
        }
        lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('productFolder is ' + result);
        return result;
    }
    static getTempPath() {
        let path = '';
        if (electron_1.app) {
            path = electron_1.app.getPath('temp');
        }
        return path;
    }
}
exports.ClientUtils = ClientUtils;
//# sourceMappingURL=clientutils.js.map