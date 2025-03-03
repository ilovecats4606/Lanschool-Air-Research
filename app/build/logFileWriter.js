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
exports.LogFileWriter = void 0;
const saveLogs_1 = require("./window/saveLogs");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
class LogFileWriter {
    constructor(logExporter, params) {
        this.logExporter = logExporter;
        if (!params || !params.fileDir)
            this.fileDir = process.env.TEMP || '.';
        else
            this.fileDir = params.fileDir;
        if (!params || !params.filenamePrefix)
            this.filenamePrefix = 'LSAClientCL';
        else
            this.filenamePrefix = params.filenamePrefix;
        if (!params || !params.numPreviousLogsAllowed)
            this.numPreviousLogsAllowed = 10;
        else if (params.numPreviousLogsAllowed > 0)
            this.numPreviousLogsAllowed = params.numPreviousLogsAllowed;
        else
            throw new Error('numPreviousLogsAllowed must be greater than 0');
    }
    async writeLog() {
        const logFilePath = this.getLogFilePath();
        await saveLogs_1.SaveLogs.getInstance(this.logExporter).writeZippedLog(logFilePath);
        await this.removeOldLogs();
    }
    getLogFilePath() {
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().replace(/:/g, '-').split('.')[0];
        const fileName = `${this.filenamePrefix}_${formattedDate}.zip`;
        const fullPath = path.join(this.fileDir, fileName);
        return fullPath;
    }
    async readDir(directory) {
        return new Promise((resolve, reject) => {
            fs.readdir(directory, (err, files) => {
                if (err)
                    reject(err);
                else
                    resolve(files);
            });
        });
    }
    async stat(filePath) {
        return new Promise((resolve, reject) => {
            fs.stat(filePath, (err, stats) => {
                if (err)
                    reject(err);
                else
                    resolve(stats);
            });
        });
    }
    async unlink(filePath) {
        return new Promise((resolve, reject) => {
            fs.unlink(filePath, (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    async removeOldLogs() {
        try {
            const files = await this.readDir(this.fileDir);
            const logFiles = files.filter((file) => file.startsWith(this.filenamePrefix));
            let fileDataArray = [];
            for (let i = 0; i < logFiles.length; i++) {
                const filePath = path.join(this.fileDir, logFiles[i]);
                const fileStat = await this.stat(filePath);
                fileDataArray.push({
                    filePath,
                    mtime: fileStat.mtime
                });
            }
            const sortedFiles = fileDataArray.sort((a, b) => {
                return a.mtime.getTime() - b.mtime.getTime();
            });
            const filesToDelete = sortedFiles.slice(0, Math.max(0, sortedFiles.length - this.numPreviousLogsAllowed));
            await Promise.all(filesToDelete.map(async (file) => {
                await this.unlink(file.filePath);
            }));
        }
        catch (e) {
        }
    }
}
exports.LogFileWriter = LogFileWriter;
//# sourceMappingURL=logFileWriter.js.map