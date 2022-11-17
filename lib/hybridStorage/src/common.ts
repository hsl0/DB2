export const STORAGE = Symbol('storage');
export const MEMBERS = Symbol('member keys');
export const GET_MEMBERS = Symbol('get members');
export const NAMESPACE = Symbol('namespace');
export const ENCODE_KEY = Symbol('encode key');
export const DECODE_KEY = Symbol('decode key');
export const IS_MY_KEY = Symbol('Is it my key?');
export const PROMISE = Symbol('promise object');

// 런타임 readonly PropertyDescriptor 옵션
export const propOptions: PropertyDescriptor = {
    configurable: false,
    enumerable: true,
    writable: false,
};

// 인코더/디코더 묶음 객체
export interface KeyEncoder {
    encoder(key: string): string;
    decoder(key: string): string;
}

// 공통 StorageOrigin 생성 인자
interface StorageOriginInit<T> {
    readonly storage: T;
    readonly needSync: boolean;
    readonly namespace?: string;
    keys(this: StorageOrigin<T>): Set<string>;
    get(this: StorageOrigin<T>, key: string): string | null;
    set(this: StorageOrigin<T>, key: string, value: string | null): void;
    delete?(this: StorageOrigin<T>, key: string): void;
}

// 원격 전용 StorageOrigin 생성 인자
export interface RemoteStorageOriginInit<T> extends StorageOriginInit<T> {
    readonly needSync: true;

    push(this: RemoteStorageOrigin<T>): PromiseLike<any>;
    pull(this: RemoteStorageOrigin<T>): PromiseLike<any>;

    keys(this: RemoteStorageOrigin<T>): Set<string>;
    get(this: RemoteStorageOrigin<T>, key: string): string | null;
    set(this: RemoteStorageOrigin<T>, key: string, value: string | null): void;
    delete?(this: RemoteStorageOrigin<T>, key: string): void;
}

// 로컬 전용 StorageOrigin 생성 인자
export interface LocalStorageOriginInit<T> extends StorageOriginInit<T> {
    readonly needSync: false;

    keys(this: LocalStorageOrigin<T>): Set<string>;
    get(this: LocalStorageOrigin<T>, key: string): string | null;
    set(this: LocalStorageOrigin<T>, key: string, value: string | null): void;
    delete?(this: LocalStorageOrigin<T>, key: string): void;
}

interface StrictEvent<T extends string> extends Event {
    type: T;
}

interface StrictEventTarget<T extends { [_K: string]: Event }> extends EventTarget {
    addEventListener<_E extends T[_K], _K extends keyof T>(
        type: _K,
        callback: ((event: _E) => void) | { handleEvent(event: _E): void } | null,
        options?: boolean | AddEventListenerOptions
    ): void;
    dispatchEvent<
        _E extends Event,
        _R extends _E['type'] extends keyof T
            ? _E extends T[_E['type']]
                ? boolean
                : never
            : never
    >(
        event: _E
    ): _R;
    removeEventListener<_E extends T[_K], _K extends keyof T>(
        type: _K,
        callback: ((event: _E) => void) | { handleEvent(event: _E): void } | null,
        options?: EventListenerOptions | boolean
    ): void;
}

interface StorageOriginBase<T> extends EventTarget, StorageOriginInit<T> {
    keys(): Set<string>;
    get(key: string): string | null;
    set(key: string, value: string | null): void;
    delete(key: string): void;
}
export interface RemoteStorageOrigin<T>
    extends StorageOriginBase<T>,
        RemoteStorageOriginInit<T> {
    stage: Record<string, string | null>;
    unsaved: boolean;

    needSync: true;
    delete(key: string): void;
}
export interface LocalStorageOrigin<T>
    extends StorageOriginBase<T>,
        LocalStorageOriginInit<T> {
    needSync: false;
    delete(key: string): void;
}

