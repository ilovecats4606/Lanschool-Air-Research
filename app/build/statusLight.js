"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusLight = void 0;
class StatusLight {
    constructor(win) {
        this.win = win;
    }
    statusNotification(status) {
        this.win.sendToUI('UI_SetConnectivityStatus', status);
    }
    getClientProvisioningHelpUrl(language) {
        if (process.platform === 'darwin') {
            return "https://helpdesk.lanschoolair.com/portal/en/kb/articles/mass-deploying-lanschool-air-for-mac-student";
        }
        else if (process.platform === 'win32') {
            return "https://helpdesk.lanschoolair.com/portal/en/kb/articles/mass-deploying-lanschool-air-for-windows-student";
        }
        return "https://helpdesk.lanschoolair.com/portal/en/kb/articles/mass-deploying-lanschool-air-for-chromebook-student";
    }
}
exports.StatusLight = StatusLight;
//# sourceMappingURL=statusLight.js.map