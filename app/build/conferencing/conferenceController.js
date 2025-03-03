"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConferenceController = void 0;
const conferenceDirectiveHandler_1 = require("./conferenceDirectiveHandler");
const electron_1 = require("electron");
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
class ConferenceController {
    constructor(win, classroomEventHandler) {
        this.win = win;
        this.classroomEventHandler = classroomEventHandler;
        this.audioConferenceOngoing = false;
        this.videoConferenceOngoing = false;
        this.studentScreenShareOngoing = false;
        win.addSubscriber(this);
        classroomEventHandler.addSubscriber(this);
        this.conferenceDirectiveHandler = new conferenceDirectiveHandler_1.ConferenceDirectiveHandler(this);
        electron_1.ipcMain.handle('FromUI_ConferenceParamsSet', (event, arg) => {
            lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('Received FromUI_ConferenceParamsSet from Angular: ' +
                JSON.stringify(arg));
            lsa_clients_common_1.LSAClient.getInstance().conferenceUIMessageSink.onConferenceParamsSet();
        });
        electron_1.ipcMain.handle('FromUI_ConferenceError', (event, arg) => {
            lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('Received FromUI_ConferenceError from Angular: ' +
                JSON.stringify(arg));
            lsa_clients_common_1.LSAClient.getInstance().conferenceUIMessageSink.onConferenceError(arg);
        });
        electron_1.ipcMain.handle('FromUI_ConferenceAttachComplete', (event, arg) => {
            lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('Received FromUI_ConferenceAttachComplete from Angular: ' +
                JSON.stringify(arg));
            lsa_clients_common_1.LSAClient.getInstance().conferenceUIMessageSink.onConferenceAttachComplete();
        });
        electron_1.ipcMain.handle('FromUI_ConferenceDetachComplete', (event, arg) => {
            lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('Received FromUI_ConferenceDetachComplete from Angular: ' +
                JSON.stringify(arg));
            lsa_clients_common_1.LSAClient.getInstance().conferenceUIMessageSink.onConferenceDetachComplete();
        });
        electron_1.ipcMain.handle('FromUI_ConferenceAttendeeId', (event, arg) => {
            lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('Received FromUI_ConferenceAttendeeId from Angular: ' +
                JSON.stringify(arg));
            lsa_clients_common_1.LSAClient.getInstance().conferenceUIMessageSink.onConferenceAttendeeId(arg.data);
        });
        electron_1.ipcMain.handle('FromUI_WindowMoving', (event, arg) => {
            win.handleWindowMovingNotification(arg.data);
        });
        electron_1.ipcMain.handle('FromUI_WindowMoved', () => {
            lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('Received FromUI_WindowMoved');
            win.handleWindowMovedNotification();
        });
    }
    onOrgVerification(isVerified) {
    }
    onJoinClass(data) {
    }
    onLeaveClass(data) {
        this.audioConferenceOngoing = false;
        this.videoConferenceOngoing = false;
        this.win.windowRestore();
    }
    onMainWindowMinimize() {
        if (this.audioConferenceOngoing) {
            this.win.positionMinimizedAudioOnly();
            return true;
        }
        return false;
    }
    joinConference() {
        this.win.sendToUI('UI_JoinConference', null);
        lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('ConferenceController.joinConference: (audioConferenceOngoing: ' + this.audioConferenceOngoing +
            ', videoConferenceOngoing: ' + this.videoConferenceOngoing +
            ', studentScreenShareOngoing: ' + this.studentScreenShareOngoing + ')');
        if (!this.studentScreenShareOngoing) {
            this.win.windowRestoreIfMinimized(true);
        }
    }
    leaveConference() {
        this.win.setFullScreenShowTeacher(false);
    }
    setConferenceAttendeeNames(data) {
        this.win.sendToUI('UI_SetConferenceAttendeeNames', data);
    }
    async setConferenceParams(data) {
        if (this.audioConferenceOngoing === false) {
            this.audioConferenceOngoing = !!(data.conferenceType & lsa_clients_common_1.ConferenceTypeEnum.TeacherConferenceTypeAudio);
        }
        this.videoConferenceOngoing = !!(data.conferenceType & lsa_clients_common_1.ConferenceTypeEnum.TeacherConferenceTypeVideo);
        if (this.videoConferenceOngoing) {
            await this.win.setFullScreenShowTeacher(!data.windowed);
        }
        else {
            await this.win.setFullScreenShowTeacher(false);
        }
        this.studentScreenShareOngoing = !!(data.conferenceType & lsa_clients_common_1.ConferenceTypeEnum.StudentConferenceTypeVideo);
        this.win.sendToUI('UI_SetConferenceParams', data);
    }
}
exports.ConferenceController = ConferenceController;
//# sourceMappingURL=conferenceController.js.map