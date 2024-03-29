"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rootGameDB = exports.getLocalNamespace = exports.keyEncoder = exports.decode = exports.encode = void 0;
// common.ts, controller.ts에서 공용으로 사용
var hybridStorage = require("hybridStorage");
/* option key 인코딩
    url인코딩
    % = _
    _ = __
*/
function encode(key) {
    return encodeURIComponent(key)
        .replace(/\./g, '%2E')
        .replace(/!/g, '%21')
        .replace(/~/g, '%7E')
        .replace(/\*/g, '%2A')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/_/g, '__')
        .replace(/%/g, '_');
}
exports.encode = encode;
function decode(key) {
    return decodeURIComponent(key.replace(/_(?=[a-zA-Z0-9]{2})/g, '%').replace(/__/g, '_'));
}
exports.decode = decode;
exports.keyEncoder = {
    encoder: encode,
    decoder: decode,
};
function getLocalNamespace(pagename) {
    if (pagename === void 0) { pagename = mw.config.get('wgPageName'); }
    var title = new mw.Title(pagename).getSubjectPage();
    if (!title)
        throw new TypeError("'".concat(pagename, "'\uC740 \uC798\uBABB\uB41C \uC81C\uBAA9\uC778 \uAC83 \uAC19\uC2B5\uB2C8\uB2E4"));
    return "".concat(title.getNamespacePrefix().slice(0, -1), ":").concat(title.getMainText());
}
exports.getLocalNamespace = getLocalNamespace;
exports.rootGameDB = hybridStorage.subset('gameDB-', exports.keyEncoder);
//# sourceMappingURL=common.js.map