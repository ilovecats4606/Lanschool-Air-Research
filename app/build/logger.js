"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const logSeverity_1 = require("./logSeverity");
class logger {
    static formatLine(msg) {
        return logger.timeStampMS(true) + ': ' + msg;
    }
    constructor(storage, exporter, noLog) {
        this.storage = storage;
        this.exporter = exporter;
        this.noLog = noLog;
    }
    shouldLog(msg) {
        if (!this.noLog)
            return;
        for (const regex of this.noLog) {
            if (regex.test(msg))
                return false;
        }
        return true;
    }
    logDebug(msg) {
        if (!this.shouldLog(msg))
            return;
        this.exporter.logDebug(msg);
        this.storage.logDebug(logSeverity_1.LogSeverity.DEBUG, logger.formatLine(msg));
    }
    logInfo(msg) {
        if (!this.shouldLog(msg))
            return;
        this.exporter.logInfo(msg);
        this.storage.logDebug(logSeverity_1.LogSeverity.INFO, logger.formatLine(msg));
    }
    logMessage(msg) {
        if (!this.shouldLog(msg))
            return;
        this.exporter.logInfo(msg);
        this.storage.logDebug(logSeverity_1.LogSeverity.INFO, logger.formatLine(msg));
    }
    logWarning(msg) {
        this.exporter.logWarning(msg);
        this.storage.logDebug(logSeverity_1.LogSeverity.WARNING, logger.formatLine(msg));
    }
    logError(msg) {
        this.exporter.logError(msg);
        this.storage.logDebug(logSeverity_1.LogSeverity.ERROR, logger.formatLine(msg));
    }
    static timeStampMS(doMS) {
        const now = new Date();
        const date = [now.getMonth() + 1, now.getDate(), now.getFullYear()];
        const time = [now.getHours().toString(), now.getMinutes().toString(), now.getSeconds().toString()];
        const time_ms = now.getMilliseconds();
        for (let i = 1; i < 3; i++) {
            if (Number(time[i]) < 10) {
                time[i] = '0' + time[i];
            }
        }
        let dateTime = date.join('/') + ' ' + time.join(':');
        if (doMS) {
            dateTime += '.' + time_ms;
        }
        return dateTime;
    }
}
exports.logger = logger;
//# sourceMappingURL=logger.js.map