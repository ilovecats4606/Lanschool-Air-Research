"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindowPingHeartbeat = void 0;
class WindowPingHeartbeat {
    constructor(mainWindowController, heartbeatNotificationRecipient, ipcMain) {
        this.mainWindowController = mainWindowController;
        this.heartbeatNotificationRecipient = heartbeatNotificationRecipient;
        this.ipcMain = ipcMain;
        ipcMain.handle('FromUI_Pong', async (event, arg) => {
            await this.gotPong();
        });
    }
    async gotPong() {
        clearTimeout(this.pingTimer);
        await this.heartbeatNotificationRecipient.onHeartbeatResponse();
    }
    sendPing() {
        this.pingTimer = setTimeout(async () => {
            clearTimeout(this.heartbeatTimer);
            await this.heartbeatNotificationRecipient.onHeartbeatExpired();
        }, WindowPingHeartbeat.pongWaitPeriod);
        this.mainWindowController.sendToUI('UI_Ping', {});
    }
    start() {
        this.heartbeatTimer = setTimeout(() => {
            this.stop();
            this.sendPing();
            this.start();
        }, WindowPingHeartbeat.heartbeatFrequency);
    }
    stop() {
        clearTimeout(this.pingTimer);
        clearTimeout(this.heartbeatTimer);
    }
}
exports.WindowPingHeartbeat = WindowPingHeartbeat;
WindowPingHeartbeat.heartbeatFrequency = 10000;
WindowPingHeartbeat.pongWaitPeriod = 5000;
//# sourceMappingURL=windowPingHeartbeat.js.map