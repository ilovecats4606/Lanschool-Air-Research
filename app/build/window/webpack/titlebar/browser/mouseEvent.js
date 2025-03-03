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
exports.StandardWheelEvent = exports.DragMouseEvent = exports.StandardMouseEvent = void 0;
const browser = __importStar(require("./browser"));
const iframe_1 = require("./iframe");
const platform = __importStar(require("../common/platform"));
class StandardMouseEvent {
    constructor(e) {
        this.timestamp = Date.now();
        this.browserEvent = e;
        this.leftButton = e.button === 0;
        this.middleButton = e.button === 1;
        this.rightButton = e.button === 2;
        this.target = e.target;
        this.detail = e.detail || 1;
        if (e.type === 'dblclick') {
            this.detail = 2;
        }
        this.ctrlKey = e.ctrlKey;
        this.shiftKey = e.shiftKey;
        this.altKey = e.altKey;
        this.metaKey = e.metaKey;
        if (typeof e.pageX === 'number') {
            this.posx = e.pageX;
            this.posy = e.pageY;
        }
        else {
            this.posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            this.posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        let iframeOffsets = iframe_1.IframeUtils.getPositionOfChildWindowRelativeToAncestorWindow(self, e.view);
        this.posx -= iframeOffsets.left;
        this.posy -= iframeOffsets.top;
    }
    preventDefault() {
        if (this.browserEvent.preventDefault) {
            this.browserEvent.preventDefault();
        }
    }
    stopPropagation() {
        if (this.browserEvent.stopPropagation) {
            this.browserEvent.stopPropagation();
        }
    }
}
exports.StandardMouseEvent = StandardMouseEvent;
class DragMouseEvent extends StandardMouseEvent {
    constructor(e) {
        super(e);
        this.dataTransfer = e.dataTransfer;
    }
}
exports.DragMouseEvent = DragMouseEvent;
class StandardWheelEvent {
    constructor(e, deltaX = 0, deltaY = 0) {
        this.browserEvent = e || null;
        this.target = e ? (e.target || e.targetNode || e.srcElement) : null;
        this.deltaY = deltaY;
        this.deltaX = deltaX;
        if (e) {
            let e1 = e;
            let e2 = e;
            if (typeof e1.wheelDeltaY !== 'undefined') {
                this.deltaY = e1.wheelDeltaY / 120;
            }
            else if (typeof e2.VERTICAL_AXIS !== 'undefined' && e2.axis === e2.VERTICAL_AXIS) {
                this.deltaY = -e2.detail / 3;
            }
            if (typeof e1.wheelDeltaX !== 'undefined') {
                if (browser.isSafari && platform.isWindows) {
                    this.deltaX = -(e1.wheelDeltaX / 120);
                }
                else {
                    this.deltaX = e1.wheelDeltaX / 120;
                }
            }
            else if (typeof e2.HORIZONTAL_AXIS !== 'undefined' && e2.axis === e2.HORIZONTAL_AXIS) {
                this.deltaX = -e.detail / 3;
            }
            if (this.deltaY === 0 && this.deltaX === 0 && e.wheelDelta) {
                this.deltaY = e.wheelDelta / 120;
            }
        }
    }
    preventDefault() {
        if (this.browserEvent) {
            if (this.browserEvent.preventDefault) {
                this.browserEvent.preventDefault();
            }
        }
    }
    stopPropagation() {
        if (this.browserEvent) {
            if (this.browserEvent.stopPropagation) {
                this.browserEvent.stopPropagation();
            }
        }
    }
}
exports.StandardWheelEvent = StandardWheelEvent;
//# sourceMappingURL=mouseEvent.js.map