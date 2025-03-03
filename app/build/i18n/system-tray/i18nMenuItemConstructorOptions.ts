import { Menu, MenuItemConstructorOptions } from 'electron';

export interface i18nMenuItemConstructorOptions
    extends MenuItemConstructorOptions {
    // key to read from translation file
    i18nKey?: string;

    submenu?: i18nMenuItemConstructorOptions[];
}
