"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listenForTestMessages = exports.init = exports.setLogger = void 0;
const fs = __importStar(require("fs"));
let electronCb = null;
let testFilePath = process.env.TEST_FILEPATH + '/testMessageFile.json';
let currentFileContent = null;
let _logger = null;
function setLogger(logger) {
    _logger = logger;
}
exports.setLogger = setLogger;
function init() {
    loadTestFile();
    if (fs.existsSync(testFilePath)) {
        fs.watchFile(testFilePath, (curr, prev) => {
            doLog('watch file update from:' + electronCb ? ' electron ' : ' test runner');
            loadTestFile();
            if (electronCb) {
                sendLatestMessages();
            }
        });
    }
}
exports.init = init;
function doLog(msg) {
    if (_logger) {
        _logger.logInfo(msg);
    }
    else {
        console.log(msg);
    }
}
function listenForTestMessages(callback) {
    doLog('listenForTestMessages');
    init();
    electronCb = callback;
}
exports.listenForTestMessages = listenForTestMessages;
function loadTestFile() {
    if (fs.existsSync(testFilePath)) {
        currentFileContent = JSON.parse(fs.readFileSync(testFilePath, 'binary'));
        doLog('loadTestFile:' + JSON.stringify(currentFileContent));
    }
}
function saveFile() {
    fs.writeFileSync(testFilePath, JSON.stringify(currentFileContent));
}
function sendLatestMessages() {
    if (currentFileContent.messagesForElectron.length > 0) {
        const latestMessge = currentFileContent.messagesForElectron.pop();
        doLog('sending message to callback');
        electronCb(latestMessge);
        saveFile();
    }
}
//# sourceMappingURL=testMessage.js.map