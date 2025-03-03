"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnownClientStatus = void 0;
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
class KnownClientStatus {
    constructor(storage) {
        this.storage = storage;
    }
    isHotProvisioningCodePresent() {
        let present = false;
        let code = this.storage.loadHotProvisioningCode();
        if (code && code.length > 0) {
            present = true;
        }
        return present;
    }
    isProvisioningOK() {
        const provisioningData = this.storage.loadProvisioningData();
        if (this.isHotProvisioningCodePresent()) {
            lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('KnownClientStatus: hot code present, provisioning status is not OK');
            return false;
        }
        return !!(provisioningData && provisioningData.id.length > 0);
    }
    isTokenStatusOK() {
        const token = this.storage.loadToken();
        if (this.isHotProvisioningCodePresent()) {
            lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('KnownClientStatus: hot code present, token status is not OK');
            return false;
        }
        return !!(token && token.access_token && token.access_token.length > 0);
    }
}
exports.KnownClientStatus = KnownClientStatus;
//# sourceMappingURL=knownClientStatus.js.map