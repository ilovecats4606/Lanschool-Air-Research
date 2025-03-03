"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentScreenRequestHandler = void 0;
const electron_1 = require("electron");
const mainWindow_1 = require("./window/mainWindow");
const thumbnailCapture_1 = require("./thumbnailCapture");
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
class UniqueMessageConstruct {
    constructor() {
        this.messageReturnPairs = new Array();
    }
    generateUniqueId() {
        const min = 100000;
        const max = 999999;
        return Math.floor(Math.random() * (max - min + 1) + min).toString();
    }
    getAndRegisterNewMessageId(callback) {
        const uniqueId = this.generateUniqueId();
        this.messageReturnPairs.push({
            messageId: uniqueId,
            callback: callback
        });
        return uniqueId;
    }
    processSuccessfulReturnMessage(arg) {
        let included = false;
        for (let i = 0; i < this.messageReturnPairs.length; i++) {
            if (this.messageReturnPairs[i].messageId === arg.messageId) {
                if (this.messageReturnPairs[i].callback) {
                    this.messageReturnPairs[i].callback(arg.processedImage);
                }
                this.messageReturnPairs.splice(i, 1);
                included = true;
                break;
            }
        }
        return included;
    }
    disposeMessageId(messageId) {
        for (let i = 0; i < this.messageReturnPairs.length; i++) {
            if (this.messageReturnPairs[i].messageId === messageId) {
                this.messageReturnPairs.splice(i, 1);
                break;
            }
        }
    }
}
class CurrentScreenRequestHandler {
    constructor(storage, ipcMain) {
        this.storage = storage;
        this.ipcMain = ipcMain;
        ipcMain.on('onRenderCurrentScreenCompleted', (event, arg) => {
            if (!arg ||
                !arg.processedImage ||
                !arg.processedImage.imgData) {
                throw new Error('BAD');
            }
            if (this.messageIds.processSuccessfulReturnMessage(arg)) {
                this.logger.logInfo('CurrentScreenHandle - onRenderCurrentScreenCompleted() - processed return message');
            }
            else {
                this.logger.logInfo('CurrentScreenHandle - onRenderCurrentScreenCompleted(): Message ID not found: ' +
                    arg.messageId);
            }
        });
        ipcMain.on('onRenderCurrentScreenError', (event, arg) => {
            this.logger.logError('CurrentScreenHandler - onRenderCurrentScreenError(): ' +
                (arg && arg.error ? arg.error : 'Undefined error'));
            this.messageIds.disposeMessageId(arg.messageId);
        });
        this.messageIds = new UniqueMessageConstruct();
        this.logger = lsa_clients_common_1.LSAClient.getInstance().logger;
    }
    constructOverlayMessage(requestData) {
        let ret = '';
        if (requestData.overlayUserName) {
            ret = this.storage.loadLoginName();
        }
        if (requestData.overlayTimeDate) {
            ret += requestData.overlayUserName ? ' @ ' : '';
            ret += new Date(Date.now()).toLocaleString(electron_1.app.getLocale());
        }
        return ret;
    }
    async handleCurrentScreenRequest(requestData, callback) {
        this.logger.logInfo('CurrentScreenRequestHandler.handleCurrentScreenRequest(+)');
        const capture = new thumbnailCapture_1.ThumbnailCapture();
        let screenWidth = electron_1.screen.getPrimaryDisplay().size.width;
        let screenHeight = electron_1.screen.getPrimaryDisplay().size.height;
        let constrainedSize = capture.constrainResolution(screenWidth, screenHeight);
        screenWidth = constrainedSize.width;
        screenHeight = constrainedSize.height;
        try {
            const request = {
                format: [lsa_clients_common_1.ThumbnailFormat.JPG],
                size: {
                    width: screenWidth,
                    height: screenHeight
                }
            };
            this.logger.logInfo('CurrentScreenRequestHandler.handleCurrentScreenRequest(): Performing capture...');
            const screenCapture = await capture.getThumbnailWithMonitorIndex(0, request);
            this.logger.logInfo('CurrentScreenRequestHandler.handleCurrentScreenRequest(): Capture complete.');
            const toRenderer = {
                imageParams: {
                    width: screenWidth,
                    height: screenHeight,
                    overlayMessage: this.constructOverlayMessage(requestData)
                },
                dataURI: screenCapture.image,
                messageId: this.messageIds.getAndRegisterNewMessageId(callback)
            };
            mainWindow_1.MainWindowController.getInstance().sendToTitlebar('renderCurrentScreen', toRenderer);
        }
        catch (e) {
            this.logger.logError('CurrentScreenRequestHandler.handleCurrentScreenRequest(): Error generating screenshot: ' +
                e);
        }
    }
}
exports.CurrentScreenRequestHandler = CurrentScreenRequestHandler;
//# sourceMappingURL=currentScreenRequestHandler.js.map