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

var _a$1, _b$1;
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
        this[_b$1] = '';
    }
    SyncableStorage.prototype[(_a$1 = NAMESPACE, _b$1 = NAMESPACEE, ENCODE_KEY)] = function (key) {
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
var api = new mw.Api();
var _b = (function () {
    var deferred = $.Deferred();
    var timeout = null;
    function saveOption(key, value) {
        var _b;
        return saveOptions((_b = {}, _b[key] = value, _b));
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
})(), saveOption = _b.saveOption, saveOptions = _b.saveOptions;
/** @class */ ((function (_super) {
    __extends(CloudStorage, _super);
    function CloudStorage(parent, namespace, keyEncoder) {
        var _b;
        if (namespace === void 0) { namespace = ''; }
        var _this = _super.call(this) || this;
        _this[_a] = mw.user.options;
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
        Object.defineProperties(_this, (_b = {
                isRoot: propOptions
            },
            _b[NAMESPACE] = __assign({ value: (parent ? parent[NAMESPACE] : 'userjs-') +
                    (keyEncoder ? '' : namespace) }, propOptions),
            _b[NAMESPACEE] = __assign({ value: (parent ? parent[NAMESPACEE] : '') +
                    (keyEncoder ? namespace : '') }, propOptions),
            _b));
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
        for (var _b = 0, keys_1 = keys; _b < keys_1.length; _b++) {
            var key = keys_1[_b];
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
        for (var _b = 0, keys_2 = keys; _b < keys_2.length; _b++) {
            var key = keys_2[_b];
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
})(SyncableStorage));
_a = STORAGE;
//# sourceMappingURL=user.js.map
