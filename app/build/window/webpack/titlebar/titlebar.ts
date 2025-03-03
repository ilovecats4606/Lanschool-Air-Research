/*--------------------------------------------------------------------------------------------------------
 *  This file has been modified by @AlexTorresSk (http://github.com/AlexTorresSk)
 *  to work in custom-electron-titlebar.
 *
 *  The original copy of this file and its respective license are in https://github.com/Microsoft/vscode/
 *
 *  Copyright (c) 2018 Alex Torres
 *  Licensed under the MIT License. See License in the project root for license information.
 *-------------------------------------------------------------------------------------------------------*/

import { isMacintosh, isWindows, isLinux } from './common/platform';
import { Color, RGBA } from './common/color';
import { EventType, hide, show, removeClass, addClass, append, $, addDisposableListener, prepend, removeNode } from './common/dom';
import { ipcRenderer } from 'electron';
import { Theme, Themebar } from './themebar';
import { Ii18nTitleBarData } from '../../../i18n/titlebar/titlebar.interface';
import { IAsyncTitlebarMessage } from '../../titlebarCommandProcessor';

const INACTIVE_FOREGROUND_DARK = Color.fromHex('#222222');
const ACTIVE_FOREGROUND_DARK = Color.fromHex('#333333');
const INACTIVE_FOREGROUND = Color.fromHex('#EEEEEE');
const ACTIVE_FOREGROUND = Color.fromHex('#FFFFFF');

const IS_MAC_BIGSUR_OR_LATER = isMacintosh && parseInt(process.getSystemVersion().split(".")[0]) >= 11;
const TOP_TITLEBAR_HEIGHT_MAC = IS_MAC_BIGSUR_OR_LATER ? '28px': '22px';
const TOP_TITLEBAR_HEIGHT_WIN = '30px';

export interface TitlebarOptions {
	/**
	 * The foreground color of the titlebar text.
	 */
	foregroundColor: Color;
	/**
	 * The background color of titlebar.
	 */
	backgroundColor: Color;
	/**
	 * The icon shown on the left side of titlebar.
	 */
	icon?: string;
	/**
	 * Style of the icons of titlebar.
	 * You can create your custom style using [`Theme`](https://github.com/AlexTorresSk/custom-electron-titlebar/THEMES.md)
	 */
	iconsTheme?: Theme;
	/**
	 * The shadow color of titlebar.
	 */
	shadow?: boolean;
	/**
	 * Define if the minimize window button is displayed.
	 * *The default is true*
	 */
	minimizable?: boolean;
	/**
	 * Define if the maximize and restore window buttons are displayed.
	 * *The default is true*
	 */
	maximizable?: boolean;
	/**
	 * Define if the close window button is displayed.
	 * *The default is true*
	 */
	closeable?: boolean;
	/**
	 * When the close button is clicked, the window is hidden instead of closed.
	 * *The default is false*
	 */
	hideWhenClickingClose?: boolean;
	/**
	 * Enables or disables the blur option in titlebar.
	 * *The default is true*
	 */
	unfocusEffect?: boolean;
	/**
	 * Set the order of the elements on the title bar. You can use `inverted`, `first-buttons` or don't add for.
	 * *The default is normal*
	 */
	order?: "inverted" | "first-buttons";
	/**
	 * Set horizontal alignment of the window title.
	 * *The default value is center*
	 */
	titleHorizontalAlignment?: "left" | "center" | "right";
	/**
	 * Sets the value for the overflow of the window.
	 * *The default value is auto*
	 */
	overflow?: "auto" | "hidden" | "visible";

	itemBackgroundColor?: Color;

	/**
	 * Sends this with close/minimize/maximize commands to be handled by the proper window
	 */
	windowId?: string;

	displayTitle: boolean;

	title?: string;
}

const defaultOptions: TitlebarOptions = {
	foregroundColor: Color.fromHex('#ffffff'),
	backgroundColor: Color.fromHex('#444444'),
	iconsTheme: Themebar.win,
	shadow: false,
	minimizable: true,
	maximizable: true,
	closeable: true,
	hideWhenClickingClose: false,
	unfocusEffect: true,
	overflow: "auto",
	displayTitle: true
};

