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
exports.ThumbnailCapture = void 0;
const electron_1 = require("electron");
const clientutils_1 = require("./clientutils");
const execAndSpawn_1 = require("./execAndSpawn");
const ThumbnailModels = __importStar(require("@lenovo-software/lsa-clients-common/dist/models/thumbnail"));
const MaxLinearResolution = 1920;
class ThumbnailCapture {
    constructor() {
        this.monitorIndex = 0;
    }
    async getThumbnail(request) {
        const thumbnailImage = await this.getThumbnailWithMonitorIndex(this.monitorIndex, request);
        if (process.platform === 'win32') {
            this.monitorIndex++;
            let numScreens = electron_1.screen.getAllDisplays().length;
            if (this.monitorIndex >= numScreens) {
                this.monitorIndex = 0;
            }
        }
        return Promise.resolve(thumbnailImage);
    }
    constrainResolution(width, height) {
        let screenWidth = width;
        let screenHeight = height;
        let longestDim = Math.max(screenWidth, screenHeight);
        if (longestDim > MaxLinearResolution) {
            const longestIsWidth = (longestDim === screenWidth);
            let shortestDim = longestIsWidth ? screenHeight : screenWidth;
            shortestDim = Math.round(MaxLinearResolution / (longestDim / shortestDim));
            longestDim = MaxLinearResolution;
            screenWidth = longestIsWidth ? longestDim : shortestDim;
            screenHeight = longestIsWidth ? shortestDim : longestDim;
        }
        let newSize = new ThumbnailModels.ThumbnailSize();
        newSize.width = screenWidth;
        newSize.height = screenHeight;
        return newSize;
    }
    async getThumbnailWithMonitorIndex(monitorIndex, request) {
        let width = 480;
        let height = 240;
        if (request.size) {
            let newSize = this.constrainResolution(request.size.width, request.size.height);
            width = newSize.width;
            height = newSize.height;
        }
        let cmd = '';
        if (process.platform === 'darwin') {
            let appPath = clientutils_1.ClientUtils.exePathForApp('telemetry');
            cmd = `\"${appPath}\" "{ &quot;width&quot;: ${width}, &quot;height&quot;: ${height} }" `;
        }
        else if (process.platform === 'win32') {
            if (request.skipResize) {
                width = -1;
                height = -1;
            }
            let appPath = clientutils_1.ClientUtils.exePathForApp('DesktopThumbnail.exe');
            cmd = `\"${appPath}\" "{ &quot;screen&quot;: ${this.monitorIndex}, &quot;width&quot;: ${width}, &quot;height&quot;: ${height} }"`;
        }
        else {
            return Promise.reject('Error retrieving thumbnail: Unrecognized platform.');
        }
        try {
            const { stdout, stderr } = await (0, execAndSpawn_1.execAndSpawn)(cmd, { maxBuffer: 1024 * 1024 * 8, windowsHide: true });
            if (stderr) {
                return Promise.reject('Error retrieving thumbnail: ' + stderr);
            }
            if (!stdout) {
                return Promise.reject('Error retrieving thumbnail: Empty buffer.');
            }
            let obj = JSON.parse(stdout.toString());
            const ret = new ThumbnailModels.ThumbnailImage();
            ret.activeTabFailure = false;
            ret.type = 'base64';
            ret.source = ThumbnailModels.ThumbnailSource.ActiveTab;
            ret.size = new ThumbnailModels.ThumbnailSize();
            ret.size.width = obj.thumbnail.width;
            ret.size.height = obj.thumbnail.height;
            ret.image = obj.thumbnail.image.data;
            return Promise.resolve(ret);
        }
        catch (err) {
            return Promise.reject('Error retrieving thumbnail: ' + err);
        }
    }
}
exports.ThumbnailCapture = ThumbnailCapture;
//# sourceMappingURL=thumbnailCapture.js.map