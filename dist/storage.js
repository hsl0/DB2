"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalGameDB = exports.localGameDB = void 0;
//@ts-ignore
// DB2 저장소와 호환되는 자바스크립트 인터페이스
var common_js_1 = require("./common.js");
exports.localGameDB = common_js_1.rootGameDB.subset((0, common_js_1.getLocalNamespace)(), common_js_1.keyEncoder);
exports.globalGameDB = common_js_1.rootGameDB.subset('#', common_js_1.keyEncoder);
//# sourceMappingURL=storage.js.map