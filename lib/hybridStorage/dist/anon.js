"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var _a;
var common_1 = require("./common");
var LocalStorage = /** @class */ (function (_super) {
    __extends(LocalStorage, _super);
    function LocalStorage() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this[_a] = common_1.localOrigin;
        _this.hasRemote = false;
        return _this;
    }
    LocalStorage.prototype.pull = function () {
        return Promise.resolve(true);
    };
    LocalStorage.prototype.push = function () {
        return Promise.resolve(true);
    };
    return LocalStorage;
}(common_1.SyncableStorage));
_a = common_1.STORAGE;
module.exports = new LocalStorage();
//# sourceMappingURL=anon.js.map