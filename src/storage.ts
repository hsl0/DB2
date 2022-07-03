//@ts-ignore
// DB2 저장소와 호환되는 자바스크립트 인터페이스
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
