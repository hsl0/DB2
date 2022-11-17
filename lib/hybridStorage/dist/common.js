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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncableStorage = exports.localOrigin = exports.StorageOrigin = exports.propOptions = exports.PROMISE = exports.IS_MY_KEY = exports.DECODE_KEY = exports.ENCODE_KEY = exports.NAMESPACE = exports.GET_MEMBERS = exports.MEMBERS = exports.STORAGE = void 0;
exports.STORAGE = Symbol('storage');
exports.MEMBERS = Symbol('member keys');
exports.GET_MEMBERS = Symbol('get members');
exports.NAMESPACE = Symbol('namespace');
exports.ENCODE_KEY = Symbol('encode key');
exports.DECODE_KEY = Symbol('decode key');
exports.IS_MY_KEY = Symbol('Is it my key?');
exports.PROMISE = Symbol('promise object');
// 런타임 readonly PropertyDescriptor 옵션
exports.propOptions = {
    configurable: false,
    enumerable: true,
    writable: false,
};
var StorageOrigin = /** @class */ (function (_super) {
    __extends(StorageOrigin, _super);
    function StorageOrigin(init) {
        var _this = _super.call(this) || this;
        _this.storage = init.storage;
        _this.needSync = init.needSync;
        _this.namespace = init.namespace;
        _this.get = init.get;
        _this.set = init.set;
        _this.keys = init.keys;
        if (init.delete)
            _this.delete = init.delete;
        if (init.needSync) {
            _this.stage = {};
            _this.unsaved = false;
            _this.pull = init.pull;
            _this.push = init.push;
        }
        return _this;
    }
    StorageOrigin.prototype.delete = function (key) {
        this.set(key, null);
    };
    return StorageOrigin;
}(EventTarget));
exports.StorageOrigin = StorageOrigin;
// localStorage API 추상화
exports.localOrigin = new StorageOrigin({
    storage: localStorage,
    needSync: false,
    set: function (key, value) {
        this.storage.setItem(key, value);
    },
    delete: function (key) {
        this.storage.removeItem(key);
    },
    get: function (key) {
        return this.storage.getItem(key);
    },
    keys: function () {
        return new Set(Object.keys(this.storage));
    },
});
// 온라인/오프라인 공통 저장소 클래스
var SyncableStorage = /** @class */ (function () {
    function SyncableStorage(parent, namespace, keyEncoder) {
        var _a;
        if (namespace === void 0) { namespace = ''; }
        var _b;
        if (keyEncoder) {
            if (!keyEncoder.encoder || !keyEncoder.decoder)
                throw new TypeError('Encoder and decoder must be included');
            this.encodeKey = keyEncoder.encoder;
            this.decodeKey = keyEncoder.decoder;
            this.keyEncoded = true;
        }
        else
            this.keyEncoded = false;
        this.isRoot = !parent;
        (_b = this.hasRemote) !== null && _b !== void 0 ? _b : (this.hasRemote = this[exports.STORAGE].needSync);
        this[exports.NAMESPACE] =
            (parent ? parent[exports.NAMESPACE] : this[exports.STORAGE].namespace || '') + namespace;
        this[exports.MEMBERS] = new Set();
        this[exports.GET_MEMBERS]((parent === null || parent === void 0 ? void 0 : parent[exports.MEMBERS]) || this[exports.STORAGE].keys());
        Object.defineProperties(this, (_a = {
                isRoot: exports.propOptions,
                hasRemote: exports.propOptions,
                keyEncoded: exports.propOptions
            },
            _a[exports.NAMESPACE] = exports.propOptions,
            _a));
    }
    Object.defineProperty(SyncableStorage.prototype, "unsaved", {
        // 저장이 완료되지 않았는지 여부
        get: function () {
            return Boolean(this[exports.STORAGE].unsaved);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SyncableStorage.prototype, "size", {
        // 소속 키의 수
        get: function () {
            return this[exports.MEMBERS].size;
        },
        enumerable: false,
        configurable: true
    });
    // 저장소 영역 초기화
    SyncableStorage.prototype.clear = function () {
        var _this = this;
        if (this.isRoot)
            throw new TypeError('Root storage cannot be cleared');
        this[exports.MEMBERS].forEach(function (key) {
            _this[exports.STORAGE].delete(key);
        });
        this[exports.MEMBERS].clear();
        return this[exports.PROMISE];
    };
    SyncableStorage.prototype.delete = function () {
        var _this = this;
        var keys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            keys[_i] = arguments[_i];
        }
        if (Array.isArray(keys[0]))
            keys = keys[0];
        keys.forEach(function (key) {
            key = _this[exports.ENCODE_KEY](key);
            if (_this[exports.MEMBERS].has(key)) {
                _this[exports.STORAGE].delete(key);
                _this[exports.MEMBERS].delete(key);
            }
        });
        return this[exports.PROMISE];
    };
    // 모든 키와 값에 대해 일괄 작업 수행
    SyncableStorage.prototype.forEach = function (callbackfn, thisArg) {
        var _this = this;
        this[exports.MEMBERS].forEach(function (key) {
            var value = _this[exports.STORAGE].get(key);
            if (value !== null)
                callbackfn.call(thisArg, value, _this[exports.DECODE_KEY](key), _this);
        });
    };
    // 특정 키의 값 불러오기
    SyncableStorage.prototype.get = function (key) {
        if (key)
            return this[exports.STORAGE].get(this[exports.ENCODE_KEY](key));
        throw new TypeError("Failed to execute 'get' on 'SyncableStorage': 1 argument required, but only 0 present.");
    };
    SyncableStorage.prototype.getAll = function () {
        var _this = this;
        var keys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            keys[_i] = arguments[_i];
        }
        if (Array.isArray(keys[0]))
            keys = keys[0];
        var values = {};
        keys.forEach(function (key) {
            values[key] = _this[exports.STORAGE].get(_this[exports.ENCODE_KEY](key));
        });
        return values;
    };
    SyncableStorage.prototype.has = function () {
        var e_1, _a;
        var keys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            keys[_i] = arguments[_i];
        }
        if (Array.isArray(keys[0]))
            keys = keys[0];
        else if (!keys.length)
            throw new TypeError("Failed to execute 'hasAll' on 'SyncableStorage': 1 argument required, but only 0 present.");
        try {
            for (var _b = __values(keys), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                if (!this[exports.MEMBERS].has(this[exports.ENCODE_KEY](key))) {
                    return false;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return true;
    };
    SyncableStorage.prototype.set = function (keys, value) {
        switch (typeof keys) {
            case 'string':
                if (typeof value === 'string') {
                    var key = this[exports.ENCODE_KEY](keys);
                    this[exports.STORAGE].set(key, value);
                    this[exports.MEMBERS].add(key);
                    return this[exports.PROMISE];
                }
            case 'object':
                for (var key in keys) {
                    var value_1 = keys[key];
                    key = this[exports.ENCODE_KEY](key);
                    if (typeof value_1 === 'string') {
                        this[exports.STORAGE].set(key, value_1);
                        this[exports.MEMBERS].add(key);
                    }
                }
                return this[exports.PROMISE];
            default:
                throw new TypeError("Failed to execute 'set' on 'SyncableStorage': 1 argument required, but only 0 present.");
        }
    };
    // 소속 키 목록 불러오기 (인코딩되지 않은/디코딩된 키)
    SyncableStorage.prototype.keys = function () {
        var _this = this;
        return __spreadArray([], __read(this[exports.MEMBERS]), false).map(function (key) { return _this[exports.DECODE_KEY](key); });
    };
    // 저장된 모든 키의 값을 객체로 불러오기
    SyncableStorage.prototype.values = function () {
        var _this = this;
        var values = {};
        this[exports.MEMBERS].forEach(function (key) {
            var value = _this[exports.STORAGE].get(key);
            if (value !== null)
                values[_this[exports.DECODE_KEY](key)] = value;
        });
        return values;
    };
    // 키 접두어를 설정하여 하위 저장소를 만들기
    SyncableStorage.prototype.subset = function (namespace, keyEncoder) {
        if (!namespace)
            throw new TypeError("Failed to execute 'subset' on 'SyncableStorage': 1 argument required, but only 0 present.");
        if (keyEncoder && (!keyEncoder.encoder || !keyEncoder.decoder))
            throw new TypeError('Encoder and decoder must be included');
        return new this.constructor(this, this.encodeKey(namespace), keyEncoder);
    };
    // 클라우드 저장소에서 최신 데이터 불러오기
    SyncableStorage.prototype.pull = function () {
        return this[exports.PROMISE];
    };
    // 클라우드 저장소에 수정사항 저장하기
    SyncableStorage.prototype.push = function () {
        return this[exports.PROMISE];
    };
    // 키 인코딩하기 (원본 저장소상 키 이름으로 변환)
    SyncableStorage.prototype.encodeKey = function (key) {
        return key;
    };
    // 키 디코딩하기 (원본 저장소상 키 이름에서 변환)
    SyncableStorage.prototype.decodeKey = function (key) {
        return key;
    };
    // 키 인코딩 내부함수 (접두어+인코딩된 키)
    SyncableStorage.prototype[exports.ENCODE_KEY] = function (key) {
        return this[exports.NAMESPACE] + this.encodeKey(key);
    };
    // 키 디코딩 내부함수 (접두어를 제거하고 디코딩된 키 추출)
    SyncableStorage.prototype[exports.DECODE_KEY] = function (key) {
        return this.decodeKey(key.slice(this[exports.NAMESPACE].length));
    };
    // 소속 키 여부 확인 (접두어 일치 확인, [GET_MEMBERS]에서 사용)
    SyncableStorage.prototype[exports.IS_MY_KEY] = function (key) {
        return key.startsWith(this[exports.NAMESPACE]);
    };
    // [MEMBERS] 배열 갱신 (init에서 기존 데이터를 불러올 때 활용)
    SyncableStorage.prototype[exports.GET_MEMBERS] = function (parentMembers) {
        var _this = this;
        if (parentMembers === void 0) { parentMembers = this[exports.STORAGE].keys(); }
        this[exports.MEMBERS].clear();
        parentMembers.forEach(function (key) {
            if (_this[exports.IS_MY_KEY](key))
                _this[exports.MEMBERS].add(key);
        });
    };
    return SyncableStorage;
}());
exports.SyncableStorage = SyncableStorage;
// 클라우드에 업로드 불가능할 때, 로컬에 임시 저장하는 클래스
var BackupStorage = /** @class */ (function () {
    function BackupStorage(storage, // 로컬 임시 저장소
    remote, // 클라우드 주 저장소
    rootNamespace, // 시스템 설정을 저장하는 네임스페이스
    subNamespace) {
        if (rootNamespace === void 0) { rootNamespace = ''; }
        if (subNamespace === void 0) { subNamespace = ''; }
        this.storage = storage;
        this.remote = remote;
        this.rootNamespace = rootNamespace;
        if (!(storage instanceof StorageOrigin && remote instanceof StorageOrigin))
            throw new TypeError('Target storage should be wrapped with StorageOrigin object');
        this.subNamespace = this.rootNamespace + subNamespace;
        this.deviceID = this.getDeviceID();
        this.userID = this.getUserID();
        this.unsaved = this.storage.get(this.subNamespace + this.userID) !== null;
    }
    // 로컬 임시 저장소에 백업
    BackupStorage.prototype.backup = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        data[this.rootNamespace + 'from'] = this.getFrom();
                        this.cache = data;
                        _b = (_a = this.storage).set;
                        _c = [this.subNamespace + this.userID];
                        return [4 /*yield*/, this.encrypt(data)];
                    case 1:
                        _b.apply(_a, _c.concat([_d.sent()]));
                        return [2 /*return*/];
                }
            });
        });
    };
    // 클라우드 주 저장소에 백업 데이터 병합
    BackupStorage.prototype.merge = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data, cipher, from;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.cache) return [3 /*break*/, 1];
                        data = this.cache;
                        return [3 /*break*/, 4];
                    case 1:
                        cipher = this.storage.get(this.subNamespace + this.userID);
                        if (!cipher) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.decrypt(cipher)];
                    case 2:
                        data = _a.sent();
                        return [3 /*break*/, 4];
                    case 3: return [2 /*return*/];
                    case 4:
                        from = this.remote.get(this.rootNamespace + 'from');
                        if (from) {
                        }
                        else {
                            this.remote.stage = __assign(__assign({}, data), this.remote.stage);
                            return [2 /*return*/, this.remote.push()];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    // 메타데이터와 함께 업로드
    BackupStorage.prototype.push = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.remote.push();
                return [2 /*return*/];
            });
        });
    };
    // 장치 ID 불러오기
    BackupStorage.prototype.getDeviceID = function () {
        var id = this.storage.get(this.rootNamespace + '-id');
        if (!id) {
            id = crypto.randomUUID();
            this.storage.set(this.rootNamespace + 'id', id);
        }
        return id;
    };
    // 주 저장소에 마지막으로 저장한 장치/시간을 나타내는 from 메타데이터 값 불러오기
    BackupStorage.prototype.getFrom = function () {
        return this.deviceID + '/' + Date.now();
    };
    // from 메타데이터에서 장치 ID/시간 추출
    BackupStorage.parseFrom = function (from) {
        var _a = __read(from.split('/'), 2), deviceID = _a[0], date = _a[1];
        return { deviceID: deviceID, date: Number(date) };
    };
    // 바이너리를 base64 문자열로 변환
    BackupStorage.encodeBuffer = function (buffer) {
        return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));
    };
    // base64 문자열을 바이너리로 변환
    BackupStorage.decodeBuffer = function (base64) {
        return Uint8Array.from(atob(base64), function (char) { return char.charCodeAt(0); });
    };
    // 저장소 암호화
    BackupStorage.prototype.encrypt = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var iv, cipher, _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        iv = crypto.getRandomValues(new Uint8Array());
                        _b = (_a = crypto.subtle).encrypt;
                        _c = [{
                                name: 'AES-GCM',
                                iv: iv,
                            }];
                        return [4 /*yield*/, this.getCryptoKey()];
                    case 1: return [4 /*yield*/, _b.apply(_a, _c.concat([_d.sent(), new TextEncoder().encode(JSON.stringify(data))]))];
                    case 2:
                        cipher = _d.sent();
                        return [2 /*return*/, (BackupStorage.encodeBuffer(iv) + ',' + BackupStorage.encodeBuffer(cipher))];
                }
            });
        });
    };
    // 저장소 복호화
    BackupStorage.prototype.decrypt = function (set) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, iv, cipher, _b, _c, _d, _e, _f, _g, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        _a = __read(set.split(','), 2), iv = _a[0], cipher = _a[1];
                        _c = (_b = JSON).parse;
                        _e = (_d = new TextDecoder()).decode;
                        _g = (_f = crypto.subtle).decrypt;
                        _h = [{
                                name: 'AES-GCM',
                                iv: BackupStorage.decodeBuffer(iv),
                            }];
                        return [4 /*yield*/, this.getCryptoKey()];
                    case 1: return [4 /*yield*/, _g.apply(_f, _h.concat([_j.sent(), BackupStorage.decodeBuffer(cipher)]))];
                    case 2: return [2 /*return*/, _c.apply(_b, [_e.apply(_d, [_j.sent()])])];
                }
            });
        });
    };
    // 사용자 ID 불러오기 (서버에 없으면 생성후 저장)
    BackupStorage.prototype.getUserID = function () {
        var id = this.remote.get(this.rootNamespace + 'id');
        if (!id) {
            id = crypto.randomUUID();
            this.remote.set(this.rootNamespace + 'id', id);
        }
        return id;
    };
    // 비밀키 불러오기 (서버에 없으면 생성후 저장)
    BackupStorage.prototype.getCryptoKey = function () {
        var _this = this;
        if (this.cryptoKey)
            return this.cryptoKey;
        if (!this.cryptoKeyPromise) {
            var cryptoKeyStr = this.remote.get(this.rootNamespace + 'cryptokey');
            if (cryptoKeyStr) {
                this.cryptoKeyPromise = BackupStorage.importCryptoKey(cryptoKeyStr);
            }
            else {
                this.cryptoKeyPromise = BackupStorage.generateCryptoKey();
                this.cryptoKeyPromise
                    .then(function (key) { return BackupStorage.exportCryptoKey(key); })
                    .then(function (key) {
                    _this.remote.set(_this.rootNamespace + 'cryptokey', key);
                });
            }
        }
        this.cryptoKeyPromise.then(function (key) {
            _this.cryptoKey = key;
        });
        return this.cryptoKeyPromise;
    };
    // 비밀키 생성
    BackupStorage.generateCryptoKey = function () {
        return crypto.subtle.generateKey({
            name: 'AES-GCM',
            length: 128,
        }, true, ['encrypt', 'decrypt']);
    };
    // 비밀키 문자열로 내보내기
    BackupStorage.exportCryptoKey = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = JSON).stringify;
                        return [4 /*yield*/, crypto.subtle.exportKey('jwk', key)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    // 비밀키 불러오기
    BackupStorage.importCryptoKey = function (key) {
        return crypto.subtle.importKey('jwk', JSON.parse(key), { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
    };
    return BackupStorage;
}());
//# sourceMappingURL=common.js.map