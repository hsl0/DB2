import {
    HybridStorage,
    PARENT,
    PUSH_PROMISE,
    remoteStage,
    DecoratedRemoteStorage,
    storagePrefixer,
} from './common';

const RESOLVE = Symbol('promise resolver function');

const api = new mw.Api();

// 미디어위키 options API (mw.user.options) 추상화
const remoteOrigin = new DecoratedRemoteStorage(
    remoteStage({
        //@ts-ignore 강제로 덮어쓰기
        initialState: mw.user.options.values,
        pull() {
            return api
                .get(
                    {
                        action: 'query',
                        meta: 'userinfo',
                        uiprop: 'options',
                    },
                    {
                        cache: false,
                    }
                )
                .then(
                    (response) =>
                        response.query.userinfo.options as Record<string, string>
                );
        },
        push(changed: Record<string, string | null>, removed) {
            for (const key of removed) changed[key] = null;
            return api.saveOptions(changed);
        },
        async onPull(promise) {
            //@ts-ignore 강제로 덮어쓰기
            mw.user.options.values = await promise;
        },
    }),
    storagePrefixer('userjs-')
);

class CloudStorage extends HybridStorage<mw.Map> {
    protected readonly [PARENT]!: typeof remoteOrigin;
    private [RESOLVE]!: (p: PromiseLike<any>) => void;
    protected [PUSH_PROMISE]: Promise<any> = new Promise((resolve) => {
        this[RESOLVE] = resolve;
    });

    pull() {
        return this[PARENT].pull();
    }

    push() {
        const result = this[PARENT].push();
        this[RESOLVE](result);
        this[PUSH_PROMISE] = new Promise((resolve) => {
            this[RESOLVE] = resolve;
        });
        return result;
    }
}
Object.defineProperties(CloudStorage.prototype, {
    [PARENT]: {
        value: remoteOrigin,
        ...propOptions,
    },
});

export = new CloudStorage() as HybridStorage<mw.Map>;
