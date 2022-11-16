"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 위키 문법을 통해 DB2 저장소 제어
var storage_js_1 = require("./storage.js");
var common_js_1 = require("./common.js");
var CGI2Parser = require("ext.gadget.CGI2-parser");
function enableDB2() {
    function parseJSON(json) {
        try {
            return JSON.parse(json);
        }
        catch (_a) {
            return;
        }
    }
    var title = (0, common_js_1.getLocalNamespace)();
    var useCGIProtect = Boolean(document.getElementsByClassName('protectCGI')[0]);
    var currentSearch = useCGIProtect
        ? parseJSON(sessionStorage.getItem('protectCGI'))
        : geturlSearch();
    var currentTitle = (useCGIProtect && currentSearch && currentSearch.title) ||
        mw.config.get('wgPageName');
    var handleError = notifyApiError.bind(null, '데이터 저장에 실패하였습니다.', {
        tag: 'gameDB',
        additionalMessage: '(<a href="##emergency-save">로컬에 임시 저장</a>)',
    });
    var temp = mw.user.isAnon()
        ? null
        : localStorage.getItem(('gamedb-temp-' + mw.config.get('wgUserName')));
    var noti;
    var instantDone = false;
    if (useCGIProtect) {
        if (currentSearch)
            delete currentSearch.title;
        else
            return;
    }
    else
        delete currentSearch.title;
    if (currentSearch === null || currentSearch === void 0 ? void 0 : currentSearch.action) {
        $('.gameDB-container').removeClass('gameDB-container');
        return;
    }
    if (temp)
        registerTrigger(function () {
            function save() {
                noti = mw.notification.notify('DB2 데이터를 동기화하는 중입니다...', {
                    autoHide: false,
                    tag: 'gameDB',
                    //@ts-ignore
                    type: 'pending',
                });
                DataChange.prototype.save
                    .call(change)
                    .then(function () {
                    noti = mw.notification.notify("DB2 \uB370\uC774\uD130\uB97C \uB3D9\uAE30\uD654\uD558\uC600\uC2B5\uB2C8\uB2E4. (\uB370\uC774\uD130 \uB0A0\uC9DC: ".concat(new Date(change.timestamp), ")"), { tag: 'gameDB' });
                    localStorage.removeItem('gamedb-temp-' + mw.config.get('wgUserName'));
                    common_js_1.rootGameDB.push();
                }, 
                //@ts-ignore
                notifyApiError.bind(null, 'DB2 데이터 동기화에 실패하였습니다. 다음 접속에 다시 시도합니다.', { tag: 'gameDB' }));
            }
            var change = JSON.parse(temp);
            if (Number(common_js_1.rootGameDB.get('timestamp')) > change.timestamp)
                mw.loader.using('ext.gadget.DB2-controller');
            else
                save();
        });
    var DataChange = /** @class */ (function () {
        function DataChange(href) {
            this.local = {};
            this.global = {};
            this.root = {};
            this.deleteLocal = [];
            this.deleteGlobal = [];
            this.deleteRoot = [];
            this.refresh = false;
            this.paramChanged = false;
            this.params = geturlSearch(new URL(href, location));
        }
        DataChange.prototype.control = function (element) {
            var base, delBase, key, storage, params, val, paramChanged;
            var data = element.dataset;
            /* 저장할 키
                    local: 키 지정
                    global: 전역 키 지정
                    local global: 키 지정
                    (없음): 기본 키
                */
            if ('local' in data && 'global' in data) {
                throw new TypeError('전역키와 일반키가 동시에 지정되었습니다');
            }
            else if ('local' in data) {
                storage = storage_js_1.localGameDB;
                base = this.local;
                delBase = this.deleteLocal;
                key = data.local;
            }
            else if ('global' in data) {
                storage = storage_js_1.globalGameDB;
                base = this.global;
                delBase = this.deleteGlobal;
                key = data.global;
            }
            else {
                storage = common_js_1.rootGameDB;
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
                        base[key] = JSON.stringify(Object.assign({}, currentSearch, 'savetitle' in data && {
                            title: currentTitle,
                        }));
                    break;
                case '로드':
                case 'load':
                    /*
                            safe: 파라미터가 있으면 불러오지 않음
                            fill: 없는 파라미터만 불러옴
                        */
                    if (!(location.search && 'safe' in data)) {
                        Object.assign(this.params, parseJSON(storage.get(key)), 'fill' in data && this.params);
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
                            throw new TypeError('데이터를 내보낼 urlget 파라미터를 지정하지 않았습니다');
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
                    if (!('create' in data && key in base))
                        base[key] = data.arg;
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
                    val = JSON.stringify(new CGI2Parser({
                        get: function (args) {
                            var _this = this;
                            if (args && typeof args === 'object')
                                Object.entries(args).forEach(function (_a) {
                                    var key = _a[0], value = _a[1];
                                    if (typeof value !== 'string')
                                        throw new TypeError("'get' \uB3D9\uC791\uC5D0 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 \uC778\uC790\uAC00 \uC785\uB825\uB418\uC5C8\uC2B5\uB2C8\uB2E4");
                                    if (_this[value]) {
                                        params[key] = _this[value];
                                        paramChanged = true;
                                    }
                                });
                            else
                                Array.from(arguments).forEach(function (key) {
                                    if (typeof key !== 'string')
                                        throw new TypeError("'get' \uB3D9\uC791\uC5D0 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 \uC778\uC790\uAC00 \uC785\uB825\uB418\uC5C8\uC2B5\uB2C8\uB2E4");
                                    if (_this[key]) {
                                        params[key] = _this[key];
                                        paramChanged = true;
                                    }
                                });
                        },
                        set: function (args) {
                            var _this = this;
                            if (!args || typeof args !== 'object')
                                throw new TypeError("'set' \uB3D9\uC791\uC758 \uC720\uD6A8\uD55C \uC778\uC790 \uD615\uC2DD\uC740 Object \uC774\uC9C0\uB9CC, ".concat(typeof args, " \uD615\uC2DD\uC758 ").concat(args, "\uAC00 \uC785\uB825\uB418\uC5C8\uC2B5\uB2C8\uB2E4"));
                            Object.entries(args).forEach(function (_a) {
                                var key = _a[0], value = _a[1];
                                if (typeof key !== 'string' ||
                                    typeof value !== 'string')
                                    throw new TypeError("'set' \uB3D9\uC791\uC5D0 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 \uC778\uC790\uAC00 \uC785\uB825\uB418\uC5C8\uC2B5\uB2C8\uB2E4");
                                _this[key] = value;
                            });
                        },
                        del: function () {
                            var _this = this;
                            Array.from(arguments).forEach(function (key) {
                                delete _this[key];
                            });
                        },
                        def: function (args) {
                            var _this = this;
                            if (!args || typeof args !== 'object')
                                throw new TypeError("'def' \uB3D9\uC791\uC758 \uC720\uD6A8\uD55C \uC778\uC790 \uD615\uC2DD\uC740 Object \uC774\uC9C0\uB9CC, ".concat(typeof args, " \uD615\uC2DD\uC758 ").concat(args, "\uAC00 \uC785\uB825\uB418\uC5C8\uC2B5\uB2C8\uB2E4"));
                            Object.entries(args).forEach(function (_a) {
                                var key = _a[0], value = _a[1];
                                if (typeof value !== 'string')
                                    throw new TypeError("'def' \uB3D9\uC791\uC5D0 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 \uC778\uC790\uAC00 \uC785\uB825\uB418\uC5C8\uC2B5\uB2C8\uB2E4");
                                if (!(key in _this))
                                    _this[key] = value;
                            });
                        },
                        sav: function (args) {
                            var _this = this;
                            if (args && typeof args === 'object')
                                Object.entries(args).forEach(function (_a) {
                                    var key = _a[0], value = _a[1];
                                    if (typeof value !== 'string')
                                        throw new TypeError("'sav' \uB3D9\uC791\uC5D0 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 \uC778\uC790\uAC00 \uC785\uB825\uB418\uC5C8\uC2B5\uB2C8\uB2E4");
                                    _this[key] =
                                        value === 'title'
                                            ? currentTitle
                                            : params[value];
                                });
                            else
                                Array.from(arguments).forEach(function (key) {
                                    if (typeof key !== 'string')
                                        throw new TypeError("'sav' \uB3D9\uC791\uC5D0 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 \uC778\uC790\uAC00 \uC785\uB825\uB418\uC5C8\uC2B5\uB2C8\uB2E4");
                                    _this[key] =
                                        key === 'title'
                                            ? currentTitle
                                            : params[key];
                                });
                        },
                    }).parse(parseJSON('reset' in data ? '' : storage.get(key)) ||
                        {}, '[' + data.arg + ']'));
                    if (val.length > 2)
                        base[key] = val;
                    if (paramChanged)
                        this.paramChanged = true;
                    break;
                default:
                    $(element)
                        .addClass('error')
                        .text(data.action
                        ? "'" +
                            data.action +
                            "'은(는) 올바른 동작이 아닙니다"
                        : '올바른 동작을 입력하지 않았습니다');
            }
        };
        DataChange.prototype.save = function () {
            var promise;
            var yet = true;
            var promises = [];
            if (this.deleteRoot.includes(title))
                promises.push(common_js_1.rootGameDB.delete(title));
            else if (title in this.root)
                promises.push(common_js_1.rootGameDB.set(title, this.root[title]));
            promises.push(storage_js_1.localGameDB.set(this.local));
            promises.push(storage_js_1.localGameDB.delete(this.deleteLocal));
            promises.push(storage_js_1.globalGameDB.set(this.global));
            promises.push(storage_js_1.globalGameDB.delete(this.deleteGlobal));
            promise = $.when.apply(null, promises);
            promise.then(function () {
                yet = false;
            });
            if (promises.length && !mw.user.isAnon())
                setTimeout(function () {
                    if (yet) {
                        common_js_1.rootGameDB.set('timestamp', String(Date.now()));
                        noti = mw.notification.notify('데이터를 저장하는 중입니다...', {
                            autoHide: false,
                            tag: 'gameDB',
                            //@ts-ignore
                            type: 'pending',
                        });
                    }
                }, 10);
            return promise;
        };
        return DataChange;
    }());
    // 즉시
    function instant() {
        var instant = new DataChange(location.href);
        $('.gameDB-control').each(function () {
            instant.control(this);
        });
        return instant.save().then(function () {
            var url = mw.util.getUrl(instant.params.title || currentTitle, instant.params) + location.hash;
            instantDone = true;
            if (instant.paramChanged)
                location.href = url;
            else if (noti)
                noti.close();
        }, handleError);
    }
    registerTrigger(instant);
    // 링크
    function link() {
        function process(link, controllers, change) {
            controllers.each(function () {
                change.control(this);
            });
            var href;
            var url = mw.util.getUrl(change.params.title || currentTitle, change.params) +
                (link.href && new URL(link.href).hash);
            if (link.href)
                href = new URL(link.href);
            if (change.paramChanged)
                link.href = url;
            else if (href &&
                link.href ===
                    location.href.slice(0, -location.hash.length) + href.hash)
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
                }
                else
                    href = location.href;
                $(this).html(
                //@ts-ignore
                $('<a />', { href: href }).text(this.innerText));
            });
            $('.gameDB-container a').each(function () {
                var change = new DataChange(this.href);
                var controllers = $($(this).parents('.gameDB-container').get().reverse());
                process(this, controllers, change);
                $(this).data('change', change);
                $(this).addClass('gameDB-link');
            });
        });
        registerHandler(function () {
            $('.gameDB-link').each(function () {
                if (this.href)
                    $(this).one('click', function (event) {
                        var _this = this;
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        if (!('wait' in this.dataset))
                            this.dataset.wait = '0';
                        this.dataset.wait = String(Number(this.dataset.wait) + 1);
                        $(this)
                            .data('change')
                            .save()
                            .then(function () {
                            _this.dataset.wait = String(Number(_this.dataset.wait) - 1);
                            _this.click();
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
                mw.notification.notify('긴급 저장 모드가 켜졌습니다. 저장하려던 링크를 다시 눌러 저장해 주세요.');
                DataChange.prototype.save = function () {
                    var change = {
                        root: this.root,
                        local: this.local,
                        global: this.global,
                        deleteRoot: this.deleteRoot,
                        deleteLocal: this.deleteLocal,
                        deleteGlobal: this.deleteGlobal,
                        timestamp: Date.now(),
                    };
                    localStorage.setItem('gamedb-temp-' + mw.config.get('wgUserName'), JSON.stringify(change));
                    mw.notification.notify('로컬에 데이터를 임시 저장하였습니다.', {
                        tag: 'gameDB',
                    });
                    return Promise.resolve();
                };
                if (!instantDone)
                    instant();
                link();
            }
        });
    });
}
enableDB2();
//# sourceMappingURL=controller.js.map