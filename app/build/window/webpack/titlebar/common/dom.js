"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getElementsByTagName = exports.removeTabIndexAndUpdateFocus = exports.hide = exports.show = exports.join = exports.$ = exports.prepend = exports.append = exports.trackFocus = exports.restoreParentsScrollTop = exports.saveParentsScrollTop = exports.EventHelper = exports.EventType = exports.isHTMLElement = exports.removeCSSRulesContainingSelector = exports.createCSSRule = exports.createStyleSheet = exports.findParentWithClass = exports.isAncestor = exports.getLargestChildWidth = exports.getTotalHeight = exports.getContentHeight = exports.getTotalScrollWidth = exports.getContentWidth = exports.getTotalWidth = exports.StandardWindow = exports.getDomNodePagePosition = exports.position = exports.size = exports.getTopLeftOffset = exports.Dimension = exports.getClientArea = exports.getComputedStyle = exports.addDisposableThrottledListener = exports.modify = exports.measure = exports.scheduleAtNextAnimationFrame = exports.runAtThisOrScheduleAtNextAnimationFrame = exports.addDisposableNonBubblingMouseOutListener = exports.addStandardDisposableListener = exports.addDisposableListener = exports.toggleClass = exports.removeClasses = exports.removeClass = exports.addClasses = exports.addClass = exports.hasClass = exports.isInDOM = exports.removeNode = exports.clearNode = void 0;
exports.animate = exports.windowOpenNoOpener = exports.computeScreenAwareSize = exports.domContentLoaded = exports.finalHandler = void 0;
const browser = __importStar(require("../browser/browser"));
const event_1 = require("../browser/event");
const keyboardEvent_1 = require("../browser/keyboardEvent");
const mouseEvent_1 = require("../browser/mouseEvent");
const async_1 = require("./async");
const event_2 = require("./event");
const lifecycle_1 = require("./lifecycle");
const platform = __importStar(require("./platform"));
const arrays_1 = require("./arrays");
function clearNode(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}
exports.clearNode = clearNode;
function removeNode(node) {
    if (node.parentNode) {
        node.parentNode.removeChild(node);
    }
}
exports.removeNode = removeNode;
function isInDOM(node) {
    while (node) {
        if (node === document.body) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}
exports.isInDOM = isInDOM;
const _manualClassList = new class {
    _findClassName(node, className) {
        let classes = node.className;
        if (!classes) {
            this._lastStart = -1;
            return;
        }
        className = className.trim();
        let classesLen = classes.length, classLen = className.length;
        if (classLen === 0) {
            this._lastStart = -1;
            return;
        }
        if (classesLen < classLen) {
            this._lastStart = -1;
            return;
        }
        if (classes === className) {
            this._lastStart = 0;
            this._lastEnd = classesLen;
            return;
        }
        let idx = -1, idxEnd;
        while ((idx = classes.indexOf(className, idx + 1)) >= 0) {
            idxEnd = idx + classLen;
            if ((idx === 0 || classes.charCodeAt(idx - 1) === 32) && classes.charCodeAt(idxEnd) === 32) {
                this._lastStart = idx;
                this._lastEnd = idxEnd + 1;
                return;
            }
            if (idx > 0 && classes.charCodeAt(idx - 1) === 32 && idxEnd === classesLen) {
                this._lastStart = idx - 1;
                this._lastEnd = idxEnd;
                return;
            }
            if (idx === 0 && idxEnd === classesLen) {
                this._lastStart = 0;
                this._lastEnd = idxEnd;
                return;
            }
        }
        this._lastStart = -1;
    }
    hasClass(node, className) {
        this._findClassName(node, className);
        return this._lastStart !== -1;
    }
    addClasses(node, ...classNames) {
        classNames.forEach(nameValue => nameValue.split(' ').forEach(name => this.addClass(node, name)));
    }
    addClass(node, className) {
        if (!node.className) {
            node.className = className;
        }
        else {
            this._findClassName(node, className);
            if (this._lastStart === -1) {
                node.className = node.className + ' ' + className;
            }
        }
    }
    removeClass(node, className) {
        var _a;
        this._findClassName(node, className);
        if (this._lastStart === -1) {
            return;
        }
        else {
            node.className = node.className.substring(0, this._lastStart) + node.className.substring((_a = this._lastEnd) !== null && _a !== void 0 ? _a : -1);
        }
    }
    removeClasses(node, ...classNames) {
        classNames.forEach(nameValue => nameValue.split(' ').forEach(name => this.removeClass(node, name)));
    }
    toggleClass(node, className, shouldHaveIt) {
        this._findClassName(node, className);
        if (this._lastStart !== -1 && (shouldHaveIt === undefined || !shouldHaveIt)) {
            this.removeClass(node, className);
        }
        if (this._lastStart === -1 && (shouldHaveIt === undefined || shouldHaveIt)) {
            this.addClass(node, className);
        }
    }
};
const _nativeClassList = new class {
    hasClass(node, className) {
        return Boolean(className) && node.classList && node.classList.contains(className);
    }
    addClasses(node, ...classNames) {
        classNames.forEach(nameValue => nameValue.split(' ').forEach(name => this.addClass(node, name)));
    }
    addClass(node, className) {
        if (className && node.classList) {
            node.classList.add(className);
        }
    }
    removeClass(node, className) {
        if (className && node.classList) {
            node.classList.remove(className);
        }
    }
    removeClasses(node, ...classNames) {
        classNames.forEach(nameValue => nameValue.split(' ').forEach(name => this.removeClass(node, name)));
    }
    toggleClass(node, className, shouldHaveIt) {
        if (node.classList) {
            node.classList.toggle(className, shouldHaveIt);
        }
    }
};
const _classList = browser.isIE ? _manualClassList : _nativeClassList;
exports.hasClass = _classList.hasClass.bind(_classList);
exports.addClass = _classList.addClass.bind(_classList);
exports.addClasses = _classList.addClasses.bind(_classList);
exports.removeClass = _classList.removeClass.bind(_classList);
exports.removeClasses = _classList.removeClasses.bind(_classList);
exports.toggleClass = _classList.toggleClass.bind(_classList);
class DomListener {
    constructor(node, type, handler, useCapture) {
        this._node = node;
        this._type = type;
        this._handler = handler;
        this._useCapture = (useCapture || false);
        this._node.addEventListener(this._type, this._handler, this._useCapture);
    }
    dispose() {
        if (!this._handler) {
            return;
        }
        this._node.removeEventListener(this._type, this._handler, this._useCapture);
        this._node = null;
        this._handler = null;
    }
}
function addDisposableListener(node, type, handler, useCapture) {
    return new DomListener(node, type, handler, useCapture);
}
exports.addDisposableListener = addDisposableListener;
function _wrapAsStandardMouseEvent(handler) {
    return function (e) {
        return handler(new mouseEvent_1.StandardMouseEvent(e));
    };
}
function _wrapAsStandardKeyboardEvent(handler) {
    return function (e) {
        return handler(new keyboardEvent_1.StandardKeyboardEvent(e));
    };
}
let addStandardDisposableListener = function addStandardDisposableListener(node, type, handler, useCapture) {
    let wrapHandler = handler;
    if (type === 'click' || type === 'mousedown') {
        wrapHandler = _wrapAsStandardMouseEvent(handler);
    }
    else if (type === 'keydown' || type === 'keypress' || type === 'keyup') {
        wrapHandler = _wrapAsStandardKeyboardEvent(handler);
    }
    return addDisposableListener(node, type, wrapHandler, useCapture);
};
exports.addStandardDisposableListener = addStandardDisposableListener;
function addDisposableNonBubblingMouseOutListener(node, handler) {
    return addDisposableListener(node, 'mouseout', (e) => {
        let toElement = (e.relatedTarget || e.target);
        while (toElement && toElement !== node) {
            toElement = toElement.parentNode;
        }
        if (toElement === node) {
            return;
        }
        handler(e);
    });
}
exports.addDisposableNonBubblingMouseOutListener = addDisposableNonBubblingMouseOutListener;
let _animationFrame = null;
function doRequestAnimationFrame(callback) {
    if (!_animationFrame) {
        const emulatedRequestAnimationFrame = (callback) => {
            return setTimeout(() => callback(new Date().getTime()), 0);
        };
        _animationFrame = (self.requestAnimationFrame
            || self.msRequestAnimationFrame
            || self.webkitRequestAnimationFrame
            || self.mozRequestAnimationFrame
            || self.oRequestAnimationFrame
            || emulatedRequestAnimationFrame);
    }
    return _animationFrame.call(self, callback);
}
class AnimationFrameQueueItem {
    constructor(runner, priority = 0) {
        this._runner = runner;
        this.priority = priority;
        this._canceled = false;
    }
    dispose() {
        this._canceled = true;
    }
    execute() {
        if (this._canceled) {
            return;
        }
        try {
            this._runner();
        }
        catch (e) {
        }
    }
    static sort(a, b) {
        return b.priority - a.priority;
    }
}
(function () {
    let NEXT_QUEUE = [];
    let CURRENT_QUEUE = null;
    let animFrameRequested = false;
    let inAnimationFrameRunner = false;
    let animationFrameRunner = () => {
        animFrameRequested = false;
        CURRENT_QUEUE = NEXT_QUEUE;
        NEXT_QUEUE = [];
        inAnimationFrameRunner = true;
        while (CURRENT_QUEUE.length > 0) {
            CURRENT_QUEUE.sort(AnimationFrameQueueItem.sort);
            let top = CURRENT_QUEUE.shift();
            top.execute();
        }
        inAnimationFrameRunner = false;
    };
    exports.scheduleAtNextAnimationFrame = (runner, priority = 0) => {
        let item = new AnimationFrameQueueItem(runner, priority);
        NEXT_QUEUE.push(item);
        if (!animFrameRequested) {
            animFrameRequested = true;
            doRequestAnimationFrame(animationFrameRunner);
        }
        return item;
    };
    exports.runAtThisOrScheduleAtNextAnimationFrame = (runner, priority) => {
        if (inAnimationFrameRunner) {
            let item = new AnimationFrameQueueItem(runner, priority);
            CURRENT_QUEUE.push(item);
            return item;
        }
        else {
            return (0, exports.scheduleAtNextAnimationFrame)(runner, priority);
        }
    };
})();
function measure(callback) {
    return (0, exports.scheduleAtNextAnimationFrame)(callback, 10000);
}
exports.measure = measure;
function modify(callback) {
    return (0, exports.scheduleAtNextAnimationFrame)(callback, -10000);
}
exports.modify = modify;
const MINIMUM_TIME_MS = 16;
const DEFAULT_EVENT_MERGER = function (lastEvent, currentEvent) {
    return currentEvent;
};
class TimeoutThrottledDomListener extends lifecycle_1.Disposable {
    constructor(node, type, handler, eventMerger = DEFAULT_EVENT_MERGER, minimumTimeMs = MINIMUM_TIME_MS) {
        super();
        let lastEvent = null;
        let lastHandlerTime = 0;
        let timeout = this._register(new async_1.TimeoutTimer());
        let invokeHandler = () => {
            lastHandlerTime = (new Date()).getTime();
            handler(lastEvent);
            lastEvent = null;
        };
        this._register(addDisposableListener(node, type, (e) => {
            lastEvent = eventMerger(lastEvent, e);
            let elapsedTime = (new Date()).getTime() - lastHandlerTime;
            if (elapsedTime >= minimumTimeMs) {
                timeout.cancel();
                invokeHandler();
            }
            else {
                timeout.setIfNotSet(invokeHandler, minimumTimeMs - elapsedTime);
            }
        }));
    }
}
function addDisposableThrottledListener(node, type, handler, eventMerger, minimumTimeMs) {
    return new TimeoutThrottledDomListener(node, type, handler, eventMerger, minimumTimeMs);
}
exports.addDisposableThrottledListener = addDisposableThrottledListener;
function getComputedStyle(el) {
    return document.defaultView.getComputedStyle(el, null);
}
exports.getComputedStyle = getComputedStyle;
const convertToPixels = (function () {
    return function (element, value) {
        return parseFloat(value) || 0;
    };
})();
function getDimension(element, cssPropertyName, jsPropertyName) {
    let computedStyle = getComputedStyle(element);
    let value = '0';
    if (computedStyle) {
        if (computedStyle.getPropertyValue) {
            value = computedStyle.getPropertyValue(cssPropertyName);
        }
        else {
            value = computedStyle.getAttribute(jsPropertyName);
        }
    }
    return convertToPixels(element, value);
}
function getClientArea(element) {
    if (element !== document.body) {
        return new Dimension(element.clientWidth, element.clientHeight);
    }
    if (window.innerWidth && window.innerHeight) {
        return new Dimension(window.innerWidth, window.innerHeight);
    }
    if (document.body && document.body.clientWidth && document.body.clientHeight) {
        return new Dimension(document.body.clientWidth, document.body.clientHeight);
    }
    if (document.documentElement && document.documentElement.clientWidth && document.documentElement.clientHeight) {
        return new Dimension(document.documentElement.clientWidth, document.documentElement.clientHeight);
    }
    throw new Error('Unable to figure out browser width and height');
}
exports.getClientArea = getClientArea;
const sizeUtils = {
    getBorderLeftWidth: function (element) {
        return getDimension(element, 'border-left-width', 'borderLeftWidth');
    },
    getBorderRightWidth: function (element) {
        return getDimension(element, 'border-right-width', 'borderRightWidth');
    },
    getBorderTopWidth: function (element) {
        return getDimension(element, 'border-top-width', 'borderTopWidth');
    },
    getBorderBottomWidth: function (element) {
        return getDimension(element, 'border-bottom-width', 'borderBottomWidth');
    },
    getPaddingLeft: function (element) {
        return getDimension(element, 'padding-left', 'paddingLeft');
    },
    getPaddingRight: function (element) {
        return getDimension(element, 'padding-right', 'paddingRight');
    },
    getPaddingTop: function (element) {
        return getDimension(element, 'padding-top', 'paddingTop');
    },
    getPaddingBottom: function (element) {
        return getDimension(element, 'padding-bottom', 'paddingBottom');
    },
    getMarginLeft: function (element) {
        return getDimension(element, 'margin-left', 'marginLeft');
    },
    getMarginTop: function (element) {
        return getDimension(element, 'margin-top', 'marginTop');
    },
    getMarginRight: function (element) {
        return getDimension(element, 'margin-right', 'marginRight');
    },
    getMarginBottom: function (element) {
        return getDimension(element, 'margin-bottom', 'marginBottom');
    },
    __commaSentinel: false
};
class Dimension {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
    static equals(a, b) {
        if (a === b) {
            return true;
        }
        if (!a || !b) {
            return false;
        }
        return a.width === b.width && a.height === b.height;
    }
}
exports.Dimension = Dimension;
function getTopLeftOffset(element) {
    let offsetParent = element.offsetParent, top = element.offsetTop, left = element.offsetLeft;
    while ((element = element.parentNode) !== null && element !== document.body && element !== document.documentElement) {
        top -= element.scrollTop;
        let c = getComputedStyle(element);
        if (c) {
            left -= c.direction !== 'rtl' ? element.scrollLeft : -element.scrollLeft;
        }
        if (element === offsetParent) {
            left += sizeUtils.getBorderLeftWidth(element);
            top += sizeUtils.getBorderTopWidth(element);
            top += element.offsetTop;
            left += element.offsetLeft;
            offsetParent = element.offsetParent;
        }
    }
    return {
        left: left,
        top: top
    };
}
exports.getTopLeftOffset = getTopLeftOffset;
function size(element, width, height) {
    if (typeof width === 'number') {
        element.style.width = `${width}px`;
    }
    if (typeof height === 'number') {
        element.style.height = `${height}px`;
    }
}
exports.size = size;
function position(element, top, right, bottom, left, position = 'absolute') {
    if (typeof top === 'number') {
        element.style.top = `${top}px`;
    }
    if (typeof right === 'number') {
        element.style.right = `${right}px`;
    }
    if (typeof bottom === 'number') {
        element.style.bottom = `${bottom}px`;
    }
    if (typeof left === 'number') {
        element.style.left = `${left}px`;
    }
    element.style.position = position;
}
exports.position = position;
function getDomNodePagePosition(domNode) {
    let bb = domNode.getBoundingClientRect();
    return {
        left: bb.left + exports.StandardWindow.scrollX,
        top: bb.top + exports.StandardWindow.scrollY,
        width: bb.width,
        height: bb.height
    };
}
exports.getDomNodePagePosition = getDomNodePagePosition;
exports.StandardWindow = new class {
    get scrollX() {
        if (typeof window.scrollX === 'number') {
            return window.scrollX;
        }
        else {
            return document.body.scrollLeft + document.documentElement.scrollLeft;
        }
    }
    get scrollY() {
        if (typeof window.scrollY === 'number') {
            return window.scrollY;
        }
        else {
            return document.body.scrollTop + document.documentElement.scrollTop;
        }
    }
};
function getTotalWidth(element) {
    let margin = sizeUtils.getMarginLeft(element) + sizeUtils.getMarginRight(element);
    return element.offsetWidth + margin;
}
exports.getTotalWidth = getTotalWidth;
function getContentWidth(element) {
    let border = sizeUtils.getBorderLeftWidth(element) + sizeUtils.getBorderRightWidth(element);
    let padding = sizeUtils.getPaddingLeft(element) + sizeUtils.getPaddingRight(element);
    return element.offsetWidth - border - padding;
}
exports.getContentWidth = getContentWidth;
function getTotalScrollWidth(element) {
    let margin = sizeUtils.getMarginLeft(element) + sizeUtils.getMarginRight(element);
    return element.scrollWidth + margin;
}
exports.getTotalScrollWidth = getTotalScrollWidth;
function getContentHeight(element) {
    let border = sizeUtils.getBorderTopWidth(element) + sizeUtils.getBorderBottomWidth(element);
    let padding = sizeUtils.getPaddingTop(element) + sizeUtils.getPaddingBottom(element);
    return element.offsetHeight - border - padding;
}
exports.getContentHeight = getContentHeight;
function getTotalHeight(element) {
    let margin = sizeUtils.getMarginTop(element) + sizeUtils.getMarginBottom(element);
    return element.offsetHeight + margin;
}
exports.getTotalHeight = getTotalHeight;
function getRelativeLeft(element, parent) {
    if (element === null) {
        return 0;
    }
    let elementPosition = getTopLeftOffset(element);
    let parentPosition = getTopLeftOffset(parent);
    return elementPosition.left - parentPosition.left;
}
function getLargestChildWidth(parent, children) {
    let childWidths = children.map((child) => {
        return Math.max(getTotalScrollWidth(child), getTotalWidth(child)) + getRelativeLeft(child, parent) || 0;
    });
    let maxWidth = Math.max(...childWidths);
    return maxWidth;
}
exports.getLargestChildWidth = getLargestChildWidth;
function isAncestor(testChild, testAncestor) {
    while (testChild) {
        if (testChild === testAncestor) {
            return true;
        }
        testChild = testChild.parentNode;
    }
    return false;
}
exports.isAncestor = isAncestor;
function findParentWithClass(node, clazz, stopAtClazzOrNode) {
    while (node) {
        if ((0, exports.hasClass)(node, clazz)) {
            return node;
        }
        if (stopAtClazzOrNode) {
            if (typeof stopAtClazzOrNode === 'string') {
                if ((0, exports.hasClass)(node, stopAtClazzOrNode)) {
                    return null;
                }
            }
            else {
                if (node === stopAtClazzOrNode) {
                    return null;
                }
            }
        }
        node = node.parentNode;
    }
    return null;
}
exports.findParentWithClass = findParentWithClass;
function createStyleSheet(container = document.getElementsByTagName('head')[0]) {
    let style = document.createElement('style');
    style.type = 'text/css';
    style.media = 'screen';
    container.appendChild(style);
    return style;
}
exports.createStyleSheet = createStyleSheet;
let _sharedStyleSheet = null;
function getSharedStyleSheet() {
    if (!_sharedStyleSheet) {
        _sharedStyleSheet = createStyleSheet();
    }
    return _sharedStyleSheet;
}
function getDynamicStyleSheetRules(style) {
    if (style && style.sheet && style.sheet.rules) {
        return style.sheet.rules;
    }
    if (style && style.sheet && style.sheet.cssRules) {
        return style.sheet.cssRules;
    }
    return [];
}
function createCSSRule(selector, cssText, style = getSharedStyleSheet()) {
    if (!style || !cssText) {
        return;
    }
    style.sheet.insertRule(selector + '{' + cssText + '}', 0);
}
exports.createCSSRule = createCSSRule;
function removeCSSRulesContainingSelector(ruleName, style = getSharedStyleSheet()) {
    if (!style) {
        return;
    }
    let rules = getDynamicStyleSheetRules(style);
    let toDelete = [];
    for (let i = 0; i < rules.length; i++) {
        let rule = rules[i];
        if (rule.selectorText.indexOf(ruleName) !== -1) {
            toDelete.push(i);
        }
    }
    for (let i = toDelete.length - 1; i >= 0; i--) {
        style.sheet.deleteRule(toDelete[i]);
    }
}
exports.removeCSSRulesContainingSelector = removeCSSRulesContainingSelector;
function isHTMLElement(o) {
    if (typeof HTMLElement === 'object') {
        return o instanceof HTMLElement;
    }
    return o && typeof o === 'object' && o.nodeType === 1 && typeof o.nodeName === 'string';
}
exports.isHTMLElement = isHTMLElement;
exports.EventType = {
    MINIMIZE: 'minimize',
    MAXIMIZE: 'maximize',
    UNMAXIMIZE: 'unmaximize',
    ENTER_FULLSCREEN: 'enter-full-screen',
    LEAVE_FULLSCREEN: 'leave-full-screen',
    CLICK: 'click',
    DBLCLICK: 'dblclick',
    MOUSE_UP: 'mouseup',
    MOUSE_DOWN: 'mousedown',
    MOUSE_OVER: 'mouseover',
    MOUSE_MOVE: 'mousemove',
    MOUSE_OUT: 'mouseout',
    MOUSE_ENTER: 'mouseenter',
    MOUSE_LEAVE: 'mouseleave',
    CONTEXT_MENU: 'contextmenu',
    WHEEL: 'wheel',
    KEY_DOWN: 'keydown',
    KEY_PRESS: 'keypress',
    KEY_UP: 'keyup',
    LOAD: 'load',
    UNLOAD: 'unload',
    ABORT: 'abort',
    ERROR: 'error',
    RESIZE: 'resize',
    SCROLL: 'scroll',
    SELECT: 'select',
    CHANGE: 'change',
    SUBMIT: 'submit',
    RESET: 'reset',
    FOCUS: 'focus',
    FOCUS_IN: 'focusin',
    FOCUS_OUT: 'focusout',
    BLUR: 'blur',
    INPUT: 'input',
    STORAGE: 'storage',
    DRAG_START: 'dragstart',
    DRAG: 'drag',
    DRAG_ENTER: 'dragenter',
    DRAG_LEAVE: 'dragleave',
    DRAG_OVER: 'dragover',
    DROP: 'drop',
    DRAG_END: 'dragend',
    ANIMATION_START: browser.isWebKit ? 'webkitAnimationStart' : 'animationstart',
    ANIMATION_END: browser.isWebKit ? 'webkitAnimationEnd' : 'animationend',
    ANIMATION_ITERATION: browser.isWebKit ? 'webkitAnimationIteration' : 'animationiteration'
};
exports.EventHelper = {
    stop: function (e, cancelBubble) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        else {
            e.returnValue = false;
        }
        if (cancelBubble) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            else {
                e.cancelBubble = true;
            }
        }
    }
};
function saveParentsScrollTop(node) {
    let r = [];
    for (let i = 0; node && node.nodeType === node.ELEMENT_NODE; i++) {
        r[i] = node.scrollTop;
        node = node.parentNode;
    }
    return r;
}
exports.saveParentsScrollTop = saveParentsScrollTop;
function restoreParentsScrollTop(node, state) {
    for (let i = 0; node && node.nodeType === node.ELEMENT_NODE; i++) {
        if (node.scrollTop !== state[i]) {
            node.scrollTop = state[i];
        }
        node = node.parentNode;
    }
}
exports.restoreParentsScrollTop = restoreParentsScrollTop;
class FocusTracker {
    constructor(element) {
        this._onDidFocus = new event_2.Emitter();
        this.onDidFocus = this._onDidFocus.event;
        this._onDidBlur = new event_2.Emitter();
        this.onDidBlur = this._onDidBlur.event;
        this.disposables = [];
        let hasFocus = isAncestor(document.activeElement, element);
        let loosingFocus = false;
        let onFocus = () => {
            loosingFocus = false;
            if (!hasFocus) {
                hasFocus = true;
                this._onDidFocus.fire();
            }
        };
        let onBlur = () => {
            if (hasFocus) {
                loosingFocus = true;
                window.setTimeout(() => {
                    if (loosingFocus) {
                        loosingFocus = false;
                        hasFocus = false;
                        this._onDidBlur.fire();
                    }
                }, 0);
            }
        };
        (0, event_1.domEvent)(element, exports.EventType.FOCUS, true)(onFocus, null, this.disposables);
        (0, event_1.domEvent)(element, exports.EventType.BLUR, true)(onBlur, null, this.disposables);
    }
    dispose() {
        this.disposables = (0, lifecycle_1.dispose)(this.disposables);
        this._onDidFocus.dispose();
        this._onDidBlur.dispose();
    }
}
function trackFocus(element) {
    return new FocusTracker(element);
}
exports.trackFocus = trackFocus;
function append(parent, ...children) {
    children.forEach(child => parent.appendChild(child));
    return children[children.length - 1];
}
exports.append = append;
function prepend(parent, child) {
    parent.insertBefore(child, parent.firstChild);
    return child;
}
exports.prepend = prepend;
const SELECTOR_REGEX = /([\w\-]+)?(#([\w\-]+))?((.([\w\-]+))*)/;
function $(description, attrs, ...children) {
    let match = SELECTOR_REGEX.exec(description);
    if (!match) {
        throw new Error('Bad use of emmet');
    }
    let result = document.createElement(match[1] || 'div');
    if (match[3]) {
        result.id = match[3];
    }
    if (match[4]) {
        result.className = match[4].replace(/\./g, ' ').trim();
    }
    attrs = attrs || {};
    Object.keys(attrs).forEach(name => {
        const value = attrs[name];
        if (/^on\w+$/.test(name)) {
            result[name] = value;
        }
        else if (name === 'selected') {
            if (value) {
                result.setAttribute(name, 'true');
            }
        }
        else {
            result.setAttribute(name, value);
        }
    });
    (0, arrays_1.coalesce)(children)
        .forEach(child => {
        if (child instanceof Node) {
            result.appendChild(child);
        }
        else {
            result.appendChild(document.createTextNode(child));
        }
    });
    return result;
}
exports.$ = $;
function join(nodes, separator) {
    const result = [];
    nodes.forEach((node, index) => {
        if (index > 0) {
            if (separator instanceof Node) {
                result.push(separator.cloneNode());
            }
            else {
                result.push(document.createTextNode(separator));
            }
        }
        result.push(node);
    });
    return result;
}
exports.join = join;
function show(...elements) {
    for (let element of elements) {
        if (element) {
            element.style.display = '';
            element.removeAttribute('aria-hidden');
        }
    }
}
exports.show = show;
function hide(...elements) {
    for (let element of elements) {
        if (element) {
            element.style.display = 'none';
            element.setAttribute('aria-hidden', 'true');
        }
    }
}
exports.hide = hide;
function findParentWithAttribute(node, attribute) {
    while (node) {
        if (node instanceof HTMLElement && node.hasAttribute(attribute)) {
            return node;
        }
        node = node.parentNode;
    }
    return null;
}
function removeTabIndexAndUpdateFocus(node) {
    if (!node || !node.hasAttribute('tabIndex')) {
        return;
    }
    if (document.activeElement === node) {
        let parentFocusable = findParentWithAttribute(node.parentElement, 'tabIndex');
        if (parentFocusable) {
            parentFocusable.focus();
        }
    }
    node.removeAttribute('tabindex');
}
exports.removeTabIndexAndUpdateFocus = removeTabIndexAndUpdateFocus;
function getElementsByTagName(tag) {
    return Array.prototype.slice.call(document.getElementsByTagName(tag), 0);
}
exports.getElementsByTagName = getElementsByTagName;
function finalHandler(fn) {
    return e => {
        e.preventDefault();
        e.stopPropagation();
        fn(e);
    };
}
exports.finalHandler = finalHandler;
function domContentLoaded() {
    return new Promise(resolve => {
        const readyState = document.readyState;
        if (readyState === 'complete' || (document && document.body !== null)) {
            platform.setImmediate(resolve);
        }
        else {
            window.addEventListener('DOMContentLoaded', resolve, false);
        }
    });
}
exports.domContentLoaded = domContentLoaded;
function computeScreenAwareSize(cssPx) {
    const screenPx = window.devicePixelRatio * cssPx;
    return Math.max(1, Math.floor(screenPx)) / window.devicePixelRatio;
}
exports.computeScreenAwareSize = computeScreenAwareSize;
function windowOpenNoOpener(url) {
    if (platform.isNative || browser.isEdgeWebView) {
        window.open(url);
    }
    else {
        let newTab = window.open();
        if (newTab) {
            newTab.opener = null;
            newTab.location.href = url;
        }
    }
}
exports.windowOpenNoOpener = windowOpenNoOpener;
function animate(fn) {
    const step = () => {
        fn();
        stepDisposable = (0, exports.scheduleAtNextAnimationFrame)(step);
    };
    let stepDisposable = (0, exports.scheduleAtNextAnimationFrame)(step);
    return (0, lifecycle_1.toDisposable)(() => stepDisposable.dispose());
}
exports.animate = animate;
//# sourceMappingURL=dom.js.map