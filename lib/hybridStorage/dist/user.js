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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
var _a;
/// <reference types="mediawiki/mw" />
import { SyncableStorage, StorageOrigin, STORAGE } from './common';
export var CACHE = Symbol('temporary storage cache');
export var STAGE = Symbol('stageed data cache');
var api = new mw.Api();
// 미디어위키 options API (mw.user.options) 추상화
var remoteOrigin = new StorageOrigin({
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
        var stage = this.stage;
        this.stage = {};
        this.unsaved = false;
        return api
            .saveOptions(stage)
            .catch(function (code, info) {
            return $.Deferred().reject(stage, code, info);
        });
    },
});
var CloudStorage = /** @class */ (function (_super) {
    __extends(CloudStorage, _super);
    function CloudStorage() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this[_a] = remoteOrigin;
        _this.hasRemote = true;
        return _this;
    }
    CloudStorage.prototype.pull = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            return [2 /*return*/];
        }); });
    };
    CloudStorage.prototype.push = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_b) {
            return [2 /*return*/];
        }); });
    };
    return CloudStorage;
}(SyncableStorage));
_a = STORAGE;
//# sourceMappingURL=user.js.map