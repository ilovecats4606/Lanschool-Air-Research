"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSPGenerator = void 0;
const electronInterfaceImpl_1 = require("./electronInterfaceImpl");
class CSPGenerator {
    static getInstance(sessionInterface) {
        if (!CSPGenerator.instance) {
            CSPGenerator.instance = new CSPGenerator(sessionInterface);
        }
        return CSPGenerator.instance;
    }
    constructor(sessionInterface) {
        this.cspParams = {
            'default-src': ['\'none\''],
            'script-src': [
                '\'self\'',
                '\'unsafe-inline\'',
                'https://use.typekit.net/szd8zeu.js',
                'https://unpkg.com/material-components-web@latest/dist/material-components-web.js'
            ],
            'img-src': [
                '\'self\'',
                'https://p.typekit.net',
                'data:'
            ],
            'style-src': [
                '\'self\'',
                '\'unsafe-inline\''
            ],
            'font-src': [
                '\'self\'',
                'https://use.typekit.net'
            ],
            'connect-src': [
                '\'self\'',
                'https://*.lenovosoftware.com',
                'wss://*.lenovosoftware.com',
                'https://*.airclass-sandbox.com',
                'wss://*.airclass-sandbox.com',
                'https://*.chime.aws',
                'wss://*.chime.aws'
            ],
            'media-src': [
                '\'self\''
            ]
        };
        if (!sessionInterface) {
            this.mySession = new electronInterfaceImpl_1.ElectronSessionForCSPGenerator();
        }
        else {
            this.mySession = sessionInterface;
        }
    }
    hasAllowed(key, val) {
        const k = this.cspParams[key];
        const index = k.indexOf(val);
        if (index !== -1) {
            return true;
        }
        return false;
    }
    addUnique(key, val) {
        if (!this.hasAllowed(key, val)) {
            this.cspParams[key].push(val);
        }
    }
    removeVal(key, val) {
        const k = this.cspParams[key];
        const index = k.indexOf(val);
        if (index !== -1) {
            k.splice(index, 1);
        }
    }
    addImageSrc(src) {
        this.addUnique('img-src', src);
        this.updateHeaders();
    }
    removeImageSrc(src) {
        this.removeVal('img-src', src);
        this.updateHeaders();
    }
    getCSPString() {
        let ret = '';
        for (const [k, v] of Object.entries(this.cspParams)) {
            if (v.length < 1) {
                continue;
            }
            ret += k;
            for (const str in v) {
                ret += ' ' + v[str];
            }
            ret += '; ';
        }
        return ret;
    }
    updateHeaders() {
        if (this.mySession.sessionReady() === false) {
            throw new Error('Electron \'session\' not ready.');
        }
        this.mySession.setHeaders(this.getCSPString());
    }
}
exports.CSPGenerator = CSPGenerator;
//# sourceMappingURL=csp.js.map