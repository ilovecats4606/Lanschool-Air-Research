"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingController = void 0;
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
const electron_1 = require("electron");
const meetingDirectiveHandler_1 = require("./meetingDirectiveHandler");
class MeetingController {
    constructor(win, classroomEventHandler) {
        this.win = win;
        this.classroomEventHandler = classroomEventHandler;
        this.audioMeetingOngoing = false;
        this.videoMeetingOngoing = false;
        lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('MeetingController.constructor(+)');
        win.addSubscriber(this);
        classroomEventHandler.addSubscriber(this);
        this.meetingDirectiveHandler = new meetingDirectiveHandler_1.MeetingDirectiveHandler(this);
        electron_1.ipcMain.handle('FromUI_MeetingEnded', (event, arg) => {
            lsa_clients_common_1.LSAClient.getInstance().logger.logInfo(`Received FromUI_MeetingEnded from Angular: ${JSON.stringify(arg)}`);
            lsa_clients_common_1.LSAClient.getInstance().meetingUIMessageSink.onMeetingEnded();
        });
    }
    onOrgVerification(isVerified) {
    }
    onJoinClass(data) {
        lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('MeetingController.onJoinClass(+)');
    }
    onLeaveClass(data) {
        lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('MeetingController.onLeaveClass(+)');
        this.audioMeetingOngoing = false;
        this.videoMeetingOngoing = false;
        this.win.windowRestore();
    }
    onMainWindowMinimize() {
        if (this.audioMeetingOngoing) {
            this.win.positionMinimizedAudioOnly();
            return true;
        }
        return false;
    }
    async createMeetingSession(meetingModel) {
        lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('MeetingController.createMeetingSession(+)');
        lsa_clients_common_1.LSAClient.getInstance().logger.logInfo(`MeetingController.createMeetingSession() meetingModel = ${JSON.stringify(meetingModel)}`);
        this.videoMeetingOngoing = !!(meetingModel.meetingType & lsa_clients_common_1.ConferenceTypeEnum.TeacherConferenceTypeVideo);
        if (this.videoMeetingOngoing) {
            await this.win.setFullScreenShowTeacher(!meetingModel.windowed);
        }
        else {
            await this.win.setFullScreenShowTeacher(false);
        }
        lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('MeetingController.createMeetingSession() Sending UI_CreateMeetingSession to UI.');
        this.win.sendToUI('UI_CreateMeetingSession', meetingModel);
        lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('MeetingController.windowRestoreIfMinimized()');
        void this.win.windowRestoreIfMinimized(true);
        lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('MeetingController.createMeetingSession(-)');
    }
}
exports.MeetingController = MeetingController;
//# sourceMappingURL=meetingController.js.map