// 원본 저장소 API 추상화 계층
type StorageOrigin<T> = RemoteStorageOrigin<T> | LocalStorageOrigin<T>;
const StorageOrigin = class StorageOrigin<T>
    extends EventTarget
    implements StorageOriginBase<T>
{
    readonly storage: T;
    stage?: Record<string, string | null>;
    unsaved?: boolean;
    readonly needSync: boolean;
    readonly namespace?: string;

    constructor(init: RemoteStorageOriginInit<T> | LocalStorageOriginInit<T>) {
        super();

        this.storage = init.storage;
        this.needSync = init.needSync;
        this.namespace = init.namespace;

        this.get = init.get;
        this.set = init.set;
        this.keys = init.keys;
        if (init.delete) this.delete = init.delete;

        if (init.needSync) {
            (this as RemoteStorageOrigin<T>).stage = {};
            (this as RemoteStorageOrigin<T>).unsaved = false;
            (this as RemoteStorageOrigin<T>).pull = init.pull;
            (this as RemoteStorageOrigin<T>).push = init.push;
        }
    }
    get: (key: string) => string | null;
    set: (key: string, value: string) => void;
    keys: () => Set<string>;
    delete(key: string): void {
        this.set(key, null as any);
    }
    push?(): PromiseLike<any>;
    pull?(): PromiseLike<any>;
} as {
    new <T>(init: RemoteStorageOriginInit<T>): RemoteStorageOrigin<T>;
    new <T>(init: LocalStorageOriginInit<T>): LocalStorageOrigin<T>;
};
export { StorageOrigin };

// localStorage API 추상화
export const localOrigin = new StorageOrigin<Storage>({
    storage: localStorage,
    needSync: false,
    set(key: string, value: string): void {
        this.storage.setItem(key, value);
    },
    delete(key: string): void {
        this.storage.removeItem(key);
    },
    get(key: string): string | null {
        return this.storage.getItem(key);
    },
    keys() {
        return new Set(Object.keys(this.storage));
    },
});

// 온라인/오프라인 공통 저장소 클래스
export abstract class SyncableStorage<T> {
    protected abstract readonly [STORAGE]: StorageOrigin<T>; // 원본이 저장되는 저장소
    protected readonly [MEMBERS]: Set<string>; // 인코딩을 거친 원본 저장소상의 소속 키

    protected readonly [NAMESPACE]: string; // (하위 저장소의 경우) 원본 저장소상 소속 키의 접두어
    protected abstract [PROMISE]: PromiseLike<any>; // 다음 push 결과값을 반환할 promise
    readonly isRoot: boolean; // 최상위 저장소 여부
    readonly hasRemote: boolean; // 동기화될 클라우드 저장소 존재 여부
    readonly keyEncoded: boolean; // 원본 키가 인코딩을 거쳤는지 여부

    constructor(
        parent?: SyncableStorage<T>,
        namespace = '',
        keyEncoder?: KeyEncoder
    ) {
        if (keyEncoder) {
            if (!keyEncoder.encoder || !keyEncoder.decoder)
                throw new TypeError('Encoder and decoder must be included');

            this.encodeKey = keyEncoder.encoder;
            this.decodeKey = keyEncoder.decoder;
            this.keyEncoded = true;
        } else this.keyEncoded = false;

        this.isRoot = !parent;
        this.hasRemote ??= this[STORAGE].needSync;
        this[NAMESPACE] =
            (parent ? parent[NAMESPACE] : this[STORAGE].namespace || '') + namespace;

        this[MEMBERS] = new Set();
        this[GET_MEMBERS](parent?.[MEMBERS] || this[STORAGE].keys());

        Object.defineProperties(this, {
            isRoot: propOptions,
            hasRemote: propOptions,
            keyEncoded: propOptions,
            [NAMESPACE]: propOptions,
        });
    }

    // 저장이 완료되지 않았는지 여부
    get unsaved(): boolean {
        return Boolean((this[STORAGE] as any).unsaved);
    }

    // 소속 키의 수
    get size(): number {
        return this[MEMBERS].size;
    }

    // 저장소 영역 초기화
    clear(): PromiseLike<any> {
        if (this.isRoot) throw new TypeError('Root storage cannot be cleared');

        this[MEMBERS].forEach((key) => {
            this[STORAGE].delete(key);
        });
        this[MEMBERS].clear();

        return this[PROMISE];
    }

