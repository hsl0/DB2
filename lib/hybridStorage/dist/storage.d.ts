import { RemoteStorageHelper, type RemoteStorageOrigin } from './builder';
declare const _default: RemoteStorageHelper<import("./builder").StorageOrigin<string, string>, [<O>(local: O) => O & {
    push: () => Promise<void>;
    pull: () => Promise<void>;
}], RemoteStorageOrigin<string | number, string>, string | number>;
export = _default;
