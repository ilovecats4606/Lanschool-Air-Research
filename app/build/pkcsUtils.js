"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PKCSUtils = void 0;
const forge = require('node-forge');
class PKCSUtils {
    static pkcs1ToPkcs8(pkcs1PrivateKey) {
        let pki = forge.pki;
        const privateKey1 = pki.privateKeyFromPem(pkcs1PrivateKey);
        const rsaPrivateKey = pki.privateKeyToAsn1(privateKey1);
        const privateKeyInfo = pki.wrapRsaPrivateKey(rsaPrivateKey);
        const pem = pki.privateKeyInfoToPem(privateKeyInfo);
        return pem;
    }
}
exports.PKCSUtils = PKCSUtils;
//# sourceMappingURL=pkcsUtils.js.map