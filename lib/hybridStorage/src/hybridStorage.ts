// 로그인시 알아서 서버와 동기화하고 로그아웃시 로컬에 데이터를 안전하게 저장하는 저장소
const api = new mw.Api();
const STORAGE = Symbol('storage');
const NAMESPACE = Symbol('namespace');
const NAMESPACEE = Symbol('namespace (encode needed)');
const PRE_ENCODED = Symbol('pre encoded');
const ENCODE_KEY = Symbol('encode key');
const DECODE_KEY = Symbol('decode key');
const IS_MY_KEY = Symbol('Is it my key?');

const propOptions = {
    configurable: false,
    enumerable: true,
    writable: false,
};

const { saveOption, saveOptions } = (() => {
    let deferred = $.Deferred();
    let timeout: number | null = null;

    function saveOption(key: string, value: string | null) {
        return saveOptions({ [key]: value });
    }
    function saveOptions(options: Record<string, string | null>) {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            api.saveOptions(options as any).then(deferred.resolve, deferred.reject);

            timeout = null;
            deferred = $.Deferred();
        }, 100);
        return deferred.promise();
    }

    return {
        saveOption,
        saveOptions,
    };
})();

interface KeyEncoder {
    encoder(key: string): string;
    decoder(key: string): string;
    encodeNamespace?: boolean;
    preEncodable?: boolean;
}

abstract class SyncableStorage {
    protected abstract readonly [STORAGE]: unknown;
    protected readonly [NAMESPACE]: string = '';
    protected readonly [NAMESPACEE]: string = '';
    protected readonly [PRE_ENCODED]?: boolean;

    abstract readonly isRoot: boolean;
    abstract readonly needRefresh: boolean;

    abstract get size(): number;

    abstract clear?(): PromiseLike<any>;
    abstract delete(key: string): PromiseLike<any>;
    abstract deleteAll(keysArg: string[], ...keys: string[]): PromiseLike<any>;
    abstract forEach(
        callbackfn: (value: string, key: string, map: this) => void,
        thisArg?: any
    ): void;
    abstract get(key: string): string | null | undefined;
    abstract has(key: string): boolean;
    abstract hasAll(keysArr?: string[], ...keysArg: string[]): boolean;
    abstract set(key: string, value: string): PromiseLike<any>;
    abstract setAll(entries: Record<string, string>): PromiseLike<any>;
    abstract refresh(): PromiseLike<any>;
    abstract keys(): string[];
    abstract values(): Record<string, string>;
    abstract subset(namespace: string, keyEncoder?: KeyEncoder): SyncableStorage;
    abstract copy(keyEncoder: KeyEncoder): SyncableStorage;

    encodeKey?(key: string): string;
    decodeKey?(key: string): string;

    protected [ENCODE_KEY](key: string): string {
        if (!this.encodeKey) return this[NAMESPACE] + this[NAMESPACEE] + key;
        if (this[PRE_ENCODED])
            return this[NAMESPACE] + this[NAMESPACEE] + this.encodeKey(key);
        return this[NAMESPACE] + this.encodeKey(this[NAMESPACEE] + key);
    }

    protected [DECODE_KEY](key: string): string {
        if (!this.decodeKey)
            return key.slice(this[NAMESPACE].length + this[NAMESPACEE].length);
        if (this[PRE_ENCODED])
            return this.decodeKey(
                key.slice(this[NAMESPACE].length + this[NAMESPACEE].length)
            );
        return this.decodeKey(key.slice(this[NAMESPACE].length)).slice(
            this[NAMESPACEE].length
        );
    }

    protected [IS_MY_KEY](key: string): boolean {
        if (!key.startsWith(this[NAMESPACE])) return false;
        key = key.slice(this[NAMESPACE].length);

        if (!this.decodeKey || this[PRE_ENCODED])
            return key.startsWith(this[NAMESPACEE]);
        return this.decodeKey(key).startsWith(this[NAMESPACEE]);
    }
}

class LocalStorage extends SyncableStorage {
    isRoot: boolean;
    protected readonly [STORAGE] = localStorage;
    readonly needRefresh = false;

