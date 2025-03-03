"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShellExecutorCancelable = exports.ShellExecutor = void 0;
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
class ShellExecutor {
    constructor(electronShell) {
        this.electronShell = electronShell;
        this.subscribers = [];
    }
    addSubscriber(subscriber) {
        this.subscribers.push(subscriber);
    }
    isValidShellExecutePath(path) {
        let url;
        try {
            url = new URL(path);
        }
        catch (e) {
            lsa_clients_common_1.LSAClient.getInstance().logger.logError('ShellExecutor.isValidShellExecutePath() exception:' + e);
            return false;
        }
        return (url.protocol.match(/https?:/)) ? true : false;
    }
    checkCancellation(data) {
        return new Promise((resolve) => {
            var _a;
            if (!this.cancellationChecker)
                resolve(false);
            (_a = this.cancellationChecker) === null || _a === void 0 ? void 0 : _a.shouldCancelExecution(data).then((val) => resolve(val));
        });
    }
    execute(data) {
        try {
            if (data && data.path) {
                let valid = this.isValidShellExecutePath(data.path);
                lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('execute valid=' + valid + ' url=' + data.path);
                if (valid) {
                    this.checkCancellation(data)
                        .then(async (cancel) => {
                        if (!cancel) {
                            lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('ShellExecutor.execute(): No cancellation.');
                            try {
                                this.subscribers.forEach(async (val) => {
                                    await val.onBeforeShellExecution(data);
                                });
                                await this.electronShell.openExternal(data.path);
                                this.subscribers.forEach(async (val) => {
                                    await val.onAfterShellExecution(data, true);
                                });
                            }
                            catch (e) {
                                lsa_clients_common_1.LSAClient.getInstance().logger.logInfo(`ShellExecutor.execute(): Error executing ${data.path}: ${e === null || e === void 0 ? void 0 : e.message}`);
                                this.subscribers.forEach(async (val) => {
                                    await val.onAfterShellExecution(data, false);
                                });
                            }
                        }
                        else {
                            lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('ShellExecutor.execute(): Cancelled.');
                        }
                    });
                }
            }
            else {
                throw new Error('ShellExecutor.execute(): Path null or empty.');
            }
        }
        catch (err) {
            lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('onRemoteExecute exception: ' + err);
        }
    }
    setExecutionCancellationChecker(checker) {
        this.cancellationChecker = checker;
    }
}
exports.ShellExecutor = ShellExecutor;
class ShellExecutorCancelable extends ShellExecutor {
    constructor(electronShell) {
        super(electronShell);
        this.electronShell = electronShell;
        this._executionCancelled = false;
    }
    cancelExecution() {
        this._executionCancelled = true;
    }
    execute(data) {
        setTimeout(() => {
            if (!this._executionCancelled) {
                super.execute(data);
            }
            this._executionCancelled = false;
        }, 2000);
    }
}
exports.ShellExecutorCancelable = ShellExecutorCancelable;
//# sourceMappingURL=shellExecutor.js.map