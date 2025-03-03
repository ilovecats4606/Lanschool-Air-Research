"use strict";
function addTableRow(module, version) {
    let table = document.getElementById("version_table");
    let newRow = table.insertRow(-1);
    let nameCell = newRow.insertCell(0);
    let moduleName = document.createTextNode(module);
    nameCell.appendChild(moduleName);
    let versionCell = newRow.insertCell(1);
    let moduleVersion = document.createTextNode(version);
    versionCell.appendChild(moduleVersion);
}
function AboutPageConfigure() {
    const params = new URLSearchParams(window.location.search);
    let list = params.getAll('module');
    for (let i = 0; i < list.length; i++) {
        let info = list[i].split(",");
        addTableRow(info[0], info[1]);
    }
}
window.onload = function () {
    window.aboutPage.send('FromUI_GetTranslations');
    AboutPageConfigure();
    window.aboutPage.receive('UI_TranslationsReceived', (event, args) => {
        loadTranslationContent(args);
    });
};
const loadTranslationContent = (translation) => {
    const title = document.getElementById("title");
    if (title) {
        title.innerText = translation.title;
    }
    const versionInfo = document.getElementById("version_info");
    if (versionInfo) {
        versionInfo.innerText = translation.version;
    }
    const copyright = document.getElementById("copyright_info");
    if (copyright) {
        copyright.innerText = translation.copyright;
    }
    const privacyPolicy = document.getElementById("privacy_policy");
    if (privacyPolicy) {
        privacyPolicy.innerText = translation.privacyPolicy;
    }
    const license = document.getElementById("license");
    if (license) {
        license.innerText = translation.license;
    }
};
//# sourceMappingURL=about.js.map