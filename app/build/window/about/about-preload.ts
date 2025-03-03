const { contextBridge, ipcRenderer } = require('electron');

/**
 * Any message/event name part of this array will be passed from About Page to Main process.
 */
const validChannelsFromRenderer = ['FromUI_GetTranslations'];

/**
 * any message/event name part of this array will be passed to About Page.
 */
const validChannelsFromMain = ['UI_TranslationsReceived'];

contextBridge.exposeInMainWorld('aboutPage', {
    // Sanitize channels for Angular to ferry data back and forth.
    // This should be how we can keep contextIsolation set to true.
    send: (channel: string, data: any) => {
        if (validChannelsFromRenderer.includes(channel)) {
            ipcRenderer.invoke(channel, data);
        } else {
            // console.warn(
            //     "aboutPage.send(): channel: '" + channel + "' unrecognized."
            // );
        }
    },
    receive: (channel: string, func: any) => {
        if (validChannelsFromMain.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => func(event, ...args));
        } else {
            // console.warn(
            //     "aboutPage.receive(): channel: '" + channel + "' unrecognized."
            // );
        }
    }
});
