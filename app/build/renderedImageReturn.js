"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderedImageReturn = void 0;
class RenderedImageReturn {
    constructor() {
        this.messageId = '';
    }
    static fromAny(data) {
        var _a, _b, _c, _d, _e;
        if (!data) {
            return new RenderedImageReturn();
        }
        if (data instanceof RenderedImageReturn) {
            return data;
        }
        const ret = new RenderedImageReturn();
        ret.messageId = (_a = data.messageId) !== null && _a !== void 0 ? _a : '';
        ret.processedImage = {
            width: (_b = data.width) !== null && _b !== void 0 ? _b : '',
            height: (_c = data.height) !== null && _c !== void 0 ? _c : '',
            imgData: (_d = data.processedImage) !== null && _d !== void 0 ? _d : ''
        };
        ret.error = (_e = data.error) !== null && _e !== void 0 ? _e : '';
        return ret;
    }
}
exports.RenderedImageReturn = RenderedImageReturn;
//# sourceMappingURL=renderedImageReturn.js.map