export class Titlebar extends Themebar {
	private titlebar: HTMLElement | undefined;
	private title: HTMLElement | undefined;
	private dragRegion: HTMLElement | undefined;
	private appIcon: HTMLElement | undefined;
	private windowControls: HTMLElement | undefined;
	private maxRestoreControl: HTMLElement | undefined;
	private container: HTMLElement | undefined;

	private resizer: {
		top: HTMLElement;
		left: HTMLElement;
	} | undefined;

	private isInactive: boolean | undefined;

	private _options: TitlebarOptions;

	private events: { [k: string]: Function; } | undefined;

	private readonly ID_CLOSE = 'titlebar-close';
	private readonly ID_MINIMIZE = 'titlebar-minimize';
	private readonly ID_MAXIMIZE = 'titlebar-maximize';

	private titleRestore = 'Restore Down';
	private titleMaximize = 'Maximize';

	constructor(options?: TitlebarOptions) {
		super();

		this._options = { ...defaultOptions, ...options };

		if (isMacintosh) {
			this._options.iconsTheme = Themebar.mac;
		}
		
		this.registerListeners();
		this.createTitlebar();
		this.updateStyles();
		if (this._options.iconsTheme) {
			this.registerTheme(this._options.iconsTheme);
		}

		window.addEventListener('beforeunload', () => {
			this.removeListeners();
		});
	}

	private registerListeners() {
		this.events = {};

		this.events[EventType.FOCUS] = () => this.onDidChangeWindowFocus(true);
		this.events[EventType.BLUR] = () => this.onDidChangeWindowFocus(false);
		this.events[EventType.MAXIMIZE] = () => {
			ipcRenderer.invoke('isMaximized')
			.then((result) => {
				this.onDidChangeMaximized(result);
			})
			.catch((err) => {
				//console.error('invoke failed: ' + err);
			});
		};

		this.events[EventType.UNMAXIMIZE] = () => {
			ipcRenderer.invoke('isMaximized')
			.then((result) => {
				this.onDidChangeMaximized(result);
			})
			.catch((err) => {
				//console.error('invoke failed: ' + err);
			});
		};

		this.events[EventType.ENTER_FULLSCREEN] = () => this.onDidChangeFullscreen(true);
		this.events[EventType.LEAVE_FULLSCREEN] = () => this.onDidChangeFullscreen(false);

		ipcRenderer.on('removeTitlebar', (event, arg) => {
			//log('ipcRenderer.on removeTitlebar(+)');
			this.hideTitlebar(true);
		});

		ipcRenderer.on('restoreTitlebar', (event, arg) => {
			//console.log('ipcRenderer.on restoreTitlebar(+)');
			this.hideTitlebar(false);
		});

		ipcRenderer.on('onMaximize', (event, arg) => {
			// No op
		});

		ipcRenderer.on('onRestore', (event, arg) => {
			// No op
		});

		ipcRenderer.on('i18nLanguageChanged', (event, arg: Ii18nTitleBarData) => {
			//console.log("+++++++++++++++++++++++++++ i18nLanguageChanged +++++++++", arg);
			this.handleTranslation(arg);
		});

		ipcRenderer.on('getTitlebarHeightInPx', (event, arg: IAsyncTitlebarMessage) => {
			ipcRenderer.send('onTitlebarHeightInPx', {
				windowId: this._options.windowId,
				cookie: arg.cookie,
				data: this.getTitlebarHeightInPx()
			});
		});
	}

	private handleTranslation(data: Ii18nTitleBarData){
		this.titleMaximize = data.maximize;
		this.titleRestore = data.restore;
		
		const close = document.getElementById(this.ID_CLOSE);
		if(close) close.title = data.close;

		const minimize = document.getElementById(this.ID_MINIMIZE);
		if(minimize) minimize.title = data.minimize;

		const maximize = document.getElementById(this.ID_MAXIMIZE);
		if(maximize) 
		maximize.title = data.isMaximized ? data.restore :data.maximize;
	}

	private getTitlebarHeightInPx(): number {
		const titlebar = document.getElementsByClassName('titlebar');
		if (titlebar && titlebar.length > 0) {
			return (<HTMLStyleElement>titlebar[0]).offsetHeight;
		}

		return 50;
	}

