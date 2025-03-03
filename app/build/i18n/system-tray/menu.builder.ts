import { Tray, Menu } from 'electron';
import { i18n } from 'i18next';

import { TrayItemController } from '../../trayItem';
import { i18next } from '../configs/i18next.config';
import config from '../configs/config';
import {
    ContextMenuItemParameters,
    IContextMenu,
    LSAClient
} from '@lenovo-software/lsa-clients-common';
import { i18nMenuItemConstructorOptions } from './i18nMenuItemConstructorOptions';
/**
 * Generated Tray menu based on current set default/locale language.
 * @param i18n i18next initialized object.
 * @param tray tray instance.
 * @returns returns generated i18nMenuItemConstructorOptions array.
 */
export class TrayMenuBuilder implements IContextMenu {
    private static instance: TrayMenuBuilder;
    private menu: i18nMenuItemConstructorOptions[];
    private env = process.env.NODE_ENV || 'production';

    public constructor(private i18n: i18n, private tray: Tray) {
        this.menu = [
            {
                id: 'Messages',
                label: i18n.t('tray.messages'),
                i18nKey: 'tray.messages',
                click: () => {
                    TrayItemController.getInstance().showMainWindow();
                }
            },
            { type: 'separator' },
            {
                id: 'Status',
                label: i18n.t('tray.status'),
                i18nKey: 'tray.status',
                click: () => {
                    TrayItemController.getInstance().showStatusWindow();
                }
            },
            { type: 'separator' },
            {
                id: 'Download',
                label: i18n.t('tray.download'),
                i18nKey: 'tray.download',
                click: () => {
                    TrayItemController.getInstance().downloadLogs();
                }
            },            
            { type: 'separator' },
            {
                id: 'About',
                label: i18n.t('tray.about'),
                i18nKey: 'tray.about',
                click: () => {
                    TrayItemController.getInstance().showAboutBox();
                }
            }
        ];

        if (this.env.toLowerCase() === 'development') {
            // for demo only
            const languageMenu: i18nMenuItemConstructorOptions[] =
                config.languages.map((languageCode) => {
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

    private updateTranslations(menuList: i18nMenuItemConstructorOptions[]) {
        if (menuList) {
            menuList.forEach((menu) => {
                if (menu.i18nKey) {
                    menu.label = this.i18n.t(menu.i18nKey);
                }
                // if menu has submenus then update i18n string
                if (menu.submenu) {
                    this.updateTranslations(menu.submenu);
                }

                // for demo only
                if (
                    this.env.toLowerCase() === 'development' &&
                    menu.type === 'radio' &&
                    menu.label?.startsWith('Language - ')
                ) {
                    menu.checked = this.i18n.language === menu.id;
                }
            });
        }
    }

    protected getMenuItemOrdinal(id: string): number {
        for (let i = 0; i < this.menu.length; i++) {
            if (this.menu[i].id === id) {
                return i;
            }
        }

        return -1;
    }

    public createMenuItem(params: ContextMenuItemParameters): string {
        LSAClient.getInstance().logger.logInfo(
            'TrayMenuBuilder.createMenuItem(+): ' + params
        );

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

    public removeMenuItem(id: string): void {
        LSAClient.getInstance().logger.logInfo('TrayMenuBuilder.removeMenuItem(+): ' + id);

        const itemNum = this.getMenuItemOrdinal(id);
        if (itemNum >= 0) {
            this.menu.splice(itemNum, 1);
            this.buildTrayMenu();
        }
    }

    public static getInstance(tray: Tray) {
        if (!TrayMenuBuilder.instance) {
            TrayMenuBuilder.instance = new TrayMenuBuilder(i18next, tray);
        }

        return TrayMenuBuilder.instance;
    }

    public buildTrayMenu() {
        this.updateTranslations(this.menu);
        const menu = Menu.buildFromTemplate(this.menu);
        this.tray.setContextMenu(menu);
    }
}
