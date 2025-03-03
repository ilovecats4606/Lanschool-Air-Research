"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IframeUtils = void 0;
let hasDifferentOriginAncestorFlag = false;
let sameOriginWindowChainCache = null;
function getParentWindowIfSameOrigin(w) {
    if (!w.parent || w.parent === w) {
        return null;
    }
    try {
        let location = w.location;
        let parentLocation = w.parent.location;
        if (location.protocol !== parentLocation.protocol || location.hostname !== parentLocation.hostname || location.port !== parentLocation.port) {
            hasDifferentOriginAncestorFlag = true;
            return null;
        }
    }
    catch (e) {
        hasDifferentOriginAncestorFlag = true;
        return null;
    }
    return w.parent;
}
function findIframeElementInParentWindow(parentWindow, childWindow) {
    let parentWindowIframes = parentWindow.document.getElementsByTagName('iframe');
    let iframe;
    for (let i = 0, len = parentWindowIframes.length; i < len; i++) {
        iframe = parentWindowIframes[i];
        if (iframe.contentWindow === childWindow) {
            return iframe;
        }
    }
    return null;
}
class IframeUtils {
    static getSameOriginWindowChain() {
        if (!sameOriginWindowChainCache) {
            sameOriginWindowChainCache = [];
            let w = window;
            let parent;
            do {
                parent = getParentWindowIfSameOrigin(w);
                if (parent) {
                    sameOriginWindowChainCache.push({
                        window: w,
                        iframeElement: findIframeElementInParentWindow(parent, w)
                    });
                }
                else {
                    sameOriginWindowChainCache.push({
                        window: w,
                        iframeElement: null
                    });
                }
                w = parent;
            } while (w);
        }
        return sameOriginWindowChainCache.slice(0);
    }
    static hasDifferentOriginAncestor() {
        if (!sameOriginWindowChainCache) {
            this.getSameOriginWindowChain();
        }
        return hasDifferentOriginAncestorFlag;
    }
    static getPositionOfChildWindowRelativeToAncestorWindow(childWindow, ancestorWindow) {
        if (!ancestorWindow || childWindow === ancestorWindow) {
            return {
                top: 0,
                left: 0
            };
        }
        let top = 0, left = 0;
        let windowChain = this.getSameOriginWindowChain();
        for (const windowChainEl of windowChain) {
            if (windowChainEl.window === ancestorWindow) {
                break;
            }
            if (!windowChainEl.iframeElement) {
                break;
            }
            let boundingRect = windowChainEl.iframeElement.getBoundingClientRect();
            top += boundingRect.top;
            left += boundingRect.left;
        }
        return {
            top: top,
            left: left
        };
    }
}
exports.IframeUtils = IframeUtils;
//# sourceMappingURL=iframe.js.map