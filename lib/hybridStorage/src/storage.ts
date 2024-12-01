import {
    HybridStorage,
    webStorageOrigin,
    remoteStage,
    storagePrefixer,
    cacheSyncPromise,
    dummyRemoteDecorator,
    type RemoteStorageOrigin,
    type RemoteStorageDecorator,
} from './builder';

const api = new mw.Api();

export = mw.user.isAnon()
    ? new HybridStorage(webStorageOrigin(localStorage), dummyRemoteDecorator)
    : new HybridStorage(
          remoteStage<string, string>({
              //@ts-ignore 강제로 덮어쓰기
              initialState: mw.user.options.values,
              pull() {
                  return Promise.resolve(
                      api
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
                                  response.query.userinfo.options as Record<
                                      string,
                                      string
                                  >
                          )
                  );
              },
              async push(changed: Record<string, string | null>, removed) {
                  for (const key of removed) changed[key] = null;
                  await api.saveOptions(changed);
              },
              async onPull(promise) {
                  //@ts-ignore 강제로 덮어쓰기
                  mw.user.options.values = await promise;
              },
          }),
          storagePrefixer('userjs-') satisfies RemoteStorageDecorator<
              RemoteStorageOrigin<string, string>
          >,
          cacheSyncPromise
      );
