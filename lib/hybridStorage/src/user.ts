/// <reference types="mediawiki/mw" />
import { SyncableStorage, StorageOrigin, STORAGE, propOptions, PROMISE } from './common';

const RESOLVE = Symbol('promise resolver function');

const api = new mw.Api();

// 미디어위키 options API (mw.user.options) 추상화
const remoteOrigin = new StorageOrigin<mw.Map>({
    storage: mw.user.options,
    needSync: true,
    namespace: 'userjs-',
    get(key: string): string | null {
        return this.stage[key] || this.storage.get(key);
    },
    set(key: string, value: string): void {
        this.stage[key] = value;
        this.unsaved = true;
    },
    delete(key: string) {
        this.stage[key] = null;
        this.unsaved = true;
    },
    keys(): Set<string> {
        const keys = new Set(Object.keys(this.storage.get()));

        for (const key in this.stage) {
            if (this.stage[key] === null) keys.delete(key);
            else keys.add(key);
        }

        return keys;
    },
    pull(): PromiseLike<void> {
        return api
            .get(
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
            });
    },
    push(): JQueryPromise<void> {
        return api.saveOptions(this.stage).then(
            () => {
                this.unsaved = false;
            },
            (code: string, info?: Object) => {
                return $.Deferred().reject(this.stage, code, info);
            }
        );
    },
});

class CloudStorage extends SyncableStorage<mw.Map> {
    protected readonly [STORAGE]!: typeof remoteOrigin;
    private [RESOLVE]!: (p: PromiseLike<any>) => void;
    protected [PROMISE]: Promise<any> = new Promise(resolve =>
    {
        this[RESOLVE] = resolve;
    });
    
    pull() {
        return this[STORAGE].pull();
    }

    push()
    {
        const result = this[STORAGE].push();
        this[RESOLVE](result);
        this[PROMISE] = new Promise(resolve =>
        {
            this[RESOLVE] = resolve;
        })
        return result;
    }
}
Object.defineProperties(CloudStorage.prototype, {
    [STORAGE]: {
        value: remoteOrigin,
        ...propOptions,
    },
});

export = new CloudStorage() as SyncableStorage<mw.Map>;
