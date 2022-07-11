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

const api = new mw.Api();

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

export = new CloudStorage() as SyncableStorage;
