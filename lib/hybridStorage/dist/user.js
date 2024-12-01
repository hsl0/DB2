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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a;
var _b;
var common_1 = require("./common");
var RESOLVE = Symbol('promise resolver function');
var api = new mw.Api();
// 미디어위키 options API (mw.user.options) 추상화
var remoteOrigin = new common_1.DecoratedRemoteStorage((0, common_1.remoteStage)({
    //@ts-ignore 강제로 덮어쓰기
    initialState: mw.user.options.values,
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
            return response.query.userinfo.options;
        });
    },
    push: function (changed, removed) {
        var e_1, _a;
        try {
            for (var removed_1 = __values(removed), removed_1_1 = removed_1.next(); !removed_1_1.done; removed_1_1 = removed_1.next()) {
                var key = removed_1_1.value;
                changed[key] = null;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (removed_1_1 && !removed_1_1.done && (_a = removed_1.return)) _a.call(removed_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return api.saveOptions(changed);
    },
    onPull: function (promise) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        //@ts-ignore 강제로 덮어쓰기
                        _a = mw.user.options;
                        return [4 /*yield*/, promise];
                    case 1:
                        //@ts-ignore 강제로 덮어쓰기
                        _a.values = _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    },
}), (0, common_1.storagePrefixer)('userjs-'));
var CloudStorage = /** @class */ (function (_super) {
    __extends(CloudStorage, _super);
    function CloudStorage() {
        var _this = _super.apply(this, __spreadArray([], __read(arguments), false)) || this;
        _this[_b] = new Promise(function (resolve) {
            _this[RESOLVE] = resolve;
        });
        return _this;
    }
    CloudStorage.prototype.pull = function () {
        return this[common_1.PARENT].pull();
    };
    CloudStorage.prototype.push = function () {
        var _this = this;
        var result = this[common_1.PARENT].push();
        this[RESOLVE](result);
        this[common_1.PUSH_PROMISE] = new Promise(function (resolve) {
            _this[RESOLVE] = resolve;
        });
        return result;
    };
    return CloudStorage;
}(common_1.HybridStorage));
_b = common_1.PUSH_PROMISE;
Object.defineProperties(CloudStorage.prototype, (_a = {},
    _a[common_1.PARENT] = __assign({ value: remoteOrigin }, propOptions),
    _a));
module.exports = new CloudStorage();
//# sourceMappingURL=user.js.map