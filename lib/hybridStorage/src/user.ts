/// <reference types="mediawiki/mw" />
import { SyncableStorage, StorageOrigin, STORAGE } from './common';

export const CACHE = Symbol('temporary storage cache');
export const STAGE = Symbol('stageed data cache');

const api = new mw.Api();

// 미디어위키 options API (mw.user.options) 추상화
const remoteOrigin = new StorageOrigin<mw.Map>({
    storage: mw.user.options,
    needSync: true,
    namespace: 'userjs-',
    get(key: string): string | null {
        return this.stage![key] || this.storage.get(key);
    },
    set(key: string, value: string): void {
        this.stage![key] = value;
        this.unsaved = true;
    },
    delete(key: string) {
        this.stage![key] = null;
        this.unsaved = true;
    },
    keys() {
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
    push(): PromiseLike<void> {
        const stage = this.stage as Record<string, string>;
        this.stage = {};
        this.unsaved = false;

        return api
            .saveOptions(stage)
            .catch((code: string, info?: Object) =>
                $.Deferred().reject(stage, code, info)
            );
    },
});

class CloudStorage extends SyncableStorage<mw.Map> {
    protected readonly [STORAGE] = remoteOrigin;
    readonly hasRemote = true;

    async pull() {}

    async push() {}
}

//@ts-ignore
export = new CloudStorage() as SyncableStorage<any>;
