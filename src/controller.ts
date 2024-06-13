// 위키 문법을 통해 DB2 저장소 제어
import { localGameDB, globalGameDB } from './storage.js';
import { rootGameDB, getLocalNamespace, SyncableStorage } from './common.js';

import CGI2Parser = require('ext.gadget.CGI2-parser');

type MWNotification = {
    pause: () => void;
    resume: () => void;
    close: () => void;
};

function enableDB2() {
    function parseJSON(json: string): any {
        try {
            return JSON.parse(json);
        } catch {
            return;
        }
    }

    const title = getLocalNamespace();
    const useCGIProtect = Boolean(document.getElementById('protectCGI'));
    const currentSearch = useCGIProtect
        ? (parseJSON(sessionStorage.getItem('protectCGI') as string) as
              | Record<string, string>
              | undefined)
        : geturlSearch();
    const currentTitle =
        (useCGIProtect && currentSearch && currentSearch.title) ||
        (mw.config.get('wgPageName') as string);
    const handleError = notifyApiError.bind(null, '데이터 저장에 실패하였습니다.', {
        tag: 'gameDB',
        additionalMessage: '(<a href="##emergency-save">로컬에 임시 저장</a>)',
    });
    const temp = mw.user.isAnon()
        ? null
        : localStorage.getItem(
              ('gamedb-temp-' + mw.config.get('wgUserName')) as string
          );
    let noti: MWNotification;
    let instantDone = false;

    if (useCGIProtect) {
        if (currentSearch) delete currentSearch.title;
        else return;
    } else delete (currentSearch as Record<string, string>).title;

    if (currentSearch?.action) {
        $('.gameDB-container').removeClass('gameDB-container');
        return;
    }

    if (temp)
        registerTrigger(function () {
            function save() {
                noti = mw.notification.notify(
                    'DB2 데이터를 동기화하는 중입니다...',
                    {
                        autoHide: false,
                        tag: 'gameDB',
                        //@ts-ignore
                        type: 'pending',
                    }
                );

                DataChange.prototype.save.call(change).then(
                    function () {
                        noti = mw.notification.notify(
                            `DB2 데이터를 동기화하였습니다. (데이터 날짜: ${new Date(
                                change.timestamp
                            )})`,
                            { tag: 'gameDB' }
                        );
                        localStorage.removeItem(
                            'gamedb-temp-' + mw.config.get('wgUserName')
                        );
                        rootGameDB.push();
                    },

                    notifyApiError.bind(
                        null,
                        'DB2 데이터 동기화에 실패하였습니다. 다음 접속에 다시 시도합니다.',
                        { tag: 'gameDB' }
                    )
                );
            }

            const change: {
                local: Record<string, string>;
                global: Record<string, string>;
                root: Record<string, string>;
                deleteLocal: string[];
                deleteGlobal: string[];
                deleteRoot: string[];
                timestamp: number;
            } = JSON.parse(temp);

            if (Number(rootGameDB.get('timestamp')) > change.timestamp)
                mw.loader.using('ext.gadget.DB2-controller');
            else save();
        });

    class DataChange {
        params: Record<string, string>;
        local: Record<string, string> = {};
        global: Record<string, string> = {};
        root: Record<string, string> = {};
        deleteLocal: string[] = [];
        deleteGlobal: string[] = [];
        deleteRoot: string[] = [];
        refresh = false;
        paramChanged = false;

        constructor(href: string) {
            this.params = geturlSearch(new URL(href, location as unknown as URL));
        }
        control(element: HTMLElement) {
            let base: Record<string, string | null>,
                delBase: string[],
                key: string,
                storage: SyncableStorage,
                params: Record<string, string>,
                val: string | null | undefined,
                paramChanged: boolean;
            const data = element.dataset;

            /* 저장할 키
                    local: 키 지정
                    global: 전역 키 지정
                    local global: 키 지정
                    (없음): 기본 키
                */
            if ('local' in data && 'global' in data) {
                throw new TypeError('전역키와 일반키가 동시에 지정되었습니다');
            } else if ('local' in data) {
                storage = localGameDB;
                base = this.local;
                delBase = this.deleteLocal;
                key = data.local as string;
            } else if ('global' in data) {
                storage = globalGameDB;
                base = this.global;
                delBase = this.deleteGlobal;
                key = data.global as string;
            } else {
                storage = rootGameDB;
                base = this.root;
                delBase = this.deleteRoot;
                key = title;
            }

            switch (data.action) {
                // 호환
                case '저장':
                case 'save':
                    /*
                            create: 새 키를 생성할 때만 저장
                            savetitle: title 키(제목) 포함 저장
                        */
                    if (!('create' in data && key in base) && location.search)
                        base[key] = JSON.stringify(
                            Object.assign(
                                {},
                                currentSearch,
                                'savetitle' in data && {
                                    title: currentTitle,
                                }
                            )
                        );
                    break;

                case '로드':
                case 'load':
                    /*
                            safe: 파라미터가 있으면 불러오지 않음
                            fill: 없는 파라미터만 불러옴
                        */
                    if (!(location.search && 'safe' in data) && key in storage) {
                        Object.assign(
                            this.params,

                            parseJSON(storage.get(key) as string),
                            'fill' in data && this.params
                        );
                        this.paramChanged = true;
                    }
                    break;

                // 기본
                case '호출':
                case 'get':
                    /*
                            else: 저장된 데이터가 없을 때의 대체 텍스트
                        */
                    if (key in storage || data.else) {
                        if (!data.arg)
                            throw new TypeError(
                                '데이터를 내보낼 urlget 파라미터를 지정하지 않았습니다'
                            );
                        val = storage.get(key) || data.else;
                        if (val) {
                            this.params[data.arg] = val;
                            this.paramChanged = true;
                        }
                    }
                    break;

                case '수정':
                case 'set':
                    /*
                            create: 새 키를 생성할 때만 저장
                        */
                    if (!data.arg)
                        throw new TypeError('저장할 값이 지정되지 않았습니다');
                    if (!('create' in data && key in base)) base[key] = data.arg;
                    break;

                case '삭제':
                case '제거':
                case 'del':
                    delBase.push(key);
                    break;

                // JSON
                case 'JSON':
                case 'json':
                    /*
                            reset: 데이터 초기화
                        */
                    paramChanged = false;
                    params = this.params;
                    val = JSON.stringify(
                        new CGI2Parser<Record<string, string>>({
                            get(args) {
                                if (args && typeof args === 'object')
                                    Object.entries(
                                        args as Record<string, unknown>
                                    ).forEach(([key, value]) => {
                                        if (typeof value !== 'string')
                                            throw new TypeError(
                                                `'get' 동작에 유효하지 않은 인자가 입력되었습니다`
                                            );
                                        if (this[value]) {
                                            params[key] = this[value];
                                            paramChanged = true;
                                        }
                                    });
                                else
                                    Array.from(
                                        arguments as ArrayLike<unknown>
                                    ).forEach((key) => {
                                        if (typeof key !== 'string')
                                            throw new TypeError(
                                                `'get' 동작에 유효하지 않은 인자가 입력되었습니다`
                                            );
                                        if (this[key]) {
                                            params[key] = this[key];
                                            paramChanged = true;
                                        }
                                    });
                            },
                            set(args) {
                                if (!args || typeof args !== 'object')
                                    throw new TypeError(
                                        `'set' 동작의 유효한 인자 형식은 Object 이지만, ${typeof args} 형식의 ${args}가 입력되었습니다`
                                    );
                                Object.entries(
                                    args as Record<string, unknown>
                                ).forEach(([key, value]) => {
                                    if (
                                        typeof key !== 'string' ||
                                        typeof value !== 'string'
                                    )
                                        throw new TypeError(
                                            `'set' 동작에 유효하지 않은 인자가 입력되었습니다`
                                        );
                                    this[key] = value;
                                });
                            },
                            del() {
                                Array.from(arguments).forEach((key) => {
                                    delete this[key];
                                });
                            },
                            def(args) {
                                if (!args || typeof args !== 'object')
                                    throw new TypeError(
                                        `'def' 동작의 유효한 인자 형식은 Object 이지만, ${typeof args} 형식의 ${args}가 입력되었습니다`
                                    );
                                Object.entries(
                                    args as Record<string, unknown>
                                ).forEach(([key, value]) => {
                                    if (typeof value !== 'string')
                                        throw new TypeError(
                                            `'def' 동작에 유효하지 않은 인자가 입력되었습니다`
                                        );
                                    if (!(key in this)) this[key] = value;
                                });
                            },
                            sav(args) {
                                if (args && typeof args === 'object')
                                    Object.entries(
                                        args as Record<string, unknown>
                                    ).forEach(([key, value]) => {
                                        if (typeof value !== 'string')
                                            throw new TypeError(
                                                `'sav' 동작에 유효하지 않은 인자가 입력되었습니다`
                                            );
                                        this[key] =
                                            value === 'title'
                                                ? currentTitle
                                                : params[value];
                                    });
                                else
                                    Array.from(
                                        arguments as ArrayLike<unknown>
                                    ).forEach((key) => {
                                        if (typeof key !== 'string')
                                            throw new TypeError(
                                                `'sav' 동작에 유효하지 않은 인자가 입력되었습니다`
                                            );
                                        this[key] =
                                            key === 'title'
                                                ? currentTitle
                                                : params[key];
                                    });
                            },
                        }).parse(
                            parseJSON(
                                'reset' in data ? '' : (storage.get(key) as string)
                            ) || {},
                            '[' + data.arg + ']'
                        )
                    );
                    if (val.length > 2) base[key] = val;
                    if (paramChanged) this.paramChanged = true;
                    break;

                default:
                    $(element)
                        .addClass('error')
                        .text(
                            data.action
                                ? "'" +
                                      data.action +
                                      "'은(는) 올바른 동작이 아닙니다"
                                : '올바른 동작을 입력하지 않았습니다'
                        );
            }
        }
        save(): PromiseLike<any> {
            let promise;
            let yet = true;
            let promises: PromiseLike<any>[];

            if (this.deleteRoot.includes(title)) rootGameDB.delete(title);
            else if (title in this.root)
                rootGameDB.set(title, this.root[title] as string);

            localGameDB.set(this.local);
            localGameDB.delete(this.deleteLocal);

            globalGameDB.set(this.global);
            globalGameDB.delete(this.deleteGlobal);

            promises = [rootGameDB.push(), localGameDB.push(), globalGameDB.push()];

            promise = $.when.apply(null, promises);
            promise.then(function () {
                yet = false;
            });

            if (promises.length && !mw.user.isAnon())
                setTimeout(function () {
                    if (yet) {
                        rootGameDB.set('timestamp', String(Date.now()));
                        noti = mw.notification.notify(
                            '데이터를 저장하는 중입니다...',
                            {
                                autoHide: false,
                                tag: 'gameDB',
                                //@ts-ignore
                                type: 'pending',
                            }
                        );
                    }
                }, 10);

            return promise;
        }
    }

    // 즉시
    function instant() {
        var instant = new DataChange(location.href);

        $('.gameDB-control').each(function () {
            instant.control(this);
        });

        return instant.save().then(function () {
            var url =
                mw.util.getUrl(
                    instant.params.title || currentTitle,
                    instant.params
                ) + location.hash;
            instantDone = true;

            if (instant.paramChanged) location.href = url;
            else if (noti) noti.close();
        }, handleError);
    }
    registerTrigger(instant);

    // 링크
    function link() {
        function process(
            link: HTMLAnchorElement,
            controllers: JQuery,
            change: DataChange
        ) {
            controllers.each(function () {
                change.control(this);
            });

            let href: URL | undefined;
            let url =
                mw.util.getUrl(change.params.title || currentTitle, change.params) +
                (link.href && new URL(link.href).hash);

            if (link.href) href = new URL(link.href);
            if (change.paramChanged) link.href = url;
            else if (
                href &&
                link.href ===
                    location.href.slice(0, -location.hash.length) + href.hash
            )
                link.removeAttribute('href');
        }

        registerRenderer(function () {
            $('.gameDB-container')
                .not(':has(a)')
                .each(function () {
                    var href;

                    /*
                        clear: 기존 파라미터 넘겨주지 않음
                    */
                    if ('clear' in this.dataset) {
                        href = new URL(location.href);
                        href.search = '';
                        href = href.href;
                    } else href = location.href;

                    $(this).html(
                        //@ts-ignore
                        $('<a />', { href }).text(this.innerText)
                    );
                });

            $('.gameDB-container a').each(function () {
                var change = new DataChange((this as HTMLAnchorElement).href);
                var controllers = $(
                    $(this).parents('.gameDB-container').get().reverse()
                );

                process(this as HTMLAnchorElement, controllers, change);

                $(this).data('change', change);
                $(this).addClass('gameDB-link');
            });
        });

        registerHandler(function () {
            $('.gameDB-link').each(function () {
                if ((this as HTMLAnchorElement).href)
                    $(this).one('click', function (event) {
                        event.preventDefault();
                        event.stopImmediatePropagation();

                        if (!('wait' in this.dataset)) this.dataset.wait = '0';

                        this.dataset.wait = String(Number(this.dataset.wait) + 1);

                        $(this)
                            .data('change')
                            .save()
                            .then(() => {
                                this.dataset.wait = String(
                                    Number(this.dataset.wait) - 1
                                );
                                this.click();
                            }, handleError);
                    });
                else
                    $(this).on('click', function handler() {
                        $(this)
                            .data('change')
                            .save()
                            .then(function () {
                                mw.notification.notify('데이터가 저장되었습니다.', {
                                    tag: 'gameDB',
                                });
                            }, handleError);
                    });
            });
        });
    }
    link();

    // 비상용 로컬에 임시 저장
    registerHandler(function () {
        window.addEventListener('hashchange', function () {
            if (!mw.user.isAnon() && location.hash.endsWith('##emergency-save')) {
                mw.notification.notify(
                    '긴급 저장 모드가 켜졌습니다. 저장하려던 링크를 다시 눌러 저장해 주세요.'
                );

                DataChange.prototype.save = function () {
                    const change = {
                        root: this.root,
                        local: this.local,
                        global: this.global,
                        deleteRoot: this.deleteRoot,
                        deleteLocal: this.deleteLocal,
                        deleteGlobal: this.deleteGlobal,
                        timestamp: Date.now(),
                    };

                    localStorage.setItem(
                        'gamedb-temp-' + mw.config.get('wgUserName'),
                        JSON.stringify(change)
                    );

                    mw.notification.notify('로컬에 데이터를 임시 저장하였습니다.', {
                        tag: 'gameDB',
                    });

                    return Promise.resolve();
                };

                if (!instantDone) instant();
                link();
            }
        });
    });
}
enableDB2();
