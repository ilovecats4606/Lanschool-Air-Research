"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stop = exports.domEvent = void 0;
const event_1 = require("../common/event");
const domEvent = (element, type, useCapture) => {
    const fn = (e) => emitter.fire(e);
    const emitter = new event_1.Emitter({
        onFirstListenerAdd: () => {
            element.addEventListener(type, fn, useCapture);
        },
        onLastListenerRemove: () => {
            element.removeEventListener(type, fn, useCapture);
        }
    });
    return emitter.event;
};
exports.domEvent = domEvent;
function stop(event) {
    return event_1.Event.map(event, e => {
        e.preventDefault();
        e.stopPropagation();
        return e;
    });
}
exports.stop = stop;
//# sourceMappingURL=event.js.map