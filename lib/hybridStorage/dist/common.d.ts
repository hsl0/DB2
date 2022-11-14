export declare const STORAGE: unique symbol;
export declare const MEMBERS: unique symbol;
export declare const GET_MEMBERS: unique symbol;
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
    set(this: StorageOrigin<T>, key: string, value: string | null): void;
    delete?(this: StorageOrigin<T>, key: string): void;
}
export interface RemoteStorageOriginInit<T> extends StorageOriginInit<T> {
    readonly needSync: true;
    push(this: RemoteStorageOrigin<T>): PromiseLike<any>;
    pull(this: RemoteStorageOrigin<T>): PromiseLike<any>;
    keys(this: RemoteStorageOrigin<T>): Set<string>;
    get(this: RemoteStorageOrigin<T>, key: string): string | null;
    set(this: RemoteStorageOrigin<T>, key: string, value: string | null): void;
    delete?(this: RemoteStorageOrigin<T>, key: string): void;
}
export interface LocalStorageOriginInit<T> extends StorageOriginInit<T> {
    readonly needSync: false;
    keys(this: LocalStorageOrigin<T>): Set<string>;
    get(this: LocalStorageOrigin<T>, key: string): string | null;
    set(this: LocalStorageOrigin<T>, key: string, value: string | null): void;
    delete?(this: LocalStorageOrigin<T>, key: string): void;
}
interface StorageOriginBase<T> extends EventTarget, StorageOriginInit<T> {
    keys(): Set<string>;
    get(key: string): string | null;
    set(key: string, value: string | null): void;
    delete(key: string): void;
}
export interface RemoteStorageOrigin<T> extends StorageOriginBase<T>, RemoteStorageOriginInit<T> {
    stage: Record<string, string | null>;
    unsaved: boolean;
    needSync: true;
    delete(key: string): void;
}
export interface LocalStorageOrigin<T> extends StorageOriginBase<T>, LocalStorageOriginInit<T> {
    needSync: false;
    delete(key: string): void;
}
declare type StorageOrigin<T> = RemoteStorageOrigin<T> | LocalStorageOrigin<T>;
declare const StorageOrigin: {
    new <T>(init: RemoteStorageOriginInit<T>): RemoteStorageOrigin<T>;
    new <T_1>(init: LocalStorageOriginInit<T_1>): LocalStorageOrigin<T_1>;
};
export { StorageOrigin };
export declare const localOrigin: LocalStorageOrigin<Storage>;
export declare abstract class SyncableStorage<T> {
    protected abstract readonly [STORAGE]: StorageOrigin<T>;
    protected readonly [MEMBERS]: Set<string>;
    readonly [NAMESPACE]: string;
    readonly isRoot: boolean;
    readonly hasRemote: boolean;
    readonly keyEncoded: boolean;
    constructor(parent?: SyncableStorage<T>, namespace?: string, keyEncoder?: KeyEncoder);
    get unsaved(): boolean;
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
    pull(): PromiseLike<any>;
    push(): PromiseLike<any>;
    encodeKey(key: string): string;
    decodeKey(key: string): string;
    protected [ENCODE_KEY](key: string): string;
    protected [DECODE_KEY](key: string): string;
    protected [IS_MY_KEY](key: string): boolean;
    protected [GET_MEMBERS](parentMembers?: Set<string> | string[]): void;
}
