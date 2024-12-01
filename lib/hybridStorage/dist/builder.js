"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HybridStorage = exports.localStorageOrigin = exports.webStorageOrigin = exports.storagePrefixer = exports.storageEncoder = exports.dummyRemoteDecorator = exports.cacheSyncPromise = exports.remoteStage = void 0;
exports.decorate = decorate;
var PARENT = Symbol('local storage origin');
var MEMBERS = Symbol('member keys');
var DummyFunction = function () { };
function bindMethods(obj, context) {
    var e_1, _a;
    if (context === void 0) { context = obj; }
    var copied = {};
    try {
        for (var _b = __values(__spreadArray(__spreadArray([], __read(Object.getOwnPropertyNames(obj)), false), __read(Object.getOwnPropertySymbols(obj)), false)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var key = _c.value;
            var value = obj[key];
            copied[key] = typeof value === 'function' ? value.bind(context) : value;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return copied;
}
function decorate(origin) {
    var e_2, _a;
    var decorators = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        decorators[_i - 1] = arguments[_i];
    }
    var decorated = bindMethods(origin);
    try {
        for (var _b = __values(decorators), _c = _b.next(); !_c.done; _c = _b.next()) {
            var deco = _c.value;
            decorated = deco(bindMethods(decorated));
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return decorated;
}
var recordOrigin = function (record) {
    return ({
        keys: function () { return new Set(Object.keys(record)); },
        get: function (key) { var _a; return (_a = record[key]) !== null && _a !== void 0 ? _a : null; },
        set: function (key, value) {
            record[key] = value;
        },
        delete: function (key) {
            delete record[key];
        },
    });
};
var remoteStage = function (init) {
    var _a;
    var state = recordOrigin((_a = init.initialState) !== null && _a !== void 0 ? _a : {});
    var changedKeys = new Set();
    return {
        keys: state.keys,
        get: state.get,
        set: function (key, value) {
            state.set(key, value);
            changedKeys.add(key);
        },
        delete: function (key) {
            state.delete(key);
            changedKeys.add(key);
        },
        pull: function () {
            var _a;
            var waitingPull = Promise.resolve()
                .then(init.pull)
                .then(function (data) {
                var e_3, _a;
                var newState = __assign({}, data);
                try {
                    for (var changedKeys_1 = __values(changedKeys), changedKeys_1_1 = changedKeys_1.next(); !changedKeys_1_1.done; changedKeys_1_1 = changedKeys_1.next()) {
                        var key = changedKeys_1_1.value;
                        var value = state.get(key);
                        if (value)
                            newState[key] = value;
                        else
                            delete newState[key];
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (changedKeys_1_1 && !changedKeys_1_1.done && (_a = changedKeys_1.return)) _a.call(changedKeys_1);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
                state = recordOrigin(newState);
                return newState;
            });
            (_a = init.onPull) === null || _a === void 0 ? void 0 : _a.call(init, waitingPull);
            return waitingPull.then(function () { });
        },
        push: function () {
            var _a;
            var waitingPush = Promise.resolve().then(function () {
                var oldChangedKeys = changedKeys;
                changedKeys = new Set();
                var changed = Object.fromEntries(oldChangedKeys
                    .union(state.keys())
                    .values()
                    .map(function (key) { return [key, state.get(key)]; }));
                var removed = oldChangedKeys.difference(state.keys());
                return init.push(changed, removed);
            });
            (_a = init.onPush) === null || _a === void 0 ? void 0 : _a.call(init, waitingPush);
            return waitingPush;
        },
    };
};
exports.remoteStage = remoteStage;
var cacheSyncPromise = function (storage) {
    var pushPromise = null;
    var pullPromise = null;
    return __assign(__assign({}, storage), { push: function () {
            if (!pushPromise)
                pushPromise = storage.push().finally(function () {
                    pushPromise = null;
                });
            return pushPromise;
        }, pull: function () {
            if (!pullPromise)
                pullPromise = storage.pull().finally(function () {
                    pullPromise = null;
                });
            return pullPromise;
        } });
};
exports.cacheSyncPromise = cacheSyncPromise;
var dummyRemoteDecorator = function (local) {
    return (__assign(__assign({}, local), { push: function () { return Promise.resolve(); }, pull: function () { return Promise.resolve(); } }));
};
exports.dummyRemoteDecorator = dummyRemoteDecorator;
var backupUploads = function (_a) {
    var backupStorage = _a.backupStorage, prefix = _a.prefix, profile = _a.profile, merger = _a.merger;
    return function (origin) {
        backupStorage = decorate(backupStorage, (0, exports.storagePrefixer)(prefix));
        var changedKeys = new Set();
        function merge() {
            var e_4, _a;
            if (!merger)
                return;
            var saved = decorate(backupStorage, (0, exports.storagePrefixer)(profile + '/'));
            if (new Set(saved.keys()).size < 0)
                return;
            var latest = Math.max.apply(Math, __spreadArray([], __read(__spreadArray([], __read(saved.keys()), false).map(function (key) { return Number(key); })), false));
            var stage = JSON.parse(saved.get(String(latest)));
            var remote = Object.fromEntries(__spreadArray([], __read(origin.keys()), false).map(function (key) { var _a; return [key, (_a = origin.get(key)) !== null && _a !== void 0 ? _a : null]; }));
            var merged = merger(stage, remote);
            try {
                for (var _b = __values(Object.entries(merged)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
                    if (value)
                        origin.set(key, value);
                    else
                        origin.delete(key);
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_4) throw e_4.error; }
            }
        }
        merge();
        return __assign(__assign({}, origin), { set: function (key, value) {
                origin.set(key, value);
                changedKeys.add(key);
            }, delete: function (key) {
                origin.delete(key);
                changedKeys.add(key);
            }, push: function () {
                var promise = origin.push();
                var stage = Object.fromEntries(changedKeys.values().map(function (key) { var _a; return [key, (_a = origin.get(key)) !== null && _a !== void 0 ? _a : null]; }));
                var key = "".concat(profile, "/").concat(Date.now());
                backupStorage.set(key, JSON.stringify(stage));
                promise.then(function () {
                    backupStorage.delete(key);
                });
                return promise;
            }, pull: function () {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, origin.pull()];
                            case 1:
                                _a.sent();
                                merge();
                                return [2 /*return*/];
                        }
                    });
                });
            } });
    };
};
var storageEncoder = function (_a) {
    var encodeKey = _a.encodeKey, decodeKey = _a.decodeKey;
    return function (storage) { return (__assign(__assign({}, storage), { keys: function () { return new Set(storage.keys().values().map(decodeKey)); }, get: function (key) { return storage.get(encodeKey(key)); }, set: function (key, value) { return storage.set(encodeKey(key), value); }, delete: function (key) { return storage.delete(encodeKey(key)); } })); };
};
exports.storageEncoder = storageEncoder;
var storagePrefixer = function (prefix) {
    return function (storage) { return (__assign(__assign({}, storage), { keys: function () {
            return new Set(storage
                .keys()
                .values()
                .filter(function (key) { return key.startsWith(prefix); })
                .map(function (key) { return key.slice(prefix.length); }));
        }, get: function (key) { return storage.get((prefix + key)); }, set: function (key, value) { return storage.set((prefix + key), value); }, delete: function (key) { return storage.delete((prefix + key)); } })); };
};
exports.storagePrefixer = storagePrefixer;
// web Storage API 추상화
var webStorageOrigin = function (storage) { return ({
    set: function (key, value) { return storage.setItem(key, value); },
    delete: function (key) { return storage.removeItem(key); },
    get: function (key) { return storage.getItem(key); },
    keys: function () { return new Set(Object.keys(storage)); },
}); };
exports.webStorageOrigin = webStorageOrigin;
exports.localStorageOrigin = (0, exports.webStorageOrigin)(localStorage);
// 온라인/오프라인 공통 저장소 클래스
var HybridStorage = /** @class */ (function () {
    function HybridStorage(parent) {
        var decorators = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            decorators[_i - 1] = arguments[_i];
        }
        this[PARENT] = decorate.apply(void 0, __spreadArray([parent], __read(decorators), false));
    }
    HybridStorage.decorator = function (parent) {
        return new HybridStorage(parent);
    };
    Object.defineProperty(HybridStorage.prototype, "size", {
        // 소속 키의 수
        get: function () {
            return this.keys().size;
        },
        enumerable: false,
        configurable: true
    });
    // 저장소 영역 초기화
    HybridStorage.prototype.clear = function () {
        var _this = this;
        var _a;
        this.keys().forEach(function (key) {
            _this.delete(key);
        });
        (_a = this[MEMBERS]) === null || _a === void 0 ? void 0 : _a.clear();
    };
    // 키 삭제
    HybridStorage.prototype.delete = function () {
        var e_5, _a;
        var _b;
        var keys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            keys[_i] = arguments[_i];
        }
        try {
            for (var keys_1 = __values(keys), keys_1_1 = keys_1.next(); !keys_1_1.done; keys_1_1 = keys_1.next()) {
                var key = keys_1_1.value;
                this[PARENT].delete(key);
                (_b = this[MEMBERS]) === null || _b === void 0 ? void 0 : _b.delete(key);
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (keys_1_1 && !keys_1_1.done && (_a = keys_1.return)) _a.call(keys_1);
            }
            finally { if (e_5) throw e_5.error; }
        }
    };
    // 모든 키와 값에 대해 일괄 작업 수행
    HybridStorage.prototype.forEach = function (callbackfn, thisArg) {
        var e_6, _a;
        try {
            for (var _b = __values(this.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                var value = this.get(key);
                if (value)
                    callbackfn.call(thisArg, value, key, this);
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_6) throw e_6.error; }
        }
    };
    // 특정 키의 값 불러오기
    HybridStorage.prototype.get = function (key) {
        var _a;
        if (key)
            return (_a = this[PARENT].get(key)) !== null && _a !== void 0 ? _a : null;
        throw new TypeError('HybridStorage의 get 메소드의 첫번째 인자는 문자열이어야 합니다. ' +
            (key === undefined
                ? '인자가 비어있습니다.'
                : "\uC5EC\uAE30\uC5D0 \uD574\uB2F9\uD558\uC9C0 \uC54A\uB294 \uD0C0\uC785 '".concat(typeof key, "'\uC744(\uB97C) \uC0AC\uC6A9\uD588\uC2B5\uB2C8\uB2E4.")));
    };
    HybridStorage.prototype.getAll = function (keys) {
        var e_7, _a, e_8, _b;
        var _c;
        var values = {};
        if (!keys)
            keys = this.keys();
        if (Symbol.iterator in keys) {
            try {
                for (var keys_2 = __values(keys), keys_2_1 = keys_2.next(); !keys_2_1.done; keys_2_1 = keys_2.next()) {
                    var key = keys_2_1.value;
                    values[key] = this.get(key);
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (keys_2_1 && !keys_2_1.done && (_a = keys_2.return)) _a.call(keys_2);
                }
                finally { if (e_7) throw e_7.error; }
            }
            return values;
        }
        if (typeof keys === 'object') {
            var defaults = keys;
            keys = Object.keys(keys);
            try {
                for (var keys_3 = __values(keys), keys_3_1 = keys_3.next(); !keys_3_1.done; keys_3_1 = keys_3.next()) {
                    var key = keys_3_1.value;
                    values[key] = (_c = this.get(key)) !== null && _c !== void 0 ? _c : defaults[key];
                }
            }
            catch (e_8_1) { e_8 = { error: e_8_1 }; }
            finally {
                try {
                    if (keys_3_1 && !keys_3_1.done && (_b = keys_3.return)) _b.call(keys_3);
                }
                finally { if (e_8) throw e_8.error; }
            }
            return values;
        }
        throw new TypeError("HybridStorage \uAC1D\uCCB4\uC758 getAll \uBA54\uC18C\uB4DC\uC758 \uCCAB\uBC88\uC9F8 \uC778\uC790\uB294 \uC720\uD6A8\uD55C \uAC1D\uCCB4 \uBC0F Iterator\uC774\uAC70\uB098 \uBE44\uC5B4 \uC788\uC5B4\uC57C \uD569\uB2C8\uB2E4. \uC5EC\uAE30\uC5D0 \uD574\uB2F9\uD558\uC9C0 \uC54A\uB294 \uD0C0\uC785 '".concat(typeof keys, "'\uC744(\uB97C) \uC0AC\uC6A9\uD588\uC2B5\uB2C8\uB2E4."));
    };
    // 특정 키의 존재여부 확인
    HybridStorage.prototype.has = function (key) {
        return this.keys().has(key);
    };
    HybridStorage.prototype.hasAll = function () {
        var e_9, _a;
        var keys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            keys[_i] = arguments[_i];
        }
        try {
            for (var keys_4 = __values(keys), keys_4_1 = keys_4.next(); !keys_4_1.done; keys_4_1 = keys_4.next()) {
                var key = keys_4_1.value;
                if (!this.has(key))
                    return false;
            }
        }
        catch (e_9_1) { e_9 = { error: e_9_1 }; }
        finally {
            try {
                if (keys_4_1 && !keys_4_1.done && (_a = keys_4.return)) _a.call(keys_4);
            }
            finally { if (e_9) throw e_9.error; }
        }
        return true;
    };
    HybridStorage.prototype.hasSome = function () {
        var e_10, _a;
        var keys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            keys[_i] = arguments[_i];
        }
        try {
            for (var keys_5 = __values(keys), keys_5_1 = keys_5.next(); !keys_5_1.done; keys_5_1 = keys_5.next()) {
                var key = keys_5_1.value;
                if (this.has(key))
                    return true;
            }
        }
        catch (e_10_1) { e_10 = { error: e_10_1 }; }
        finally {
            try {
                if (keys_5_1 && !keys_5_1.done && (_a = keys_5.return)) _a.call(keys_5);
            }
            finally { if (e_10) throw e_10.error; }
        }
        return false;
    };
    HybridStorage.prototype.set = function (keys, value) {
        var e_11, _a;
        var _b;
        if (typeof keys === 'string' && typeof value === 'string') {
            this[PARENT].set(keys, value);
            (_b = this[MEMBERS]) === null || _b === void 0 ? void 0 : _b.add(keys);
        }
        else if (typeof keys === 'object') {
            try {
                for (var _c = __values(Object.entries(keys)), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var _e = __read(_d.value, 2), key = _e[0], value_1 = _e[1];
                    if (value_1 === null)
                        this.delete(key);
                    else
                        this.set(key, value_1);
                }
            }
            catch (e_11_1) { e_11 = { error: e_11_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_11) throw e_11.error; }
            }
        }
        else
            throw new TypeError("Failed to execute 'set' on 'SyncableStorage': 1 argument required, but only 0 present.");
    };
    // 소속 키 목록 불러오기 (인코딩되지 않은/디코딩된 키)
    HybridStorage.prototype.keys = function () {
        if (this[MEMBERS])
            return this[MEMBERS];
        return this[PARENT].keys();
    };
    HybridStorage.prototype.decorate = function () {
        var decorators = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            decorators[_i] = arguments[_i];
        }
        return new (HybridStorage.bind.apply(HybridStorage, __spreadArray([void 0, this], __read(decorators), false)))();
    };
    // 클라우드 저장소에서 최신 데이터 불러오기
    HybridStorage.prototype.pull = function () {
        return Promise.resolve(this[PARENT].pull());
    };
    // 클라우드 저장소에 수정사항 저장하기
    HybridStorage.prototype.push = function () {
        return Promise.resolve(this[PARENT].push());
    };
    HybridStorage.prototype.sync = function () {
        return Promise.all([this.pull(), this.push()]);
    };
    return HybridStorage;
}());
exports.HybridStorage = HybridStorage;
//# sourceMappingURL=builder.js.map