    // 키 삭제
    delete(key: string): PromiseLike<any>;
    delete(keys: string[]): PromiseLike<any>;
    delete(...keys: string[]): PromiseLike<any>;
    delete(...keys: [string[]] | string[]) {
        if (Array.isArray(keys[0])) keys = keys[0];

        (keys as string[]).forEach((key) => {
            key = this[ENCODE_KEY](key);
            if (this[MEMBERS].has(key)) {
                this[STORAGE].delete(key);
                this[MEMBERS].delete(key);
            }
        });

        return this[PROMISE];
    }

    // 모든 키와 값에 대해 일괄 작업 수행
    forEach(
        callbackfn: (value: string, key: string, map: this) => void,
        thisArg?: any
    ): void {
        this[MEMBERS].forEach((key) => {
            const value = this[STORAGE].get(key);
            if (value !== null)
                callbackfn.call(thisArg, value, this[DECODE_KEY](key), this);
        });
    }

    // 특정 키의 값 불러오기
    get(key: string): string | null {
        if (key) return this[STORAGE].get(this[ENCODE_KEY](key));
        throw new TypeError(
            "Failed to execute 'get' on 'SyncableStorage': 1 argument required, but only 0 present."
        );
    }

    // 여러 키의 값 객체로 불러오기
    getAll(keys: string[]): Record<string, string>;
    getAll(...keys: string[]): Record<string, string>;
    getAll(...keys: [string[]] | string[]) {
        if (Array.isArray(keys[0])) keys = keys[0];

        const values: Record<string, string> = {};

        (keys as string[]).forEach((key) => {
            values[key] = this[STORAGE].get(this[ENCODE_KEY](key))!;
        });

        return values;
    }

    // 특정 키의 존재여부 확인
    has(key: string): boolean;
    has(keys: string[]): boolean;
    has(...keys: string[]): boolean;
    has(...keys: string[] | [string[]]) {
        if (Array.isArray(keys[0])) keys = keys[0];
        else if (!keys.length)
            throw new TypeError(
                "Failed to execute 'hasAll' on 'SyncableStorage': 1 argument required, but only 0 present."
            );

        for (const key of keys as string[]) {
            if (!this[MEMBERS].has(this[ENCODE_KEY](key))) {
                return false;
            }
        }

        return true;
    }

    // 키의 값을 변경
    set(key: string, value: string): PromiseLike<any>;
    set(entries: Record<string, string>): PromiseLike<any>;
    set(keys: string | Record<string, string>, value?: string) {
        switch (typeof keys) {
            case 'string':
                if (typeof value === 'string') {
                    const key = this[ENCODE_KEY](keys);
                    this[STORAGE].set(key, value);
                    this[MEMBERS].add(key);
                    return this[PROMISE];
                }
            case 'object':
                for (let key in keys as Record<string, string>) {
                    const value = (keys as Record<string, string>)[key];
                    key = this[ENCODE_KEY](key);
                    if (typeof value === 'string') {
                        this[STORAGE].set(key, value);
                        this[MEMBERS].add(key);
                    }
                }
                return this[PROMISE];
            default:
                throw new TypeError(
                    "Failed to execute 'set' on 'SyncableStorage': 1 argument required, but only 0 present."
                );
        }
    }
    // 소속 키 목록 불러오기 (인코딩되지 않은/디코딩된 키)
    keys(): string[] {
        return [...this[MEMBERS]].map((key) => this[DECODE_KEY](key));
    }

    // 저장된 모든 키의 값을 객체로 불러오기
    values(): Record<string, string> {
        const values: Record<string, string> = {};

        this[MEMBERS].forEach((key) => {
            const value = this[STORAGE].get(key);
            if (value !== null) values[this[DECODE_KEY](key)] = value;
        });

        return values;
    }

    // 키 접두어를 설정하여 하위 저장소를 만들기
    subset(namespace: string, keyEncoder?: KeyEncoder): this {
        if (!namespace)
            throw new TypeError(
                "Failed to execute 'subset' on 'SyncableStorage': 1 argument required, but only 0 present."
            );
        if (keyEncoder && (!keyEncoder.encoder || !keyEncoder.decoder))
            throw new TypeError('Encoder and decoder must be included');
        return new (this.constructor as new (
            parent?: SyncableStorage<T>,
            namespace?: string,
            keyEncoder?: KeyEncoder
        ) => this)(this, this.encodeKey(namespace), keyEncoder);
    }