    constructor(parent?: LocalStorage, namespace = '', keyEncoder?: KeyEncoder) {
        super();

        if (keyEncoder) {
            if (!keyEncoder.encoder || !keyEncoder.decoder)
                throw new TypeError('Encoder and decoder must be included');

            this.encodeKey = keyEncoder.encoder;
            this.decodeKey = keyEncoder.decoder;

            if (keyEncoder.encodeNamespace && keyEncoder.preEncodable)
                namespace = keyEncoder.encoder(namespace);

            Object.defineProperty(this, PRE_ENCODED, {
                value: keyEncoder.preEncodable,
            });
        }

        this.isRoot = !parent;

        Object.defineProperties(this, {
            isRoot: propOptions,
            [NAMESPACE]: {
                value:
                    (parent ? parent[NAMESPACE] : '') +
                    (keyEncoder && keyEncoder.encodeNamespace ? '' : namespace),
                ...propOptions,
            },
            [NAMESPACEE]: {
                value:
                    (parent ? parent[NAMESPACEE] : '') +
                    (keyEncoder && keyEncoder.encodeNamespace ? namespace : ''),
                ...propOptions,
            },
        });
    }

    clear() {
        if (this.isRoot) throw new TypeError('Root storage cannot be cleared');

        for (const key in this[STORAGE]) {
            if (this[IS_MY_KEY](key)) this[STORAGE].removeItem(key);
        }

        return Promise.resolve(true);
    }

    delete(key: string) {
        if (!key)
            throw new TypeError(
                "Failed to execute 'delete' on 'LocalStorage': 1 argument required, but only 0 present."
            );

        this[STORAGE].removeItem(this[ENCODE_KEY](key));
        return Promise.resolve(true);
    }

    deleteAll(keysArg?: string[], ...keys: string[]) {
        if (Array.isArray(keysArg)) keys = keysArg;
        else if (!keys.length)
            throw new TypeError(
                "Failed to execute 'deleteAll' on 'LocalStorage': 1 argument required, but only 0 present."
            );

        for (const key of keys) this[STORAGE].removeItem(this[ENCODE_KEY](key));
        return Promise.resolve(true);
    }

    forEach(
        callbackfn: (value: string, key: string, map: this) => unknown,
        thisArg?: unknown
    ) {
        for (const key in this[STORAGE]) {
            if (this[IS_MY_KEY](key))
                callbackfn.call(
                    thisArg,
                    this[STORAGE][key],
                    this[DECODE_KEY](key),
                    this
                );
        }
    }

    get(key: string) {
        if (key) return this[STORAGE].getItem(this[ENCODE_KEY](key));
        throw new TypeError(
            "Failed to execute 'get' on 'LocalStorage': 1 argument required, but only 0 present."
        );
    }

    has(key: string) {
        if (key) return this[ENCODE_KEY](key) in this[STORAGE];
        throw new TypeError(
            "Failed to execute 'has' on 'LocalStorage': 1 argument required, but only 0 present."
        );
    }

    hasAll(keysArg?: string[], ...keys: string[]) {
        if (keysArg) keys = keysArg;
        else if (!keys.length)
            throw new TypeError(
                "Failed to execute 'hasAll' on 'LocalStorage': 1 argument required, but only 0 present."
            );

        let missing = false;

        for (const key of keys) {
            if (!(this[ENCODE_KEY](key) in this[STORAGE])) {
                missing = true;
                break;
            }
        }

        return !missing;
    }

    set(key: string, value: string) {
        if (key) {
            this[STORAGE].setItem(this[ENCODE_KEY](key), value);
            return Promise.resolve(true);
        }
        throw new TypeError(
            "Failed to execute 'set' on 'LocalStorage': 1 argument required, but only 0 present."
        );
    }

    setAll(entries: Record<string, string>) {
        if (entries) {
            for (const key in entries)
                this[STORAGE].setItem(this[ENCODE_KEY](key), entries[key]);
            return Promise.resolve(true);
        }
        throw new TypeError(
            "Failed to execute 'setAll' on 'LocalStorage': 1 argument required, but only 0 present."
        );
    }

    refresh() {
        return Promise.resolve(this);
    }

    keys() {
        const keys: string[] = [];

        for (const key in this[STORAGE]) {
            if (this[IS_MY_KEY](key)) keys.push(this[DECODE_KEY](key));
        }

        return keys;
    }

