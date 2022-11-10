export declare const STORAGE: unique symbol;
export declare const MEMBERS: unique symbol;
export declare const GET_MEMBERS: unique symbol;
export declare const LOCKED: unique symbol;
export declare const NAMESPACE: unique symbol;
export declare const ENCODE_KEY: unique symbol;
export declare const DECODE_KEY: unique symbol;
export declare const IS_MY_KEY: unique symbol;
export declare const propOptions: PropertyDescriptor;
export interface KeyEncoder {
    encoder(key: string): string;
    decoder(key: string): string;
}
interface StorageOriginInit<T> {
    readonly storage: T;
    readonly needSync: boolean;
    readonly namespace?: string;
    keys(this: StorageOrigin<T>): Set<string>;
    get(this: StorageOrigin<T>, key: string): string | null;
    set(this: StorageOrigin<T>, key: string, value: string): void;
    delete?(this: StorageOrigin<T>, key: string): void;
}
interface RemoteStorageOriginInit<T> extends StorageOriginInit<T> {
    readonly needSync: true;
    delete?(this: StorageOrigin<T>, key: string): void;
    push(this: StorageOrigin<T>): PromiseLike<any>;
    pull(this: StorageOrigin<T>): PromiseLike<any>;
}
interface LocalStorageOriginInit<T> extends StorageOriginInit<T> {
    readonly needSync: false;
    delete(key: string): void;
}
export declare class StorageOrigin<T> extends EventTarget {
    readonly storage: T;
    stage?: Record<string, string | null>;
    unsaved?: boolean;
    readonly needSync: boolean;
    readonly namespace?: string;
    constructor(init: RemoteStorageOriginInit<T>);
    constructor(init: LocalStorageOriginInit<T>);
    get: (key: string) => string | null;
    set: (key: string, value: string) => void;
    keys: () => Set<string>;
    delete(key: string): void;
    push(): PromiseLike<any>;
    pull(): PromiseLike<any>;
}
export declare const localOrigin: StorageOrigin<Storage>;
export declare abstract class SyncableStorage<T> {
    protected abstract readonly [STORAGE]: StorageOrigin<T>;
    protected readonly [MEMBERS]: Set<string>;
    readonly [NAMESPACE]: string;
    readonly isRoot: boolean;
    abstract readonly hasRemote: boolean;
    constructor(parent?: SyncableStorage<T>, namespace?: string, keyEncoder?: KeyEncoder);
    get unsaved(): boolean | undefined;
    get size(): number;
    clear(): PromiseLike<any>;
    delete(key: string): PromiseLike<any>;
    delete(keys: string[]): PromiseLike<any>;
    delete(...keys: string[]): PromiseLike<any>;
    forEach(callbackfn: (value: string, key: string, map: this) => void, thisArg?: any): void;
    get(key: string): string | null;
    getAll(keys: string[]): Record<string, string>;
    getAll(...keys: string[]): Record<string, string>;
    has(key: string): boolean;
    has(keys: string[]): boolean;
    has(...keys: string[]): boolean;
    set(key: string, value: string): PromiseLike<any>;
    set(entries: Record<string, string>): PromiseLike<any>;
    keys(): string[];
    values(): Record<string, string>;
    subset(namespace: string, keyEncoder?: KeyEncoder): this;
    abstract pull(): PromiseLike<any>;
    abstract push(): PromiseLike<any>;
    encodeKey?(key: string): string;
    decodeKey?(key: string): string;
    protected [ENCODE_KEY](key: string): string;
    protected [DECODE_KEY](key: string): string;
    protected [IS_MY_KEY](key: string): boolean;
    protected [GET_MEMBERS](parentMembers?: Set<string> | string[]): void;
}
export {};
