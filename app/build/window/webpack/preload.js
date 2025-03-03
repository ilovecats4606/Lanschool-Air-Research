// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer } = require('electron');
const customTitlebar = require('./titlebar');
const renderScreenRequestHandler = require('./imageRenderWeb');
const { RoutableWindowTitleBarParameters2TitlebarOptions } = require('./titlebarParameterTranslator');

window.addEventListener('DOMContentLoaded', () => {
    const urlSearchParams = new window.URLSearchParams(location.search);
    const titlebarParameters = RoutableWindowTitleBarParameters2TitlebarOptions
        .toTitlebarParametersForPreloadFromQueryString(urlSearchParams);

    if (titlebarParameters.hasTitlebar)
        new customTitlebar.Titlebar(
            RoutableWindowTitleBarParameters2TitlebarOptions.toTitlebarOptions(titlebarParameters)
        );

    new renderScreenRequestHandler.RenderScreenRequestHandler();

    window.addEventListener('online', () => {
        ipcRenderer.send('FromRenderer_online');
    });
    window.addEventListener('offline', () => {
        ipcRenderer.send('FromRenderer_offline');
    
    });
});

const validChannelsFromRenderer = [
    'FromUI_RaiseHand', 
    'FromUI_ChatMessage',
    'FromUI_ConferenceParamsSet',
    'FromUI_ConferenceError',
    'FromUI_ConferenceAttachComplete',
    'FromUI_ConferenceDetachComplete',
    'FromUI_ConferenceAttendeeId',
    'FromUI_WindowMoving',
    'FromUI_WindowMoved',
    'FromUI_LogMessage',
    'FromUI_DownloadLogs',
    'FromUI_LearnMoreAboutStatus',
    'FromUI_CloseWindow',
    'FromUI_ElementSizeNotification',
    'FromUI_ShareStudentScreenResponse',
    'FromUI_StopStudentScreenBroadcast',
    'FromUI_Pong',
    'FromUI_MeetingEnded'
];

const validChannelsFromMain = [
    'UI_ChatMessage',
    'UI_SetState',
    'UI_SetConferenceParams',
    'UI_JoinConference',
    'UI_LeaveConference',
    'UI_SetConferenceAttendeeNames',
    'UI_CreateMeetingSession',
    'UI_SetConnectivityStatus',
    'UI_DisplayConnectivityStatus',
    'UI_LanguageChanged',
    'UI_LogSaveStatus',
    'UI_AgentVersionString',
    'UI_SetFullScreenSourceId',
    'UI_StopStudentScreenBroadcast',
    'UI_EndStudentScreenViewBroadcast',
    'UI_Ping'
];

contextBridge.exposeInMainWorld(
    "electronAPI", {
        // Sanitize channels for Angular to ferry data back and forth. 
        // This should be how we can keep contextIsolation set to true.
        send: (channel, data) => {
            if (validChannelsFromRenderer.includes(channel)) {
                ipcRenderer.invoke(channel, data);
            }
            else {
                //console.warn('electronAPI.send(): channel: \'' + channel + '\' unrecognized.');
            }
        },
        receive: (channel, func) => {
            if (validChannelsFromMain.includes(channel)) {
                ipcRenderer.on(channel, (event, ...args) => func(event, ...args));
            }
            else {
                //console.warn('electronAPI.receive(): channel: \'' + channel + '\' unrecognized.');
            }
        },
    }
);