    values() {
        const values: Record<string, string> = {};

        for (const key in this[STORAGE]) {
            if (this[IS_MY_KEY](key))
                values[this[DECODE_KEY](key)] = this[STORAGE][key];
        }

        return values;
    }

    subset(namespace: string, keyEncoder?: KeyEncoder): LocalStorage {
        if (!namespace)
            throw new TypeError(
                "Failed to execute 'subset' on 'LocalStorage': 1 argument required, but only 0 present."
            );
        if (!keyEncoder && this[NAMESPACEE]) {
            keyEncoder = {
                encoder: this.encodeKey as any,
                decoder: this.decodeKey as any,
                encodeNamespace: true,
                preEncodable: this[PRE_ENCODED],
            };
        }
        if (keyEncoder && (!keyEncoder.encoder || !keyEncoder.decoder))
            throw new TypeError('Encoder and decoder must be included');

        return new LocalStorage(this, namespace, keyEncoder);
    }

    copy(keyEncoder: KeyEncoder): LocalStorage {
        if (!keyEncoder)
            throw new TypeError(
                "Failed to execute 'copy' on 'LocalStorage': 1 argument required, but only 0 present."
            );
        if (!keyEncoder.encoder || !keyEncoder.decoder)
            throw new TypeError('Encoder and decoder must be included');

        keyEncoder.encodeNamespace = false;

        return new LocalStorage(this, '', keyEncoder);
    }

    get size() {
        let count = 0;

        for (const key in this[STORAGE]) {
            if (this[IS_MY_KEY](key)) count++;
        }

        return count;
    }
}
class CloudStorage extends SyncableStorage {
    isRoot: boolean;
    protected readonly [STORAGE] = mw.user.options;
    readonly needRefresh = true;

    constructor(parent?: CloudStorage, namespace = '', keyEncoder?: KeyEncoder) {
        super();

        if (keyEncoder) {
            if (!keyEncoder.encoder || !keyEncoder.decoder)
                throw new TypeError('Encoder and decoder must be included');

            this.encodeKey = keyEncoder.encoder;
            this.decodeKey = keyEncoder.decoder;

            if (keyEncoder.preEncodable) namespace = keyEncoder.encoder(namespace);

            Object.defineProperty(this, PRE_ENCODED, {
                value: keyEncoder.preEncodable,
            });
        }

        this.isRoot = !parent;

        Object.defineProperties(this, {
            isRoot: propOptions,
            [NAMESPACE]: {
                value:
                    (parent ? parent[NAMESPACE] : 'userjs-') +
                    (keyEncoder ? '' : namespace),
                ...propOptions,
            },
            [NAMESPACEE]: {
                value:
                    (parent ? parent[NAMESPACEE] : '') +
                    (keyEncoder ? namespace : ''),
                ...propOptions,
            },
        });
    }

    clear() {
        if (this.isRoot) throw new TypeError('Root storage cannot be cleared');

        const options: {
            [key: string]: string | null;
        } = {};

        //@ts-ignore Access private anyway
        for (const key in this[STORAGE].values) {
            if (this[IS_MY_KEY](key)) options[key] = null;
        }

        return saveOptions(options);
    }

    delete(key: string) {
        if (key) return saveOption(this[ENCODE_KEY](key), null);
        throw new TypeError(
            "Failed to execute 'delete' on 'CloudStorage': 1 argument required, but only 0 present."
        );
    }

    deleteAll(keysArg?: string[], ...keys: string[]) {
        if (Array.isArray(keysArg)) keys = keysArg;
        else if (!keys.length)
            throw new TypeError(
                "Failed to execute 'deleteAll' on 'CloudStorage': 1 argument required, but only 0 present."
            );

        const options: Record<string, string | null> = {};

        for (const key of keys) options[this[ENCODE_KEY](key)] = null;

        return saveOptions(options);
    }

    forEach(
        callbackfn: (value: string, key: string, map: this) => unknown,
        thisArg?: unknown
    ) {
        // @ts-ignore
        for (const key in this[STORAGE].values) {
            if (this[IS_MY_KEY](key))
                callbackfn.call(
                    thisArg,
                    // @ts-ignore
                    this[STORAGE].values[key],
                    this[DECODE_KEY](key),
                    this
                );
        }
    }

