export const PARENT = Symbol('local storage origin');
export const MEMBERS = Symbol('member keys');
export const PULL_PROMISE = Symbol('pull promise object');
export const PUSH_PROMISE = Symbol('push promise object');
export const CHANGED = Symbol('changed keys');

type AnyFunction<R = any> = (...args: any) => R;
type DummyFunction = () => void;
const DummyFunction: DummyFunction = () => {};

type Key = string | number | symbol;

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

// 원격 전용 StorageOrigin 생성 인자
interface RemoteStorageOriginSkeletonPart {
    push: AnyFunction;
    pull: AnyFunction;
}

type RemoteStorageOriginSkeleton = StorageOriginSkeleton &
    RemoteStorageOriginSkeletonPart;

export interface RemoteStorageOriginPart extends RemoteStorageOriginSkeletonPart {
    push(): Promise<void>;
    pull(): Promise<void>;
}

type RemoteStorageOrigin<K extends string | number, V> = RemoteStorageOriginPart &
    StorageOrigin<K, V>;

type ObjectDecorator<O, R> = (origin: O) => R;
type SameTypeDecorator<T> = ObjectDecorator<T, T>;
type UnionTypeDecorator<O, R> = ObjectDecorator<O, O & R>;

type StorageDecorator<
    O extends StorageOriginSkeleton,
    R extends StorageOriginSkeleton = O
> = ObjectDecorator<O, R>;

type DecoratorChain<H, A extends ObjectDecorator<any, any>[]> = A extends [
    infer D,
    ...infer N
]
    ? D extends ObjectDecorator<any, any>
        ? [
              ObjectDecorator<H, any> extends D ? D : never,
              ...(N extends ObjectDecorator<any, any>[]
                  ? DecoratorChain<
                        SameTypeDecorator<H> extends D
                            ? H
                            : UnionTypeDecorator<H, unknown> extends D
                            ? H & ReturnType<D>
                            : ReturnType<D>,
                        N
                    >
                  : never)
          ]
        : never
    : A extends []
    ? A
    : never;

type RemoteStorageDecorator<
    O extends RemoteStorageOriginSkeleton,
    R extends RemoteStorageOriginSkeleton = O
> = StorageDecorator<O, R>;

function bindMethods<T>(obj: T, context: T = obj): T {
    const copied: Partial<T> = {};
    for (const key of [
        ...Object.getOwnPropertyNames(obj),
        ...Object.getOwnPropertySymbols(obj),
    ] as (keyof T)[]) {
        const value = obj[key];
        copied[key] = typeof value === 'function' ? value.bind(context) : value;
    }
    return copied as T;
}

function decorate<O, R>(origin: O, ...decorators: [ObjectDecorator<O, R>]): R;
function decorate<O, R, I1>(
    origin: O,
    ...decorators: [ObjectDecorator<O, I1>, ObjectDecorator<I1, R>]
): R;
function decorate<O, R, I1, I2>(
    origin: O,
    ...decorators: [
        ObjectDecorator<O, I1>,
        ObjectDecorator<I1, I2>,
        ObjectDecorator<I2, R>
    ]
): R;
function decorate<O, R, I1, I2, I3>(
    origin: O,
    ...decorators: [
        ObjectDecorator<O, I1>,
        ObjectDecorator<I1, I2>,
        ObjectDecorator<I2, I3>,
        ObjectDecorator<I3, R>
    ]
): R;
function decorate<O, R, I1, I2, I3, I4>(
    origin: O,
    ...decorators: [
        ObjectDecorator<O, I1>,
        ObjectDecorator<I1, I2>,
        ObjectDecorator<I2, I3>,
        ObjectDecorator<I3, I4>,
        ObjectDecorator<I4, R>
    ]
): R;
function decorate<O, R, I1, I2, I3, I4, I5>(
    origin: O,
    ...decorators: [
        ObjectDecorator<O, I1>,
        ObjectDecorator<I1, I2>,
        ObjectDecorator<I2, I3>,
        ObjectDecorator<I3, I4>,
        ObjectDecorator<I4, I5>,
        ObjectDecorator<I5, R>
    ]
): R;
function decorate<O, R, I1, I2, I3, I4, I5, I6>(
    origin: O,
    ...decorators: [
        ObjectDecorator<O, I1>,
        ObjectDecorator<I1, I2>,
        ObjectDecorator<I2, I3>,
        ObjectDecorator<I3, I4>,
        ObjectDecorator<I4, I5>,
        ObjectDecorator<I5, I6>,
        ObjectDecorator<I6, R>
    ]
): R;
function decorate<O, R, I1, I2, I3, I4, I5, I6, I7>(
    origin: O,
    ...decorators: [
        ObjectDecorator<O, I1>,
        ObjectDecorator<I1, I2>,
        ObjectDecorator<I2, I3>,
        ObjectDecorator<I3, I4>,
        ObjectDecorator<I4, I5>,
        ObjectDecorator<I5, I6>,
        ObjectDecorator<I6, I7>,
        ObjectDecorator<I7, R>
    ]
): R;
function decorate<O, R, I1, I2, I3, I4, I5, I6, I7, I8>(
    origin: O,
    ...decorators: [
        ObjectDecorator<O, I1>,
        ObjectDecorator<I1, I2>,
        ObjectDecorator<I2, I3>,
        ObjectDecorator<I3, I4>,
        ObjectDecorator<I4, I5>,
        ObjectDecorator<I5, I6>,
        ObjectDecorator<I6, I7>,
        ObjectDecorator<I7, I8>,
        ObjectDecorator<I8, R>
    ]
): R;
function decorate<O, R, I1, I2, I3, I4, I5, I6, I7, I8, I9>(
    origin: O,
    ...decorators: [
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
    ]
): R;
function decorate<O, R, D extends ObjectDecorator<any, any>[]>(
    origin: O,
    ...decorators: D &
        DecoratorChain<NoInfer<O>, NoInfer<D>> &
        ([...ObjectDecorator<any, any>[], ObjectDecorator<any, R>] | [])
): R;
function decorate<O, R, D extends ObjectDecorator<any, any>[]>(
    origin: O,
    ...decorators: D &
        DecoratorChain<NoInfer<O>, NoInfer<D>> &
        ([...ObjectDecorator<any, any>[], ObjectDecorator<any, R>] | [])
): R {
    let decorated: O | D[keyof D] = bindMethods(origin);

    for (const deco of decorators as D) {
        decorated = deco(bindMethods(decorated));
    }

    return decorated as R;
}

