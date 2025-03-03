"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coalesce = void 0;
function coalesce(array) {
    if (!array) {
        return array;
    }
    return array.filter(e => !!e);
}
exports.coalesce = coalesce;
//# sourceMappingURL=arrays.js.map