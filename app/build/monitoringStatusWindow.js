const { ipcRenderer } = require('electron');

let localizedStrings = {};

class Logger {
    logMessage(message) {
        ipcRenderer.send('logMonitoringWindowMessage', message);
    }
}

let logger = new Logger();

/* eslint-disable no-undef */
function updateCurrentState(stateObj) {
    ipcRenderer.send('MonitoringWindowState', JSON.stringify(stateObj));
}

function presentMonitoringRequest(userRequesting) {
    updateCurrentState({
        presentation: "UserRequest",
        param: userRequesting
    });

    cleanDialog();
    
    logger.logMessage("Presenting monitoring request dialog");
    let localizedString = localizedStrings['unverified_teacher_request'];
    setStatusText(localizedString.replace("%TEACHER%", userRequesting));

    createButtons([{
        label: localizedStrings['monitoring_button_allow'],
        action: function () {
            logger.logMessage("User is allowing monitoring.");
            ipcRenderer.send('UserAllowsMonitoring');
            presentCurrentMonitoring();
        }
    },
    {
        label: localizedStrings['monitoring_button_reject'],
        action: function () {
            logger.logMessage("User is rejecting monitoring.");
            actionCloseApp();
        }
    }]);


    moveAndResize({
        height: 180
    });
}

function retractMonitoringRequest() {
    setStatusText("");
    retractButtons();
}

function removeStopLink() {
    let parentDiv = document.getElementById("stop-link-div");
    if (parentDiv) {
        parentDiv.parentElement.removeChild(parentDiv);
    }
}

function createStopLink() {
    removeStopLink();
    let parentDiv = document.getElementById("fontWrapper");

    let aDiv = document.createElement("div");
    aDiv.setAttribute("id", "stop-link-div");

    let a = document.createElement("a");
    a.setAttribute("id", "stopLink");
    a.setAttribute("href", "#");
    a.onclick = confirmStopMonitoring;
    a.innerText = localizedStrings['stop_monitoring'];

    aDiv.appendChild(a);
    parentDiv.appendChild(aDiv);
}

function presentCurrentMonitoring() {
    updateCurrentState({
        presentation: "ActiveMonitoring"
    });

    cleanDialog();
    logger.logMessage("Presenting current monitoring dialog");
    setStatusText(localizedStrings['you_are_being_monitored'], true)
    createStopLink();

    moveAndResize({
        width: 400,
        height: 130,
        position: "corner",
        imgMaxHeight: 36,
    });
}

function moveAndResize(obj) {
    let w = obj.width || 430;
    let h = obj.height || 200;
    let left = Math.round((screen.width / 2) - (w / 2));
    let top = Math.round((screen.height / 2) - (h / 2));
    if (obj.position === "corner") {
        left = screen.availWidth - w + screen.availLeft;
        top = screen.availHeight - h + screen.availTop;
    }

    if (obj.imgMaxHeight) {
        document.getElementById("logo").style['max-height'] = obj.imgMaxHeight;
    }
    else {
        document.getElementById("logo").style['max-height'] = 56;
    }

    logger.logMessage('moveAndResize: left: ' + left + ', top: ' + top + ', width: ' + w + ', height: ' + h);
    const rectObj = {
        x: left,
        y: top,
        width: w,
        height: h
    };

    ipcRenderer.send('resizeMe', JSON.stringify(rectObj));
}

function retractCurrentMonitoring() {
    setStatusText("");
    removeStopLink();
}

function cleanDialog() {
    retractCurrentMonitoring();
    retractConfirmation();
    retractMonitoringRequest();
}

function setStatusText(text, center) {
    let statusTextDiv = document.getElementById("status-text");
    statusTextDiv.innerText = text;
    if (center) {
        statusTextDiv.style.textAlign = "center";
    }
    else {
        statusTextDiv.style.textAlign = "left";
    }
}

function confirmStopMonitoring() {
    updateCurrentState({
        presentation: "ConfirmStopMonitoring"
    });

    cleanDialog();

    logger.logMessage("Presenting stop confirmation dialog");
    setStatusText(localizedStrings['confirm_stop_monitoring']);
    createButtons([{
        label: localizedStrings['monitoring_button_ok'],
        action: function () {
            logger.logMessage("User confirmed discontinuing monitoring");
            actionCloseApp();
        }
    },
    {
        label: localizedStrings['monitoring_button_cancel'],
        action: function () {
            presentCurrentMonitoring();
        }
    }]);

    moveAndResize({
        height: 230
    });
}

function retractConfirmation() {
    setStatusText("");
    retractButtons();
}

function createButtons(buttons) {
    retractButtons();
    let parentDiv = document.getElementById("fontWrapper");
    let buttonDiv = document.createElement("div");
    buttonDiv.setAttribute("id", "button-div");
    buttonDiv.setAttribute("class", "buttonDiv");

    let buttonUL = document.createElement("ul");
    buttonDiv.appendChild(buttonUL);
    parentDiv.appendChild(buttonDiv);

    for (let i = 0; i < buttons.length; i++) {
        let buttonLI = document.createElement("li");
        let button = document.createElement("button");
        button.setAttribute("class", "myDialogButton mdc-button mdc-button--raised");
        let buttonLabel = document.createElement("span");
        buttonLabel.setAttribute("class", "mdc-button__label");
        buttonLabel.innerText = buttons[i].label;
        button.appendChild(buttonLabel);
        button.onclick = buttons[i].action;
        buttonLI.appendChild(button);
        buttonUL.appendChild(buttonLI);
    }
}

function retractButtons() {
    let buttonDiv = document.getElementById("button-div");
    if (buttonDiv) {
        buttonDiv.parentElement.removeChild(buttonDiv);
    }
}

function actionCloseApp() {
    ipcRenderer.send('UserRejectsMonitoring');
    closeWindow();
}

function closeWindow() {
    logger.logMessage("Closing monitoring dialog");
    window.close();
}

function connectListeners() {
    ipcRenderer.on('closeWindow', () => {
        closeWindow();
    });
}

window.addEventListener('DOMContentLoaded', () => {
    logger.logMessage('running main(+)');            
    main();
});

async function loadTranslations() {
    const monitoringWindowLocalizedStings = await ipcRenderer.invoke('getMonitoringWindowLocalizedStings');
    localizedStrings = JSON.parse(monitoringWindowLocalizedStings);
}

async function main() {
    await loadTranslations();
    connectListeners();
    const desiredWindowState = await ipcRenderer.invoke('RequestMonitoringWindowState');
    logger.logMessage("Last window state: " + desiredWindowState);
    const state = JSON.parse(desiredWindowState);

    switch (state.presentation) {
        case "UserRequest": {
            presentMonitoringRequest(state.param);
        }
            break;
        case "ActiveMonitoring": {
            presentCurrentMonitoring();
        }
            break;
        case "ConfirmStopMonitoring": {
            confirmStopMonitoring();
        }
    }
}
