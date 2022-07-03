declare const STORAGE: unique symbol;
declare const NAMESPACE: unique symbol;
declare const NAMESPACEE: unique symbol;
declare const PRE_ENCODED: unique symbol;
declare const ENCODE_KEY: unique symbol;
declare const DECODE_KEY: unique symbol;
declare const IS_MY_KEY: unique symbol;
interface KeyEncoder {
    encoder(key: string): string;
    decoder(key: string): string;
    encodeNamespace?: boolean;
    preEncodable?: boolean;
}
declare abstract class SyncableStorage {
    protected abstract readonly [STORAGE]: unknown;
    protected readonly [NAMESPACE]: string;
    protected readonly [NAMESPACEE]: string;
    protected readonly [PRE_ENCODED]?: boolean;
    abstract readonly isRoot: boolean;
    abstract readonly needRefresh: boolean;
    abstract get size(): number;
    abstract clear?(): PromiseLike<any>;
    abstract delete(key: string): PromiseLike<any>;
    abstract deleteAll(keysArg: string[], ...keys: string[]): PromiseLike<any>;
    abstract forEach(callbackfn: (value: string, key: string, map: this) => void, thisArg?: any): void;
    abstract get(key: string): string | null | undefined;
    abstract has(key: string): boolean;
    abstract hasAll(keysArr?: string[], ...keysArg: string[]): boolean;
    abstract set(key: string, value: string): PromiseLike<any>;
    abstract setAll(entries: {
        [key: string]: string;
    }): PromiseLike<any>;
    abstract refresh(): PromiseLike<any>;
    abstract keys(): string[];
    abstract values(): {
        [key: string]: string;
    };
    abstract subset(namespace: string, keyEncoder?: KeyEncoder): SyncableStorage;
    abstract copy(keyEncoder: KeyEncoder): SyncableStorage;
    encodeKey?(key: string): string;
    decodeKey?(key: string): string;
    protected [ENCODE_KEY](key: string): string;
    protected [DECODE_KEY](key: string): string;
    protected [IS_MY_KEY](key: string): boolean;
}
declare const _default: SyncableStorage;
export = _default;