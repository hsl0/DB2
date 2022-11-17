import {
    SyncableStorage,
    STORAGE,
    localOrigin,
    propOptions,
    PROMISE,
} from './common';

class LocalStorage extends SyncableStorage<Storage> {
    protected [PROMISE]!: Promise<true>;
    protected readonly [STORAGE]!: typeof localOrigin;

    pull() {
        return this[PROMISE];
    }

    push() {
        return this[PROMISE];
    }
}
LocalStorage.prototype[PROMISE] = Promise.resolve(true);
Object.defineProperties(LocalStorage.prototype, {
    [STORAGE]: {
        value: localOrigin,
        ...propOptions,
    },
});

export = new LocalStorage() as SyncableStorage<Storage>;
