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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var _a;
var _b;
/// <reference types="mediawiki/mw" />
var common_1 = require("./common");
var RESOLVE = Symbol('promise resolver function');
var api = new mw.Api();
// 미디어위키 options API (mw.user.options) 추상화
var remoteOrigin = new common_1.StorageOrigin({
    storage: mw.user.options,
    needSync: true,
    namespace: 'userjs-',
    get: function (key) {
        return this.stage[key] || this.storage.get(key);
    },
    set: function (key, value) {
        this.stage[key] = value;
        this.unsaved = true;
    },
    delete: function (key) {
        this.stage[key] = null;
        this.unsaved = true;
    },
    keys: function () {
        var keys = new Set(Object.keys(this.storage.get()));
        for (var key in this.stage) {
            if (this.stage[key] === null)
                keys.delete(key);
            else
                keys.add(key);
        }
        return keys;
    },
    pull: function () {
        return api
            .get({
            action: 'query',
            meta: 'userinfo',
            uiprop: 'options',
        }, {
            cache: false,
        })
            .then(function (response) {
            //@ts-ignore Access private anyway
            mw.user.options.values = response.query.userinfo.options;
        });
    },
    push: function () {
        var _this = this;
        return api.saveOptions(this.stage).then(function () {
            _this.unsaved = false;
        }, function (code, info) {
            return $.Deferred().reject(_this.stage, code, info);
        });
    },
});
var CloudStorage = /** @class */ (function (_super) {
    __extends(CloudStorage, _super);
    function CloudStorage() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this[_b] = new Promise(function (resolve) {
            _this[RESOLVE] = resolve;
        });
        return _this;
    }
    CloudStorage.prototype.pull = function () {
        return this[common_1.STORAGE].pull();
    };
    CloudStorage.prototype.push = function () {
        var _this = this;
        var result = this[common_1.STORAGE].push();
        this[RESOLVE](result);
        this[common_1.PROMISE] = new Promise(function (resolve) {
            _this[RESOLVE] = resolve;
        });
        return result;
    };
    return CloudStorage;
}(common_1.SyncableStorage));
_b = common_1.PROMISE;
Object.defineProperties(CloudStorage.prototype, (_a = {},
    _a[common_1.STORAGE] = __assign({ value: remoteOrigin }, common_1.propOptions),
    _a));
module.exports = new CloudStorage();
//# sourceMappingURL=user.js.map