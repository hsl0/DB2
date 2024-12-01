import {
    HybridStorage,
    PARENT,
    localStorageOrigin,
    propOptions,
    PUSH_PROMISE,
} from './common';

class LocalStorage extends HybridStorage<Storage> {
    protected [PUSH_PROMISE]!: Promise<true>;
    protected readonly [PARENT]!: typeof localStorageOrigin;

    pull() {
        return this[PUSH_PROMISE];
    }

    push() {
        return this[PUSH_PROMISE];
    }
}
LocalStorage.prototype[PUSH_PROMISE] = Promise.resolve(true);
Object.defineProperties(LocalStorage.prototype, {
    [PARENT]: {
        value: localStorageOrigin,
        ...propOptions,
    },
});

export = new LocalStorage() as HybridStorage<Storage>;
