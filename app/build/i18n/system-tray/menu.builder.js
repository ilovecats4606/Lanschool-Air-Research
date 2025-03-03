"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrayMenuBuilder = void 0;
const electron_1 = require("electron");
const trayItem_1 = require("../../trayItem");
const i18next_config_1 = require("../configs/i18next.config");
const config_1 = __importDefault(require("../configs/config"));
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
class TrayMenuBuilder {
    constructor(i18n, tray) {
        this.i18n = i18n;
        this.tray = tray;
        this.env = process.env.NODE_ENV || 'production';
        this.menu = [
            {
                id: 'Messages',
                label: i18n.t('tray.messages'),
                i18nKey: 'tray.messages',
                click: () => {
                    trayItem_1.TrayItemController.getInstance().showMainWindow();
                }
            },
            { type: 'separator' },
            {
                id: 'Status',
                label: i18n.t('tray.status'),
                i18nKey: 'tray.status',
                click: () => {
                    trayItem_1.TrayItemController.getInstance().showStatusWindow();
                }
            },
            { type: 'separator' },
            {
                id: 'Download',
                label: i18n.t('tray.download'),
                i18nKey: 'tray.download',
                click: () => {
                    trayItem_1.TrayItemController.getInstance().downloadLogs();
                }
            },
            { type: 'separator' },
            {
                id: 'About',
                label: i18n.t('tray.about'),
                i18nKey: 'tray.about',
                click: () => {
                    trayItem_1.TrayItemController.getInstance().showAboutBox();
                }
            }
        ];
        if (this.env.toLowerCase() === 'development') {
            const languageMenu = config_1.default.languages.map((languageCode) => {
                return {
                    label: `Language - ${languageCode
                        .replace('-', '_')
                        .toLowerCase()}`,
                    type: 'radio',
                    id: languageCode,
                    checked: i18n.language === languageCode,
                    click: () => {
                        i18n.changeLanguage(languageCode);
                    }
                };
            });
            this.menu.unshift({ type: 'separator' });
            this.menu.unshift({
                label: 'Languages',
                submenu: languageMenu
            });
        }
    }
    updateTranslations(menuList) {
        if (menuList) {
            menuList.forEach((menu) => {
                var _a;
                if (menu.i18nKey) {
                    menu.label = this.i18n.t(menu.i18nKey);
                }
                if (menu.submenu) {
                    this.updateTranslations(menu.submenu);
                }
                if (this.env.toLowerCase() === 'development' &&
                    menu.type === 'radio' &&
                    ((_a = menu.label) === null || _a === void 0 ? void 0 : _a.startsWith('Language - '))) {
                    menu.checked = this.i18n.language === menu.id;
                }
            });
        }
    }
    getMenuItemOrdinal(id) {
        for (let i = 0; i < this.menu.length; i++) {
            if (this.menu[i].id === id) {
                return i;
            }
        }
        return -1;
    }
    createMenuItem(params) {
        lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('TrayMenuBuilder.createMenuItem(+): ' + params);
        if (this.getMenuItemOrdinal(params.id) >= 0) {
            return params.id;
        }
        this.menu.push({
            type: 'separator'
        });
        this.menu.push({
            id: params.id,
            label: params.title,
            click: params.onClick
        });
        this.buildTrayMenu();
        return params.id;
    }
    removeMenuItem(id) {
        lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('TrayMenuBuilder.removeMenuItem(+): ' + id);
        const itemNum = this.getMenuItemOrdinal(id);
        if (itemNum >= 0) {
            this.menu.splice(itemNum, 1);
            this.buildTrayMenu();
        }
    }
    static getInstance(tray) {
        if (!TrayMenuBuilder.instance) {
            TrayMenuBuilder.instance = new TrayMenuBuilder(i18next_config_1.i18next, tray);
        }
        return TrayMenuBuilder.instance;
    }
    buildTrayMenu() {
        this.updateTranslations(this.menu);
        const menu = electron_1.Menu.buildFromTemplate(this.menu);
        this.tray.setContextMenu(menu);
    }
}
exports.TrayMenuBuilder = TrayMenuBuilder;
//# sourceMappingURL=menu.builder.js.map