	private hideTitlebar(hide: boolean) {
		const titlebar = document.getElementsByClassName('titlebar');
		if (titlebar && titlebar.length > 0) {
			(<HTMLStyleElement>titlebar[0]).style.display = hide ? 'none' : 'flex';
		}

		const container = document.getElementsByClassName('container-after-titlebar');
		if (container && container.length > 0) {
			(<HTMLStyleElement>container[0]).style.top = hide ? '0px' : this.getContainerTopSize();
		}

		ipcRenderer.send('onTitlebarVisibility', {
			windowId: this._options.windowId,
			visible: !hide
		});
	}

	// From https://github.com/panjiang/custom-electron-titlebar/commit/825bff6b15e9223c1160208847b4c5010610bcf7
	private removeListeners() {
		this.events = {};
	}

	private getContainerTopSize(): string {
		if (isMacintosh) {
			return TOP_TITLEBAR_HEIGHT_MAC;
		}

		return TOP_TITLEBAR_HEIGHT_WIN;
	}

	private buildMinimizeControl() {
		if (!this.windowControls) {
			throw new Error('Titlebar.buildMinimizeControl(): No windowControls object instantiated.');
		}

		// Minimize
		const minimizeIconContainer = append(this.windowControls, $('div.window-icon-bg'));
		minimizeIconContainer.title = "Minimize";
		minimizeIconContainer.id = this.ID_MINIMIZE;
		addClass(minimizeIconContainer, 'window-minimize-bg');
		const minimizeIcon = append(minimizeIconContainer, $('div.window-icon'));
		addClass(minimizeIcon, 'window-minimize');

		if (!this._options.minimizable) {
			addClass(minimizeIconContainer, 'inactive');
		} else {
			this._register(addDisposableListener(minimizeIcon, EventType.CLICK, e => {
				ipcRenderer.send('onMinimize', { windowId: this._options.windowId });
			}));
		}
	}

	private buildRestoreControl() {
		if (!this.windowControls) {
			throw new Error('Titlebar.buildRestoreControl(): No windowControls object instantiated.');
		}

		// Restore
		const restoreIconContainer = append(this.windowControls, $('div.window-icon-bg'));
		addClass(restoreIconContainer, 'window-maximize-bg');
		this.maxRestoreControl = append(restoreIconContainer, $('div.window-icon'));
		this.maxRestoreControl.id = this.ID_MAXIMIZE;
		addClass(this.maxRestoreControl, 'window-max-restore');

		if (!this._options.maximizable) {
			addClass(restoreIconContainer, 'inactive');
		} else {
			this._register(addDisposableListener(this.maxRestoreControl, EventType.CLICK, e => {
				ipcRenderer.invoke('isMaximized')
				.then((result) => {
					if (result) {
						ipcRenderer.send('onRestore', { windowId: this._options.windowId });
					}
					else {
						ipcRenderer.send('onMaximize', { windowId: this._options.windowId });
					}
					this.onDidChangeMaximized(!result);
				})
				.catch((err) => {
					//console.error('invoke failed: ' + err);
				});
			}));
		}
	}

	private buildCloseControl() {
		if (!this.windowControls) {
			throw new Error('Titlebar.buildCloseControl(): No windowControls object instantiated.');
		}

		// Close
		const closeIconContainer = append(this.windowControls, $('div.window-icon-bg'));
		closeIconContainer.title = "Close";
		closeIconContainer.id = this.ID_CLOSE;
		addClass(closeIconContainer, 'window-close-bg');
		const closeIcon = append(closeIconContainer, $('div.window-icon'));
		addClass(closeIcon, 'window-close');

		if (!this._options.closeable) {
			addClass(closeIconContainer, 'inactive');
		} else {
			this._register(addDisposableListener(closeIcon, EventType.CLICK, e => {
				if (this._options.hideWhenClickingClose) {
					ipcRenderer.send('onHide', { windowId: this._options.windowId });
				} else {
					ipcRenderer.send('onClose', { windowId: this._options.windowId });
				}
			}));
		}
	}

