export const STORAGE = Symbol('storage');
export const NAMESPACE = Symbol('namespace');
export const NAMESPACEE = Symbol('namespace (encode needed)');
export const PRE_ENCODED = Symbol('pre encoded');
export const ENCODE_KEY = Symbol('encode key');
export const DECODE_KEY = Symbol('decode key');
export const IS_MY_KEY = Symbol('Is it my key?');

export const propOptions = {
    configurable: false,
    enumerable: true,
    writable: false,
};

export interface KeyEncoder {
    encoder(key: string): string;
    decoder(key: string): string;
    encodeNamespace?: boolean;
    preEncodable?: boolean;
}

export abstract class SyncableStorage {
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
