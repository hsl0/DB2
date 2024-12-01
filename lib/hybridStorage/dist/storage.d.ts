import { HybridStorage, type RemoteStorageOrigin } from './builder';
declare const _default: HybridStorage<import("./builder").StorageOrigin<string, string>, [<O>(local: O) => O & {
    push: () => Promise<void>;
    pull: () => Promise<void>;
}], RemoteStorageOrigin<string, string>, string>;
export = _default;
