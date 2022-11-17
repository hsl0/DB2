// common.ts, controller.ts에서 공용으로 사용
import hybridStorage = require('hybridStorage');
export type SyncableStorage = typeof hybridStorage;
/* option key 인코딩
    url인코딩
    % = _
    _ = __
*/
export function encode(key: string) {
    return encodeURIComponent(key)
        .replace(/\./g, '%2E')
        .replace(/!/g, '%21')
        .replace(/~/g, '%7E')
        .replace(/\*/g, '%2A')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/_/g, '__')
        .replace(/%/g, '_');
}
export function decode(key: string) {
    return decodeURIComponent(
        key.replace(/_(?=[a-zA-Z0-9]{2})/g, '%').replace(/__/g, '_')
    );
}
export const keyEncoder = {
    encoder: encode,
    decoder: decode,
};

export function getLocalNamespace(pagename = mw.config.get('wgPageName') as string) {
    const root = pagename.split('/')[0];
    if (pagename.includes(':')) {
        const [namespace, title] = root.split(':');
        return `${namespace.replace(/talk|토론/gi, '')}:${title}`;
    } else return `:${root}`;
}

export const rootGameDB: SyncableStorage = hybridStorage.subset(
    'gameDB-',
    keyEncoder
);
