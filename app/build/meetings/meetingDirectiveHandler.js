"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingDirectiveHandler = void 0;
class MeetingDirectiveHandler {
    constructor(meetingController) {
        this.meetingController = meetingController;
    }
    async createMeetingSession(meetingModel) {
        if (!this.meetingController) {
            throw new Error('MeetingDirectiveHandler.createMeetingSession(): Meeting controller not present!');
        }
        this.meetingController.createMeetingSession(meetingModel);
    }
}
exports.MeetingDirectiveHandler = MeetingDirectiveHandler;
//# sourceMappingURL=meetingDirectiveHandler.js.map