    get(key: string) {
        if (key) return this[STORAGE].get(this[ENCODE_KEY](key));
        throw new TypeError(
            "Failed to execute 'get' on 'CloudStorage': 1 argument required, but only 0 present."
        );
    }

    has(key: string) {
        if (key) return this[STORAGE].exists(this[ENCODE_KEY](key));
        throw new TypeError(
            "Failed to execute 'has' on 'CloudStorage': 1 argument required, but only 0 present."
        );
    }

    hasAll(keysArg?: string[], ...keys: string[]): boolean {
        if (keysArg) keys = keysArg;
        else if (!keys.length)
            throw new TypeError(
                "Failed to execute 'hasAll' on 'CloudStorage': 1 argument required, but only 0 present."
            );

        let missing = false;

        for (const key of keys) {
            //@ts-ignore Access private anyway
            if (!(this[ENCODE_KEY](key) in this[STORAGE].values)) {
                missing = true;
                break;
            }
        }

        return !missing;
    }

    set(key: string, value: string) {
        if (key) return saveOption(this[ENCODE_KEY](key), value);
        throw new TypeError(
            "Failed to execute 'set' on 'CloudStorage': 1 argument required, but only 0 present."
        );
    }

    setAll(entries: Record<string, string>) {
        if (entries) {
            const options: Record<string, string> = {};

            for (const key in entries) options[this[ENCODE_KEY](key)] = entries[key];

            return saveOptions(options);
        }
        throw new TypeError(
            "Failed to execute 'setAll' on 'CloudStorage': 1 argument required, but only 0 present."
        );
    }

    refresh = (() => {
        let deferred = $.Deferred();
        let timeout: number | null = null;

        return () => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => {
                api.get(
                    {
                        action: 'query',
                        meta: 'userinfo',
                        uiprop: 'options',
                    },
                    {
                        cache: false,
                    }
                )
                    .then((response) => {
                        //@ts-ignore Access private anyway
                        mw.user.options.values = response.query.userinfo.options;
                        return this as CloudStorage;
                    })
                    .then(deferred.resolve, deferred.reject);

                timeout = null;
                deferred = $.Deferred();
            }, 100);
            return deferred.promise();
        };
    })();

    keys() {
        const keys: string[] = [];

        //@ts-ignore Access private anyway
        for (const key in this[STORAGE].values) {
            if (this[IS_MY_KEY](key)) keys.push(this[DECODE_KEY](key));
        }

        return keys;
    }

    values() {
        const values: Record<string, string> = {};

        //@ts-ignore Access private anyway
        for (const key in this[STORAGE].values) {
            if (this[IS_MY_KEY](key))
                //@ts-ignore Access private anyway
                values[this[DECODE_KEY](key)] = this[STORAGE].values[key];
        }

        return values;
    }

    subset(namespace: string, keyEncoder?: KeyEncoder): CloudStorage {
        if (!keyEncoder && this[NAMESPACEE]) {
            keyEncoder = {
                encoder: this.encodeKey as any,
                decoder: this.decodeKey as any,
                encodeNamespace: true,
                preEncodable: this[PRE_ENCODED],
            };
        }
        if (keyEncoder && (!keyEncoder.encoder || !keyEncoder.decoder))
            throw new TypeError('Encoder and decoder must be included');
        return new CloudStorage(this, namespace, keyEncoder);
    }

    copy(keyEncoder: KeyEncoder): CloudStorage {
        if (!keyEncoder)
            throw new TypeError(
                "Failed to execute 'copy' on 'CloudStorage': 1 argument required, but only 0 present."
            );
        if (!keyEncoder.encoder || !keyEncoder.decoder)
            throw new TypeError('Encoder and decoder must be included');

        keyEncoder.encodeNamespace = false;

        return new CloudStorage(this, '', keyEncoder);
    }

    get size() {
        let count = 0;

        //@ts-ignore Access private anyway
        for (const key in this[STORAGE].values) {
            if (this[IS_MY_KEY](key)) count++;
        }

        return count;
    }
}
export = (mw.user.isAnon()
    ? new LocalStorage()
    : new CloudStorage()) as SyncableStorage;
