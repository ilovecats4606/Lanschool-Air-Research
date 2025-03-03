"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebLimiter = exports.LimitUrlInfo = void 0;
const lsa_clients_common_1 = require("@lenovo-software/lsa-clients-common");
class LimitUrlInfo {
}
exports.LimitUrlInfo = LimitUrlInfo;
class WebLimiter {
    constructor() {
        this.limitingParams = null;
        this.urlList = new Array();
        this.rawUrlList = new Array();
    }
    static getInstance() {
        if (!WebLimiter.instance) {
            WebLimiter.instance = new WebLimiter();
        }
        return WebLimiter.instance;
    }
    setExtensionChannel(extChannel) {
        this.extensionChannel = extChannel;
    }
    blockHost(env) {
        var host = env;
        if ((env.match(/-/g) || []).length == 1) {
            host = host.replace("api-lsa", "lanschoolair");
        }
        else {
            host = host.replace("api-lsa-", "lanschoolair-");
        }
        if (host.startsWith('https://')) {
            return host;
        }
        return ('https://' + host);
    }
    blockPageUrl(env) {
        let page = this.blockHost(env);
        page = page + '/assets/client-limiting/index.html';
        return page;
    }
    getLimitedBy() {
        var _a, _b;
        let result = '';
        if ((_a = this.limitingParams) === null || _a === void 0 ? void 0 : _a.className) {
            result = (_b = this.limitingParams) === null || _b === void 0 ? void 0 : _b.className;
        }
        return result;
    }
    getEnv() {
        var env = '';
        try {
            env = lsa_clients_common_1.LSAClient.getInstance().storage.loadAPIServer();
        }
        catch (err) {
            lsa_clients_common_1.LSAClient.getInstance().logger.logError('failed to get apiServer: ' + err);
        }
        if (env.length == 0) {
            env = 'api-lsa.lenovosoftware.com';
        }
        return env;
    }
    addParamsToBlockPage(blockPage, blockType, attempted, limitedBy, allowedList) {
        let url = new URL(blockPage);
        let searchParams = url.searchParams;
        if (searchParams) {
            if (blockType.length) {
                searchParams.append("bt", blockType);
            }
            if (attempted.length) {
                searchParams.append("attempted", attempted);
            }
            if (limitedBy.length) {
                searchParams.append("limitedby", limitedBy);
            }
            if (allowedList && allowedList.length > 0) {
                let strList = "";
                allowedList === null || allowedList === void 0 ? void 0 : allowedList.forEach(element => {
                    if (strList.length) {
                        strList = strList.concat(',');
                    }
                    strList = strList.concat(element);
                });
                searchParams.append("u", strList);
            }
        }
        return url.toString();
    }
    isURLInList(url) {
        var _a;
        var rv = false;
        if (this.limitingParams && this.limitingParams.sites) {
            var cnt = (_a = this.limitingParams) === null || _a === void 0 ? void 0 : _a.sites.length;
            for (var x = 0; x < cnt; x++) {
                let path = url.replace(/(^\w+:|^)\/\//, '');
                if (path.toLowerCase() === this.rawUrlList[x].toLowerCase()) {
                    rv = true;
                    break;
                }
                if (url.match(this.urlList[x])) {
                    rv = true;
                    break;
                }
            }
        }
        return rv;
    }
    shouldNeverBlock(url) {
        var neverBlock = [
            "chrome-extension://",
            "chrome://",
            "chrome-devtools://",
            "file://",
            "about:blank"
        ];
        if (url === null) {
            return false;
        }
        url = url.toLocaleLowerCase();
        if (url.startsWith(this.blockPageUrl(this.getEnv()))) {
            return true;
        }
        for (let entry of neverBlock) {
            if (url.startsWith(entry)) {
                return true;
            }
        }
        return false;
    }
    removeUsernameFromUrl(urlString) {
        if (urlString && urlString.length > 0 && urlString.includes('://')) {
            const url = new URL(urlString);
            url.username = '';
            url.password = '';
            return url.href;
        }
        return urlString;
    }
    shouldBlock(url) {
        let info = new LimitUrlInfo();
        info.shouldBlock = false;
        info.redirectUrl = '';
        url = url.toLowerCase();
        try {
            url = this.removeUsernameFromUrl(url);
            if (this.limitingParams === null || this.shouldNeverBlock(url)) {
                return info;
            }
            if (this.limitingParams &&
                this.limitingParams.blockType != lsa_clients_common_1.WebLimitBlockType.None) {
                switch (this.limitingParams.blockType) {
                    case lsa_clients_common_1.WebLimitBlockType.BlockAll:
                        info.shouldBlock = true;
                        info.redirectUrl = this.addParamsToBlockPage(this.blockPageUrl(this.getEnv()), 'all', url, this.getLimitedBy(), undefined);
                        break;
                    case lsa_clients_common_1.WebLimitBlockType.Block:
                        info.shouldBlock = this.isURLInList(url);
                        info.redirectUrl = this.addParamsToBlockPage(this.blockPageUrl(this.getEnv()), 'blocked', url, this.getLimitedBy(), undefined);
                        break;
                    case lsa_clients_common_1.WebLimitBlockType.Allow:
                    default:
                        info.shouldBlock = !this.isURLInList(url);
                        info.redirectUrl = this.addParamsToBlockPage(this.blockPageUrl(this.getEnv()), 'allowed', url, this.getLimitedBy(), this.rawUrlList);
                        break;
                }
            }
        }
        catch (err) {
            lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('shouldBlock exception: ' + err);
        }
        return info;
    }
    blockingTypeStr(type) {
        let str = '';
        switch (type) {
            case lsa_clients_common_1.WebLimitBlockType.BlockAll:
                str = 'Block All';
                break;
            case lsa_clients_common_1.WebLimitBlockType.Allow:
                str = 'Allow List';
                break;
            case lsa_clients_common_1.WebLimitBlockType.Block:
                str = 'Block List';
                break;
            default:
            case lsa_clients_common_1.WebLimitBlockType.None:
                str = 'None';
                break;
        }
        return str;
    }
    prepareLists(list) {
        if (list.length > 0) {
            for (var x = 0; x < list.length; x++) {
                var indx = 0;
                this.rawUrlList[x] = list[x];
                var entry = list[x].toLowerCase();
                entry = entry.replace(/[.]/g, "[.]");
                entry = entry.replace(/\*/g, ".*");
                entry = entry.replace(/\?/g, ".");
                entry = entry.replace(/\//g, "[/]");
                indx = entry.search(/\.\*/);
                if (indx === 0) {
                    this.urlList[x] = new RegExp(entry, 'i');
                }
                else {
                    var urlRegexPrefix = '.*[.]{0,1}';
                    this.urlList[x] = new RegExp(urlRegexPrefix + entry, 'i');
                }
            }
        }
    }
    sendWakeupKeystroke() {
        if (this.extensionChannel) {
            this.extensionChannel.sendCheckinRequest();
        }
    }
    async start(params) {
        this.limitingParams = params;
        this.urlList = new Array();
        this.rawUrlList = new Array();
        if (params.sites) {
            this.prepareLists(params.sites);
        }
        this.sendWakeupKeystroke();
        try {
            lsa_clients_common_1.LSAClient.getInstance().logger.logInfo('WebLimit started with type ' +
                this.blockingTypeStr(params.blockType));
        }
        catch (err) {
            throw new Error('WebLimiting.start(): ' + err);
        }
    }
    stop() {
        this.limitingParams = null;
    }
}
exports.WebLimiter = WebLimiter;
//# sourceMappingURL=webLimiting.js.map