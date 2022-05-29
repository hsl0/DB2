//@ts-ignore
import {
    rootGameDB,
    encode,
    decode,
    getLocalNamespace,
    SyncableStorage,
} from './common.js';

const keyEncoder = {
    encoder: encode,
    decoder: decode,
    encodeNamespace: true,
    preEncodable: true,
};

export const localGameDB: SyncableStorage = rootGameDB.subset(
    getLocalNamespace(),
    keyEncoder
);
export const globalGameDB: SyncableStorage = rootGameDB.subset('#', keyEncoder);
