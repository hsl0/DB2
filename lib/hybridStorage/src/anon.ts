import {
    SyncableStorage,
    STORAGE,
    KeyEncoder,
    PRE_ENCODED,
    propOptions,
    NAMESPACE,
    NAMESPACEE,
    IS_MY_KEY,
    ENCODE_KEY,
    DECODE_KEY,
} from './common';

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

//@ts-ignore
export = new LocalStorage() as SyncableStorage;