    // 클라우드 저장소에서 최신 데이터 불러오기
    pull(): PromiseLike<any> {
        return this[PROMISE];
    }

    // 클라우드 저장소에 수정사항 저장하기
    push(): PromiseLike<any> {
        return this[PROMISE];
    }

    // 키 인코딩하기 (원본 저장소상 키 이름으로 변환)
    encodeKey(key: string): string {
        return key;
    }

    // 키 디코딩하기 (원본 저장소상 키 이름에서 변환)
    decodeKey(key: string): string {
        return key;
    }

    // 키 인코딩 내부함수 (접두어+인코딩된 키)
    protected [ENCODE_KEY](key: string): string {
        return this[NAMESPACE] + this.encodeKey(key);
    }

    // 키 디코딩 내부함수 (접두어를 제거하고 디코딩된 키 추출)
    protected [DECODE_KEY](key: string): string {
        return this.decodeKey(key.slice(this[NAMESPACE].length));
    }

    // 소속 키 여부 확인 (접두어 일치 확인, [GET_MEMBERS]에서 사용)
    protected [IS_MY_KEY](key: string): boolean {
        return key.startsWith(this[NAMESPACE]);
    }

    // [MEMBERS] 배열 갱신 (init에서 기존 데이터를 불러올 때 활용)
    protected [GET_MEMBERS](
        parentMembers: Set<string> | string[] = this[STORAGE].keys()
    ): void {
        this[MEMBERS].clear();
        parentMembers.forEach((key) => {
            if (this[IS_MY_KEY](key)) this[MEMBERS].add(key);
        });
    }
}

// 클라우드에 업로드 불가능할 때, 로컬에 임시 저장하는 클래스
class BackupStorage<T, U> {
    readonly subNamespace: string; // 임시 데이터 저장소의 하위 네임스페이스
    deviceID: string; // 기기 ID (충돌시 대처)
    userID: string; // 사용자 ID (로그인된 사용자를 추적할 수 없도록 난수 사용)
    unsaved: boolean; // 저장이 완료되지 않았는지 여부
    private cryptoKeyPromise?: PromiseLike<CryptoKey>;
    cryptoKey?: CryptoKey; // 저장소 암호화에 사용될 비밀키
    cache?: Record<string, string>; // 임시 저장된 데이터의 사본 (세션이 종료되지 않았을 때 불필요한 암호화/복호화 방지)

    constructor(
        readonly storage: LocalStorageOrigin<T>, // 로컬 임시 저장소
        readonly remote: RemoteStorageOrigin<U>, // 클라우드 주 저장소
        readonly rootNamespace: string = '', // 시스템 설정을 저장하는 네임스페이스
        subNamespace = ''
    ) {
        if (!(storage instanceof StorageOrigin && remote instanceof StorageOrigin))
            throw new TypeError(
                'Target storage should be wrapped with StorageOrigin object'
            );

        this.subNamespace = this.rootNamespace + subNamespace;
        this.deviceID = this.getDeviceID();
        this.userID = this.getUserID();
        this.unsaved = this.storage.get(this.subNamespace + this.userID) !== null;
    }

    // 로컬 임시 저장소에 백업
    async backup(data: Record<string, string>): Promise<void> {
        data[this.rootNamespace + 'from'] = this.getFrom();
        this.cache = data;
        this.storage.set(this.subNamespace + this.userID, await this.encrypt(data));
    }

    // 클라우드 주 저장소에 백업 데이터 병합
    async merge(): Promise<any> {
        let data: Record<string, string>;

        if (this.cache) data = this.cache;
        else {
            const cipher = this.storage.get(this.subNamespace + this.userID);
            if (cipher) data = await this.decrypt(cipher);
            else return;
        }

        const from = this.remote.get(this.rootNamespace + 'from');
        if (from) {
        } else {
            this.remote.stage = { ...data, ...this.remote.stage };
            return this.remote.push();
        }
    }

