import { IpcMain } from 'electron';
import { IMainWindowController } from './mainWindow';

export interface IHeartbeatNotificationRecipient {
    onHeartbeatResponse(): Promise<void>;
    onHeartbeatExpired(): Promise<void>;
}

export class WindowPingHeartbeat {
    protected heartbeatTimer: NodeJS.Timeout;
    protected pingTimer: NodeJS.Timeout;

    public static heartbeatFrequency = 10000;
    public static pongWaitPeriod = 5000;

    public constructor(
        protected mainWindowController: IMainWindowController,
        protected heartbeatNotificationRecipient: IHeartbeatNotificationRecipient,
        protected ipcMain: IpcMain) {
        ipcMain.handle('FromUI_Pong', async (event, arg) => {
            await this.gotPong();
        });
    }

    protected async gotPong() {
        clearTimeout(this.pingTimer);
        await this.heartbeatNotificationRecipient.onHeartbeatResponse();
    }

    protected sendPing() {
        this.pingTimer = setTimeout(async () => {
            clearTimeout(this.heartbeatTimer);
            await this.heartbeatNotificationRecipient.onHeartbeatExpired();
        }, WindowPingHeartbeat.pongWaitPeriod);
        
        this.mainWindowController.sendToUI('UI_Ping', {});
    }

    public start() {
        this.heartbeatTimer = setTimeout(() => {
            this.stop();
            this.sendPing();
            this.start();
        }, WindowPingHeartbeat.heartbeatFrequency);
    }

    public stop() {
        clearTimeout(this.pingTimer);
        clearTimeout(this.heartbeatTimer);
    }
}