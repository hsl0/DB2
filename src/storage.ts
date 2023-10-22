// DB2 저장소와 호환되는 자바스크립트 인터페이스
import {
    rootGameDB,
    keyEncoder,
    getLocalNamespace,
    SyncableStorage,
} from './common.js';

export const localGameDB: SyncableStorage = rootGameDB.subset(
    getLocalNamespace(),
    keyEncoder
);
export const globalGameDB: SyncableStorage = rootGameDB.subset('#', keyEncoder);
