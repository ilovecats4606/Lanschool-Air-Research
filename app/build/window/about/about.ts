

function addTableRow(module: string, version: string) {
    let table: HTMLTableElement = <HTMLTableElement>document.getElementById("version_table");
    let newRow: HTMLTableRowElement = table.insertRow(-1);

    // module name
    let nameCell = newRow.insertCell(0);
    let moduleName = document.createTextNode(module);
    nameCell.appendChild(moduleName);

    // module version
    let versionCell = newRow.insertCell(1);
    let moduleVersion = document.createTextNode(version);
    versionCell.appendChild(moduleVersion);
}

function AboutPageConfigure() {
    const params = new URLSearchParams(window.location.search);
    let list = params.getAll('module');

    for (let i = 0; i < list.length; i++) {
        let info = list[i].split( "," );
        addTableRow(info[0], info[1]);
    }
}


window.onload = function () {
    // @ts-ignore onload we can optionally pass language code to load that particular i18n.
    window.aboutPage.send('FromUI_GetTranslations' /*, 'de' */);
    AboutPageConfigure();
    // @ts-ignore
    window.aboutPage.receive('UI_TranslationsReceived', (event, args) => {
        //console.log('AboutPage Translations', args);
        loadTranslationContent(args);
    });
};

const loadTranslationContent = (translation: any) => {
   
    const title =  document.getElementById("title");
    if (title) {
        title.innerText = translation.title;
    }
    const versionInfo =  document.getElementById("version_info");
    if (versionInfo) {
        versionInfo.innerText = translation.version;
    }
    const copyright =  document.getElementById("copyright_info");
    if (copyright) {
        copyright.innerText = translation.copyright;
    }
    const privacyPolicy =  document.getElementById("privacy_policy");
    if (privacyPolicy) {
        privacyPolicy.innerText = translation.privacyPolicy;
    }
    const license =  document.getElementById("license");
    if (license) {
        license.innerText = translation.license;
    }
}
