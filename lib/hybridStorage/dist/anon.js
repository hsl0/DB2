'use strict';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var _a$1, _b;
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
var SyncableStorage = /** @class */ (function () {
    function SyncableStorage() {
        this[_a$1] = '';
        this[_b] = '';
    }
    SyncableStorage.prototype[(_a$1 = NAMESPACE, _b = NAMESPACEE, ENCODE_KEY)] = function (key) {
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

var _a;
/** @class */ ((function (_super) {
    __extends(LocalStorage, _super);
    function LocalStorage(parent, namespace, keyEncoder) {
        var _b;
        if (namespace === void 0) { namespace = ''; }
        var _this = _super.call(this) || this;
        _this[_a] = localStorage;
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
        Object.defineProperties(_this, (_b = {
                isRoot: propOptions
            },
            _b[NAMESPACE] = __assign({ value: (parent ? parent[NAMESPACE] : '') +
                    (keyEncoder && keyEncoder.encodeNamespace ? '' : namespace) }, propOptions),
            _b[NAMESPACEE] = __assign({ value: (parent ? parent[NAMESPACEE] : '') +
                    (keyEncoder && keyEncoder.encodeNamespace ? namespace : '') }, propOptions),
            _b));
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
        for (var _b = 0, keys_1 = keys; _b < keys_1.length; _b++) {
            var key = keys_1[_b];
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
        for (var _b = 0, keys_2 = keys; _b < keys_2.length; _b++) {
            var key = keys_2[_b];
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
})(SyncableStorage));
_a = STORAGE;
//# sourceMappingURL=anon.js.map
