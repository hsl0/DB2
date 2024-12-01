declare const PARENT: unique symbol;
declare const MEMBERS: unique symbol;
type AnyFunction<R = any> = (...args: any) => R;
interface StorageOriginSkeleton {
    keys: AnyFunction;
    get: AnyFunction;
    set: AnyFunction;
    delete: AnyFunction;
}
export interface StorageOrigin<K, V> extends StorageOriginSkeleton {
    keys(): Set<K>;
    get(key: K): V | null | undefined;
    set(key: K, value: V): void;
    delete(key: K): void;
}
interface RemoteStorageOriginSkeletonPart {
    push: AnyFunction;
    pull: AnyFunction;
}
type RemoteStorageOriginSkeleton = StorageOriginSkeleton & RemoteStorageOriginSkeletonPart;
export interface RemoteStorageOriginPart extends RemoteStorageOriginSkeletonPart {
    push(): Promise<void>;
    pull(): Promise<void>;
}
export type RemoteStorageOrigin<K extends string | number, V> = RemoteStorageOriginPart & StorageOrigin<K, V>;
export type ObjectDecorator<O, R> = (origin: O) => R;
type SameTypeDecorator<T> = ObjectDecorator<T, T>;
type UnionTypeDecorator<O, R> = ObjectDecorator<O, O & R>;
export type StorageDecorator<O extends StorageOriginSkeleton, R extends StorageOriginSkeleton = O> = ObjectDecorator<O, R>;
type DecoratorChain<H, A extends ObjectDecorator<any, any>[]> = A extends [
    infer D,
    ...infer N
] ? D extends ObjectDecorator<any, any> ? [
    ObjectDecorator<H, any> extends D ? D : unknown,
    ...(N extends ObjectDecorator<any, any>[] ? DecoratorChain<SameTypeDecorator<H> extends D ? H : UnionTypeDecorator<H, unknown> extends D ? H & ReturnType<D> : ReturnType<D>, N> : [])
] : unknown : A extends [] ? A : never;
export type RemoteStorageDecorator<O extends RemoteStorageOriginSkeleton, R extends RemoteStorageOriginSkeleton = O> = StorageDecorator<O, R>;
export declare function decorate<O, R>(origin: O, ...decorators: [ObjectDecorator<O, R>]): R;
export declare function decorate<O, R, I1>(origin: O, ...decorators: [ObjectDecorator<O, I1>, ObjectDecorator<I1, R>]): R;
export declare function decorate<O, R, I1, I2>(origin: O, ...decorators: [
    ObjectDecorator<O, I1>,
    ObjectDecorator<I1, I2>,
    ObjectDecorator<I2, R>
]): R;
export declare function decorate<O, R, I1, I2, I3>(origin: O, ...decorators: [
    ObjectDecorator<O, I1>,
    ObjectDecorator<I1, I2>,
    ObjectDecorator<I2, I3>,
    ObjectDecorator<I3, R>
]): R;
export declare function decorate<O, R, I1, I2, I3, I4>(origin: O, ...decorators: [
    ObjectDecorator<O, I1>,
    ObjectDecorator<I1, I2>,
    ObjectDecorator<I2, I3>,
    ObjectDecorator<I3, I4>,
    ObjectDecorator<I4, R>
]): R;
export declare function decorate<O, R, I1, I2, I3, I4, I5>(origin: O, ...decorators: [
    ObjectDecorator<O, I1>,
    ObjectDecorator<I1, I2>,
    ObjectDecorator<I2, I3>,
    ObjectDecorator<I3, I4>,
    ObjectDecorator<I4, I5>,
    ObjectDecorator<I5, R>
]): R;
export declare function decorate<O, R, I1, I2, I3, I4, I5, I6>(origin: O, ...decorators: [
    ObjectDecorator<O, I1>,
    ObjectDecorator<I1, I2>,
    ObjectDecorator<I2, I3>,
    ObjectDecorator<I3, I4>,
    ObjectDecorator<I4, I5>,
    ObjectDecorator<I5, I6>,
    ObjectDecorator<I6, R>
]): R;
export declare function decorate<O, R, I1, I2, I3, I4, I5, I6, I7>(origin: O, ...decorators: [
    ObjectDecorator<O, I1>,
    ObjectDecorator<I1, I2>,
    ObjectDecorator<I2, I3>,
    ObjectDecorator<I3, I4>,
    ObjectDecorator<I4, I5>,
    ObjectDecorator<I5, I6>,
    ObjectDecorator<I6, I7>,
    ObjectDecorator<I7, R>
]): R;
export declare function decorate<O, R, I1, I2, I3, I4, I5, I6, I7, I8>(origin: O, ...decorators: [
    ObjectDecorator<O, I1>,
    ObjectDecorator<I1, I2>,
    ObjectDecorator<I2, I3>,
    ObjectDecorator<I3, I4>,
    ObjectDecorator<I4, I5>,
    ObjectDecorator<I5, I6>,
    ObjectDecorator<I6, I7>,
    ObjectDecorator<I7, I8>,
    ObjectDecorator<I8, R>
]): R;
export declare function decorate<O, R, I1, I2, I3, I4, I5, I6, I7, I8, I9>(origin: O, ...decorators: [
    ObjectDecorator<O, I1>,
    ObjectDecorator<I1, I2>,
    ObjectDecorator<I2, I3>,
    ObjectDecorator<I3, I4>,
    ObjectDecorator<I4, I5>,
    ObjectDecorator<I5, I6>,
    ObjectDecorator<I6, I7>,
    ObjectDecorator<I7, I8>,
    ObjectDecorator<I8, I9>,
    ObjectDecorator<I9, R>
]): R;
export declare function decorate<O, R, D extends ObjectDecorator<any, any>[]>(origin: O, ...decorators: D & DecoratorChain<NoInfer<O>, NoInfer<D>> & ([...ObjectDecorator<any, any>[], ObjectDecorator<any, R>] | [])): R;
export interface RemoteStageInit<K extends string | number, V> {
    initialState?: Record<K, V>;
    push(changed: Record<K, V>, removed: Set<K>): Promise<void>;
    pull(): Promise<Record<K, V>>;
    onPush?: (promise: Promise<void>) => void;
    onPull?: (promise: Promise<Record<K, V>>) => void;
}
export declare const remoteStage: <K extends string | number, V>(init: RemoteStageInit<K, V>) => {
    keys: () => Set<K>;
    get: (key: K) => NonNullable<Record<K, V>[K]> | null;
    set(key: K, value: V): void;
    delete(key: K): void;
    pull(): Promise<void>;
    push(): Promise<void>;
};
export declare const cacheSyncPromise: <O extends RemoteStorageOriginPart>(storage: O) => O;
export declare const dummyRemoteDecorator: <O>(local: O) => O & {
    push: () => Promise<void>;
    pull: () => Promise<void>;
};
export interface StorageEncoderInit<E extends string, D extends string> {
    encodeKey: (key: D) => E;
    decodeKey: (key: E) => D;
}
export declare const storageEncoder: <E extends string, D extends string>({ encodeKey, decodeKey, }: StorageEncoderInit<E, D>) => <O extends StorageOrigin<E, string>>(storage: O) => StorageOrigin<D, string> & Omit<O, keyof StorageOrigin<E, string>>;
export declare const storagePrefixer: <P extends string>(prefix: P) => <K extends string, V extends O extends StorageOrigin<string, infer V_1> ? V_1 : never, O extends StorageOrigin<`${P}${K}` | string, any>>(storage: O) => StorageOrigin<K, V> & Omit<O, keyof StorageOrigin<K, V>>;
export declare const webStorageOrigin: (storage: Storage) => StorageOrigin<string, string>;
export declare const localStorageOrigin: StorageOrigin<string, string>;
export declare class HybridStorage<O extends Partial<RemoteStorageOrigin<string, string>>, D extends StorageDecorator<any, any>[], P extends RemoteStorageOrigin<string, string>, K extends P extends RemoteStorageOrigin<infer K, string> ? K : never> implements RemoteStorageOrigin<string, string> {
    protected readonly [PARENT]: P;
    protected [MEMBERS]?: Set<K>;
    constructor(parent: O, ...decorators: D & DecoratorChain<NoInfer<O>, NoInfer<D>> & ([
        ...ObjectDecorator<any, any>[],
        ObjectDecorator<any, RemoteStorageOrigin<string, string>>
    ] | []));
    static decorator<O extends Partial<RemoteStorageOrigin<string, string>>>(parent: O): HybridStorage<O, [], RemoteStorageOrigin<string, string>, string>;
    get size(): number;
    clear(): void;
    delete(...keys: K[]): void;
    forEach(callbackfn: (value: string, key: K, map: this) => void, thisArg?: any): void;
    get(key: K): string | null;
    getAll<D extends Record<K, unknown>>(defaults: D): {
        [K in keyof D]: D[K] | string;
    };
    getAll<T extends Iterable<K>>(keys: T): {
        [K in keyof T]: string | null;
    };
    getAll(): Record<K, string>;
    has(key: string): key is K;
    hasAll(...keys: string[]): typeof keys extends K[] ? true : false;
    hasSome<T extends string>(...keys: T[]): T & K extends never ? false : true;
    set(key: K, value: string): void;
    set(entries: Record<K, string | null>): void;
    keys(): Set<K>;
    decorate<D extends StorageDecorator<any, any>[]>(...decorators: D & DecoratorChain<NoInfer<O>, NoInfer<D>> & [
        ...ObjectDecorator<any, any>[],
        ObjectDecorator<any, RemoteStorageOrigin<string, string>>
    ]): HybridStorage<this, any, RemoteStorageOrigin<string, string>, string>;
    pull(): Promise<any>;
    push(): Promise<void>;
    sync(): Promise<any>;
}
export {};
