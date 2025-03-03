const { ipcRenderer } = require('electron');

let localizedStrings = {};
let windowType = 'None';

class Logger {
    logMessage(message) {
        ipcRenderer.send('logShareRequestPromptMessage', message);
    }
}

let logger = new Logger();

function presentShareRequestPrompt() {
    logger.logMessage("Presenting share request prompt dialog");

    // share-request-prompt-font-wrapper
    document.getElementById('fontWrapper').classList.add(`${windowType}-font-wrapper`);

    // add rectangle class for share-request-prompt
    const rectangleElement = document.getElementById('rectangle');
    rectangleElement.classList.add('rectangle');

    const localizedString = localizedStrings['instructor_share_request'];
    setMessage(localizedString, 'warning');
    attachButtons();
}

function presentActiveSharingWindow() {
    logger.logMessage("Presenting active screen sharing window");
        
    let localizedString = localizedStrings['screen_sharing_text'];
    setMessage(localizedString, 'screen_share');
    attachStopButton();
}

function setMessage(text, icon) {
    const messageTextElement = document.getElementById("message-text");
    messageTextElement.innerText = text;
    const messageIconElement = document.getElementById("message-icon");
    if (messageIconElement) {
        if (icon) {
            const iconImage = document.createElement("img");
            iconImage.setAttribute("src", `../../icons/${icon}.svg`);
            iconImage.setAttribute("class", "material-icons");
            iconImage.classList.add(`${windowType}-icon`);
            
            messageIconElement.appendChild(iconImage);
        } else {
            messageIconElement.parentElement.removeChild(messageIconElement);
        }
    }
}

function attachButtons () {
    const buttonDiv = document.getElementById("buttonDiv");
    buttonDiv.setAttribute("class", "buttonDiv");

    let button = createButton(
        localizedStrings["button_cancel"],
        rejectStudentScreenShare,
        {"class": "mdc-button mdc-button--outlined button-cancel"},
    )
    buttonDiv.appendChild(button);

    button = createButton(
        localizedStrings["button_share"],
        acceptStudentScreenShare,
        {"class": "mdc-button mdc-button--raised button-share"},
    )
    buttonDiv.appendChild(button);
}

function attachStopButton() {
    const buttonSpan = document.getElementById("inline-button");
    buttonSpan.setAttribute("class", "inline-button");

    let button = createButton(
        localizedStrings["button_stop_sharing"],
        stopStudentScreenBroadcast,
        {"class": "mdc-button mdc-button--raised button-stop-share"},
    )
    buttonSpan.appendChild(button);
}

function createButton(label, action, attributes={}) {
    const buttonElement = document.createElement("button");
    for([k,v] of Object.entries(attributes)) {
        buttonElement.setAttribute(k, v);
    }
    buttonElement.onclick = action;
    
    const labelElement = document.createElement("span");
    labelElement.setAttribute("class", "mdc-button__label");
    labelElement.innerText = label;

    buttonElement.appendChild(labelElement);

    return buttonElement;
}

function closeWindow() {
    logger.logMessage("Closing student share screen window");
    window.close();
}

window.addEventListener('DOMContentLoaded', async () => {
    logger.logMessage('running main(+)');
    
    await loadTranslations();
    windowType = await ipcRenderer.invoke('ShareWindowType');

    document.getElementsByTagName('body')[0].classList.add(windowType);
    
    switch(windowType) {
        case 'share-request-prompt':
            presentShareRequestPrompt();
            break;
        case 'active-sharing':
            presentActiveSharingWindow();
            break;
    }
});

async function loadTranslations() {
    const shareRequestPromptLocalizedStings = await ipcRenderer.invoke('getShareRequestPromptLocalizedStings');
    localizedStrings = JSON.parse(shareRequestPromptLocalizedStings);
}

function rejectStudentScreenShare() {
    ipcRenderer.send('RejectStudentScreenShare');
    closeWindow();
}

function acceptStudentScreenShare() {
    ipcRenderer.send('AcceptStudentScreenShare');
    closeWindow();
}

function stopStudentScreenBroadcast() {
    ipcRenderer.send('StopStudentScreenBroadcast');
}