const recordOrigin = <K extends Key, V>(record: Record<K, V>) =>
    ({
        keys: () => new Set(Object.keys(record) as K[]),
        get: (key) => record[key] ?? null,
        set(key, value) {
            record[key] = value;
        },
        delete(key) {
            delete record[key];
        },
    } satisfies StorageOrigin<K, V>);
export interface RemoteStageInit {
    initialState?: Record<string, string>;

    push(changed: Record<string, string>, removed: Set<string>): Promise<void>;
    pull(): Promise<Record<string, string>>;

    onPush?: (promise: Promise<void>) => void;
    onPull?: (promise: Promise<Record<string, string>>) => void;
}
export const remoteStage = (init: RemoteStageInit) => {
    let state = recordOrigin(init.initialState ?? {});
    let changedKeys = new Set<string>();

    return {
        keys: state.keys,
        get: state.get,
        set(key, value) {
            state.set(key, value);
            changedKeys.add(key);
        },
        delete(key) {
            state.delete(key);
            changedKeys.add(key);
        },
        pull() {
            const waitingPull = Promise.resolve()
                .then(init.pull)
                .then((data) => {
                    const newState = { ...data };

                    for (const key of changedKeys) {
                        const value = state.get(key);
                        if (value) newState[key] = value;
                        else delete newState[key];
                    }

                    state = recordOrigin<string, string>(newState);

                    return newState;
                });
            init.onPull?.(waitingPull);
            return waitingPull.then(() => {});
        },
        push() {
            const waitingPush = Promise.resolve().then(() => {
                let oldChangedKeys = changedKeys;
                changedKeys = new Set();
                const changed = Object.fromEntries(
                    oldChangedKeys
                        .union(state.keys())
                        .values()
                        .map((key) => [key, state.get(key)!])
                );
                const removed = oldChangedKeys.difference(state.keys());
                return init.push(changed, removed);
            });
            init.onPush?.(waitingPush);
            return waitingPush;
        },
    } satisfies RemoteStorageOrigin<string, string>;
};

const cacheSyncPromise = <O extends RemoteStorageOriginPart>(storage: O): O => {
    let pushPromise: Promise<void> | null = null;
    let pullPromise: Promise<void> | null = null;

    return {
        ...storage,
        push() {
            if (!pushPromise)
                pushPromise = storage.push().finally(() => {
                    pushPromise = null;
                });

            return pushPromise;
        },
        pull() {
            if (!pullPromise)
                pullPromise = storage.pull().finally(() => {
                    pullPromise = null;
                });
            return pullPromise;
        },
    };
};

const dummyRemoteDecorator = <O>(local: O) =>
    ({
        ...local,
        push: () => Promise.resolve(),
        pull: () => Promise.resolve(),
    } satisfies O & RemoteStorageOriginSkeletonPart);

interface BackupUploadsInit {
    backupStorage: StorageOrigin<string, string>;
    prefix: string;
    profile: string;
    merger?: (
        local: Record<string, string | null>,
        remote: Record<string, string | null>
    ) => Record<string, string | null>;

