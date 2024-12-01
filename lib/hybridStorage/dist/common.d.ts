export declare const PARENT: unique symbol;
export declare const MEMBERS: unique symbol;
export declare const PULL_PROMISE: unique symbol;
export declare const PUSH_PROMISE: unique symbol;
export declare const CHANGED: unique symbol;
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
export interface RemoteStorageOriginPart extends RemoteStorageOriginSkeletonPart {
    push(): Promise<void>;
    pull(): Promise<void>;
}
type RemoteStorageOrigin<K extends string | number, V> = RemoteStorageOriginPart & StorageOrigin<K, V>;
type ObjectDecorator<O, R> = (origin: O) => R;
type SameTypeDecorator<T> = ObjectDecorator<T, T>;
type UnionTypeDecorator<O, R> = ObjectDecorator<O, O & R>;
type StorageDecorator<O extends StorageOriginSkeleton, R extends StorageOriginSkeleton = O> = ObjectDecorator<O, R>;
type DecoratorChain<H, A extends ObjectDecorator<any, any>[]> = A extends [
    infer D,
    ...infer N
] ? D extends ObjectDecorator<any, any> ? [
    ObjectDecorator<H, any> extends D ? D : never,
    ...(N extends ObjectDecorator<any, any>[] ? DecoratorChain<SameTypeDecorator<H> extends D ? H : UnionTypeDecorator<H, unknown> extends D ? H & ReturnType<D> : ReturnType<D>, N> : never)
] : never : A extends [] ? A : never;
export interface RemoteStageInit {
    initialState?: Record<string, string>;
    push(changed: Record<string, string>, removed: Set<string>): Promise<void>;
    pull(): Promise<Record<string, string>>;
    onPush?: (promise: Promise<void>) => void;
    onPull?: (promise: Promise<Record<string, string>>) => void;
}
export declare const remoteStage: (init: RemoteStageInit) => {
    keys: () => Set<string>;
    get: (key: string) => string | null;
    set(key: string, value: string): void;
    delete(key: string): void;
    pull(): Promise<void>;
    push(): Promise<void>;
};
export interface StorageEncoderInit<E extends string, D extends string> {
    encodeKey: (key: D) => E;
    decodeKey: (key: E) => D;
}
export declare const storageEncoder: <E extends string, D extends string>({ encodeKey, decodeKey, }: StorageEncoderInit<E, D>) => <O extends StorageOrigin<E, string>>(storage: O) => StorageOrigin<D, string> & Omit<O, keyof StorageOrigin<E, string>>;
export declare const storagePrefixer: <P extends string>(prefix: P) => <K extends O extends StorageOrigin<infer S, string> ? string extends S ? string : Extract<S, `${P}${string}`> extends `${P}${infer K_1}` ? K_1 : never : never, O extends StorageOrigin<string, string>>(storage: O) => StorageOrigin<K, string> & Omit<O, keyof StorageOrigin<string, string>>;
export declare const webStorageOrigin: (storage: Storage) => StorageOrigin<string, string>;
export declare const localStorageOrigin: StorageOrigin<string, string>;
export declare class HybridStorage<O extends Partial<RemoteStorageOrigin<string, string>>, D extends StorageDecorator<any, any>[], P extends RemoteStorageOrigin<string, string>, K extends P extends RemoteStorageOrigin<infer K, string> ? K : never> implements RemoteStorageOrigin<string, string> {
    protected readonly [PARENT]: P;
    protected [MEMBERS]?: Set<K>;
    protected [PUSH_PROMISE]: Promise<any> | null;
    protected [PULL_PROMISE]: Promise<any> | null;
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
