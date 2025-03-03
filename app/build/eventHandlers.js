"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassroomEventHandler = exports.AnyEventHandler = void 0;
const currentScreenRequestHandler_1 = require("./currentScreenRequestHandler");
const CloseAppImplementation_1 = require("./CloseAppImplementation");
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
class AnyEventHandler {
    onEvent(type, data) {
        lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('GOT EVENT: ' + type + ' data: ' + JSON.stringify(data));
    }
}
exports.AnyEventHandler = AnyEventHandler;
class ClassroomEventHandler {
    constructor(win, storage, shellExecutor, ipcMain) {
        this.win = win;
        this.storage = storage;
        this.shellExecutor = shellExecutor;
        this.ipcMain = ipcMain;
        this.classStatusEventSubscribers = new Array();
        ipcMain.handle('FromUI_ChatMessage', (event, arg) => {
            const chatMessage = new lsa_clients_common_1.ChatMessage();
            chatMessage.message = arg.data.msg;
            chatMessage.timestamp = arg.data.timestamp;
            lsa_clients_common_1.LSAClient.getInstance().clientChat.postChatMessageToTeacher(chatMessage);
        });
        ipcMain.handle('FromUI_RaiseHand', (event, arg) => {
            const raiseHandMessage = new lsa_clients_common_1.RaiseHandStatusMessage();
            raiseHandMessage.timestamp = arg.data.timestamp;
            raiseHandMessage.handRaised = arg.data.state;
            lsa_clients_common_1.LSAClient.getInstance().clientChat.postRaiseHandStatusToTeacher(raiseHandMessage);
        });
        this.currentScreenRequestHandler = new currentScreenRequestHandler_1.CurrentScreenRequestHandler(storage, ipcMain);
        this.appCloser = new CloseAppImplementation_1.CloseAppImplementation();
    }
    setTabCloser(closer) {
        this.tabCloser = closer;
    }
    onActiveInstructorsInfo(activeInstructorsModel) {
        this.setState({
            state: {
                activeInstructors: activeInstructorsModel.activeInstructors
            }
        });
    }
    setState(obj) {
        this.win.sendToUI('UI_SetState', obj);
    }
    chatMessage(obj) {
        this.win.sendToUI('UI_ChatMessage', obj);
    }
    addSubscriber(sub) {
        this.classStatusEventSubscribers.push(sub);
    }
    onPayloadVerificationFailure() {
    }
    onJoinClass(data) {
    }
    onJoinClassPostProcess(currentClassData) {
        this.setState({
            state: {
                className: currentClassData.className,
                chatHistoryEnabled: currentClassData.chatHistoryEnabled
            }
        });
        this.classStatusEventSubscribers.forEach((sub) => {
            sub.onJoinClass(currentClassData);
        });
    }
    onLeaveClass(data) {
        this.setState({
            state: {
                className: ''
            }
        });
        this.classStatusEventSubscribers.forEach((sub) => {
            sub.onLeaveClass(data);
        });
    }
    onLeaveClassPostProcess(data) {
        this.onLeaveClass(data);
    }
    onPublicKeyReceivedFromTeacher(data) {
    }
    onTelemetryRequest(data) {
        this.classStatusEventSubscribers.forEach((sub) => {
            if (sub.onTelemetryRequest) {
                sub.onTelemetryRequest(data);
            }
        });
    }
    onLimitState(data) {
    }
    onRemoteExecute(data) {
        this.shellExecutor.execute(data);
    }
    onCurrentScreenRequest(data) {
        this.currentScreenRequestHandler.handleCurrentScreenRequest(data, (imageData) => {
            lsa_clients_common_1.LSAClient.getInstance().classroomEventRequestResponse.postCurrentScreen(imageData);
        });
    }
    onHeartbeatReceived(data) {
    }
    onChatReceived(data) {
        this.chatMessage({
            data: {
                message: data.message,
                timestamp: data.sendTime,
                from: data.from
            }
        });
    }
    onDoNotDisturbReceived(dnd) {
        this.setState({
            state: {
                doNotDisturb: dnd
            }
        });
    }
    onClearRaiseHand() {
        this.setState({
            state: {
                handRaised: false
            }
        });
    }
    onCloseTabsRequest(data) {
        var _a;
        (_a = this.tabCloser) === null || _a === void 0 ? void 0 : _a.closeTabs(data);
    }
    onOrgVerification(isOrgVerified) {
        this.classStatusEventSubscribers.forEach((sub) => {
            sub.onOrgVerification(isOrgVerified);
        });
    }
    onCloseApp(closeAppInfo) {
        var _a;
        (_a = this.appCloser) === null || _a === void 0 ? void 0 : _a.closeApp(closeAppInfo);
    }
}
exports.ClassroomEventHandler = ClassroomEventHandler;
//# sourceMappingURL=eventHandlers.js.map