    onConflict?(
        local: Record<string, string>,
        remote: Record<string, string>
    ): Promise<Record<string, string>>;
}

const backupUploads =
    ({ backupStorage, prefix, profile, merger }: BackupUploadsInit) =>
    (
        origin: RemoteStorageOrigin<string, string>
    ): RemoteStorageOrigin<string, string> => {
        backupStorage = decorate(backupStorage, storagePrefixer(prefix));
        let changedKeys = new Set<string>();

        function merge() {
            if (!merger) return;

            const saved = decorate(backupStorage, storagePrefixer(profile + '/'));

            if (new Set(saved.keys()).size < 0) return;

            const latest = Math.max(...[...saved.keys()].map((key) => Number(key)));
            const stage: Record<string, string | null> = JSON.parse(
                saved.get(String(latest))!
            );

            const remote: Record<string, string | null> = Object.fromEntries(
                [...origin.keys()].map((key) => [key, origin.get(key) ?? null])
            );

            const merged: Record<string, string | null> = merger(stage, remote);
            for (const [key, value] of Object.entries(merged)) {
                if (value) origin.set(key, value);
                else origin.delete(key);
            }
        }

        merge();

        return {
            ...origin,
            set(key, value) {
                origin.set(key, value);
                changedKeys.add(key);
            },
            delete(key) {
                origin.delete(key);
                changedKeys.add(key);
            },
            push: () => {
                const promise = origin.push();

                const stage = Object.fromEntries(
                    changedKeys.values().map((key) => [key, origin.get(key) ?? null])
                );
                const key = `${profile}/${Date.now()}`;

                backupStorage.set(key, JSON.stringify(stage));

                promise.then(() => {
                    backupStorage.delete(key);
                });

                return promise;
            },
            async pull() {
                await origin.pull();
                merge();
            },
        };
    };

export interface StorageEncoderInit<E extends string, D extends string> {
    encodeKey: (key: D) => E;
    decodeKey: (key: E) => D;
}

export const storageEncoder =
    <E extends string, D extends string>({
        encodeKey,
        decodeKey,
    }: StorageEncoderInit<E, D>) =>
    <O extends StorageOrigin<E, string>>(
        storage: O
    ): StorageOrigin<D, string> & Omit<O, keyof StorageOrigin<E, string>> => ({
        ...storage,
        keys: () => new Set(storage.keys().values().map(decodeKey)),
        get: (key) => storage.get(encodeKey(key)),
        set: (key, value) => storage.set(encodeKey(key), value),
        delete: (key) => storage.delete(encodeKey(key)),
    });

export const storagePrefixer =
    <P extends string>(prefix: P) =>
    <
        K extends O extends StorageOrigin<infer S, string>
            ? string extends S
                ? string
                : Extract<S, `${P}${string}`> extends `${P}${infer K}`
                ? K
                : never
            : never,
        O extends StorageOrigin<string, string>
    >(
        storage: O
    ): StorageOrigin<K, string> & Omit<O, keyof StorageOrigin<string, string>> => ({
        ...storage,
        keys: () =>
            new Set(
                storage
                    .keys()
                    .values()
                    .filter((key): key is `${P}${K}` => key.startsWith(prefix))
                    .map((key) => key.slice(prefix.length) as K)
            ),
        get: (key) => storage.get(prefix + key),
        set: (key, value) => storage.set(prefix + key, value),
        delete: (key) => storage.delete(prefix + key),
    });

// web Storage API 추상화
export const webStorageOrigin = (
    storage: Storage
): StorageOrigin<string, string> => ({
    set: (key, value) => storage.setItem(key, value),
    delete: (key: string) => storage.removeItem(key),
    get: (key: string) => storage.getItem(key),
    keys: () => new Set(Object.keys(storage)),
});

export const localStorageOrigin = webStorageOrigin(localStorage);

// 온라인/오프라인 공통 저장소 클래스
export class HybridStorage<
    O extends Partial<RemoteStorageOrigin<string, string>>,
    D extends StorageDecorator<any, any>[],
    P extends RemoteStorageOrigin<string, string>,
    K extends P extends RemoteStorageOrigin<infer K, string> ? K : never
