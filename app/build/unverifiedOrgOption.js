"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnverifiedOrgOption = void 0;
const monitoringStatusWindowController_1 = require("./monitoringStatusWindowController");
class UnverifiedOrgOption {
    constructor(fullScreenEventPublishers) {
        this.fullScreenEventPublishers = fullScreenEventPublishers;
        this.sink = null;
        this.teacherName = '';
        this.monitoringStatusWindowController = new monitoringStatusWindowController_1.MonitoringStatusWindowController(this);
    }
    getTeacherName() {
        return this.teacherName;
    }
    closeWindow() {
        this.monitoringStatusWindowController.closeWindow();
    }
    joinClassOptOut(sink) {
        this.sink = sink;
        this.sink.getMonitoringWindowState()
            .then((stateObj) => {
            if (stateObj.presentation === 'UserRequest') {
                this.teacherName = stateObj.param;
                this.monitoringStatusWindowController.displayJoinClassOptOut();
            }
            else if (stateObj.presentation === 'ActiveMonitoring') {
                this.monitoringStatusWindowController.displayWeAreActiveMonitoring();
            }
        });
    }
    onClassOptOut(userChoice) {
        var _a, _b;
        if (userChoice === monitoringStatusWindowController_1.JoinClassOptOutUserChoice.Reject) {
            (_a = this.sink) === null || _a === void 0 ? void 0 : _a.userRejectsMonitoring();
        }
        else if (userChoice === monitoringStatusWindowController_1.JoinClassOptOutUserChoice.Accept) {
            (_b = this.sink) === null || _b === void 0 ? void 0 : _b.userAllowsMonitoring();
        }
    }
    getFullScreenEventPublishers() {
        return this.fullScreenEventPublishers;
    }
}
exports.UnverifiedOrgOption = UnverifiedOrgOption;
//# sourceMappingURL=unverifiedOrgOption.js.map