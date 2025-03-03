"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Titlebar = void 0;
const platform_1 = require("./common/platform");
const color_1 = require("./common/color");
const dom_1 = require("./common/dom");
const electron_1 = require("electron");
const themebar_1 = require("./themebar");
const INACTIVE_FOREGROUND_DARK = color_1.Color.fromHex('#222222');
const ACTIVE_FOREGROUND_DARK = color_1.Color.fromHex('#333333');
const INACTIVE_FOREGROUND = color_1.Color.fromHex('#EEEEEE');
const ACTIVE_FOREGROUND = color_1.Color.fromHex('#FFFFFF');
const IS_MAC_BIGSUR_OR_LATER = platform_1.isMacintosh && parseInt(process.getSystemVersion().split(".")[0]) >= 11;
const TOP_TITLEBAR_HEIGHT_MAC = IS_MAC_BIGSUR_OR_LATER ? '28px' : '22px';
const TOP_TITLEBAR_HEIGHT_WIN = '30px';
const defaultOptions = {
    foregroundColor: color_1.Color.fromHex('#ffffff'),
    backgroundColor: color_1.Color.fromHex('#444444'),
    iconsTheme: themebar_1.Themebar.win,
    shadow: false,
    minimizable: true,
    maximizable: true,
    closeable: true,
    hideWhenClickingClose: false,
    unfocusEffect: true,
    overflow: "auto",
    displayTitle: true
};
class Titlebar extends themebar_1.Themebar {
    constructor(options) {
        super();
        this.ID_CLOSE = 'titlebar-close';
        this.ID_MINIMIZE = 'titlebar-minimize';
        this.ID_MAXIMIZE = 'titlebar-maximize';
        this.titleRestore = 'Restore Down';
        this.titleMaximize = 'Maximize';
        this._options = Object.assign(Object.assign({}, defaultOptions), options);
        if (platform_1.isMacintosh) {
            this._options.iconsTheme = themebar_1.Themebar.mac;
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
    registerListeners() {
        this.events = {};
        this.events[dom_1.EventType.FOCUS] = () => this.onDidChangeWindowFocus(true);
        this.events[dom_1.EventType.BLUR] = () => this.onDidChangeWindowFocus(false);
        this.events[dom_1.EventType.MAXIMIZE] = () => {
            electron_1.ipcRenderer.invoke('isMaximized')
                .then((result) => {
                this.onDidChangeMaximized(result);
            })
                .catch((err) => {
            });
        };
        this.events[dom_1.EventType.UNMAXIMIZE] = () => {
            electron_1.ipcRenderer.invoke('isMaximized')
                .then((result) => {
                this.onDidChangeMaximized(result);
            })
                .catch((err) => {
            });
        };
        this.events[dom_1.EventType.ENTER_FULLSCREEN] = () => this.onDidChangeFullscreen(true);
        this.events[dom_1.EventType.LEAVE_FULLSCREEN] = () => this.onDidChangeFullscreen(false);
        electron_1.ipcRenderer.on('removeTitlebar', (event, arg) => {
            this.hideTitlebar(true);
        });
        electron_1.ipcRenderer.on('restoreTitlebar', (event, arg) => {
            this.hideTitlebar(false);
        });
        electron_1.ipcRenderer.on('onMaximize', (event, arg) => {
        });
        electron_1.ipcRenderer.on('onRestore', (event, arg) => {
        });
        electron_1.ipcRenderer.on('i18nLanguageChanged', (event, arg) => {
            this.handleTranslation(arg);
        });
        electron_1.ipcRenderer.on('getTitlebarHeightInPx', (event, arg) => {
            electron_1.ipcRenderer.send('onTitlebarHeightInPx', {
                windowId: this._options.windowId,
                cookie: arg.cookie,
                data: this.getTitlebarHeightInPx()
            });
        });
    }
    handleTranslation(data) {
        this.titleMaximize = data.maximize;
        this.titleRestore = data.restore;
        const close = document.getElementById(this.ID_CLOSE);
        if (close)
            close.title = data.close;
        const minimize = document.getElementById(this.ID_MINIMIZE);
        if (minimize)
            minimize.title = data.minimize;
        const maximize = document.getElementById(this.ID_MAXIMIZE);
        if (maximize)
            maximize.title = data.isMaximized ? data.restore : data.maximize;
    }
    getTitlebarHeightInPx() {
        const titlebar = document.getElementsByClassName('titlebar');
        if (titlebar && titlebar.length > 0) {
            return titlebar[0].offsetHeight;
        }
        return 50;
    }
    hideTitlebar(hide) {
        const titlebar = document.getElementsByClassName('titlebar');
        if (titlebar && titlebar.length > 0) {
            titlebar[0].style.display = hide ? 'none' : 'flex';
        }
        const container = document.getElementsByClassName('container-after-titlebar');
        if (container && container.length > 0) {
            container[0].style.top = hide ? '0px' : this.getContainerTopSize();
        }
        electron_1.ipcRenderer.send('onTitlebarVisibility', {
            windowId: this._options.windowId,
            visible: !hide
        });
    }
    removeListeners() {
        this.events = {};
    }
    getContainerTopSize() {
        if (platform_1.isMacintosh) {
            return TOP_TITLEBAR_HEIGHT_MAC;
        }
        return TOP_TITLEBAR_HEIGHT_WIN;
    }
    buildMinimizeControl() {
        if (!this.windowControls) {
            throw new Error('Titlebar.buildMinimizeControl(): No windowControls object instantiated.');
        }
        const minimizeIconContainer = (0, dom_1.append)(this.windowControls, (0, dom_1.$)('div.window-icon-bg'));
        minimizeIconContainer.title = "Minimize";
        minimizeIconContainer.id = this.ID_MINIMIZE;
        (0, dom_1.addClass)(minimizeIconContainer, 'window-minimize-bg');
        const minimizeIcon = (0, dom_1.append)(minimizeIconContainer, (0, dom_1.$)('div.window-icon'));
        (0, dom_1.addClass)(minimizeIcon, 'window-minimize');
        if (!this._options.minimizable) {
            (0, dom_1.addClass)(minimizeIconContainer, 'inactive');
        }
        else {
            this._register((0, dom_1.addDisposableListener)(minimizeIcon, dom_1.EventType.CLICK, e => {
                electron_1.ipcRenderer.send('onMinimize', { windowId: this._options.windowId });
            }));
        }
    }
    buildRestoreControl() {
        if (!this.windowControls) {
            throw new Error('Titlebar.buildRestoreControl(): No windowControls object instantiated.');
        }
        const restoreIconContainer = (0, dom_1.append)(this.windowControls, (0, dom_1.$)('div.window-icon-bg'));
        (0, dom_1.addClass)(restoreIconContainer, 'window-maximize-bg');
        this.maxRestoreControl = (0, dom_1.append)(restoreIconContainer, (0, dom_1.$)('div.window-icon'));
        this.maxRestoreControl.id = this.ID_MAXIMIZE;
        (0, dom_1.addClass)(this.maxRestoreControl, 'window-max-restore');
        if (!this._options.maximizable) {
            (0, dom_1.addClass)(restoreIconContainer, 'inactive');
        }
        else {
            this._register((0, dom_1.addDisposableListener)(this.maxRestoreControl, dom_1.EventType.CLICK, e => {
                electron_1.ipcRenderer.invoke('isMaximized')
                    .then((result) => {
                    if (result) {
                        electron_1.ipcRenderer.send('onRestore', { windowId: this._options.windowId });
                    }
                    else {
                        electron_1.ipcRenderer.send('onMaximize', { windowId: this._options.windowId });
                    }
                    this.onDidChangeMaximized(!result);
                })
                    .catch((err) => {
                });
            }));
        }
    }
    buildCloseControl() {
        if (!this.windowControls) {
            throw new Error('Titlebar.buildCloseControl(): No windowControls object instantiated.');
        }
        const closeIconContainer = (0, dom_1.append)(this.windowControls, (0, dom_1.$)('div.window-icon-bg'));
        closeIconContainer.title = "Close";
        closeIconContainer.id = this.ID_CLOSE;
        (0, dom_1.addClass)(closeIconContainer, 'window-close-bg');
        const closeIcon = (0, dom_1.append)(closeIconContainer, (0, dom_1.$)('div.window-icon'));
        (0, dom_1.addClass)(closeIcon, 'window-close');
        if (!this._options.closeable) {
            (0, dom_1.addClass)(closeIconContainer, 'inactive');
        }
        else {
            this._register((0, dom_1.addDisposableListener)(closeIcon, dom_1.EventType.CLICK, e => {
                if (this._options.hideWhenClickingClose) {
                    electron_1.ipcRenderer.send('onHide', { windowId: this._options.windowId });
                }
                else {
                    electron_1.ipcRenderer.send('onClose', { windowId: this._options.windowId });
                }
            }));
        }
    }
    buildWindowControls() {
        if (!this.titlebar) {
            return;
        }
        this.windowControls = (0, dom_1.append)(this.titlebar, (0, dom_1.$)('div.window-controls-container'));
        if (platform_1.isMacintosh) {
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
    createTitlebar() {
        var _a, _b;
        this.container = (0, dom_1.$)('div.container-after-titlebar');
        this.container.style.top = this.getContainerTopSize();
        this.container.style.bottom = '0px';
        this.container.style.right = '0';
        this.container.style.left = '0';
        this.container.style.position = 'absolute';
        this.container.style.overflow = (_a = this._options.overflow) !== null && _a !== void 0 ? _a : '';
        while (document.body.firstChild) {
            (0, dom_1.append)(this.container, document.body.firstChild);
        }
        (0, dom_1.append)(document.body, this.container);
        document.body.style.overflow = 'hidden';
        document.body.style.margin = '0';
        this.titlebar = (0, dom_1.$)('div.titlebar');
        (0, dom_1.addClass)(this.titlebar, platform_1.isWindows ? 'cet-windows' : platform_1.isLinux ? 'cet-linux' : 'cet-mac');
        if (this._options.order) {
            (0, dom_1.addClass)(this.titlebar, this._options.order);
        }
        if (this._options.shadow) {
            this.titlebar.style.boxShadow = `0 2px 1px -1px rgba(0, 0, 0, .2), 0 1px 1px 0 rgba(0, 0, 0, .14), 0 1px 3px 0 rgba(0, 0, 0, .12)`;
        }
        if (!platform_1.isMacintosh && this._options.icon) {
            this.appIcon = (0, dom_1.append)(this.titlebar, (0, dom_1.$)('div.window-appicon'));
            this.updateIcon(this._options.icon);
        }
        this.buildWindowControls();
        this.title = (0, dom_1.append)(this.titlebar, (0, dom_1.$)('div.window-title'));
        if (!platform_1.isMacintosh) {
            this.title.style.cursor = 'default';
        }
        if (IS_MAC_BIGSUR_OR_LATER) {
            this.title.style.fontWeight = "600";
            this.title.style.fontSize = "13px";
        }
        if (this._options.displayTitle) {
            this.updateTitle(this._options.title);
            this.setHorizontalAlignment((_b = this._options.titleHorizontalAlignment) !== null && _b !== void 0 ? _b : 'center');
        }
        if (platform_1.isMacintosh) {
            electron_1.ipcRenderer.invoke('isMaximized')
                .then((result) => {
                if (this.titlebar) {
                    this._register((0, dom_1.addDisposableListener)(this.titlebar, dom_1.EventType.DBLCLICK, () => {
                        this.onDidChangeMaximized(!result);
                    }));
                }
            })
                .catch((err) => {
            });
        }
        this.resizer = {
            top: (0, dom_1.append)(this.titlebar, (0, dom_1.$)('div.resizer.top')),
            left: (0, dom_1.append)(this.titlebar, (0, dom_1.$)('div.resizer.left'))
        };
        electron_1.ipcRenderer.invoke('isMaximized')
            .then((result) => {
            this.onDidChangeMaximized(result);
        })
            .catch((err) => {
        });
        electron_1.ipcRenderer.send('onTitlebarVisibility', {
            windowId: this._options.windowId,
            visible: true
        });
        (0, dom_1.prepend)(document.body, this.titlebar);
    }
    onBlur() {
        this.isInactive = true;
        this.updateStyles();
    }
    onFocus() {
        this.isInactive = false;
        this.updateStyles();
    }
    onDidChangeWindowFocus(hasFocus) {
        if (this.titlebar) {
            if (hasFocus) {
                (0, dom_1.removeClass)(this.titlebar, 'inactive');
                this.onFocus();
            }
            else {
                (0, dom_1.addClass)(this.titlebar, 'inactive');
                this.onBlur();
            }
        }
    }
    onDidChangeMaximized(maximized) {
        if (this.maxRestoreControl) {
            if (maximized) {
                (0, dom_1.removeClass)(this.maxRestoreControl, 'window-maximize');
                this.maxRestoreControl.title = this.titleRestore;
                (0, dom_1.addClass)(this.maxRestoreControl, 'window-unmaximize');
            }
            else {
                (0, dom_1.removeClass)(this.maxRestoreControl, 'window-unmaximize');
                this.maxRestoreControl.title = this.titleMaximize;
                (0, dom_1.addClass)(this.maxRestoreControl, 'window-maximize');
            }
        }
        if (this.resizer) {
            if (maximized) {
                (0, dom_1.hide)(this.resizer.top, this.resizer.left);
            }
            else {
                (0, dom_1.show)(this.resizer.top, this.resizer.left);
            }
        }
    }
    onDidChangeFullscreen(fullscreen) {
        if (!this.appIcon || !this.title || !this.windowControls) {
            return;
        }
        if (!platform_1.isMacintosh) {
            if (fullscreen) {
                (0, dom_1.hide)(this.appIcon, this.title, this.windowControls);
            }
            else {
                (0, dom_1.show)(this.appIcon, this.title, this.windowControls);
            }
        }
    }
    updateStyles() {
        if (this.titlebar) {
            if (this.isInactive) {
                (0, dom_1.addClass)(this.titlebar, 'inactive');
            }
            else {
                (0, dom_1.removeClass)(this.titlebar, 'inactive');
            }
            const titleBackground = this.isInactive && this._options.unfocusEffect
                ? this._options.backgroundColor.lighten(.45)
                : this._options.backgroundColor;
            this.titlebar.style.backgroundColor = titleBackground.toString();
            this.titlebar.style.color = this._options.foregroundColor.toString();
            const backgroundColor = this._options.backgroundColor.darken(.16);
            const bgColor = !this._options.itemBackgroundColor || this._options.itemBackgroundColor.equals(backgroundColor)
                ? new color_1.Color(new color_1.RGBA(0, 0, 0, .14))
                : this._options.itemBackgroundColor;
        }
    }
    get options() {
        return this._options;
    }
    updateBackground(backgroundColor) {
        this._options.backgroundColor = backgroundColor;
        this.updateStyles();
    }
    updateItemBGColor(itemBGColor) {
        this._options.itemBackgroundColor = itemBGColor;
        this.updateStyles();
    }
    updateTitle(title) {
        if (this.title) {
            if (title) {
                document.title = title;
            }
            else {
                title = document.title;
            }
            this.title.innerText = title;
        }
    }
    updateIcon(path) {
        if (path === null || path === '') {
            return;
        }
        if (this.appIcon) {
            this.appIcon.style.backgroundImage = `url("${path}")`;
        }
    }
    setHorizontalAlignment(side) {
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
    dispose() {
        var _a;
        if (this.titlebar)
            (0, dom_1.removeNode)(this.titlebar);
        while ((_a = this.container) === null || _a === void 0 ? void 0 : _a.firstChild) {
            (0, dom_1.append)(document.body, this.container.firstChild);
        }
        if (this.container)
            (0, dom_1.removeNode)(this.container);
        this.removeListeners();
        super.dispose();
    }
}
exports.Titlebar = Titlebar;
//# sourceMappingURL=titlebar.js.map