	private buildWindowControls() {
		if (!this.titlebar) {
			return;
		}

		// Window Controls
		this.windowControls = append(this.titlebar, $('div.window-controls-container'));

		if (isMacintosh) {
			this.buildCloseControl();
			this.buildMinimizeControl();
			this.buildRestoreControl();
			this.windowControls.style.textAlign = 'left';
			this.windowControls.style.marginLeft = '5px';
		}
		else {
			this.buildMinimizeControl();
			this.buildRestoreControl();
			this.buildCloseControl();
		}
	}

	private createTitlebar() {
		// Content container
		this.container = $('div.container-after-titlebar');
		
		this.container.style.top = this.getContainerTopSize();
		this.container.style.bottom = '0px';
		this.container.style.right = '0';
		this.container.style.left = '0';
		this.container.style.position = 'absolute';
		this.container.style.overflow = this._options.overflow ?? '';

		while (document.body.firstChild) {
			append(this.container, document.body.firstChild);
		}

		append(document.body, this.container);

		document.body.style.overflow = 'hidden';
		document.body.style.margin = '0';

		// Titlebar
		this.titlebar = $('div.titlebar');
		addClass(this.titlebar, isWindows ? 'cet-windows' : isLinux ? 'cet-linux' : 'cet-mac');

		if (this._options.order) {
			addClass(this.titlebar, this._options.order);
		}

		if (this._options.shadow) {
			this.titlebar.style.boxShadow = `0 2px 1px -1px rgba(0, 0, 0, .2), 0 1px 1px 0 rgba(0, 0, 0, .14), 0 1px 3px 0 rgba(0, 0, 0, .12)`;
		}

		// Drag Region
		// this.dragRegion = append(this.titlebar, $('div.titlebar-drag-region'));

		// App Icon (Windows/Linux)
		if (!isMacintosh && this._options.icon) {
			this.appIcon = append(this.titlebar, $('div.window-appicon'));
			this.updateIcon(this._options.icon);
		}
		
		this.buildWindowControls();

		// Title
		this.title = append(this.titlebar, $('div.window-title'));

		if (!isMacintosh) {
			this.title.style.cursor = 'default';
		}

		if (IS_MAC_BIGSUR_OR_LATER) {
			this.title.style.fontWeight = "600";
			this.title.style.fontSize = "13px";
		}

		if (this._options.displayTitle) {
			this.updateTitle(this._options.title);
			this.setHorizontalAlignment(this._options.titleHorizontalAlignment ?? 'center');
		}

		// Maximize/Restore on doubleclick
		if (isMacintosh) {
			ipcRenderer.invoke('isMaximized')
			.then((result) => {
				if (this.titlebar) {
					this._register(addDisposableListener(this.titlebar, EventType.DBLCLICK, () => {
						this.onDidChangeMaximized(!result);
					}));
				}
			})
			.catch((err) => {
				//console.error('invoke failed: ' + err);
			});
		}

		// Resizer
		this.resizer = {
			top: append(this.titlebar, $('div.resizer.top')),
			left: append(this.titlebar, $('div.resizer.left'))
		}

		ipcRenderer.invoke('isMaximized')
		.then((result) => {
			this.onDidChangeMaximized(result);
		})
		.catch((err) => {
			//console.error('invoke failed: ' + err);
		});

		ipcRenderer.send('onTitlebarVisibility', {
			windowId: this._options.windowId,
			visible: true
		});

		prepend(document.body, this.titlebar);
	}

	private onBlur(): void {
		this.isInactive = true;
		this.updateStyles();
	}

	private onFocus(): void {
		this.isInactive = false;
		this.updateStyles();
	}

	private onDidChangeWindowFocus(hasFocus: boolean): void {
		if (this.titlebar) {
			if (hasFocus) {
				removeClass(this.titlebar, 'inactive');
				this.onFocus();
			} else {
				addClass(this.titlebar, 'inactive');
				this.onBlur();
			}
		}
	}

