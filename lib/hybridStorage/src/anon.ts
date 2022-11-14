import { SyncableStorage, STORAGE, localOrigin, propOptions } from './common';

class LocalStorage extends SyncableStorage<Storage> {
    protected readonly [STORAGE]!: typeof localOrigin;

    pull() {
        return Promise.resolve(true);
    }

    push() {
        return Promise.resolve(true);
    }
}
Object.defineProperties(LocalStorage.prototype, {
    [STORAGE]: {
        value: localOrigin,
        ...propOptions,
    },
});

export = new LocalStorage() as SyncableStorage<Storage>;
