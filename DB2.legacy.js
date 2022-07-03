//@ts-nocheck
/** [[틀:DB2]]
 * 제작자: [[사용자:hsl0]]
**/

var CGI2Parser = require('ext.gadget.CGI2-parser');
function specialPage(page, script, title) {
	if(mw.config.get('wgPageName') === '특수:빈문서/' + page) {
		mw.loader.using(script);
		if(title) document.getElementById('firstHeading').innerText = title;
		document.getElementById('mw-content-text').innerText = '잠시만 기다려 주세요...';
		document.title = title;
	}
}

function enableDB2() {
    var title = mw.config.get('wgPageName').split('/')[0].split(':');
    title = title[0].replace(/talk|토론/gi, '') + ':' + title[1];
    var noti;
    var useCGIProtect = document.getElementsByClassName('protectCGI')[0];
    var currentSearch = useCGIProtect? JSON.parse(sessionStorage.getItem('protectCGI')) : geturlSearch();
    var currentTitle = useCGIProtect && currentSearch && currentSearch.title || mw.config.get('wgPageName');
    
    if(useCGIProtect) {
    	if(currentSearch) delete currentSearch.title;
		else return;
    } else delete currentSearch.title;
    
    var handleError = notifyApiError.bind(null, '데이터 저장에 실패하였습니다.', {tag: 'gameDB', additionalMessage: '(<a href="##emergency-save">로컬에 임시 저장</a>)'});
    var instantDone = false;
    var temp = mw.user.isAnon()? null : localStorage.getItem('gamedb-temp-' + mw.config.get('wgUserName'));
    var api = mw.user.isAnon()? null : new mw.Api();
    
    /* option key 인코딩
        퓨니코드 + url인코딩
        % = _
        _ = __
    */
    function encode(key) {
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
    function decode(key) {
        return decodeURIComponent(key.replace(/_(?=[a-zA-Z0-9]{2})/g, '%').replace(/__/g, '_'));
    }

    function parseJSON(json) {
        try {
            return JSON.parse(json);
        } catch(e) {
            return;
        }
    }

    // hybridStorage 서브셋 생성
    window.setStoragePrefix = function(storage, prefix, except, needEncode) {
        if(mw.user.isAnon()) needEncode = false;

        var spp = new Proxy(storage, {
            get: function(target, prop, receiver) {
                function keys() {
                    return Object.keys(target).filter(function(key) {
                        return key.startsWith(prefix);
                    });
                }
                
                return Reflect.get(Object.assign({
                    length: (prop === 'length') && keys().length,
                    getItem: function getItem(key) {
                        return target.getItem(prefix + (needEncode? encode(key) : key));
                    },
                    key: function key(index) {
                        return decode(keys()[index].slice(prefix.length));
                    },
                    removeItem: function removeItem(key) {
                        return target.removeItem(prefix + (needEncode? encode(key) : key)).then(function() {
                            return spp;
                        });
                    },
                    setItem: function setItem(key, value) {
                        return target.setItem(prefix + (needEncode? encode(key) : key), value).then(function() {
                            return spp;
                        });
                    }
                }, except), prop, receiver) || target.getItem(prefix + (needEncode? encode(prop) : prop));
            },
            set: function(target, prop, value) {
                return target.setItem(prefix + (needEncode? encode(prop) : prop), value);
            },
            deleteProperty: function(target, prop) {
                return target.removeItem(prefix + (needEncode? encode(prop) : prop));
            },
            has: function(target, prop) {
                return Reflect.has(target, prefix + (needEncode? encode(prop) : prop));
            },
            ownKeys: function(target) {
                return Reflect.ownKeys(target).filter(function(key) {
                    return key.startsWith(prefix);
                }).map(function(key) {
                    return decode(key.slice(prefix.length));
                });
            }
        });
        return spp;
    };

    /*
        anon = localStorage[*]
        user = mw.user.options[userjs-*]
    */
    window.hybridStorage = (function(local) {
        var storage, action;
        var saveOption = (function() {
            var options = {};
            var deferred = new $.Deferred();
            var timeout = null;
            
            return function saveOption(key, value) {
                if(timeout) clearTimeout(timeout);
                options[key] = value;
                timeout = setTimeout(function() {
                    api.saveOptions(options).then(deferred.resolve, deferred.reject);
                    
                    options = {};
                    timeout = null;
                    deferred = new $.Deferred();
                }, 100);
                return deferred.promise();
            };
        })();
        if(local) {
            storage = new Proxy(localStorage, {
                get: function(target, prop, receiver) {
                    var value = Reflect.get({
                        length: target.length,
                        getItem: target.getItem.bind(target),
                        key: target.key.bind(target),
                        removeItem: function removeItem(key) {
                            return Promise.resolve(target.removeItem(key));
                        },
                        setItem: function setItem(key, value) {
                            return Promise.resolve(target.setItem(key, value));
                        },
                        refresh: function refresh() {
                            return Promise.resolve(storage);
                        },
                        needRefresh: false
                    }, prop, receiver) || target.getItem(prop);
                    return (value === null)? undefined : value;
                },
                set: function(target, prop, value, receiver) {
                    return Promise.resolve(target.setItem(prop, value));
                },
                deleteProperty: function(target, prop) {
                    return Promise.resolve(target.removeItem(prop));
                }
            });
        } else {
            action = {
                removeItem: function removeItem(key) {
                    if(key) return saveOption("userjs-" + key, null);
                    else throw new TypeError("Failed to execute 'removeItem' on 'Storage': 1 argument required, but only 0 present.");
                },
                setItem: function setItem(key, value) {
                    if(key) return saveOption("userjs-" + key, value);
                    else throw new TypeError("Failed to execute 'setItem' on 'Storage': 1 argument required, but only 0 present.");
                },
                refresh: (function() {
                    var deferred = new $.Deferred();
                    var timeout = null;
                    
                    return function refresh() {
                        if(timeout) clearTimeout(timeout);
                        timeout = setTimeout(function() {
                            api.get({
                                action: 'query',
                                meta: 'userinfo',
                                uiprop: 'options'
                            }, {
                                cache: false
                            }).then(function(response) {
                                mw.user.options.values = response.query.userinfo.options;
                                return storage;
                            }).then(deferred.resolve, deferred.reject);
                            
                            timeout = null;
                            deferred = new $.Deferred();
                        }, 100);
                        return deferred.promise();
                    };
                })()
            };
            storage = new Proxy(mw.user.options, {
                get: function(target, prop, receiver) {
                    function keys() {
                        return Object.keys(target.values).filter(function(key) {
                            return key.startsWith('userjs-');
                        });
                    }
                    
                    return Reflect.get({
                        length: prop === 'length' && keys().length,
                        getItem: function getItem(key) {
                            if(key) return target.get("userjs-" + key);
                            else throw new TypeError("Failed to execute 'getItem' on 'Storage': 1 argument required, but only 0 present.");
                        },
                        key: function key(index) {
                            return keys()[index].slice(7);
                        },
                        removeItem: function removeItem(key) {
                        	if(!target.exists("userjs-" + key)) return Promise.resolve();
                            return action.removeItem(key).then(function() {
                            	Reflect.deleteProperty(target.values, "userjs-" + key);
                            });
                        },
                        setItem: function setItem(key, value) {
                        	if(target.get("userjs-" + key) === value) return Promise.resolve();
                            return action.setItem(key, value).then(function() {
                            	target.set("userjs-" + key, value);
                            });
                        },
                        refresh: action.refresh,
                        needRefresh: true
                    }, prop, receiver) || Reflect.get(target.values, "userjs-" + prop, receiver);
                },
                set: function(target, prop, value, receiver) {
                	if(Reflect.get(target.values, "userjs-" + prop, receiver) === value) return Promise.resolve();
                    return action.setItem(prop, value).then(function() {
                    	Reflect.set(target.values, "userjs-" + prop, value, receiver);
                    });
                },
                deleteProperty: function(target, prop) {
                	if(!Reflect.has(target.values, "userjs-" + prop)) return Promise.resolve();
                    return action.removeItem(prop).then(function() {
                    	Reflect.deleteProperty(target.values, "userjs-" + prop);
                    });
                },
                has: function(target, prop) {
                    return Reflect.has(target.values, "userjs-" + prop);
                },
                ownKeys: function(target) {
                    return Reflect.ownKeys(target.values).filter(function(key) {
                        return key.startsWith("userjs-");
                    }).map(function(key) {
                        return key.slice(7);
                    });
                }
            });
        }
        return storage;
    })(mw.user.isAnon());
    // local + global 슈퍼셋 (hybridStorage[gamedb-*])
    var rootGameDB = setStoragePrefix(hybridStorage, 'gamedb-', {
        refresh: function() {
            return hybridStorage.refresh().then(function() {
                return rootGameDB;
            });
        },
        needRefresh: hybridStorage.needRefresh
    }, true);
    // 게임별로 할당되는 영역 (rootGameDB[{게임}/*])
    window.localGameDB = setStoragePrefix(rootGameDB, title + '/', {
        refresh: function() {
            return rootGameDB.refresh().then(function() {
                return localGameDB;
            });
        },
        needRefresh: rootGameDB.needRefresh
    });
    // 모든 게임이 공유하는 영역 (rootGameDB[#*])
    window.globalGameDB = setStoragePrefix(rootGameDB, '#', {
        refresh: function() {
            return rootGameDB.refresh().then(function() {
                return globalGameDB;
            });
        },
        needRefresh: rootGameDB.needRefresh
    });
    
    if(currentSearch.action) {
    	$('.gameDB-container').removeClass('gameDB-container');
    	return;
    }
    
    if(temp) registerTrigger(function() {
    	function save() {
    		var noti = mw.notification.notify('DB2 데이터를 동기화하는 중입니다...', {
	            autoHide: false,
	            tag: 'gameDB',
	            type: 'pending'
	        });
	        
	        api.saveOptions(temp).then(function() {
	        	noti = mw.notification.notify('DB2 데이터를 동기화하였습니다. (데이터 날짜: ' + Date(temp['userjs-gamedb-timestamp']) + ')', {tag: 'gameDB'});
	        	localStorage.removeItem('gamedb-temp-' + mw.config.get('wgUserName'));
	        	rootGameDB.refresh();
	        }, notifyApiError.bind(null, 'DB2 데이터 동기화에 실패하였습니다. 다음 접속에 다시 시도합니다.', {tag: 'gameDB'}));
    	}
    	
    	temp = JSON.parse(temp);
    	
    	if(mw.user.options.get('userjs-gamedb-timestamp') > temp.timestamp) (function(rootGameDB) {
			function DataSelectDialog(config) {
			    DataSelectDialog.super.call(this, config);
			}
			OO.inheritClass(DataSelectDialog, OO.ui.ProcessDialog);
			
			DataSelectDialog.static.name = 'DataSelectDialog';
			DataSelectDialog.static.title = 'DB2 데이터 선택'
			DataSelectDialog.static.actions = [
			    {
			        flags: ['primary', 'progressive'],
			        label: '저장',
			        action: 'save',
			        disabled: true
			    }
			]
			
			DataSelectDialog.prototype.initialize = function() {
			    DataSelectDialog.super.prototype.initialize.call(this);
			
			    this.panel = new OO.ui.PanelLayout({
			        padded: true,
			        expanded: false,
			        scrollable: true
			    });
			
			    this.content = $('<form />', {id: 'gameDB-select'});
			}
			
			DataSelectDialog.prototype.getSetupProcess = function() {
			    return DataSelectDialog.super.prototype.getSetupProcess.call(this).next(function() {
			        function createRow(key) {
			            var $wrapper = $('<div />', {id: 'gameDB-key-' + key, class: 'gameDB-compare'});
			
			            // remote
			            new OO.ui.RadioInputWidget({
			                name: 'key-' + key,
			                value: 'remote',
			                classes: ['gameDB-remote-select']
			            }).$element.appendTo($wrapper).click(function() {
			                if($('form input').not(':checked').length) saveButton.setDisabled(false);
			                $('#gameDB-remote-selectall input, #gameDB-local-selectall input').each(function() {
			                    this.checked = false;
			                });
			            });
			            $('<pre />', {class: 'gameDB-remote-content'}).text(mw.user.options.get(key)).appendTo($wrapper);
			
			            var $name = $('<div />', {class: 'gameDB-keyname'}).text(decode(key.slice(14))).appendTo($wrapper);
			
			            // local
			            $('<pre />', {class: 'gameDB-local-content'}).text(local[key]).appendTo($wrapper);
			            new OO.ui.RadioInputWidget({
			                name: 'key-' + key,
			                value: 'local',
			                classes: ['gameDB-local-select']
			            }).$element.appendTo($wrapper).click(function() {
			                if($('form input').not(':checked').length) saveButton.setDisabled(false);
			                $('#gameDB-remote-selectall input, #gameDB-local-selectall input').each(function() {
			                    this.checked = false;
			                });
			            });
			
			            return $wrapper;
			        }
			
			        var saveButton = this.attachedActions[0];
			
			        var local = JSON.parse(localStorage.getItem('gamedb-temp-' + mw.config.get('wgUserName')));
			        this.local = local;
			        var localTime = local.timestamp;
			
			        delete local.timestamp;
			
			        var $header = $('<div />', {id: 'gameDB-compare-header'}).appendTo(this.content);
			
			        // remote
			        new OO.ui.RadioInputWidget({
			            name: 'all',
			            value: 'remote',
			            id: 'gameDB-remote-selectall'
			        }).$element.appendTo($header).click(function() {
			            $('.gameDB-remote-select input').each(function() {
			                this.checked = true;
			            });
			            saveButton.setDisabled(false);
			        });
			        $('<div />', {id: 'gameDB-legend-remote'})
			            .append('<div class="gameDB-legend-title">서버에 저장됨</div>')
			            .append($('<time />').text(Date(mw.user.options.get('userjs-gamedb-timestamp')).slice(0, -20)))
			            .appendTo($header);
			
			        var $name = $('<div />', {id: 'gameDB-legend-keyname'}).text('키').appendTo($header);
			
			        // local
			        $('<div />', {id: 'gameDB-legend-local'})
			            .append('<div class="gameDB-legend-title">로컬에 저장됨</div>')
			            .append($('<time />').text(Date(localTime).slice(0, -20)))
			            .appendTo($header);
			        new OO.ui.RadioInputWidget({
			            name: 'all',
			            value: 'local',
			            id: 'gameDB-local-selectall'
			        }).$element.appendTo($header).click(function() {
			            $('.gameDB-local-select input').each(function() {
			                this.checked = true;
			            });
			            saveButton.setDisabled(false);
			        });
			
			        for(var key in local) {
			            this.content.append(createRow(key));
			        }
			
			        this.panel.$element.append(this.content);
			        this.$body.append(this.panel.$element);
			    }, this);
			}
			
			DataSelectDialog.prototype.getActionProcess = function(action) {
			    if(action === 'save') {
			        var dialog = this;
			        var local = this.local;
			        var change = {};
			        
			        new FormData(this.content[0]).forEach(function(choice, key) {
			            if(key !== 'all') {
			            	key = key.slice(4);
				            switch(choice) {
				                case 'remote':
				                    change[key] = mw.user.options.get(key);
				                break;
				
				                case 'local':
				                    change[key] = local[key];
				                break;
				            }
			            }
			        });
					
			        return new OO.ui.Process(api.saveOptions(change).then(function() {
			        	localStorage.removeItem('gamedb-temp-' + mw.config.get('wgUserName'));
			        	return rootGameDB.refresh();
			        }).then(function() {
			        	dialog.close();
			        }));
			    }
			}
			
			var windowManager = new OO.ui.WindowManager();
			windowManager.$element.appendTo(document.body);
			
			var dialog = new DataSelectDialog();
			windowManager.addWindows([dialog]);
			windowManager.openWindow(dialog);
    	})(rootGameDB);
    	else save();
    });
    
    function DataChange(href) {
        this.params = geturlSearch(new URL(href, location));
        this.local = {};
        this.global = {};
        this.root = {};
        this.refresh = false;
        this.paramChanged = false;
    }
    DataChange.prototype.control = function control(element) {
        var base, key, storage, params, val, paramChanged;
        var data = element.dataset;
        
        /* 저장할 키
            local: 키 지정
            global: 전역 키 지정
            local global: 키 지정
            (없음): 기본 키
        */
        if('local' in data && 'global' in data) {
        	throw new TypeError('전역키와 일반키가 동시에 지정되었습니다');
        } else if('local' in data) {
            storage = localGameDB;
            base = this.local;
            key = data.local;
        } else if('global' in data) {
            storage = globalGameDB;
            base = this.global;
            key = data.global;
        } else {
            storage = rootGameDB;
            base = this.root;
            key = title;
        }
        
        switch(data.action) {
            // 호환
            case '저장':
            case 'save':
                /*
                    create: 새 키를 생성할 때만 저장
                    savetitle: title 키(제목) 포함 저장
                */
                if(!('create' in data && key in base) && location.search) base[key] = JSON.stringify(Object.assign({}, currentSearch, 'savetitle' in data && {
                	title: currentTitle
                }));
            break;

            case '로드':
            case 'load':
                /*
                    safe: 파라미터가 있으면 불러오지 않음
                    fill: 없는 파라미터만 불러옴
                */
                if(!(location.search && 'safe' in data)) {
                	Object.assign(this.params, parseJSON(storage.getItem(key)), 'fill' in data && this.params);
                	this.paramChanged = true;
                }
            break;

            // 기본
            case '호출':
            case 'get':
            	/*
            		else: 저장된 데이터가 없을 때의 대체 텍스트
            	*/
                if(key in storage || data.else) {
                	this.params[data.arg] = storage.getItem(key) || data.else;
                	this.paramChanged = true;
                }
            break;

            case '수정':
            case 'set':
                /*
                    create: 새 키를 생성할 때만 저장
                */
               if(!('create' in data && key in base)) base[key] = data.arg;
            break;

            case '삭제':
            case '제거':
            case 'del':
                base[key] = null;
            break;

            // JSON
            case 'JSON':
            case 'json':
                /*
                    reset: 데이터 초기화
                */
                params = this.params;
                val = JSON.stringify(new CGI2Parser({
                    get: function(args) {
                    	var base = this;
                        if(typeof args === 'object') Object.pairs(args).forEach(function(pair) {
                            if(base[pair[1]]) {
                            	params[pair[0]] = base[pair[1]];
                            	paramChanged = true;
                            }
                        });
                        else Array.from(arguments).forEach(function(key) {
                            if(base[key]) {
                            	params[key] = base[key];
                            	paramChanged = true;
                            }
                        });
                    },
                    set: function(args) {
                    	var base = this;
                        Object.pairs(args).forEach(function(pair) {
                            base[pair[0]] = pair[1];
                        });
                    },
                    del: function() {
                    	var base = this;
                        Array.from(arguments).forEach(function(key) {
                            delete base[key];
                        });
                    },
            		def: function(args) {
                    	var base = this;
                        Object.pairs(args).forEach(function(pair) {
                            if(!(pair[0] in base)) base[pair[0]] = pair[1];
                        });
                    },
                    sav: function(args) {
                    	var base = this;
                        if(typeof args === 'object') Object.pairs(args).forEach(function(pair) {
                            base[pair[0]] = pair[1] === 'title'? currentTitle : params[pair[1]];
                        });
                        else Array.from(arguments).forEach(function(key) {
                            base[key] = key === 'title'? currentTitle : params[key];
                        });
                    }
                }).parse(parseJSON('reset' in data? '' : storage.getItem(key)) || {}, '[' + data.arg + ']'));
                if(val.length > 2) base[key] = val;
                Object.assign(this.params, params);
                if(paramChanged) this.paramChanged = true;
            break;

            default:
                $(element).addClass('error').text(data.action? "'" + data.action + "'은(는) 올바른 동작이 아닙니다" : '올바른 동작을 입력하지 않았습니다');
        }
    };

    /**
     * DB 저장
     * @function
     * @param {DataChange} change 
     */
    DataChange.prototype.save = function() {
        var key, promise;
        var yet = true;
        var promises = [];

        if(title in this.root) {
            promises.push(rootGameDB.setItem(title, this.root[title]));
        }
        for(key in this.local) {
            promises.push(localGameDB.setItem(key, this.local[key]));
        }
        for(key in this.global) {
            promises.push(globalGameDB.setItem(key, this.global[key]));
        }
        
        promise = $.when.apply(null, promises);
        promise.then(function() {
        	yet = false;
        });
        
        if(promises.length && !mw.user.isAnon()) setTimeout(function() {
	        if(yet) {
	        	rootGameDB.setItem('timestamp', Date.now());
	        	noti = mw.notification.notify('데이터를 저장하는 중입니다...', {
	        		autoHide: false,
	        		tag: 'gameDB',
	            	type: 'pending'
	        	});
	        }
	    }, 10);

        return promise;
    };
    
    // 즉시
    function instant() {
        var instant = new DataChange(location.href);

        $('.gameDB-control').each(function() {
            instant.control(this);
        });

        return instant.save().then(function() {
            var url = mw.util.getUrl(instant.params.title || currentTitle, instant.params) + location.hash;
            instantDone = true;
            
            if(instant.params.title && instant.params.title !== currentTitle || instant.paramChanged) location.href = url;
            else if(noti) noti.close();
        }, handleError);
    }
    registerTrigger(instant);

    // 링크
    function link() {
        function process(link, controllers, change) {
            controllers.each(function() {
                change.control(this);
            });
            
            if(link.href) var href = new URL(link.href);
            
            var url = mw.util.getUrl(change.params.title || currentTitle, change.params) + new URL(link.href).hash;
            
            if(change.paramChanged) link.href = url;
            else if(link.href && link.href === location.href.slice(0, -location.hash.length) + href.hash) link.removeAttribute('href');
        }

		registerRenderer(function() {
	        $('.gameDB-container').not(':has(a)').each(function() {
	            var href;
	
	            /*
	                clear: 기존 파라미터 넘겨주지 않음
	            */
	            if('clear' in this.dataset) {
	                href = new URL(location.href);
	                href.search = '';
	                href = href.href;
	            } else href = location.href;
	
	            $(this).html($('<a />', {
	                href: href
	            }).text(this.innerText));
	        });
	        
	        $('.gameDB-container a').each(function() {
	            var change = new DataChange(this.href);
	            var controllers = $($(this).parents('.gameDB-container').get().reverse());
	
	            process(this, controllers, change);
	            
	            $(this).data('change', change);
	            $(this).addClass('gameDB-link');
	        });
		});
		
		registerHandler(function() {
	        $('.gameDB-link').each(function() {
	        	if(this.href) $(this).one('click', function(event) {
	    			var link = this;
	    			
					event.preventDefault();
					event.stopImmediatePropagation();
					
					if(!('wait' in this.dataset)) this.dataset.wait = 0;
					
					this.dataset.wait++;
					
					$(this).data('change').save().then(function() {
						link.dataset.wait--;
						link.click();
					}, handleError);
	    		});
	        	else $(this).on('click', function handler(event) {
		            $(this).data('change').save().then(function() {
		                mw.notification.notify('데이터가 저장되었습니다.', {
		                    tag: 'gameDB'
		                });
		            }, handleError);
		        });
	        });
		});
    }
    link();
    
    // 비상용 로컬에 임시 저장
    registerHandler(function() {
	    window.addEventListener('hashchange', function(event) {
	    	if(!mw.user.isAnon() && location.hash.endsWith('##emergency-save')) {
	    		mw.notification.notify('긴급 저장 모드가 켜졌습니다. 저장하려던 링크를 다시 눌러 저장해 주세요.');
	    		
			    DataChange.prototype.save = function() {
			    	var change = {};
			        var key;
			
			        if(title in this.root) {
			            change['userjs-gamedb-' + encode(title)] = this.root[title];
			        }
			        for(key in this.local) {
			            change['userjs-gamedb-' + encode(title + '/' + key)] = this.local[key];
			        }
			        for(key in this.global) {
			            change['userjs-gamedb-' + encode('#' + key)] = this.global[key];
			        }
			        
			        change.timestamp = Date.now();
			        
			        localStorage.setItem('gamedb-temp-' + mw.config.get('wgUserName'), JSON.stringify(change));
			        
			        mw.notification.notify('로컬에 데이터를 임시 저장하였습니다.', {
	    				tag: 'gameDB'
	    			});
	    			
			        return Promise.resolve();
			    };
	    		
	    		if(!instantDone) instant();
	    		link();
	    	}
	    });
    });
}
enableDB2();
specialPage('DB2', 'ext.gadget.DB2-SpecialPage', 'DB2 데이터 관리');