	private onDidChangeMaximized(maximized: boolean) {
		if (this.maxRestoreControl) {
			if (maximized) {
				removeClass(this.maxRestoreControl, 'window-maximize');
				this.maxRestoreControl.title = this.titleRestore;
				addClass(this.maxRestoreControl, 'window-unmaximize');
			} else {
				removeClass(this.maxRestoreControl, 'window-unmaximize');
				this.maxRestoreControl.title = this.titleMaximize;
				addClass(this.maxRestoreControl, 'window-maximize');
			}
		}

		if (this.resizer) {
			if (maximized) {
				hide(this.resizer.top, this.resizer.left);
			} else {
				show(this.resizer.top, this.resizer.left);
			}
		}
	}

	private onDidChangeFullscreen(fullscreen: boolean) {
		if (!this.appIcon || !this.title || !this.windowControls) {
			return;
		}

		if (!isMacintosh) {
			if (fullscreen) {
				hide(this.appIcon, this.title, this.windowControls);
			} else {
				show(this.appIcon, this.title, this.windowControls);
			}
		}
	}

	private updateStyles() {
		if (this.titlebar) {
			if (this.isInactive) {
				addClass(this.titlebar, 'inactive');
			} else {
				removeClass(this.titlebar, 'inactive');
			}

			const titleBackground = this.isInactive && this._options.unfocusEffect
				? this._options.backgroundColor.lighten(.45)
				: this._options.backgroundColor;

			this.titlebar.style.backgroundColor = titleBackground.toString();

			this.titlebar.style.color = this._options.foregroundColor.toString();

			const backgroundColor = this._options.backgroundColor.darken(.16);

			const bgColor = !this._options.itemBackgroundColor || this._options.itemBackgroundColor.equals(backgroundColor)
				? new Color(new RGBA(0, 0, 0, .14))
				: this._options.itemBackgroundColor;
		}
	}

	/**
	 * get the options of the titlebar
	 */
	public get options(): TitlebarOptions {
		return this._options;
	}

	/**
	 * Update the background color of the title bar
	 * @param backgroundColor The color for the background 
	 */
	updateBackground(backgroundColor: Color): void {
		this._options.backgroundColor = backgroundColor;
		this.updateStyles();
	}

	/**
	 * Update the item background color of the menubar
	 * @param itemBGColor The color for the item background
	 */
	updateItemBGColor(itemBGColor: Color): void {
		this._options.itemBackgroundColor = itemBGColor;
		this.updateStyles();
	}

	/**
   * Update the title of the title bar.
   * You can use this method if change the content of `<title>` tag on your html.
   * @param title The title of the title bar and document.
   */
	updateTitle(title?: string) {
		if (this.title) {
			if (title) {
				document.title = title;
			} else {
				title = document.title;
			}

			this.title.innerText = title;
		}
	}

	/**
	 * It method set new icon to title-bar-icon of title-bar.
	 * @param path path to icon
	 */
	updateIcon(path: string) {
		if (path === null || path === '') {
			return;
		}

		if (this.appIcon) {
			this.appIcon.style.backgroundImage = `url("${path}")`;
		}
	}

	/**
	 * Horizontal alignment of the title.
	 * @param side `left`, `center` or `right`.
	 */
	// Add ability to customize title-bar title. (by @MairwunNx) https://github.com/AlexTorresSk/custom-electron-titlebar/pull/8
	setHorizontalAlignment(side: "left" | "center" | "right") {
		if (this.title) {
			if (side === 'left' || (side === 'right' && this._options.order === 'inverted')) {
				this.title.style.marginLeft = '8px';
				this.title.style.marginRight = 'auto';
			}

			if (side === 'right' || (side === 'left' && this._options.order === 'inverted')) {
				this.title.style.marginRight = '8px';
				this.title.style.marginLeft = 'auto';
			}

			if (side === 'center' || side === undefined) {
				this.title.style.marginRight = 'auto';
				this.title.style.marginLeft = 'auto';
			}
		}
	}

	/**
	 * Remove the titlebar, menubar and all methods.
	 */
	dispose() {
		if (this.titlebar)
			removeNode(this.titlebar);

		while (this.container?.firstChild) {
			append(document.body, this.container.firstChild);
		}

		if (this.container)
			removeNode(this.container);

		this.removeListeners();

		super.dispose();
	}

}
