import { SyncableStorage, STORAGE, localOrigin } from './common';

class LocalStorage extends SyncableStorage<Storage> {
    protected readonly [STORAGE] = localOrigin;
    readonly hasRemote = false;

    pull() {
        return Promise.resolve(true);
    }

    push() {
        return Promise.resolve(true);
    }
}

//@ts-ignore
export = new LocalStorage() as SyncableStorage;
