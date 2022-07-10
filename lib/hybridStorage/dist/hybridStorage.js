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
var _a, _b, _c, _d;
// 로그인시 알아서 서버와 동기화하고 로그아웃시 로컬에 데이터를 안전하게 저장하는 저장소
var api = new mw.Api();
var STORAGE = Symbol('storage');
var NAMESPACE = Symbol('namespace');
var NAMESPACEE = Symbol('namespace (encode needed)');
var PRE_ENCODED = Symbol('pre encoded');
var ENCODE_KEY = Symbol('encode key');
var DECODE_KEY = Symbol('decode key');
var IS_MY_KEY = Symbol('Is it my key?');
var propOptions = {
    configurable: false,
    enumerable: true,
    writable: false,
};
var _e = (function () {
    var deferred = $.Deferred();
    var timeout = null;
    function saveOption(key, value) {
        var _e;
        return saveOptions((_e = {}, _e[key] = value, _e));
    }
    function saveOptions(options) {
        if (timeout)
            clearTimeout(timeout);
        timeout = setTimeout(function () {
            api.saveOptions(options).then(deferred.resolve, deferred.reject);
            timeout = null;
            deferred = $.Deferred();
        }, 100);
        return deferred.promise();
    }
    return {
        saveOption: saveOption,
        saveOptions: saveOptions,
    };
})(), saveOption = _e.saveOption, saveOptions = _e.saveOptions;
var SyncableStorage = /** @class */ (function () {
    function SyncableStorage() {
        this[_a] = '';
        this[_b] = '';
    }
    SyncableStorage.prototype[(_a = NAMESPACE, _b = NAMESPACEE, ENCODE_KEY)] = function (key) {
        if (!this.encodeKey)
            return this[NAMESPACE] + this[NAMESPACEE] + key;
        if (this[PRE_ENCODED])
            return this[NAMESPACE] + this[NAMESPACEE] + this.encodeKey(key);
        return this[NAMESPACE] + this.encodeKey(this[NAMESPACEE] + key);
    };
    SyncableStorage.prototype[DECODE_KEY] = function (key) {
        if (!this.decodeKey)
            return key.slice(this[NAMESPACE].length + this[NAMESPACEE].length);
        if (this[PRE_ENCODED])
            return this.decodeKey(key.slice(this[NAMESPACE].length + this[NAMESPACEE].length));
        return this.decodeKey(key.slice(this[NAMESPACE].length)).slice(this[NAMESPACEE].length);
    };
    SyncableStorage.prototype[IS_MY_KEY] = function (key) {
        if (!key.startsWith(this[NAMESPACE]))
            return false;
        key = key.slice(this[NAMESPACE].length);
        if (!this.decodeKey || this[PRE_ENCODED])
            return key.startsWith(this[NAMESPACEE]);
        return this.decodeKey(key).startsWith(this[NAMESPACEE]);
    };
    return SyncableStorage;
}());
var LocalStorage = /** @class */ (function (_super) {
    __extends(LocalStorage, _super);
    function LocalStorage(parent, namespace, keyEncoder) {
        var _e;
        if (namespace === void 0) { namespace = ''; }
        var _this = _super.call(this) || this;
        _this[_c] = localStorage;
        _this.needRefresh = false;
        if (keyEncoder) {
            if (!keyEncoder.encoder || !keyEncoder.decoder)
                throw new TypeError('Encoder and decoder must be included');
            _this.encodeKey = keyEncoder.encoder;
            _this.decodeKey = keyEncoder.decoder;
            if (keyEncoder.encodeNamespace && keyEncoder.preEncodable)
                namespace = keyEncoder.encoder(namespace);
            Object.defineProperty(_this, PRE_ENCODED, {
                value: keyEncoder.preEncodable,
            });
        }
        _this.isRoot = !parent;
        Object.defineProperties(_this, (_e = {
                isRoot: propOptions
            },
            _e[NAMESPACE] = __assign({ value: (parent ? parent[NAMESPACE] : '') +
                    (keyEncoder && keyEncoder.encodeNamespace ? '' : namespace) }, propOptions),
            _e[NAMESPACEE] = __assign({ value: (parent ? parent[NAMESPACEE] : '') +
                    (keyEncoder && keyEncoder.encodeNamespace ? namespace : '') }, propOptions),
            _e));
        return _this;
    }
    LocalStorage.prototype.clear = function () {
        if (this.isRoot)
            throw new TypeError('Root storage cannot be cleared');
        for (var key in this[STORAGE]) {
            if (this[IS_MY_KEY](key))
                this[STORAGE].removeItem(key);
        }
        return Promise.resolve(true);
    };
    LocalStorage.prototype.delete = function (key) {
        if (!key)
            throw new TypeError("Failed to execute 'delete' on 'LocalStorage': 1 argument required, but only 0 present.");
        this[STORAGE].removeItem(this[ENCODE_KEY](key));
        return Promise.resolve(true);
    };
    LocalStorage.prototype.deleteAll = function (keysArg) {
        var keys = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            keys[_i - 1] = arguments[_i];
        }
        if (Array.isArray(keysArg))
            keys = keysArg;
        else if (!keys.length)
            throw new TypeError("Failed to execute 'deleteAll' on 'LocalStorage': 1 argument required, but only 0 present.");
        for (var _e = 0, keys_1 = keys; _e < keys_1.length; _e++) {
            var key = keys_1[_e];
            this[STORAGE].removeItem(this[ENCODE_KEY](key));
        }
        return Promise.resolve(true);
    };
    LocalStorage.prototype.forEach = function (callbackfn, thisArg) {
        for (var key in this[STORAGE]) {
            if (this[IS_MY_KEY](key))
                callbackfn.call(thisArg, this[STORAGE][key], this[DECODE_KEY](key), this);
        }
    };
    LocalStorage.prototype.get = function (key) {
        if (key)
            return this[STORAGE].getItem(this[ENCODE_KEY](key));
        throw new TypeError("Failed to execute 'get' on 'LocalStorage': 1 argument required, but only 0 present.");
    };
    LocalStorage.prototype.has = function (key) {
        if (key)
            return this[ENCODE_KEY](key) in this[STORAGE];
        throw new TypeError("Failed to execute 'has' on 'LocalStorage': 1 argument required, but only 0 present.");
    };
    LocalStorage.prototype.hasAll = function (keysArg) {
        var keys = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            keys[_i - 1] = arguments[_i];
        }
        if (keysArg)
            keys = keysArg;
        else if (!keys.length)
            throw new TypeError("Failed to execute 'hasAll' on 'LocalStorage': 1 argument required, but only 0 present.");
        var missing = false;
        for (var _e = 0, keys_2 = keys; _e < keys_2.length; _e++) {
            var key = keys_2[_e];
            if (!(this[ENCODE_KEY](key) in this[STORAGE])) {
                missing = true;
                break;
            }
        }
        return !missing;
    };
    LocalStorage.prototype.set = function (key, value) {
        if (key) {
            this[STORAGE].setItem(this[ENCODE_KEY](key), value);
            return Promise.resolve(true);
        }
        throw new TypeError("Failed to execute 'set' on 'LocalStorage': 1 argument required, but only 0 present.");
    };
    LocalStorage.prototype.setAll = function (entries) {
        if (entries) {
            for (var key in entries)
                this[STORAGE].setItem(this[ENCODE_KEY](key), entries[key]);
            return Promise.resolve(true);
        }
        throw new TypeError("Failed to execute 'setAll' on 'LocalStorage': 1 argument required, but only 0 present.");
    };
    LocalStorage.prototype.refresh = function () {
        return Promise.resolve(this);
    };
    LocalStorage.prototype.keys = function () {
        var keys = [];
        for (var key in this[STORAGE]) {
            if (this[IS_MY_KEY](key))
                keys.push(this[DECODE_KEY](key));
        }
        return keys;
    };
    LocalStorage.prototype.values = function () {
        var values = {};
        for (var key in this[STORAGE]) {
            if (this[IS_MY_KEY](key))
                values[this[DECODE_KEY](key)] = this[STORAGE][key];
        }
        return values;
    };
    LocalStorage.prototype.subset = function (namespace, keyEncoder) {
        if (!namespace)
            throw new TypeError("Failed to execute 'subset' on 'LocalStorage': 1 argument required, but only 0 present.");
        if (!keyEncoder && this[NAMESPACEE]) {
            keyEncoder = {
                encoder: this.encodeKey,
                decoder: this.decodeKey,
                encodeNamespace: true,
                preEncodable: this[PRE_ENCODED],
            };
        }
        if (keyEncoder && (!keyEncoder.encoder || !keyEncoder.decoder))
            throw new TypeError('Encoder and decoder must be included');
        return new LocalStorage(this, namespace, keyEncoder);
    };
    LocalStorage.prototype.copy = function (keyEncoder) {
        if (!keyEncoder)
            throw new TypeError("Failed to execute 'copy' on 'LocalStorage': 1 argument required, but only 0 present.");
        if (!keyEncoder.encoder || !keyEncoder.decoder)
            throw new TypeError('Encoder and decoder must be included');
        keyEncoder.encodeNamespace = false;
        return new LocalStorage(this, '', keyEncoder);
    };
    Object.defineProperty(LocalStorage.prototype, "size", {
        get: function () {
            var count = 0;
            for (var key in this[STORAGE]) {
                if (this[IS_MY_KEY](key))
                    count++;
            }
            return count;
        },
        enumerable: false,
        configurable: true
    });
    return LocalStorage;
}(SyncableStorage));
_c = STORAGE;
var CloudStorage = /** @class */ (function (_super) {
    __extends(CloudStorage, _super);
    function CloudStorage(parent, namespace, keyEncoder) {
        var _e;
        if (namespace === void 0) { namespace = ''; }
        var _this = _super.call(this) || this;
        _this[_d] = mw.user.options;
        _this.needRefresh = true;
        _this.refresh = (function () {
            var deferred = $.Deferred();
            var timeout = null;
            return function () {
                if (timeout)
                    clearTimeout(timeout);
                timeout = setTimeout(function () {
                    api.get({
                        action: 'query',
                        meta: 'userinfo',
                        uiprop: 'options',
                    }, {
                        cache: false,
                    })
                        .then(function (response) {
                        //@ts-ignore Access private anyway
                        mw.user.options.values = response.query.userinfo.options;
                        return _this;
                    })
                        .then(deferred.resolve, deferred.reject);
                    timeout = null;
                    deferred = $.Deferred();
                }, 100);
                return deferred.promise();
            };
        })();
        if (keyEncoder) {
            if (!keyEncoder.encoder || !keyEncoder.decoder)
                throw new TypeError('Encoder and decoder must be included');
            _this.encodeKey = keyEncoder.encoder;
            _this.decodeKey = keyEncoder.decoder;
            if (keyEncoder.preEncodable)
                namespace = keyEncoder.encoder(namespace);
            Object.defineProperty(_this, PRE_ENCODED, {
                value: keyEncoder.preEncodable,
            });
        }
        _this.isRoot = !parent;
        Object.defineProperties(_this, (_e = {
                isRoot: propOptions
            },
            _e[NAMESPACE] = __assign({ value: (parent ? parent[NAMESPACE] : 'userjs-') +
                    (keyEncoder ? '' : namespace) }, propOptions),
            _e[NAMESPACEE] = __assign({ value: (parent ? parent[NAMESPACEE] : '') +
                    (keyEncoder ? namespace : '') }, propOptions),
            _e));
        return _this;
    }
    CloudStorage.prototype.clear = function () {
        if (this.isRoot)
            throw new TypeError('Root storage cannot be cleared');
        var options = {};
        //@ts-ignore Access private anyway
        for (var key in this[STORAGE].values) {
            if (this[IS_MY_KEY](key))
                options[key] = null;
        }
        return saveOptions(options);
    };
    CloudStorage.prototype.delete = function (key) {
        if (key)
            return saveOption(this[ENCODE_KEY](key), null);
        throw new TypeError("Failed to execute 'delete' on 'CloudStorage': 1 argument required, but only 0 present.");
    };
    CloudStorage.prototype.deleteAll = function (keysArg) {
        var keys = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            keys[_i - 1] = arguments[_i];
        }
        if (Array.isArray(keysArg))
            keys = keysArg;
        else if (!keys.length)
            throw new TypeError("Failed to execute 'deleteAll' on 'CloudStorage': 1 argument required, but only 0 present.");
        var options = {};
        for (var _e = 0, keys_3 = keys; _e < keys_3.length; _e++) {
            var key = keys_3[_e];
            options[this[ENCODE_KEY](key)] = null;
        }
        return saveOptions(options);
    };
    CloudStorage.prototype.forEach = function (callbackfn, thisArg) {
        // @ts-ignore
        for (var key in this[STORAGE].values) {
            if (this[IS_MY_KEY](key))
                callbackfn.call(thisArg, 
                // @ts-ignore
                this[STORAGE].values[key], this[DECODE_KEY](key), this);
        }
    };
    CloudStorage.prototype.get = function (key) {
        if (key)
            return this[STORAGE].get(this[ENCODE_KEY](key));
        throw new TypeError("Failed to execute 'get' on 'CloudStorage': 1 argument required, but only 0 present.");
    };
    CloudStorage.prototype.has = function (key) {
        if (key)
            return this[STORAGE].exists(this[ENCODE_KEY](key));
        throw new TypeError("Failed to execute 'has' on 'CloudStorage': 1 argument required, but only 0 present.");
    };
    CloudStorage.prototype.hasAll = function (keysArg) {
        var keys = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            keys[_i - 1] = arguments[_i];
        }
        if (keysArg)
            keys = keysArg;
        else if (!keys.length)
            throw new TypeError("Failed to execute 'hasAll' on 'CloudStorage': 1 argument required, but only 0 present.");
        var missing = false;
        for (var _e = 0, keys_4 = keys; _e < keys_4.length; _e++) {
            var key = keys_4[_e];
            //@ts-ignore Access private anyway
            if (!(this[ENCODE_KEY](key) in this[STORAGE].values)) {
                missing = true;
                break;
            }
        }
        return !missing;
    };
    CloudStorage.prototype.set = function (key, value) {
        if (key)
            return saveOption(this[ENCODE_KEY](key), value);
        throw new TypeError("Failed to execute 'set' on 'CloudStorage': 1 argument required, but only 0 present.");
    };
    CloudStorage.prototype.setAll = function (entries) {
        if (entries) {
            var options = {};
            for (var key in entries)
                options[this[ENCODE_KEY](key)] = entries[key];
            return saveOptions(options);
        }
        throw new TypeError("Failed to execute 'setAll' on 'CloudStorage': 1 argument required, but only 0 present.");
    };
    CloudStorage.prototype.keys = function () {
        var keys = [];
        //@ts-ignore Access private anyway
        for (var key in this[STORAGE].values) {
            if (this[IS_MY_KEY](key))
                keys.push(this[DECODE_KEY](key));
        }
        return keys;
    };
    CloudStorage.prototype.values = function () {
        var values = {};
        //@ts-ignore Access private anyway
        for (var key in this[STORAGE].values) {
            if (this[IS_MY_KEY](key))
                //@ts-ignore Access private anyway
                values[this[DECODE_KEY](key)] = this[STORAGE].values[key];
        }
        return values;
    };
    CloudStorage.prototype.subset = function (namespace, keyEncoder) {
        if (!keyEncoder && this[NAMESPACEE]) {
            keyEncoder = {
                encoder: this.encodeKey,
                decoder: this.decodeKey,
                encodeNamespace: true,
                preEncodable: this[PRE_ENCODED],
            };
        }
        if (keyEncoder && (!keyEncoder.encoder || !keyEncoder.decoder))
            throw new TypeError('Encoder and decoder must be included');
        return new CloudStorage(this, namespace, keyEncoder);
    };
    CloudStorage.prototype.copy = function (keyEncoder) {
        if (!keyEncoder)
            throw new TypeError("Failed to execute 'copy' on 'CloudStorage': 1 argument required, but only 0 present.");
        if (!keyEncoder.encoder || !keyEncoder.decoder)
            throw new TypeError('Encoder and decoder must be included');
        keyEncoder.encodeNamespace = false;
        return new CloudStorage(this, '', keyEncoder);
    };
    Object.defineProperty(CloudStorage.prototype, "size", {
        get: function () {
            var count = 0;
            //@ts-ignore Access private anyway
            for (var key in this[STORAGE].values) {
                if (this[IS_MY_KEY](key))
                    count++;
            }
            return count;
        },
        enumerable: false,
        configurable: true
    });
    return CloudStorage;
}(SyncableStorage));
_d = STORAGE;
module.exports = (mw.user.isAnon()
    ? new LocalStorage()
    : new CloudStorage());
//# sourceMappingURL=hybridStorage.js.map