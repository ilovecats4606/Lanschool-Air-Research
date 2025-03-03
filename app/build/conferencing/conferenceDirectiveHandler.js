"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConferenceDirectiveHandler = void 0;
class ConferenceDirectiveHandler {
    constructor(conferenceController) {
        this.conferenceController = conferenceController;
    }
    joinConference() {
        if (!this.conferenceController) {
            throw new Error('ConferenceDirectiveHandler.joinConference(): Conference controller not present!');
        }
        this.conferenceController.joinConference();
    }
    leaveConference() {
        if (!this.conferenceController) {
            throw new Error('ConferenceDirectiveHandler.leaveConference(): Conference controller not present!');
        }
        this.conferenceController.leaveConference();
    }
    setConferenceAttendeeNames(data) {
        if (!this.conferenceController) {
            throw new Error('ConferenceDirectiveHandler.setConferenceAttendeeNames(): Conference controller not present!');
        }
        this.conferenceController.setConferenceAttendeeNames(data);
    }
    async setConferenceParams(data) {
        if (!this.conferenceController) {
            throw new Error('ConferenceDirectiveHandler.setConferenceParams(): Conference controller not present!');
        }
        await this.conferenceController.setConferenceParams(data);
    }
}
exports.ConferenceDirectiveHandler = ConferenceDirectiveHandler;
//# sourceMappingURL=conferenceDirectiveHandler.js.map