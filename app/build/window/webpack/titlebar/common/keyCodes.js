"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolvedKeybinding = exports.ResolvedKeybindingPart = exports.ChordKeybinding = exports.SimpleKeybinding = exports.createSimpleKeybinding = exports.createKeybinding = exports.KeyChord = exports.KeyCodeUtils = void 0;
class KeyCodeStrMap {
    constructor() {
        this._keyCodeToStr = [];
        this._strToKeyCode = Object.create(null);
    }
    define(keyCode, str) {
        this._keyCodeToStr[keyCode] = str;
        this._strToKeyCode[str.toLowerCase()] = keyCode;
    }
    keyCodeToStr(keyCode) {
        return this._keyCodeToStr[keyCode];
    }
    strToKeyCode(str) {
        return this._strToKeyCode[str.toLowerCase()] || 0;
    }
}
const uiMap = new KeyCodeStrMap();
const userSettingsUSMap = new KeyCodeStrMap();
const userSettingsGeneralMap = new KeyCodeStrMap();
(function () {
    function define(keyCode, uiLabel, usUserSettingsLabel = uiLabel, generalUserSettingsLabel = usUserSettingsLabel) {
        uiMap.define(keyCode, uiLabel);
        userSettingsUSMap.define(keyCode, usUserSettingsLabel);
        userSettingsGeneralMap.define(keyCode, generalUserSettingsLabel);
    }
    define(0, 'unknown');
    define(1, 'Backspace');
    define(2, 'Tab');
    define(3, 'Enter');
    define(4, 'Shift');
    define(5, 'Ctrl');
    define(6, 'Alt');
    define(7, 'PauseBreak');
    define(8, 'CapsLock');
    define(9, 'Escape');
    define(10, 'Space');
    define(11, 'PageUp');
    define(12, 'PageDown');
    define(13, 'End');
    define(14, 'Home');
    define(15, 'LeftArrow', 'Left');
    define(16, 'UpArrow', 'Up');
    define(17, 'RightArrow', 'Right');
    define(18, 'DownArrow', 'Down');
    define(19, 'Insert');
    define(20, 'Delete');
    define(21, '0');
    define(22, '1');
    define(23, '2');
    define(24, '3');
    define(25, '4');
    define(26, '5');
    define(27, '6');
    define(28, '7');
    define(29, '8');
    define(30, '9');
    define(31, 'A');
    define(32, 'B');
    define(33, 'C');
    define(34, 'D');
    define(35, 'E');
    define(36, 'F');
    define(37, 'G');
    define(38, 'H');
    define(39, 'I');
    define(40, 'J');
    define(41, 'K');
    define(42, 'L');
    define(43, 'M');
    define(44, 'N');
    define(45, 'O');
    define(46, 'P');
    define(47, 'Q');
    define(48, 'R');
    define(49, 'S');
    define(50, 'T');
    define(51, 'U');
    define(52, 'V');
    define(53, 'W');
    define(54, 'X');
    define(55, 'Y');
    define(56, 'Z');
    define(57, 'Meta');
    define(58, 'ContextMenu');
    define(59, 'F1');
    define(60, 'F2');
    define(61, 'F3');
    define(62, 'F4');
    define(63, 'F5');
    define(64, 'F6');
    define(65, 'F7');
    define(66, 'F8');
    define(67, 'F9');
    define(68, 'F10');
    define(69, 'F11');
    define(70, 'F12');
    define(71, 'F13');
    define(72, 'F14');
    define(73, 'F15');
    define(74, 'F16');
    define(75, 'F17');
    define(76, 'F18');
    define(77, 'F19');
    define(78, 'NumLock');
    define(79, 'ScrollLock');
    define(80, ';', ';', 'OEM_1');
    define(81, '=', '=', 'OEM_PLUS');
    define(82, ',', ',', 'OEM_COMMA');
    define(83, '-', '-', 'OEM_MINUS');
    define(84, '.', '.', 'OEM_PERIOD');
    define(85, '/', '/', 'OEM_2');
    define(86, '`', '`', 'OEM_3');
    define(110, 'ABNT_C1');
    define(111, 'ABNT_C2');
    define(87, '[', '[', 'OEM_4');
    define(88, '\\', '\\', 'OEM_5');
    define(89, ']', ']', 'OEM_6');
    define(90, '\'', '\'', 'OEM_7');
    define(91, 'OEM_8');
    define(92, 'OEM_102');
    define(93, 'NumPad0');
    define(94, 'NumPad1');
    define(95, 'NumPad2');
    define(96, 'NumPad3');
    define(97, 'NumPad4');
    define(98, 'NumPad5');
    define(99, 'NumPad6');
    define(100, 'NumPad7');
    define(101, 'NumPad8');
    define(102, 'NumPad9');
    define(103, 'NumPad_Multiply');
    define(104, 'NumPad_Add');
    define(105, 'NumPad_Separator');
    define(106, 'NumPad_Subtract');
    define(107, 'NumPad_Decimal');
    define(108, 'NumPad_Divide');
})();
var KeyCodeUtils;
(function (KeyCodeUtils) {
    function toString(keyCode) {
        return uiMap.keyCodeToStr(keyCode);
    }
    KeyCodeUtils.toString = toString;
    function fromString(key) {
        return uiMap.strToKeyCode(key);
    }
    KeyCodeUtils.fromString = fromString;
    function toUserSettingsUS(keyCode) {
        return userSettingsUSMap.keyCodeToStr(keyCode);
    }
    KeyCodeUtils.toUserSettingsUS = toUserSettingsUS;
    function toUserSettingsGeneral(keyCode) {
        return userSettingsGeneralMap.keyCodeToStr(keyCode);
    }
    KeyCodeUtils.toUserSettingsGeneral = toUserSettingsGeneral;
    function fromUserSettings(key) {
        return userSettingsUSMap.strToKeyCode(key) || userSettingsGeneralMap.strToKeyCode(key);
    }
    KeyCodeUtils.fromUserSettings = fromUserSettings;
})(KeyCodeUtils = exports.KeyCodeUtils || (exports.KeyCodeUtils = {}));
function KeyChord(firstPart, secondPart) {
    let chordPart = ((secondPart & 0x0000FFFF) << 16) >>> 0;
    return (firstPart | chordPart) >>> 0;
}
exports.KeyChord = KeyChord;
function createKeybinding(keybinding, OS) {
    if (keybinding === 0) {
        return null;
    }
    const firstPart = (keybinding & 0x0000FFFF) >>> 0;
    const chordPart = (keybinding & 0xFFFF0000) >>> 16;
    if (chordPart !== 0) {
        return new ChordKeybinding(createSimpleKeybinding(firstPart, OS), createSimpleKeybinding(chordPart, OS));
    }
    return createSimpleKeybinding(firstPart, OS);
}
exports.createKeybinding = createKeybinding;
function createSimpleKeybinding(keybinding, OS) {
    const ctrlCmd = (keybinding & 2048 ? true : false);
    const winCtrl = (keybinding & 256 ? true : false);
    const ctrlKey = (OS === 2 ? winCtrl : ctrlCmd);
    const shiftKey = (keybinding & 1024 ? true : false);
    const altKey = (keybinding & 512 ? true : false);
    const metaKey = (OS === 2 ? ctrlCmd : winCtrl);
    const keyCode = (keybinding & 255);
    return new SimpleKeybinding(ctrlKey, shiftKey, altKey, metaKey, keyCode);
}
exports.createSimpleKeybinding = createSimpleKeybinding;
class SimpleKeybinding {
    constructor(ctrlKey, shiftKey, altKey, metaKey, keyCode) {
        this.type = 1;
        this.ctrlKey = ctrlKey;
        this.shiftKey = shiftKey;
        this.altKey = altKey;
        this.metaKey = metaKey;
        this.keyCode = keyCode;
    }
    equals(other) {
        if (other.type !== 1) {
            return false;
        }
        return (this.ctrlKey === other.ctrlKey
            && this.shiftKey === other.shiftKey
            && this.altKey === other.altKey
            && this.metaKey === other.metaKey
            && this.keyCode === other.keyCode);
    }
    getHashCode() {
        let ctrl = this.ctrlKey ? '1' : '0';
        let shift = this.shiftKey ? '1' : '0';
        let alt = this.altKey ? '1' : '0';
        let meta = this.metaKey ? '1' : '0';
        return `${ctrl}${shift}${alt}${meta}${this.keyCode}`;
    }
    isModifierKey() {
        return (this.keyCode === 0
            || this.keyCode === 5
            || this.keyCode === 57
            || this.keyCode === 6
            || this.keyCode === 4);
    }
    isDuplicateModifierCase() {
        return ((this.ctrlKey && this.keyCode === 5)
            || (this.shiftKey && this.keyCode === 4)
            || (this.altKey && this.keyCode === 6)
            || (this.metaKey && this.keyCode === 57));
    }
}
exports.SimpleKeybinding = SimpleKeybinding;
class ChordKeybinding {
    constructor(firstPart, chordPart) {
        this.type = 2;
        this.firstPart = firstPart;
        this.chordPart = chordPart;
    }
    getHashCode() {
        return `${this.firstPart.getHashCode()};${this.chordPart.getHashCode()}`;
    }
}
exports.ChordKeybinding = ChordKeybinding;
class ResolvedKeybindingPart {
    constructor(ctrlKey, shiftKey, altKey, metaKey, kbLabel, kbAriaLabel) {
        this.ctrlKey = ctrlKey;
        this.shiftKey = shiftKey;
        this.altKey = altKey;
        this.metaKey = metaKey;
        this.keyLabel = kbLabel;
        this.keyAriaLabel = kbAriaLabel;
    }
}
exports.ResolvedKeybindingPart = ResolvedKeybindingPart;
class ResolvedKeybinding {
}
exports.ResolvedKeybinding = ResolvedKeybinding;
//# sourceMappingURL=keyCodes.js.map