> implements RemoteStorageOrigin<string, string>
{
    protected readonly [PARENT]: P; // 원본이 저장되는 저장소
    protected [MEMBERS]?: Set<K>;

    protected [PUSH_PROMISE]: Promise<any> | null = null;
    protected [PULL_PROMISE]: Promise<any> | null = null;

    constructor(
        parent: O,
        ...decorators: D &
            DecoratorChain<NoInfer<O>, NoInfer<D>> &
            (
                | [
                      ...ObjectDecorator<any, any>[],
                      ObjectDecorator<any, RemoteStorageOrigin<string, string>>
                  ]
                | []
            )
    ) {
        this[PARENT] = decorate(parent, ...(decorators as any));
    }

    static decorator<O extends Partial<RemoteStorageOrigin<string, string>>>(
        parent: O
    ) {
        return new HybridStorage(parent);
    }

    // 소속 키의 수
    get size(): number {
        return this.keys().size;
    }

    // 저장소 영역 초기화
    clear(): void {
        this.keys().forEach((key) => {
            this.delete(key);
        });
        this[MEMBERS]?.clear();
    }

    // 키 삭제
    delete(...keys: K[]): void {
        for (const key of keys) {
            this[PARENT].delete(key);
            this[MEMBERS]?.delete(key);
        }
    }

    // 모든 키와 값에 대해 일괄 작업 수행
    forEach(
        callbackfn: (value: string, key: K, map: this) => void,
        thisArg?: any
    ): void {
        for (const key of this.keys()) {
            const value = this.get(key);
            if (value) callbackfn.call(thisArg, value, key, this);
        }
    }

    // 특정 키의 값 불러오기
    get(key: K): string | null {
        if (key) return this[PARENT].get(key) ?? null;
        throw new TypeError(
            'HybridStorage의 get 메소드의 첫번째 인자는 문자열이어야 합니다. ' +
                (key === undefined
                    ? '인자가 비어있습니다.'
                    : `여기에 해당하지 않는 타입 '${typeof key}'을(를) 사용했습니다.`)
        );
    }

    // 여러 키의 값 객체로 불러오기
    getAll<D extends Record<K, unknown>>(
        defaults: D
    ): { [K in keyof D]: D[K] | string };
    getAll<T extends Iterable<K>>(keys: T): { [K in keyof T]: string | null };
    getAll(): Record<K, string>;
    getAll(keys: Record<K, unknown> | Iterable<K> | void) {
        const values: Record<string, unknown> = {};

        if (!keys) keys = this.keys();

        if (Symbol.iterator in keys) {
            for (const key of keys) {
                values[key] = this.get(key);
            }

            return values;
        }

        if (typeof keys === 'object') {
            const defaults: Record<K, unknown> = keys;
            keys = Object.keys(keys) as K[];

            for (const key of keys) {
                values[key] = this.get(key) ?? defaults[key];
            }

            return values;
        }

        throw new TypeError(
            `HybridStorage 객체의 getAll 메소드의 첫번째 인자는 유효한 객체 및 Iterator이거나 비어 있어야 합니다. 여기에 해당하지 않는 타입 '${typeof keys}'을(를) 사용했습니다.`
        );
    }

    // 특정 키의 존재여부 확인
    has(key: string): key is K {
        return this.keys().has(key as any);
    }
    hasAll(...keys: string[]): typeof keys extends K[] ? true : false {
        for (const key of keys) if (!this.has(key)) return false as any;

        return true as any;
    }
    hasSome<T extends string>(...keys: T[]): T & K extends never ? false : true {
        for (const key of keys) if (this.has(key)) return true as any;

        return false as any;
    }

    // 키의 값을 변경
    set(key: K, value: string): void;
    set(entries: Record<K, string | null>): void;
    set(keys: K | Record<K, string | null>, value?: string) {
        if (typeof keys === 'string' && typeof value === 'string') {
            this[PARENT].set(keys, value);
            this[MEMBERS]?.add(keys);
        } else if (typeof keys === 'object') {
            for (const [key, value] of Object.entries(keys) as [
                K,
                string | null
            ][]) {
                if (value === null) this.delete(key);
                else this.set(key, value);
            }
        } else
            throw new TypeError(
                "Failed to execute 'set' on 'SyncableStorage': 1 argument required, but only 0 present."
            );
    }
    // 소속 키 목록 불러오기 (인코딩되지 않은/디코딩된 키)
    keys(): Set<K> {
        if (this[MEMBERS]) return this[MEMBERS];
        return this[PARENT].keys() as Set<K>;
    }

    decorate<D extends StorageDecorator<any, any>[]>(
        ...decorators: D &
            DecoratorChain<NoInfer<O>, NoInfer<D>> &
            [
                ...ObjectDecorator<any, any>[],
                ObjectDecorator<any, RemoteStorageOrigin<string, string>>
            ]
    ) {
        return new HybridStorage(this, ...(decorators as any));
    }

    // 클라우드 저장소에서 최신 데이터 불러오기
    pull(): Promise<any> {
        return Promise.resolve(this[PARENT].pull());
    }

    // 클라우드 저장소에 수정사항 저장하기
    push(): Promise<void> {
        return Promise.resolve(this[PARENT].push());
    }

    sync(): Promise<any> {
        return Promise.all([this.pull(), this.push()]);
    }
}
