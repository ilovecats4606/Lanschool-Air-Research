"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaveLogs = void 0;
const electron_1 = require("electron");
const promises_1 = require("fs/promises");
const i18next_config_1 = require("../i18n/configs/i18next.config");
const zip_js_1 = require("@zip.js/zip.js");
class SaveLogs {
    constructor(i18n, logExporter) {
        this.i18n = i18n;
        this.logExporter = logExporter;
        this.isOnDisplay = false;
    }
    static getInstance(logExporter) {
        return new SaveLogs(i18next_config_1.i18next, logExporter);
    }
    async saveLog(browserWindow) {
        if (this.isOnDisplay === true) {
            return false;
        }
        let ret = true;
        try {
            this.isOnDisplay = true;
            const defaultLogName = this.i18n.t('fileSaveDialog.saveAsType');
            var dialogSaveResult;
            if (typeof browserWindow !== 'undefined') {
                dialogSaveResult = await electron_1.dialog.showSaveDialog(browserWindow, {
                    filters: [
                        {
                            name: defaultLogName,
                            extensions: ['zip']
                        }
                    ],
                    defaultPath: 'lsa-client.zip'
                });
            }
            else {
                dialogSaveResult = await electron_1.dialog.showSaveDialog({
                    filters: [
                        {
                            name: defaultLogName,
                            extensions: ['zip']
                        }
                    ],
                    defaultPath: 'lsa-client.zip'
                });
            }
            if (dialogSaveResult &&
                !dialogSaveResult.canceled &&
                dialogSaveResult.filePath &&
                dialogSaveResult.filePath.length > 0) {
                await this.writeZippedLog(dialogSaveResult.filePath);
            }
            else {
                ret = false;
            }
        }
        catch (err) {
            throw new Error('SaveLogs.saveLog(): Error: ' + err);
        }
        finally {
            this.isOnDisplay = false;
        }
        return ret;
    }
    async writeZippedLog(path) {
        const platformName = process.platform === 'darwin' ? "Mac" : "Windows";
        const header = `== LanSchool Air for ${platformName} version ${electron_1.app.getVersion()} ==\r\n`;
        let headers = new Array;
        headers.push(header);
        const obfuscatedLog = await this.logExporter.retrieveObfuscatedLogBufferWithHeader(headers);
        const zipFileWriter = new zip_js_1.BlobWriter();
        const zipWriter = new zip_js_1.ZipWriter(zipFileWriter);
        const helloWorldReader = new zip_js_1.TextReader(obfuscatedLog);
        await zipWriter.add("lsa-client.log", helloWorldReader);
        await zipWriter.close();
        const zipFileBlob = await zipFileWriter.getData();
        const buffer = Buffer.from(await zipFileBlob.arrayBuffer());
        await (0, promises_1.writeFile)(path, buffer);
    }
}
exports.SaveLogs = SaveLogs;
//# sourceMappingURL=saveLogs.js.map