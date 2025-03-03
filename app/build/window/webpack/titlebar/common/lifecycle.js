"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Disposable = exports.toDisposable = exports.combinedDisposable = exports.dispose = exports.isDisposable = void 0;
function isDisposable(thing) {
    return typeof thing.dispose === 'function'
        && thing.dispose.length === 0;
}
exports.isDisposable = isDisposable;
function dispose(first, ...rest) {
    if (Array.isArray(first)) {
        first.forEach(d => d && d.dispose());
        return [];
    }
    else if (rest.length === 0) {
        if (first) {
            first.dispose();
            return first;
        }
        return undefined;
    }
    else {
        dispose(first);
        dispose(rest);
        return [];
    }
}
exports.dispose = dispose;
function combinedDisposable(disposables) {
    return { dispose: () => dispose(disposables) };
}
exports.combinedDisposable = combinedDisposable;
function toDisposable(fn) {
    return { dispose() { fn(); } };
}
exports.toDisposable = toDisposable;
class Disposable {
    constructor() {
        this._toDispose = [];
        this._lifecycle_disposable_isDisposed = false;
    }
    get toDispose() { return this._toDispose; }
    dispose() {
        this._lifecycle_disposable_isDisposed = true;
        this._toDispose = dispose(this._toDispose);
    }
    _register(t) {
        if (this._lifecycle_disposable_isDisposed) {
            t.dispose();
        }
        else {
            this._toDispose.push(t);
        }
        return t;
    }
}
exports.Disposable = Disposable;
Disposable.None = Object.freeze({ dispose() { } });
//# sourceMappingURL=lifecycle.js.map