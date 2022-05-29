import hybridStorage = require('./hybridStorage');
export declare type SyncableStorage = typeof hybridStorage;
export declare function encode(key: string): string;
export declare function decode(key: string): string;
export declare function getLocalNamespace(pagename?: string): string;
export declare const rootGameDB: SyncableStorage;
