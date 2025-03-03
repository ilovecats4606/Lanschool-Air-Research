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
exports.StandardKeyboardEvent = exports.getCodeForKeyCode = void 0;
const keyCodes_1 = require("../common/keyCodes");
const platform = __importStar(require("../common/platform"));
let KEY_CODE_MAP = new Array(230);
let INVERSE_KEY_CODE_MAP = new Array(112);
(function () {
    for (let i = 0; i < INVERSE_KEY_CODE_MAP.length; i++) {
        INVERSE_KEY_CODE_MAP[i] = -1;
    }
    function define(code, keyCode) {
        KEY_CODE_MAP[code] = keyCode;
        INVERSE_KEY_CODE_MAP[keyCode] = code;
    }
    define(3, 7);
    define(8, 1);
    define(9, 2);
    define(13, 3);
    define(16, 4);
    define(17, 5);
    define(18, 6);
    define(19, 7);
    define(20, 8);
    define(27, 9);
    define(32, 10);
    define(33, 11);
    define(34, 12);
    define(35, 13);
    define(36, 14);
    define(37, 15);
    define(38, 16);
    define(39, 17);
    define(40, 18);
    define(45, 19);
    define(46, 20);
    define(48, 21);
    define(49, 22);
    define(50, 23);
    define(51, 24);
    define(52, 25);
    define(53, 26);
    define(54, 27);
    define(55, 28);
    define(56, 29);
    define(57, 30);
    define(65, 31);
    define(66, 32);
    define(67, 33);
    define(68, 34);
    define(69, 35);
    define(70, 36);
    define(71, 37);
    define(72, 38);
    define(73, 39);
    define(74, 40);
    define(75, 41);
    define(76, 42);
    define(77, 43);
    define(78, 44);
    define(79, 45);
    define(80, 46);
    define(81, 47);
    define(82, 48);
    define(83, 49);
    define(84, 50);
    define(85, 51);
    define(86, 52);
    define(87, 53);
    define(88, 54);
    define(89, 55);
    define(90, 56);
    define(93, 58);
    define(96, 93);
    define(97, 94);
    define(98, 95);
    define(99, 96);
    define(100, 97);
    define(101, 98);
    define(102, 99);
    define(103, 100);
    define(104, 101);
    define(105, 102);
    define(106, 103);
    define(107, 104);
    define(108, 105);
    define(109, 106);
    define(110, 107);
    define(111, 108);
    define(112, 59);
    define(113, 60);
    define(114, 61);
    define(115, 62);
    define(116, 63);
    define(117, 64);
    define(118, 65);
    define(119, 66);
    define(120, 67);
    define(121, 68);
    define(122, 69);
    define(123, 70);
    define(124, 71);
    define(125, 72);
    define(126, 73);
    define(127, 74);
    define(128, 75);
    define(129, 76);
    define(130, 77);
    define(144, 78);
    define(145, 79);
    define(186, 80);
    define(187, 81);
    define(188, 82);
    define(189, 83);
    define(190, 84);
    define(191, 85);
    define(192, 86);
    define(193, 110);
    define(194, 111);
    define(219, 87);
    define(220, 88);
    define(221, 89);
    define(222, 90);
    define(223, 91);
    define(226, 92);
    define(229, 109);
    define(91, 57);
    if (platform.isMacintosh) {
        define(93, 57);
    }
    else {
        define(92, 57);
    }
})();
function extractKeyCode(e) {
    if (e.charCode) {
        let char = String.fromCharCode(e.charCode).toUpperCase();
        return keyCodes_1.KeyCodeUtils.fromString(char);
    }
    return KEY_CODE_MAP[e.keyCode] || 0;
}
function getCodeForKeyCode(keyCode) {
    return INVERSE_KEY_CODE_MAP[keyCode];
}
exports.getCodeForKeyCode = getCodeForKeyCode;
const ctrlKeyMod = (platform.isMacintosh ? 256 : 2048);
const altKeyMod = 512;
const shiftKeyMod = 1024;
const metaKeyMod = (platform.isMacintosh ? 2048 : 256);
class StandardKeyboardEvent {
    constructor(source) {
        let e = source;
        this.browserEvent = e;
        this.target = e.target;
        this.ctrlKey = e.ctrlKey;
        this.shiftKey = e.shiftKey;
        this.altKey = e.altKey;
        this.metaKey = e.metaKey;
        this.keyCode = extractKeyCode(e);
        this.code = e.code;
        this.ctrlKey = this.ctrlKey || this.keyCode === 5;
        this.altKey = this.altKey || this.keyCode === 6;
        this.shiftKey = this.shiftKey || this.keyCode === 4;
        this.metaKey = this.metaKey || this.keyCode === 57;
        this._asKeybinding = this._computeKeybinding();
        this._asRuntimeKeybinding = this._computeRuntimeKeybinding();
    }
    preventDefault() {
        if (this.browserEvent && this.browserEvent.preventDefault) {
            this.browserEvent.preventDefault();
        }
    }
    stopPropagation() {
        if (this.browserEvent && this.browserEvent.stopPropagation) {
            this.browserEvent.stopPropagation();
        }
    }
    toKeybinding() {
        return this._asRuntimeKeybinding;
    }
    equals(other) {
        return this._asKeybinding === other;
    }
    _computeKeybinding() {
        let key = 0;
        if (this.keyCode !== 5 && this.keyCode !== 4 && this.keyCode !== 6 && this.keyCode !== 57) {
            key = this.keyCode;
        }
        let result = 0;
        if (this.ctrlKey) {
            result |= ctrlKeyMod;
        }
        if (this.altKey) {
            result |= altKeyMod;
        }
        if (this.shiftKey) {
            result |= shiftKeyMod;
        }
        if (this.metaKey) {
            result |= metaKeyMod;
        }
        result |= key;
        return result;
    }
    _computeRuntimeKeybinding() {
        let key = 0;
        if (this.keyCode !== 5 && this.keyCode !== 4 && this.keyCode !== 6 && this.keyCode !== 57) {
            key = this.keyCode;
        }
        return new keyCodes_1.SimpleKeybinding(this.ctrlKey, this.shiftKey, this.altKey, this.metaKey, key);
    }
}
exports.StandardKeyboardEvent = StandardKeyboardEvent;
//# sourceMappingURL=keyboardEvent.js.map