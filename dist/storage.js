"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalGameDB = exports.localGameDB = void 0;
//@ts-ignore
var common_js_1 = require("./common.js");
var keyEncoder = {
    encoder: common_js_1.encode,
    decoder: common_js_1.decode,
    encodeNamespace: true,
    preEncodable: true,
};
exports.localGameDB = common_js_1.rootGameDB.subset((0, common_js_1.getLocalNamespace)(), keyEncoder);
exports.globalGameDB = common_js_1.rootGameDB.subset('#', keyEncoder);
//# sourceMappingURL=storage.js.map