    // 메타데이터와 함께 업로드
    async push(): Promise<any> {
        this.remote.push();
    }

    // 장치 ID 불러오기
    protected getDeviceID(): string {
        let id = this.storage.get(this.rootNamespace + '-id');
        if (!id) {
            id = crypto.randomUUID();
            this.storage.set(this.rootNamespace + 'id', id);
        }
        return id;
    }

    // 주 저장소에 마지막으로 저장한 장치/시간을 나타내는 from 메타데이터 값 불러오기
    protected getFrom(): string {
        return this.deviceID + '/' + Date.now();
    }

    // from 메타데이터에서 장치 ID/시간 추출
    protected static parseFrom(from: string): { deviceID: string; date: number } {
        const [deviceID, date] = from.split('/');
        return { deviceID, date: Number(date) };
    }

    // 바이너리를 base64 문자열로 변환
    protected static encodeBuffer(buffer: ArrayBuffer): string {
        return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer) as any));
    }

    // base64 문자열을 바이너리로 변환
    protected static decodeBuffer(base64: string): ArrayBuffer {
        return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
    }

    // 저장소 암호화
    protected async encrypt(data: Record<string, string>): Promise<string> {
        const iv: ArrayBuffer = crypto.getRandomValues(new Uint8Array());
        const cipher: ArrayBuffer = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv,
            },
            await this.getCryptoKey(),
            new TextEncoder().encode(JSON.stringify(data))
        );

        return (
            BackupStorage.encodeBuffer(iv) + ',' + BackupStorage.encodeBuffer(cipher)
        );
    }

    // 저장소 복호화
    protected async decrypt(set: string): Promise<Record<string, string>> {
        const [iv, cipher]: string[] = set.split(',');
        return JSON.parse(
            new TextDecoder().decode(
                await crypto.subtle.decrypt(
                    {
                        name: 'AES-GCM',
                        iv: BackupStorage.decodeBuffer(iv),
                    },
                    await this.getCryptoKey(),
                    BackupStorage.decodeBuffer(cipher)
                )
            )
        );
    }

    // 사용자 ID 불러오기 (서버에 없으면 생성후 저장)
    protected getUserID(): string {
        let id = this.remote.get(this.rootNamespace + 'id');
        if (!id) {
            id = crypto.randomUUID();
            this.remote.set(this.rootNamespace + 'id', id);
        }
        return id;
    }

    // 비밀키 불러오기 (서버에 없으면 생성후 저장)
    protected getCryptoKey(): PromiseLike<CryptoKey> | CryptoKey {
        if (this.cryptoKey) return this.cryptoKey;

        if (!this.cryptoKeyPromise) {
            const cryptoKeyStr = this.remote.get(this.rootNamespace + 'cryptokey');
            if (cryptoKeyStr) {
                this.cryptoKeyPromise = BackupStorage.importCryptoKey(cryptoKeyStr);
            } else {
                this.cryptoKeyPromise = BackupStorage.generateCryptoKey();
                this.cryptoKeyPromise
                    .then((key) => BackupStorage.exportCryptoKey(key))
                    .then((key) => {
                        this.remote.set(this.rootNamespace + 'cryptokey', key);
                    });
            }
        }

        this.cryptoKeyPromise.then((key) => {
            this.cryptoKey = key;
        });

        return this.cryptoKeyPromise;
    }

    // 비밀키 생성
    protected static generateCryptoKey(): PromiseLike<CryptoKey> {
        return crypto.subtle.generateKey(
            {
                name: 'AES-GCM',
                length: 128,
            },
            true,
            ['encrypt', 'decrypt']
        );
    }

    // 비밀키 문자열로 내보내기
    protected static async exportCryptoKey(key: CryptoKey): Promise<string> {
        return JSON.stringify(await crypto.subtle.exportKey('jwk', key));
    }

    // 비밀키 불러오기
    protected static importCryptoKey(key: string): PromiseLike<CryptoKey> {
        return crypto.subtle.importKey(
            'jwk',
            JSON.parse(key),
            { name: 'AES-GCM' },
            false,
            ['encrypt', 'decrypt']
        );
    }
}
