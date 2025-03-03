"use strict";
const { contextBridge, ipcRenderer } = require('electron');
const validChannelsFromRenderer = ['FromUI_GetTranslations'];
const validChannelsFromMain = ['UI_TranslationsReceived'];
contextBridge.exposeInMainWorld('aboutPage', {
    send: (channel, data) => {
        if (validChannelsFromRenderer.includes(channel)) {
            ipcRenderer.invoke(channel, data);
        }
        else {
        }
    },
    receive: (channel, func) => {
        if (validChannelsFromMain.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => func(event, ...args));
        }
        else {
        }
    }
});
//# sourceMappingURL=about-preload.js.map