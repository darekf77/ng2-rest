(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("rxjs/add/operator/map"), require("rxjs/Subject"), require("json5"), require("@angular/core"), require("diff"), require("faker"));
	else if(typeof define === 'function' && define.amd)
		define(["rxjs/add/operator/map", "rxjs/Subject", "json5", "@angular/core", "diff", "faker"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("rxjs/add/operator/map"), require("rxjs/Subject"), require("json5"), require("@angular/core"), require("diff"), require("faker")) : factory(root["rxjs/add/operator/map"], root["rxjs/Subject"], root["json5"], root["@angular/core"], root["diff"], root["faker"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_14__, __WEBPACK_EXTERNAL_MODULE_23__, __WEBPACK_EXTERNAL_MODULE_24__, __WEBPACK_EXTERNAL_MODULE_25__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 26);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(16));
//# sourceMappingURL=ng2-logger.js.map

/***/ },
/* 1 */
/***/ function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Level;
(function (Level) {
    Level[Level["DATA"] = 0] = "DATA";
    Level[Level["INFO"] = 1] = "INFO";
    Level[Level["WARN"] = 2] = "WARN";
    Level[Level["ERROR"] = 3] = "ERROR";
    Level[Level["__NOTHING"] = 4] = "__NOTHING";
})(Level = exports.Level || (exports.Level = {}));
//# sourceMappingURL=level.js.map

/***/ },
/* 3 */
/***/ function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_3__;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var MockingMode;
(function (MockingMode) {
    MockingMode[MockingMode["MOCKS_ONLY"] = 0] = "MOCKS_ONLY";
    // MIX = 1,
    MockingMode[MockingMode["LIVE_BACKEND_ONLY"] = 2] = "LIVE_BACKEND_ONLY";
})(MockingMode = exports.MockingMode || (exports.MockingMode = {}));
;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

/**
 * Based on Headers from https://github.com/angular/angular/blob/master/packages/http/src/headers.ts
 */
var RestHeaders = (function () {
    // TODO(vicb): any -> string|string[]
    function RestHeaders(headers) {
        var _this = this;
        /** @internal header names are lower case */
        this._headers = new Map();
        /** @internal map lower case names to actual names */
        this._normalizedNames = new Map();
        if (!headers) {
            return;
        }
        if (headers instanceof RestHeaders) {
            headers.forEach(function (values, name) {
                values.forEach(function (value) { return _this.append(name, value); });
            });
            return;
        }
        Object.keys(headers).forEach(function (name) {
            var values = Array.isArray(headers[name]) ? headers[name] : [headers[name]];
            _this.delete(name);
            values.forEach(function (value) { return _this.append(name, value); });
        });
    }
    /**
     * Returns a new RestHeaders instance from the given DOMString of Response RestHeaders
     */
    RestHeaders.fromResponseHeaderString = function (headersString) {
        var headers = new RestHeaders();
        headersString.split('\n').forEach(function (line) {
            var index = line.indexOf(':');
            if (index > 0) {
                var name_1 = line.slice(0, index);
                var value = line.slice(index + 1).trim();
                headers.set(name_1, value);
            }
        });
        return headers;
    };
    /**
     * Appends a header to existing list of header values for a given header name.
     */
    RestHeaders.prototype.append = function (name, value) {
        var values = this.getAll(name);
        if (values === null) {
            this.set(name, value);
        }
        else {
            values.push(value);
        }
    };
    /**
     * Deletes all header values for the given name.
     */
    RestHeaders.prototype.delete = function (name) {
        var lcName = name.toLowerCase();
        this._normalizedNames.delete(lcName);
        this._headers.delete(lcName);
    };
    RestHeaders.prototype.forEach = function (fn) {
        var _this = this;
        this._headers.forEach(function (values, lcName) { return fn(values, _this._normalizedNames.get(lcName), _this._headers); });
    };
    /**
     * Returns first header that matches given name.
     */
    RestHeaders.prototype.get = function (name) {
        var values = this.getAll(name);
        if (values === null) {
            return null;
        }
        return values.length > 0 ? values[0] : null;
    };
    /**
     * Checks for existence of header by given name.
     */
    RestHeaders.prototype.has = function (name) { return this._headers.has(name.toLowerCase()); };
    /**
     * Returns the names of the headers
     */
    RestHeaders.prototype.keys = function () { return Array.from(this._normalizedNames.values()); };
    /**
     * Sets or overrides header value for given name.
     */
    RestHeaders.prototype.set = function (name, value) {
        if (Array.isArray(value)) {
            if (value.length) {
                this._headers.set(name.toLowerCase(), [value.join(',')]);
            }
        }
        else {
            this._headers.set(name.toLowerCase(), [value]);
        }
        this.mayBeSetNormalizedName(name);
    };
    /**
     * Returns values of all headers.
     */
    RestHeaders.prototype.values = function () { return Array.from(this._headers.values()); };
    /**
     * Returns string of all headers.
     */
    // TODO(vicb): returns {[name: string]: string[]}
    RestHeaders.prototype.toJSON = function () {
        var _this = this;
        var serialized = {};
        this._headers.forEach(function (values, name) {
            var split = [];
            values.forEach(function (v) { return split.push.apply(split, v.split(',')); });
            serialized[_this._normalizedNames.get(name)] = split;
        });
        return serialized;
    };
    /**
     * Returns list of header values for a given name.
     */
    RestHeaders.prototype.getAll = function (name) {
        return this.has(name) ? this._headers.get(name.toLowerCase()) : null;
    };
    RestHeaders.prototype.mayBeSetNormalizedName = function (name) {
        var lcName = name.toLowerCase();
        if (!this._normalizedNames.has(lcName)) {
            this._normalizedNames.set(lcName, name);
        }
    };
    return RestHeaders;
}());
exports.RestHeaders = RestHeaders;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var level_1 = __webpack_require__(2);
var Display = (function () {
    function Display() {
    }
    Display.msg = function (message, params, moduleName, moduleColor, level, moduleWidth) {
        var color = 'gray';
        if (level === level_1.Level.INFO)
            color = 'deepskyblue';
        if (level === level_1.Level.ERROR)
            color = 'red';
        if (level === level_1.Level.WARN)
            color = 'orange';
        if (moduleWidth) {
            var diff = moduleWidth - moduleName.length;
            if (diff > 0) {
                for (var i = 0; i < diff; i++) {
                    moduleName += ' ';
                }
            }
        }
        var a1 = '%c ' + moduleName + '  %c ' + message + ' ';
        var a2 = 'background: ' + moduleColor + ';color:white; ';
        var a3 = 'border: 1px solid ' + color + '; ';
        params.unshift(a3);
        params.unshift(a2);
        params.unshift(a1);
        console.log.apply(console, params);
    };
    return Display;
}());
exports.Display = Display;
//# sourceMappingURL=display.js.map

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function contain(arr, item) {
    return arr.filter(function (l) { return l === item || ((item.match && typeof item.match === 'function') ? item.match(l) : false); }).length > 0;
}
exports.contain = contain;
;
//# sourceMappingURL=include.js.map

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var Subject_1 = __webpack_require__(3);
__webpack_require__(1);
var ng2_logger_1 = __webpack_require__(0);
var log = ng2_logger_1.Log.create('eureka', ng2_logger_1.Level.__NOTHING);
var helpers_1 = __webpack_require__(9);
var rest_headers_1 = __webpack_require__(5);
var Eureka;
(function (Eureka_1) {
    var EurekaWaitTimeout = 500;
    var Eureka = (function () {
        function Eureka(config) {
            this.config = config;
            this.subjectInstanceFounded = new Subject_1.Subject();
            this.onInstance = this.subjectInstanceFounded.asObservable();
            this._state = EurekaState.DISABLED;
            this.headers = new rest_headers_1.RestHeaders();
            this.headers.append('Content-Type', 'application/json');
            this.headers.append('Accept', 'application/json');
        }
        Object.defineProperty(Eureka.prototype, "instance", {
            get: function () {
                return this._instance;
            },
            enumerable: true,
            configurable: true
        });
        Eureka.prototype.isWaiting = function () {
            return (this.state === EurekaState.CHECKING_INSTANCE)
                || (this.state === EurekaState.WAITING_FOR_INSTANCES);
        };
        Object.defineProperty(Eureka.prototype, "state", {
            get: function () {
                return this._state;
            },
            enumerable: true,
            configurable: true
        });
        Eureka.prototype.eurekaInstancesResolver = function (list) {
            var _this = this;
            if (list.length === 1) {
                this._instance = JSON.parse(JSON.stringify(list[0]));
            }
            else {
                var randomInstance = helpers_1.Helpers.getRandomInt(list.length - 1);
                this._instance = JSON.parse(JSON.stringify(list[randomInstance]));
            }
            this.subjectInstanceFounded.next(this._instance);
            setTimeout(function () {
                _this._state = EurekaState.ENABLE;
            });
        };
        Eureka.prototype.discovery = function (request) {
            var _this = this;
            this.onInstance.subscribe(function () {
                console.info('instance resolved !');
            });
            this.request = request;
            this._state = EurekaState.WAITING_FOR_INSTANCES;
            log.i('start JOURNE!!!');
            this.request.get(this.config.serviceUrl + "/" + this.config.decoderName, this.headers)
                .subscribe(function (r) {
                var data = r.json();
                var res = data['application'];
                if (!res.instance || !res.instance.length || res.instance.length === 0) {
                    _this._state = EurekaState.SERVER_ERROR;
                    console.error("Eureka instaces not found on address: " + _this.config.serviceUrl + "/" + _this.config.decoderName + " ");
                    return;
                }
                _this.eurekaInstancesResolver(res.instance.filter(function (e) { return e.EurekaInstanceStatus === 'up'; }));
            }, function () {
                _this._state = EurekaState.SERVER_ERROR;
                console.error("Eureka server not available address: " + _this.config.serviceUrl + "/" + _this.config.decoderName + " ");
                return;
            });
        };
        return Eureka;
    }());
    Eureka_1.Eureka = Eureka;
    ;
    ;
    var EurekaState;
    (function (EurekaState) {
        EurekaState[EurekaState["DISABLED"] = 0] = "DISABLED";
        EurekaState[EurekaState["WAITING_FOR_INSTANCES"] = 1] = "WAITING_FOR_INSTANCES";
        EurekaState[EurekaState["CHECKING_INSTANCE"] = 2] = "CHECKING_INSTANCE";
        EurekaState[EurekaState["ENABLE"] = 3] = "ENABLE";
        EurekaState[EurekaState["SERVER_ERROR"] = 4] = "SERVER_ERROR";
    })(EurekaState = Eureka_1.EurekaState || (Eureka_1.EurekaState = {}));
})(Eureka = exports.Eureka || (exports.Eureka = {}));


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var Helpers;
(function (Helpers) {
    /**
         * Returns a random integer between min (inclusive) and max (inclusive)
         * Using Math.round() will give you a non-uniform distribution!
         */
    function getRandomInt(max, min) {
        if (min === void 0) { min = 0; }
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    Helpers.getRandomInt = getRandomInt;
    function isArray(o) {
        return (o instanceof Array);
    }
    Helpers.isArray = isArray;
    function isObjectButNotArray(o) {
        return typeof o === 'object' && !isArray(o);
    }
    Helpers.isObjectButNotArray = isObjectButNotArray;
})(Helpers = exports.Helpers || (exports.Helpers = {}));


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var faker = __webpack_require__(25);
var helpers_1 = __webpack_require__(9);
var ng2_logger_1 = __webpack_require__(0);
var log = ng2_logger_1.Log.create('eureka', ng2_logger_1.Level.__NOTHING);
var MockBackend;
(function (MockBackend) {
    function goInside(o, paths) {
        log.d("paths", paths);
        log.d("o", o);
        if (paths.length === 0)
            return o;
        var tmp = o;
        paths.forEach(function (path) {
            if (tmp[path] === undefined)
                tmp[path] = {};
            tmp = tmp[path];
            log.d("upper for path:" + path, o);
        });
        log.i("tmp", tmp);
        return tmp;
    }
    MockBackend.goInside = goInside;
    function isSimpleType(value) {
        return ((typeof value === 'number') ||
            (typeof value === 'boolean') ||
            (typeof value === 'string') ||
            (typeof value === 'undefined'));
    }
    MockBackend.isSimpleType = isSimpleType;
    MockBackend.pName = function (p) {
        return p.startsWith('$') ? p.slice(1) : p;
    };
    function copyFromTo(fromObj, toObj) {
        for (var p in fromObj) {
            if (fromObj.hasOwnProperty(p)) {
                toObj[p] = fromObj[p];
            }
        }
        for (var p in toObj) {
            if (toObj.hasOwnProperty(p)) {
                log.d('p', p);
                if (p.charAt(0) === '$')
                    delete toObj[p];
            }
        }
    }
    MockBackend.copyFromTo = copyFromTo;
    ;
    var MockAutoBackend = (function () {
        function MockAutoBackend(template, howManyGen) {
            this.models = [];
            for (var i = 0; i < howManyGen; i++) {
                var model = {};
                this.construct(template, model);
                this.models.push(model);
                log.d('model', model);
            }
        }
        /**
         * Create data for pagination from models<T>
         *
         * @param {number} page
         * @param {number} pageSize
         * @returns {T[]}
         *
         * @memberOf MockAutoBackend
         */
        MockAutoBackend.prototype.getPagination = function (page, pageSize) {
            var indexStart = (page - 1) * pageSize;
            var indexEnd = indexStart + pageSize;
            var d = this.models.slice(indexStart, indexEnd);
            return d;
        };
        MockAutoBackend.prototype.filterBy = function (modelKeys) {
            var filterd = [];
            var _loop_1 = function (p) {
                if (modelKeys.hasOwnProperty(p)) {
                    filterd.concat(this_1.models
                        .filter(function (m) { return modelKeys[p] === m[p]; }));
                }
            };
            var this_1 = this;
            for (var p in modelKeys) {
                _loop_1(p);
            }
            return filterd;
        };
        MockAutoBackend.prototype.updateModelsBy = function (modelKeys, model) {
            var models = this.filterBy(modelKeys);
            models.forEach(function (m) {
                m = model;
            });
            return models;
        };
        MockAutoBackend.prototype.deleteModelBy = function (modelKeys, model) {
            var _this = this;
            var models = this.filterBy(modelKeys);
            var deletedModes = JSON.parse(JSON.stringify(models));
            var indexesToDelete = [];
            models.forEach(function (m) {
                indexesToDelete.push(_this.models.indexOf(m, 0));
            });
            indexesToDelete.forEach(function (index) {
                if (index > -1) {
                    _this.models.splice(index, 1);
                }
            });
            return models;
        };
        MockAutoBackend.prototype.addModelBy = function (newKeys, model) {
            this.models.push(model);
            for (var p in newKeys) {
                if (newKeys.hasOwnProperty(p)) {
                    model[p] = newKeys[p];
                }
            }
            return model;
        };
        MockAutoBackend.prototype.sortBy = function (params) {
            var models = JSON.parse(JSON.stringify(this.models));
            params.forEach(function (s) {
                models = models.sort(function (a, b) {
                    if (s.type === 'DESC') {
                        if (a[s.field] < b[s.field])
                            return -1;
                        if (a[s.field] > b[s.field])
                            return 1;
                    }
                    else if (s.type === 'ASC') {
                        if (a[s.field] < b[s.field])
                            return 1;
                        if (a[s.field] > b[s.field])
                            return -1;
                    }
                    return 0;
                });
            });
            return models;
        };
        /**
         * generate values.
         * if property name starts with '$' and is of type:
         *  array - pick one from value array
         *  string - assume it is [faker.js mustache string]{@link https://github.com/marak/Faker.js/#fakerfake} and try to fill it
         *
         * @param template json template object
         * @param cModel model to modify
         * @param path for recursive calls
         */
        MockAutoBackend.prototype.construct = function (template, cModel, path) {
            var _this = this;
            if (path === void 0) { path = []; }
            var tmpModel;
            for (var p in template) {
                if (template.hasOwnProperty(p)) {
                    var value = template[p];
                    if (helpers_1.Helpers.isArray(value) && p.startsWith('$')) {
                        var arr = value;
                        arr.forEach(function (elem) {
                            if (!helpers_1.Helpers.isArray(elem) && !isSimpleType(elem)) {
                                var t = {};
                                _this.construct(elem, t);
                                copyFromTo(t, elem);
                            }
                        });
                        var g = helpers_1.Helpers.getRandomInt(arr.length - 1);
                        goInside(cModel, path)[MockBackend.pName(p)] = arr[g];
                        tmpModel = JSON.parse(JSON.stringify(cModel));
                        continue;
                    }
                    if (p.startsWith('$') && 'string' === typeof value) {
                        var val = undefined;
                        try {
                            val = faker.fake(value);
                        }
                        catch (e) {
                            console.error(e);
                        }
                        goInside(cModel, path)[MockBackend.pName(p)] = val;
                        tmpModel = JSON.parse(JSON.stringify(cModel));
                        continue;
                    }
                    if (helpers_1.Helpers.isObjectButNotArray(value) || helpers_1.Helpers.isArray(value)) {
                        var joinedPath = path.concat(MockBackend.pName(p));
                        this.construct(value, cModel, joinedPath);
                        continue;
                    }
                    if (isSimpleType(value) || p.startsWith('$')) {
                        goInside(cModel, path)[MockBackend.pName(p)] = value;
                        tmpModel = JSON.parse(JSON.stringify(cModel));
                        continue;
                    }
                    throw new Error('bad type of object: ' + value);
                }
            }
        };
        return MockAutoBackend;
    }());
    MockAutoBackend.goInside = goInside;
    MockBackend.MockAutoBackend = MockAutoBackend;
})(MockBackend = exports.MockBackend || (exports.MockBackend = {}));


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var diff_1 = __webpack_require__(24);
var ng2_logger_1 = __webpack_require__(0);
var log = ng2_logger_1.Log.create('nested params', ng2_logger_1.Level.__NOTHING);
var UrlNestedParams;
(function (UrlNestedParams) {
    function checkValidUrl(url) {
        var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
        return regex.test(url);
    }
    UrlNestedParams.checkValidUrl = checkValidUrl;
    /** check if string is a valid pattern */
    function isValid(pattern) {
        return (new RegExp('\/:[a-zA-Z]*', 'g')).test(pattern.replace('://', ''));
    }
    UrlNestedParams.isValid = isValid;
    function check(url, pattern) {
        if (!checkValidUrl(url)) {
            console.error("Incorrect url: " + url);
            return false;
        }
        if (url.charAt(url.length - 1) === '/')
            url = url.slice(0, url.length - 2);
        if (pattern.charAt(pattern.length - 1) === '/')
            pattern = pattern.slice(0, url.length - 2);
        pattern = pattern.replace(/\//g, '\/');
        pattern = pattern.replace(new RegExp('\/:[a-zA-Z]*', 'g'), '.+');
        var reg = new RegExp(pattern, 'g');
        return reg.test(url);
    }
    UrlNestedParams.check = check;
    function getModels(pattern) {
        var m = pattern.match(new RegExp('[a-z-A-Z]*\/:', 'g'));
        return m.map(function (p) { return p.replace('/:', ''); });
    }
    UrlNestedParams.getModels = getModels;
    function getRestPramsNames(pattern) {
        if (pattern.charAt(pattern.length - 1) !== '/')
            pattern = pattern + "/";
        var m = pattern.match(new RegExp(':[a-zA-Z]*\/', 'g'));
        var res = m.map(function (p) { return p.replace(':', '').replace('/', ''); });
        return res.filter(function (p) { return p.trim() !== ''; });
    }
    UrlNestedParams.getRestPramsNames = getRestPramsNames;
    function containsModels(url, models) {
        if (url.charAt(0) !== '/')
            url = '/' + url;
        // url = url.replace(new RegExp('\/', 'g'), '');
        var res = models.filter(function (m) {
            var word = '/' + m;
            log.d('word', word);
            var iii = url.indexOf(word);
            log.d('iii', iii);
            if (iii + word.length < url.length && url.charAt(iii + word.length) !== '/') {
                return false;
            }
            if (iii !== -1) {
                url = url.replace(new RegExp('\/' + m, 'g'), '');
                return true;
            }
            return false;
        }).length;
        log.d('containsModels', res);
        return res === models.length;
    }
    UrlNestedParams.containsModels = containsModels;
    function stars(n) {
        var res = '';
        for (var i = 0; i < n; i++)
            res += '*';
        return res;
    }
    UrlNestedParams.stars = stars;
    function getRestParams(url, pattern) {
        var res = {};
        var models = getRestPramsNames(pattern);
        log.d('models', models);
        models.forEach(function (m) {
            pattern = pattern.replace(":" + m, stars(m.length));
        });
        var currentModel = undefined;
        diff_1.diffChars(pattern, url).forEach(function (d) {
            log.d('d', d);
            if (d.added) {
                if (!isNaN(Number(d.value)))
                    res[currentModel] = Number(d.value);
                else if (d.value.trim() === 'true')
                    res[currentModel] = true;
                else if (d.value.trim() === 'false')
                    res[currentModel] = false;
                else
                    res[currentModel] = decodeURIComponent(d.value);
                currentModel = undefined;
            }
            var m = d.value.replace(':', "");
            log.d('model m', m);
            if (d.removed) {
                currentModel = models.shift();
            }
        });
        return res;
    }
    UrlNestedParams.getRestParams = getRestParams;
    function interpolateParamsToUrl(params, url) {
        var itHasSlash = false;
        if (url.charAt(url.length - 1) !== '/') {
            url = url + "/";
            itHasSlash = true;
        }
        for (var p in params) {
            if (params.hasOwnProperty(p)) {
                var v = params[p];
                url = url.replace(new RegExp(":" + p + "/", 'g'), v + "/");
            }
        }
        return itHasSlash ? url.slice(0, url.length - 1) : url;
    }
    UrlNestedParams.interpolateParamsToUrl = interpolateParamsToUrl;
})(UrlNestedParams = exports.UrlNestedParams || (exports.UrlNestedParams = {}));


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var Subject_1 = __webpack_require__(3);
__webpack_require__(1);
var ng2_logger_1 = __webpack_require__(0);
var log = ng2_logger_1.Log.create('resouce-service', ng2_logger_1.Level.__NOTHING);
var eureka_1 = __webpack_require__(8);
var mocking_mode_1 = __webpack_require__(4);
var nested_params_1 = __webpack_require__(11);
var rest_class_1 = __webpack_require__(21);
var rest_request_1 = __webpack_require__(20);
var core_1 = __webpack_require__(23);
var Resource = (function () {
    function Resource() {
        // Quick fix
        if (Resource.__mockingMode === undefined)
            Resource.__mockingMode = mocking_mode_1.MockingMode.LIVE_BACKEND_ONLY;
        log.i('heelooeoeoeo');
    }
    Resource.create = function (e, model) {
        Resource.map(e, e);
        Resource.instance.add(e, model ? model : '');
        return {
            model: function (params) { return Resource.instance.api(e, model ? nested_params_1.UrlNestedParams.interpolateParamsToUrl(params, model) : ''); }
        };
    };
    Resource.init = function (zone) {
        if (zone instanceof core_1.NgZone)
            rest_request_1.RestRequest.zone = zone;
    };
    Resource.reset = function () {
        Resource.endpoints = {};
        Resource.mockingModeIsSet = false;
    };
    Object.defineProperty(Resource, "Headers", {
        get: function () {
            var res = {
                request: rest_class_1.Rest.headers,
                response: rest_class_1.Rest.headersResponse
            };
            return res;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * This funcion only works one time per tab in browse.
     * It means that if e2e tests needs only one browse tab
     * which is refreshed constantly and it doesn't make sens to
     * recreate server every time. In conclusion curent function
     * state is remembered in sesssion storage.
     *
     * @static
     * @param {string} url to ng2-rest  https://github.com/darekf77/ng2-rest
     * @param {string} Optional: Title for docs
     * @param {string} Optional: Force recreate docs every time when you are
     * using this function
     *
     * @memberOf Resource
     */
    Resource.setUrlToDocsServerAndRecreateIt = function (url, docsTitle, forceRecreate) {
        if (docsTitle === void 0) { docsTitle = undefined; }
        if (forceRecreate === void 0) { forceRecreate = false; }
        if (docsTitle)
            rest_class_1.Rest.docsTitle = docsTitle;
        rest_class_1.Rest.docServerUrl = sessionStorage.getItem('url');
        log.d('Rest.docServerUrl from session storage', rest_class_1.Rest.docServerUrl);
        if (forceRecreate ||
            rest_class_1.Rest.docServerUrl === undefined ||
            rest_class_1.Rest.docServerUrl === null ||
            rest_class_1.Rest.docServerUrl.trim() === '') {
            rest_class_1.Rest.docServerUrl = url;
            sessionStorage.setItem('url', url);
            rest_class_1.Rest.restartServerRequest = true;
            log.i('Recreate docs server request');
        }
    };
    Object.defineProperty(Resource, "__mockingMode", {
        get: function () {
            return rest_class_1.Rest.mockingMode;
        },
        set: function (mode) {
            rest_class_1.Rest.mockingMode = mode;
        },
        enumerable: true,
        configurable: true
    });
    Resource.setMockingMode = function (mode, setOnce) {
        if (setOnce === void 0) { setOnce = false; }
        if (Resource.mockingModeIsSet) {
            if (Resource.enableWarnings)
                console.warn('MOCKING MODE already set for entire application');
            return;
        }
        Resource.mockingModeIsSet = setOnce;
        Resource.__mockingMode = mode;
        log.i('Mode is set ', mode);
    };
    // private static eureka: Eureka<any, any>;
    Resource.mapEureka = function (config) {
        if (!config || !config.serviceUrl || !config.decoderName) {
            throw "Bad Eureka config: " + JSON.stringify(config);
        }
        rest_class_1.Rest.eureka = new eureka_1.Eureka.Eureka(config);
        rest_class_1.Rest.eureka.onInstance.subscribe(function (ins) {
            Resource.endpoints[ins.app] = {
                url: ins.instanceId,
                models: {}
            };
            Resource.subEurekaEndpointReady.next(ins);
        });
        log.i('eureka mapped');
        return true;
    };
    Resource.map = function (endpoint, url) {
        log.i('url', url);
        if (rest_class_1.Rest.eureka) {
            throw "Canno use 'map()' function after 'mapEureka()'";
        }
        var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
        var e = endpoint;
        if (!regex.test(url)) {
            throw "Url address is not correct: " + url;
        }
        if (url.charAt(url.length - 1) === '/')
            url = url.slice(0, url.length - 1);
        log.i('url after', url);
        if (Resource.endpoints[e] !== undefined) {
            if (Resource.enableWarnings)
                console.warn('Cannot use map function at the same API endpoint again ('
                    + Resource.endpoints[e].url + ')');
            return false;
        }
        Resource.endpoints[e] = {
            url: url,
            models: {}
        };
        log.i('enpoints', Resource.endpoints);
        return true;
    };
    /**
     * And enipoint to application
     *
     * @param {E} endpoint
     * @param {string} model
     * @returns {boolean}
     */
    Resource.prototype.add = function (endpoint, model, group, name, description) {
        var _this = this;
        log.i("I am maping " + model + " on " + endpoint);
        if (rest_class_1.Rest.eureka && rest_class_1.Rest.eureka.state === eureka_1.Eureka.EurekaState.DISABLED) {
            rest_class_1.Rest.eureka.discovery(Resource.request);
        }
        if (rest_class_1.Rest.eureka && rest_class_1.Rest.eureka.state !== eureka_1.Eureka.EurekaState.ENABLE // && Rest.eureka.state !== EurekaState.SERVER_ERROR
        ) {
            Resource.subEurekaEndpointReady.subscribe(function (ins) {
                log.i('instance should exist ', ins);
                _this.add(endpoint, model, group, name, description);
            });
            return;
        }
        if (!name) {
            var exName = model.replace(new RegExp('/', 'g'), ' ');
            var slName = exName.split(' ');
            var newName = [];
            var rName = slName.map(function (fr) { return (fr[0]) ? (fr[0].toUpperCase() + fr.substr(1)) : ''; });
            name = rName.join(' ');
        }
        if (model.charAt(model.length - 1) === '/')
            model = model.slice(0, model.length - 1);
        if (model.charAt(0) === '/')
            model = model.slice(1, model.length);
        var e;
        if (rest_class_1.Rest.eureka && rest_class_1.Rest.eureka.state === eureka_1.Eureka.EurekaState.ENABLE && rest_class_1.Rest.eureka.instance) {
            e = rest_class_1.Rest.eureka.instance.app;
        }
        else {
            e = (endpoint).toString();
        }
        if (Resource.endpoints[e] === undefined) {
            console.error('Endpoint is not mapped ! Cannot add model ' + model);
            return;
        }
        if (Resource.endpoints[e].models[model] !== undefined) {
            if (Resource.enableWarnings)
                console.warn("Model '" + model + "' is already defined in endpoint: "
                    + Resource.endpoints[e].url);
            return;
        }
        Resource.endpoints[e].models[model] =
            new rest_class_1.Rest(Resource.endpoints[e].url
                + '/' + model, Resource.request, description, name, group);
        return;
    };
    /**
     * Access api throught endpoint
     *
     * @param {E} endpoint
     * @param {string} model
     * @returns {Rest<T, TA>}
     */
    Resource.prototype.api = function (endpoint, model, usecase) {
        if (model.charAt(0) === '/')
            model = model.slice(1, model.length);
        var e = (endpoint).toString();
        if (Resource.endpoints[e] === undefined) {
            throw "Endpoint: " + endpoint + " is not mapped ! Cannot add model: " + model;
        }
        var allModels = Resource.endpoints[e].models;
        var orgModel = model;
        model = this.checkNestedModels(model, allModels);
        if (Resource.endpoints[e].models[model] === undefined) {
            log.d('Resource.endpoints', Resource.endpoints);
            throw "Model '" + model + "' is undefined in endpoint: " + Resource.endpoints[e].url + " ";
        }
        var res = Resource.endpoints[(endpoint).toString()].models[model];
        res.__usecase_desc = usecase;
        if (orgModel !== model) {
            var baseUrl = Resource.endpoints[(endpoint).toString()].url;
            log.d('base', Resource.endpoints[(endpoint).toString()]);
            log.d('baseUrl', baseUrl);
            log.d('orgModel', orgModel);
            res.__rest_endpoint = baseUrl + "/" + orgModel;
        }
        else
            res.__rest_endpoint = undefined;
        return res;
    };
    Resource.prototype.checkNestedModels = function (model, allModels) {
        if (model.indexOf('/') !== -1) {
            for (var p in allModels) {
                if (allModels.hasOwnProperty(p)) {
                    var m = allModels[p];
                    if (nested_params_1.UrlNestedParams.isValid(p)) {
                        var urlModels = nested_params_1.UrlNestedParams.getModels(p);
                        if (nested_params_1.UrlNestedParams.containsModels(model, urlModels)) {
                            model = p;
                            break;
                        }
                    }
                }
            }
        }
        return model;
    };
    return Resource;
}());
Resource.instance = new Resource();
Resource.endpoints = {};
Resource.request = new rest_request_1.RestRequest();
Resource.enableWarnings = true;
Resource.mockingModeIsSet = false;
Resource.setMockingModeOnce = function (mode) { return Resource.setMockingMode(mode, true); };
Resource.mockingMode = {
    setMocksOnly: function () {
        Resource.setMockingMode(mocking_mode_1.MockingMode.MOCKS_ONLY);
    },
    setBackendOnly: function () {
        Resource.setMockingMode(mocking_mode_1.MockingMode.LIVE_BACKEND_ONLY);
    },
    isMockOnlyMode: function () { return Resource.__mockingMode === mocking_mode_1.MockingMode.MOCKS_ONLY; },
    isBackendOnlyMode: function () { return Resource.__mockingMode === mocking_mode_1.MockingMode.LIVE_BACKEND_ONLY; }
};
/**
 * Use enpoint in your app
 *
 * @static
 * @template T
 * @param {T} endpoint_url
 * @returns {boolean}
 */
Resource.subEurekaEndpointReady = new Subject_1.Subject();
Resource.obs = Resource.subEurekaEndpointReady.asObservable();
exports.Resource = Resource;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

__webpack_require__(1);
var ng2_logger_1 = __webpack_require__(0);
var log = ng2_logger_1.Log.create('rest namespace', ng2_logger_1.Level.__NOTHING);
var Rest;
(function (Rest) {
    /**
     * Get query params from url, like 'ex' in /api/books?ex=value
    */
    function decodeUrl(url) {
        var regex = /[?&]([^=#]+)=([^&#]*)/g, params = {}, match;
        while (match = regex.exec(url)) {
            params[decodeURIComponent(match[1])] = decodeURIComponent(match[2]);
        }
        var paramsObject = params;
        for (var p in paramsObject) {
            if (paramsObject[p] === undefined) {
                delete paramsObject[p];
                continue;
            }
            if (paramsObject.hasOwnProperty(p)) {
                // chcek if property is number
                var n = Number(params[p]);
                if (!isNaN(n)) {
                    params[p] = n;
                    continue;
                }
                if (typeof params[p] === 'string') {
                    // check if property is object
                    var json = void 0;
                    try {
                        json = JSON.parse(params[p]);
                    }
                    catch (error) { }
                    if (json !== undefined) {
                        params[p] = json;
                        continue;
                    }
                }
            }
        }
        return params;
    }
    Rest.decodeUrl = decodeUrl;
    ;
    /**
     * Create query params string for url
     *
     * @export
     * @param {UrlParams[]} params
     * @returns {string}
     */
    function getParamsUrl(params, doNotSerialize) {
        if (doNotSerialize === void 0) { doNotSerialize = false; }
        var urlparts = [];
        if (!params)
            return '';
        if (!(params instanceof Array))
            return '';
        if (params.length === 0)
            return '';
        params.forEach(function (urlparam) {
            if (JSON.stringify(urlparam) !== '{}') {
                var parameters = [];
                var paramObject = urlparam;
                for (var p in paramObject) {
                    if (paramObject[p] === undefined)
                        delete paramObject[p];
                    if (paramObject.hasOwnProperty(p) && typeof p === 'string' && p !== 'regex' && !(paramObject[p] instanceof RegExp)) {
                        if (p.length > 0 && p[0] === '/') {
                            var newName = p.slice(1, p.length - 1);
                            urlparam[newName] = urlparam[p];
                            urlparam[p] = undefined;
                            p = newName;
                        }
                        if (p.length > 0 && p[p.length - 1] === '/') {
                            var newName = p.slice(0, p.length - 2);
                            urlparam[newName] = urlparam[p];
                            urlparam[p] = undefined;
                            p = newName;
                        }
                        var v = urlparam[p];
                        if (v instanceof Object) {
                            urlparam[p] = JSON.stringify(urlparam[p]);
                        }
                        urlparam[p] = doNotSerialize ? urlparam[p] : encodeURIComponent(urlparam[p]);
                        if (urlparam.regex !== undefined && urlparam.regex instanceof RegExp) {
                            if (!urlparam.regex.test(urlparam[p])) {
                                console.warn("Data: " + urlparam[p] + " incostistent with regex " + urlparam.regex.source);
                            }
                        }
                        parameters.push(p + "=" + urlparam[p]);
                    }
                }
                urlparts.push(parameters.join('&'));
            }
        });
        var join = urlparts.join().trim();
        if (join.trim() === '')
            return '';
        return "?" + urlparts.join('&');
    }
    Rest.getParamsUrl = getParamsUrl;
    function transform(o) {
        if (typeof o === 'object') {
            return encodeURIComponent(JSON.stringify(o));
        }
        return o;
    }
    function prepareUrlOldWay(params) {
        if (!params)
            return this.endpoint;
        if (typeof params === 'object') {
            params = transform(params);
        }
        return this.endpoint + '/' + params;
    }
    Rest.prepareUrlOldWay = prepareUrlOldWay;
    [];
    function prepare(params) {
        if (params && params instanceof Array) {
            params.forEach(function (p) {
                if (p !== undefined && p.regex !== undefined && p.regex instanceof RegExp)
                    p['regex'] = p.regex.source;
            });
        }
    }
    Rest.prepare = prepare;
})(Rest = exports.Rest || (exports.Rest = {}));


/***/ },
/* 14 */
/***/ function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_14__;

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
__export(__webpack_require__(12));
__export(__webpack_require__(8));
__export(__webpack_require__(10));
__export(__webpack_require__(13));
__export(__webpack_require__(4));
__export(__webpack_require__(22));


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(17));
__export(__webpack_require__(2));
//# sourceMappingURL=index.js.map

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = __webpack_require__(18);
var level_1 = __webpack_require__(2);
var display_1 = __webpack_require__(6);
var include_1 = __webpack_require__(7);
var Log = (function () {
    function Log() {
    }
    Log.create = function (name) {
        var level = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            level[_i - 1] = arguments[_i];
        }
        var i;
        if (Log.instances[name] === undefined) {
            i = new logger_1.Logger(name, Log.getRandomColor(), Log.levels.length > 0 ? Log.display : undefined, Log.isDevelopmentMode, level, Log.isMutedModule(name), Log.levels.length > 0 ? Log.fixedWidth : undefined);
            Log.instances[name] = i;
        }
        else {
            i = Log.instances[name];
        }
        return i;
    };
    Log.getRandomColor = function () {
        var letters = '012345'.split('');
        var color = '#';
        color += letters[Math.round(Math.random() * 5)];
        letters = '0123456789ABCDEF'.split('');
        for (var i = 0; i < 5; i++) {
            color += letters[Math.round(Math.random() * 15)];
        }
        if (color === undefined)
            return this.getRandomColor();
        return color;
    };
    Log.display = function (name, data, incomming, moduleName) {
        if (!include_1.contain(Log.levels, incomming))
            return;
        if (incomming === level_1.Level.DATA) {
            display_1.Display.msg(name, data, name, Log.instances[moduleName].color, level_1.Level.DATA, Log.instances[moduleName].fixedWidth);
        }
        if (incomming === level_1.Level.ERROR) {
            display_1.Display.msg(name, data, name, Log.instances[moduleName].color, level_1.Level.ERROR, Log.instances[moduleName].fixedWidth);
        }
        if (incomming === level_1.Level.INFO) {
            display_1.Display.msg(name, data, name, Log.instances[moduleName].color, level_1.Level.INFO, Log.instances[moduleName].fixedWidth);
        }
        if (incomming === level_1.Level.WARN) {
            display_1.Display.msg(name, data, name, Log.instances[moduleName].color, level_1.Level.WARN, Log.instances[moduleName].fixedWidth);
        }
    };
    Log.onlyLevel = function () {
        var level = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            level[_i] = arguments[_i];
        }
        if (Log._logOnly) {
            console.error('You should use funcion onlyLevel only once');
            return;
        }
        if (Log._logOnly)
            Log._logOnly = true;
        if (level.length === 0)
            return;
        Log.levels = level;
    };
    Log.onlyModules = function () {
        var modules = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            modules[_i] = arguments[_i];
        }
        if (Log._logModules) {
            console.error('You should use funcion onlyModules only once');
            return;
        }
        if (modules.length === 0)
            return;
        Log.modules = modules;
        Log.muteAllOtherModules();
    };
    Log.isMutedModule = function (moduleName) {
        if (Log.modules.length == 0)
            return false;
        if (!include_1.contain(Log.modules, moduleName))
            return true;
        return false;
    };
    Log.muteAllOtherModules = function () {
        for (var moduleName in Log.instances) {
            if (!include_1.contain(Log.modules, moduleName))
                Log.instances[moduleName].mute();
        }
    };
    Log.setProductionMode = function () {
        if (Log.modeIsSet) {
            console.error('Mode is already set');
            return;
        }
        if (console !== undefined && console.clear !== undefined) {
            setTimeout(function () {
                console.clear();
                console.log = function () { };
                console.error = function () { };
                console.warn = function () { };
                console.info = function () { };
            });
        }
        logger_1.Logger.isProductionMode = true;
        Log.isDevelopmentMode = false;
    };
    return Log;
}());
Log.instances = {};
Log.fixedWidth = 0;
Log._logOnly = false;
Log.levels = [];
Log._logModules = false;
Log.modules = [];
Log.isDevelopmentMode = true;
Log.modeIsSet = false;
exports.Log = Log;
//# sourceMappingURL=log.js.map

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var level_1 = __webpack_require__(2);
var display_1 = __webpack_require__(6);
var include_1 = __webpack_require__(7);
var Logger = (function () {
    function Logger(name, color, display, developmentMode, allowed, isMuted, fixedWidth) {
        this.name = name;
        this.color = color;
        this.display = display;
        this.developmentMode = developmentMode;
        this.allowed = allowed;
        this.isMuted = isMuted;
        this.fixedWidth = fixedWidth;
        this._level = undefined;
    }
    Logger.prototype.d = function (name) {
        var data = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            data[_i - 1] = arguments[_i];
        }
        if (this.allowed.length >= 1 && include_1.contain(this.allowed, level_1.Level.__NOTHING)
            && !include_1.contain(this.allowed, level_1.Level.DATA))
            return this;
        if (Logger.isProductionMode)
            return this;
        if (this.display !== undefined)
            this.display(name, data, level_1.Level.DATA, this.name);
        else if (this.allowed.length === 0 || include_1.contain(this.allowed, level_1.Level.DATA)) {
            display_1.Display.msg(name, data, this.name, this.color, level_1.Level.DATA, this.fixedWidth);
        }
        return this;
    };
    Logger.prototype.er = function (name) {
        var data = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            data[_i - 1] = arguments[_i];
        }
        if (this.allowed.length >= 1 && include_1.contain(this.allowed, level_1.Level.__NOTHING)
            && !include_1.contain(this.allowed, level_1.Level.ERROR))
            return this;
        if (Logger.isProductionMode)
            return this;
        if (this.display !== undefined)
            this.display(name, data, level_1.Level.ERROR, this.name);
        else if (this.allowed.length === 0 || include_1.contain(this.allowed, level_1.Level.ERROR)) {
            display_1.Display.msg(name, data, this.name, this.color, level_1.Level.ERROR, this.fixedWidth);
        }
        return this;
    };
    Logger.prototype.i = function (name) {
        var data = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            data[_i - 1] = arguments[_i];
        }
        if (this.allowed.length >= 1 && include_1.contain(this.allowed, level_1.Level.__NOTHING)
            && !include_1.contain(this.allowed, level_1.Level.INFO))
            return this;
        if (Logger.isProductionMode)
            return this;
        if (this.display !== undefined)
            this.display(name, data, level_1.Level.INFO, this.name);
        else if (this.allowed.length === 0 || include_1.contain(this.allowed, level_1.Level.INFO)) {
            display_1.Display.msg(name, data, this.name, this.color, level_1.Level.INFO, this.fixedWidth);
        }
        return this;
    };
    Logger.prototype.w = function (name) {
        var data = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            data[_i - 1] = arguments[_i];
        }
        if (this.allowed.length >= 1 && include_1.contain(this.allowed, level_1.Level.__NOTHING)
            && !include_1.contain(this.allowed, level_1.Level.WARN))
            return this;
        if (Logger.isProductionMode)
            return this;
        if (this.display !== undefined)
            this.display(name, data, level_1.Level.WARN, this.name);
        else if (this.allowed.length === 0 || include_1.contain(this.allowed, level_1.Level.WARN)) {
            display_1.Display.msg(name, data, this.name, this.color, level_1.Level.WARN, this.fixedWidth);
        }
        return this;
    };
    Logger.prototype._logMessage = function (name, level) {
        var data = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            data[_i - 2] = arguments[_i];
        }
        if (this.isMuted)
            return this;
        if (this.allowed.length >= 1 && include_1.contain(this.allowed, level)
            && !include_1.contain(this.allowed, level))
            return this;
        if (Logger.isProductionMode)
            return this;
        if (this.display !== undefined)
            this.display(name, data, level, this.name);
        else if (this.allowed.length === 0 || include_1.contain(this.allowed, level)) {
            display_1.Display.msg(name, data, this.name, this.color, level, this.fixedWidth);
        }
        return this;
    };
    Logger.prototype.level = function (l) {
        this._level = l;
        return this;
    };
    Logger.prototype.mute = function () {
        this.isMuted = true;
    };
    return Logger;
}());
Logger.isProductionMode = false;
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map

/***/ },
/* 19 */
/***/ function(module, exports) {

module.exports = "var RestHeaders = (function () {\n    // TODO(vicb): any -> string|string[]\n    function RestHeaders(headers) {\n        var _this = this;\n        /** @internal header names are lower case */\n        this._headers = new Map();\n        /** @internal map lower case names to actual names */\n        this._normalizedNames = new Map();\n        if (!headers) {\n            return;\n        }\n        if (headers instanceof RestHeaders) {\n            headers.forEach(function (values, name) {\n                values.forEach(function (value) { return _this.append(name, value); });\n            });\n            return;\n        }\n        Object.keys(headers).forEach(function (name) {\n            var values = Array.isArray(headers[name]) ? headers[name] : [headers[name]];\n            _this.delete(name);\n            values.forEach(function (value) { return _this.append(name, value); });\n        });\n    }\n    /**\n     * Returns a new RestHeaders instance from the given DOMString of Response RestHeaders\n     */\n    RestHeaders.fromResponseHeaderString = function (headersString) {\n        var headers = new RestHeaders();\n        headersString.split('\\n').forEach(function (line) {\n            var index = line.indexOf(':');\n            if (index > 0) {\n                var name = line.slice(0, index);\n                var value = line.slice(index + 1).trim();\n                headers.set(name, value);\n            }\n        });\n        return headers;\n    };\n    /**\n     * Appends a header to existing list of header values for a given header name.\n     */\n    RestHeaders.prototype.append = function (name, value) {\n        var values = this.getAll(name);\n        if (values === null) {\n            this.set(name, value);\n        }\n        else {\n            values.push(value);\n        }\n    };\n    /**\n     * Deletes all header values for the given name.\n     */\n    RestHeaders.prototype.delete = function (name) {\n        var lcName = name.toLowerCase();\n        this._normalizedNames.delete(lcName);\n        this._headers.delete(lcName);\n    };\n    RestHeaders.prototype.forEach = function (fn) {\n        var _this = this;\n        this._headers.forEach(function (values, lcName) { return fn(values, _this._normalizedNames.get(lcName), _this._headers); });\n    };\n    /**\n     * Returns first header that matches given name.\n     */\n    RestHeaders.prototype.get = function (name) {\n        var values = this.getAll(name);\n        if (values === null) {\n            return null;\n        }\n        return values.length > 0 ? values[0] : null;\n    };\n    /**\n     * Checks for existence of header by given name.\n     */\n    RestHeaders.prototype.has = function (name) { return this._headers.has(name.toLowerCase()); };\n    /**\n     * Returns the names of the headers\n     */\n    RestHeaders.prototype.keys = function () { return Array.from(this._normalizedNames.values()); };\n    /**\n     * Sets or overrides header value for given name.\n     */\n    RestHeaders.prototype.set = function (name, value) {\n        if (Array.isArray(value)) {\n            if (value.length) {\n                this._headers.set(name.toLowerCase(), [value.join(',')]);\n            }\n        }\n        else {\n            this._headers.set(name.toLowerCase(), [value]);\n        }\n        this.mayBeSetNormalizedName(name);\n    };\n    /**\n     * Returns values of all headers.\n     */\n    RestHeaders.prototype.values = function () { return Array.from(this._headers.values()); };\n    /**\n     * Returns string of all headers.\n     */\n    // TODO(vicb): returns {[name: string]: string[]}\n    RestHeaders.prototype.toJSON = function () {\n        var _this = this;\n        var serialized = {};\n        this._headers.forEach(function (values, name) {\n            var split = [];\n            values.forEach(function (v) { return split.push.apply(split, v.split(',')); });\n            serialized[_this._normalizedNames.get(name)] = split;\n        });\n        return serialized;\n    };\n    /**\n     * Returns list of header values for a given name.\n     */\n    RestHeaders.prototype.getAll = function (name) {\n        return this.has(name) ? this._headers.get(name.toLowerCase()) : null;\n    };\n    RestHeaders.prototype.mayBeSetNormalizedName = function (name) {\n        var lcName = name.toLowerCase();\n        if (!this._normalizedNames.has(lcName)) {\n            this._normalizedNames.set(lcName, name);\n        }\n    };\n    return RestHeaders;\n}());\n"

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var JSON5 = __webpack_require__(14);
var Subject_1 = __webpack_require__(3);
__webpack_require__(1);
var rest_headers_1 = __webpack_require__(5);
var RestRequest = (function () {
    function RestRequest() {
        this.subjects = {
            'GET': new Subject_1.Subject(),
            'POST': new Subject_1.Subject(),
            'PUT': new Subject_1.Subject(),
            'DELETE': new Subject_1.Subject(),
            'JSONP': new Subject_1.Subject()
        };
        this.workerActive = false;
        if (typeof (Worker) !== "undefined") {
            this.workerActive = true;
            this.createWorker();
        }
    }
    /**
     * Worke to handle XMLHttpRequest
     */
    RestRequest.prototype.createWorker = function () {
        // Build a worker from an anonymous function body
        if (!RestRequest._worker) {
            RestRequest._worker = new Worker(RestRequest.blobURL);
            RestRequest._worker.postMessage(__webpack_require__(19));
            URL.revokeObjectURL(RestRequest.blobURL);
        }
        this.worker = RestRequest._worker;
        var tmp = this;
        this.worker.addEventListener('message', function (e) {
            if (RestRequest.zone) {
                RestRequest.zone.run(function () {
                    if (e && e.data)
                        tmp.handlerResult(e.data, e.data['method']);
                });
            }
            else {
                if (e && e.data)
                    tmp.handlerResult(e.data, e.data['method']);
            }
        }, false);
    };
    RestRequest.prototype.handlerResult = function (res, method) {
        if (res && !res.code) {
            this.subjects[method].next({
                json: function () { return (typeof res.data === 'string') ? JSON5.parse(res.data) : res.data; },
                headers: new rest_headers_1.RestHeaders(res.headers)
            });
            this.subjects[method].observers.length = 0;
            return;
        }
        if (res && res.code >= 200 && res.code < 300) {
            this.subjects[method].next({
                json: function () { return JSON5.parse(res.data); },
                headers: new rest_headers_1.RestHeaders(res.headers)
            });
        }
        else {
            this.subjects[method].error({
                error: res ? res.error : 'undefined response',
                headers: new rest_headers_1.RestHeaders(res.headers)
            });
        }
        this.subjects[method].observers.length = 0;
    };
    RestRequest.prototype.req = function (url, method, headers, body) {
        if (this.workerActive) {
            this.worker.postMessage({ url: url, method: method, headers: headers, body: body });
        }
        else {
            var res = this.request(url, method, headers, body);
            this.handlerResult(res, method);
        }
    };
    RestRequest.prototype.request = function (url, method, headers, body) {
        var representationOfDesiredState = body;
        var client = new XMLHttpRequest();
        client.addEventListener;
        client.open(method, url, false);
        client.send(representationOfDesiredState);
        return {
            data: client.responseText,
            error: client.statusText,
            code: client.status,
            headers: rest_headers_1.RestHeaders.fromResponseHeaderString(client.getAllResponseHeaders())
        };
    };
    RestRequest.prototype.get = function (url, headers) {
        var _this = this;
        setTimeout(function () { return _this.req(url, 'GET', headers); });
        return this.subjects['GET'].asObservable();
    };
    RestRequest.prototype.delete = function (url, headers) {
        var _this = this;
        setTimeout(function () { return _this.req(url, 'DELETE', headers); });
        return this.subjects['DELETE'].asObservable();
    };
    RestRequest.prototype.post = function (url, body, headers) {
        var _this = this;
        setTimeout(function () { return _this.req(url, 'POST', headers, body); });
        return this.subjects['POST'].asObservable();
    };
    RestRequest.prototype.put = function (url, body, headers) {
        var _this = this;
        setTimeout(function () { return _this.req(url, 'PUT', headers, body); });
        return this.subjects['PUT'].asObservable();
    };
    RestRequest.prototype.jsonp = function (url) {
        var _this = this;
        setTimeout(function () {
            if (url.endsWith('/'))
                url = url.slice(0, url.length - 1);
            var num = Math.round(10000 * Math.random());
            var callbackMethodName = "cb_" + num;
            window[callbackMethodName] = function (data) {
                _this.handlerResult({
                    data: data
                }, 'JSONP');
            };
            var sc = document.createElement('script');
            sc.src = url + "?callback=" + callbackMethodName;
            document.body.appendChild(sc);
            document.body.removeChild(sc);
        });
        return this.subjects['JSONP'].asObservable();
    };
    return RestRequest;
}());
RestRequest.blobURL = URL.createObjectURL(new Blob(['(',
    function () {
        var firstTime = true;
        var scope = this;
        function request(url, method, headers, body) {
            var representationOfDesiredState = body;
            var client = new XMLHttpRequest();
            client.addEventListener;
            client.open(method, url, false);
            client.send(representationOfDesiredState);
            var h = eval('RestHeaders.fromResponseHeaderString(client.getAllResponseHeaders())');
            return {
                data: client.responseText,
                error: client.statusText,
                code: client.status,
                headers: h
            };
        }
        // self.postMessage("I\'m working before postMessage(\'ali\').");
        self.addEventListener('message', function (e) {
            if (firstTime) {
                firstTime = false;
                scope.eval(e.data);
                return;
            }
            var data = e.data;
            if (data) {
                var res = request(data.url, data.method, data.headers, data.body);
                res['method'] = data.method;
                self.postMessage(res, undefined);
            }
        }, false);
    }.toString(),
    ')()'], { type: 'application/javascript' }));
exports.RestRequest = RestRequest;


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var Subject_1 = __webpack_require__(3);
__webpack_require__(1);
var ng2_logger_1 = __webpack_require__(0);
var log = ng2_logger_1.Log.create('rest.class', ng2_logger_1.Level.__NOTHING);
var JSON5 = __webpack_require__(14);
var mocking_mode_1 = __webpack_require__(4);
var rest_1 = __webpack_require__(13);
var nested_params_1 = __webpack_require__(11);
var mock_backend_1 = __webpack_require__(10);
var rest_headers_1 = __webpack_require__(5);
var Rest = (function () {
    function Rest(endpoint, request, description, name, group) {
        this.request = request;
        this.description = description;
        this.name = name;
        this.group = group;
        this.prepareUrlOldWay = rest_1.Rest.prepareUrlOldWay;
        this.getParams = rest_1.Rest.getParamsUrl;
        this._endpoint = endpoint;
        // Quick fix
        if (Rest.mockingMode === undefined)
            Rest.mockingMode = mocking_mode_1.MockingMode.LIVE_BACKEND_ONLY;
        if (!Rest._headersAreSet) {
            Rest._headersAreSet = true;
            for (var h in Rest._headers) {
                Rest.headers.append(h, Rest._headers[h]);
            }
        }
        if (Rest.restartServerRequest && Rest.docServerUrl && Rest.docServerUrl.trim() !== '') {
            Rest.restartServerRequest = false;
            var tmpUrl_1 = Rest.docServerUrl.charAt(Rest.docServerUrl.length - 1) === '/' ?
                Rest.docServerUrl.slice(0, Rest.docServerUrl.length - 1) : Rest.docServerUrl;
            tmpUrl_1 = Rest.docsTitle ? tmpUrl_1 + "/api/start/" + encodeURIComponent(Rest.docsTitle) : tmpUrl_1 + "/api/start";
            Rest.waitingForDocsServer = true;
            request.get(tmpUrl_1, Rest.headers).subscribe(function () {
                Rest.waitingForDocsServer = false;
                console.info('Docs server restarted');
            }, function (err) {
                Rest.waitingForDocsServer = false;
                console.error("Problem with restart server on " + tmpUrl_1);
            });
        }
    }
    Object.defineProperty(Rest.prototype, "endpoint", {
        get: function () {
            var e = (Rest.eureka && Rest.eureka.instance) ? Rest.eureka.instance.instanceId : this._endpoint;
            if (this.restQueryParams !== undefined && this._endpointRest !== undefined
                && typeof this._endpointRest === 'string' && this._endpointRest.trim() !== '')
                e = this._endpointRest;
            return e;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rest.prototype, "__rest_endpoint", {
        set: function (endpoint) {
            this._endpointRest = endpoint;
            if (endpoint === undefined) {
                this.restQueryParams = undefined;
            }
            else {
                this.restQueryParams = nested_params_1.UrlNestedParams.getRestParams(endpoint, this._endpoint);
            }
        },
        enumerable: true,
        configurable: true
    });
    Rest.prototype.getHeadersJSON = function () {
        return Rest.headers.toJSON();
    };
    Rest.prototype.log = function (model) {
        if (Rest.docServerUrl) {
            model.description = this.description;
            model.name = this.name;
            model.group = this.group;
            model.usecase = this.__usecase_desc;
            model.url = this.endpoint;
            // model.form = this.form;
            model.headers = this.getHeadersJSON();
            model.restQueryParams = JSON.stringify(this.restQueryParams);
            var url = Rest.docServerUrl.charAt(Rest.docServerUrl.length - 1) === '/' ?
                Rest.docServerUrl.slice(0, Rest.docServerUrl.length - 1) : Rest.docServerUrl;
            url = url + "/api/save";
            this.request.post(url, JSON.stringify(model), Rest.headers).subscribe(function () {
                log.i('request saved in docs server');
            });
        }
    };
    /**
     * App is waiting unit get response from server
     *
     * @returns
     *
     * @memberOf Rest
     */
    Rest.prototype.appIsWaiting = function () {
        return ((Rest.eureka && Rest.eureka.isWaiting()) || Rest.waitingForDocsServer);
    };
    Rest.prototype.creatUrl = function (params, doNotSerializeParams) {
        if (doNotSerializeParams === void 0) { doNotSerializeParams = false; }
        return "" + this.endpoint + rest_1.Rest.getParamsUrl(params, doNotSerializeParams);
    };
    Rest.prototype.query = function (params, doNotSerializeParams, _sub) {
        var _this = this;
        if (params === void 0) { params = undefined; }
        if (doNotSerializeParams === void 0) { doNotSerializeParams = false; }
        if (_sub === void 0) { _sub = undefined; }
        if (Rest.mockingMode === mocking_mode_1.MockingMode.MOCKS_ONLY) {
            throw ("In MOCKING MODE you have to define mock of query for enipoint: " + this.endpoint + ".");
        }
        if (this.appIsWaiting()) {
            var sub_1 = _sub ? _sub : new Subject_1.Subject();
            var obs = sub_1.asObservable();
            setTimeout(function () {
                _this.query(params, doNotSerializeParams, sub_1).subscribe(function (e) { return sub_1.next(e); });
            }, Rest.waitTimeMs);
            return sub_1;
        }
        var u = this.creatUrl(params, doNotSerializeParams);
        return this.request.get(u, Rest.headers).map(function (res) {
            Rest.headersResponse = res.headers;
            var r = undefined;
            try {
                r = res.json();
            }
            catch (error) {
                console.warn(error);
            }
            _this.log({
                urlParams: JSON.stringify(params),
                bodyRecieve: JSON.stringify(r),
                method: 'GET',
                urlFull: u
            });
            return r;
        });
    };
    Rest.prototype.get = function (params, doNotSerializeParams, _sub) {
        var _this = this;
        if (doNotSerializeParams === void 0) { doNotSerializeParams = false; }
        if (_sub === void 0) { _sub = undefined; }
        if (Rest.mockingMode === mocking_mode_1.MockingMode.MOCKS_ONLY) {
            throw ("In MOCKING MODE you have to define mock of get for enipoint: " + this.endpoint + ".");
        }
        if (this.appIsWaiting()) {
            var sub_2 = _sub ? _sub : new Subject_1.Subject();
            var obs = sub_2.asObservable();
            setTimeout(function () {
                _this.get(params, doNotSerializeParams, sub_2).subscribe(function (e) { return sub_2.next(e); });
            }, Rest.waitTimeMs);
            return sub_2;
        }
        var u = this.creatUrl(params, doNotSerializeParams);
        return this.request.get(u, Rest.headers).map(function (res) {
            Rest.headersResponse = res.headers;
            var r = undefined;
            try {
                r = res.json();
            }
            catch (error) {
                console.warn(error);
            }
            _this.log({
                urlParams: JSON.stringify(params),
                bodyRecieve: JSON.stringify(r),
                method: 'GET',
                urlFull: u
            });
            return r;
        });
    };
    Rest.prototype.save = function (item, params, doNotSerializeParams, _sub) {
        var _this = this;
        if (doNotSerializeParams === void 0) { doNotSerializeParams = false; }
        if (_sub === void 0) { _sub = undefined; }
        if (Rest.mockingMode === mocking_mode_1.MockingMode.MOCKS_ONLY) {
            throw ("In MOCKING MODE you have to define mock of save for enipoint: " + this.endpoint + ".");
        }
        if (this.appIsWaiting()) {
            var sub_3 = _sub ? _sub : new Subject_1.Subject();
            var obs = sub_3.asObservable();
            setTimeout(function () {
                _this.save(item, params, doNotSerializeParams, sub_3).subscribe(function (e) { return sub_3.next(e); });
            }, Rest.waitTimeMs);
            return sub_3;
        }
        var u = this.creatUrl(params, doNotSerializeParams);
        var d = JSON.stringify(item);
        return this.request.post(u, d, Rest.headers).map(function (res) {
            Rest.headersResponse = res.headers;
            var r = undefined;
            try {
                r = res.json();
            }
            catch (error) {
                console.warn(error);
            }
            _this.log({
                bodySend: d,
                bodyRecieve: JSON.stringify(r),
                method: 'POST',
                urlFull: u
            });
            return r;
        });
    };
    Rest.prototype.update = function (item, params, doNotSerializeParams, _sub) {
        var _this = this;
        if (doNotSerializeParams === void 0) { doNotSerializeParams = false; }
        if (_sub === void 0) { _sub = undefined; }
        if (Rest.mockingMode === mocking_mode_1.MockingMode.MOCKS_ONLY) {
            throw ("In MOCKING MODE you have to define mock of update for enipoint: " + this.endpoint + ".");
        }
        if (this.appIsWaiting()) {
            var sub_4 = _sub ? _sub : new Subject_1.Subject();
            var obs = sub_4.asObservable();
            setTimeout(function () {
                _this.update(item, params, doNotSerializeParams, sub_4).subscribe(function (e) { return sub_4.next(e); });
            }, Rest.waitTimeMs);
            return sub_4;
        }
        var u = this.creatUrl(params, doNotSerializeParams);
        var d = JSON.stringify(item);
        return this.request.put(u, JSON.stringify(item), Rest.headers).map(function (res) {
            Rest.headersResponse = res.headers;
            var r = undefined;
            try {
                r = res.json();
            }
            catch (error) {
                console.warn(error);
            }
            _this.log({
                urlParams: JSON.stringify(params),
                bodySend: d,
                bodyRecieve: JSON.stringify(r),
                method: 'PUT',
                urlFull: u
            });
            return r;
        });
    };
    Rest.prototype.remove = function (params, doNotSerializeParams, _sub) {
        var _this = this;
        if (doNotSerializeParams === void 0) { doNotSerializeParams = false; }
        if (_sub === void 0) { _sub = undefined; }
        if (Rest.mockingMode === mocking_mode_1.MockingMode.MOCKS_ONLY) {
            throw ("In MOCKING MODE you have to define mock of remove for enipoint: " + this.endpoint + ".");
        }
        if (this.appIsWaiting()) {
            var sub_5 = _sub ? _sub : new Subject_1.Subject();
            var obs = sub_5.asObservable();
            setTimeout(function () {
                _this.remove(params, doNotSerializeParams, sub_5).subscribe(function (e) { return sub_5.next(e); });
            }, Rest.waitTimeMs);
            return sub_5;
        }
        var u = this.creatUrl(params, doNotSerializeParams);
        return this.request.delete(u, Rest.headers).map(function (res) {
            Rest.headersResponse = res.headers;
            if (res.text() !== '') {
                var r = undefined;
                try {
                    r = res.json();
                }
                catch (error) {
                    console.warn(error);
                }
                _this.log({
                    urlParams: JSON.stringify(params),
                    bodyRecieve: JSON.stringify(r),
                    method: 'DELETE',
                    urlFull: u
                });
                return r;
            }
            return {};
        });
    };
    Rest.prototype.jsonp = function (params, _sub) {
        var _this = this;
        if (_sub === void 0) { _sub = undefined; }
        if (Rest.mockingMode === mocking_mode_1.MockingMode.MOCKS_ONLY) {
            throw ("In MOCKING MODE you have to define mock of jsonp for enipoint: " + this.endpoint + ".");
        }
        if (this.appIsWaiting()) {
            var sub_6 = _sub ? _sub : new Subject_1.Subject();
            var obs = sub_6.asObservable();
            setTimeout(function () {
                _this.jsonp(params, _sub).subscribe(function (e) { return sub_6.next(e); });
            }, Rest.waitTimeMs);
            return sub_6;
        }
        var u = this.endpoint;
        return this.request.jsonp(u).map(function (res) {
            Rest.headersResponse = res.headers;
            var r = undefined;
            try {
                r = res.json();
            }
            catch (error) {
                console.warn(error);
            }
            _this.log({
                bodyRecieve: JSON.stringify(r),
                method: 'JSONP',
                urlFull: u
            });
            return r;
        });
    };
    Rest.prototype.mock = function (data, timeout, controller, nunOfMocks) {
        var _this = this;
        if (timeout === void 0) { timeout = 0; }
        if (nunOfMocks === void 0) { nunOfMocks = 0; }
        if (Rest.mockingMode === mocking_mode_1.MockingMode.LIVE_BACKEND_ONLY) {
            log.i('FROM MOCK TO LIVE');
            return this;
        }
        var subject;
        var currentMethod;
        var currentBodySend;
        var currentUrlParams;
        var currentFullUrl;
        setTimeout(function () {
            if (controller !== undefined) {
                var tdata = void 0;
                if (typeof data === 'object') {
                    tdata = JSON.parse(JSON.stringify(data));
                }
                else if (typeof data === 'string') {
                    tdata = JSON5.parse(data);
                }
                else {
                    throw new Error("Data for mock isn't string or object, endpoint:" + _this.endpoint);
                }
                if (_this.backend === undefined && nunOfMocks > 0)
                    _this.backend = new mock_backend_1.MockBackend.MockAutoBackend(data, nunOfMocks);
                var bodyPOSTandPUT = (currentBodySend && typeof currentBodySend === 'string') ? JSON.parse(currentBodySend) : undefined;
                log.i('currentFullUrl', currentFullUrl);
                var decodedParams = rest_1.Rest.decodeUrl(currentFullUrl);
                log.i('decodedParams', decodedParams);
                var d_1 = nunOfMocks === 0 ? controller({
                    data: tdata,
                    params: decodedParams,
                    body: bodyPOSTandPUT,
                    restParams: _this.restQueryParams,
                    method: currentMethod
                }) :
                    controller({
                        data: tdata,
                        params: decodedParams,
                        body: bodyPOSTandPUT,
                        backend: _this.backend,
                        restParams: _this.restQueryParams,
                        method: currentMethod
                    });
                if (d_1 === undefined) {
                    throw new Error("Mock controlelr can't return undefined (endpoint:" + _this.endpoint + ")");
                }
                if (d_1.error !== undefined) {
                    console.error("Mock server respond with code " + d_1.code + " - " + d_1.error);
                }
                if (d_1.code === undefined)
                    d_1.code = 200;
                if (d_1.data === undefined) {
                    _this.log({
                        urlParams: currentUrlParams,
                        bodySend: currentBodySend,
                        method: currentMethod,
                        urlFull: currentFullUrl,
                        status: d_1.code,
                    });
                    subject.error(d_1);
                }
                else {
                    _this.log({
                        urlParams: currentUrlParams,
                        bodyRecieve: JSON.stringify(d_1.data),
                        bodySend: currentBodySend,
                        method: currentMethod,
                        urlFull: currentFullUrl,
                        status: d_1.code
                    });
                    if (_this.appIsWaiting())
                        setTimeout(function () { return subject.next(d_1.data); }, Rest.waitTimeMs);
                    else
                        subject.next(d_1.data);
                }
            }
            else {
                if (typeof data === 'object' || typeof data === 'string') {
                    var res_1 = {
                        data: (typeof data === 'string') ? JSON5.parse(data) : JSON.parse(JSON.stringify(data)),
                        code: 200
                    };
                    _this.log({
                        urlParams: currentUrlParams,
                        bodyRecieve: JSON.stringify(res_1.data),
                        bodySend: currentBodySend,
                        method: currentMethod,
                        urlFull: currentFullUrl,
                        status: res_1.code
                    });
                    if (_this.appIsWaiting())
                        setTimeout(function () { return subject.next(res_1.data); }, Rest.waitTimeMs);
                    else
                        subject.next(res_1.data);
                }
                else {
                    throw new Error("Data for mock isn't string or object, endpoint:" + _this.endpoint);
                }
            }
        }, timeout);
        var t = {};
        t.query = function (params, doNotSerializeParams) {
            if (doNotSerializeParams === void 0) { doNotSerializeParams = false; }
            currentMethod = 'GET';
            subject = new Subject_1.Subject();
            rest_1.Rest.prepare(params);
            currentUrlParams = JSON.stringify(params);
            currentFullUrl = _this.creatUrl(params, doNotSerializeParams);
            return subject.asObservable();
        };
        t.get = function (params, doNotSerializeParams, _sub) {
            if (doNotSerializeParams === void 0) { doNotSerializeParams = false; }
            if (_sub === void 0) { _sub = undefined; }
            currentMethod = 'GET';
            subject = new Subject_1.Subject();
            rest_1.Rest.prepare(params);
            currentUrlParams = JSON.stringify(params);
            currentFullUrl = _this.creatUrl(params, doNotSerializeParams);
            return subject.asObservable();
        };
        t.save = function (item, params, doNotSerializeParams) {
            if (doNotSerializeParams === void 0) { doNotSerializeParams = false; }
            currentMethod = 'POST';
            subject = new Subject_1.Subject();
            rest_1.Rest.prepare(params);
            currentUrlParams = params ? JSON.stringify(params) : '{}';
            currentFullUrl = _this.creatUrl(params, doNotSerializeParams);
            currentBodySend = JSON.stringify(item);
            return subject.asObservable();
        };
        t.update = function (item, params, doNotSerializeParams) {
            if (doNotSerializeParams === void 0) { doNotSerializeParams = false; }
            currentMethod = 'PUT';
            subject = new Subject_1.Subject();
            rest_1.Rest.prepare(params);
            currentUrlParams = JSON.stringify(params);
            currentFullUrl = _this.creatUrl(params, doNotSerializeParams);
            currentBodySend = JSON.stringify(item);
            return subject.asObservable();
        };
        t.remove = function (params, doNotSerializeParams) {
            if (doNotSerializeParams === void 0) { doNotSerializeParams = false; }
            currentMethod = 'DELETE';
            subject = new Subject_1.Subject();
            rest_1.Rest.prepare(params);
            currentUrlParams = JSON.stringify(params);
            currentFullUrl = _this.creatUrl(params, doNotSerializeParams);
            return subject.asObservable();
        };
        t.jsonp = function (params) {
            currentMethod = 'JSONP';
            subject = new Subject_1.Subject();
            rest_1.Rest.prepare(params);
            currentFullUrl = _this.endpoint;
            return subject.asObservable();
        };
        return t;
    };
    return Rest;
}());
Rest.headers = new rest_headers_1.RestHeaders();
Rest.headersResponse = new rest_headers_1.RestHeaders();
Rest.waitingForDocsServer = false;
Rest.restartServerRequest = false;
Rest._headersAreSet = false;
Rest._headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};
Rest.waitTimeMs = 1000;
exports.Rest = Rest;


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

__webpack_require__(1);
var resource_service_1 = __webpack_require__(12);
/**
 *
 * @export
 * @abstract
 * @class SimpleResource
 * @extends {Resource<T, A, TA>}
 * @template E  Endpoint type
 * @template A Single modle type
 * @template TA Array Model Type
 * @template RP rest url parameters type
 * @template QP query parameter type
 */
var ExtendedResource = (function () {
    // add(endpoint: E, model: string, group?: string, name?: string, description?: string) { }
    function ExtendedResource(endpoint, path_model) {
        var _this = this;
        this.endpoint = endpoint;
        this.path_model = path_model;
        this.mock = { timeout: 100, howManyMock: 100, data: undefined };
        /**
         * Get model by rest params
        */
        this.model = function (restParams) {
            return {
                get: function (queryPrams) {
                    return new Promise(function (resolve, reject) {
                        ExtendedResource.handlers.push(_this.rest.model(restParams)
                            .mock(_this.mock.data, _this.mock.timeout, _this.mock.controller)
                            .get([queryPrams], ExtendedResource.doNotSerializeQueryParams)
                            .subscribe(function (data) { return resolve(data); }, function (err) { return reject(err); }));
                    });
                },
                query: function (queryPrams) {
                    return new Promise(function (resolve, reject) {
                        ExtendedResource.handlers.push(_this.rest.model(restParams)
                            .mock(_this.mock.data, _this.mock.timeout, _this.mock.controller)
                            .query([queryPrams], ExtendedResource.doNotSerializeQueryParams)
                            .subscribe(function (data) { return resolve(data); }, function (err) { return reject(err); }));
                    });
                },
                save: function (item, queryParams) {
                    return new Promise(function (resolve, reject) {
                        ExtendedResource.handlers.push(_this.rest.model(restParams)
                            .mock(_this.mock.data, _this.mock.timeout, _this.mock.controller)
                            .save(item, [queryParams], ExtendedResource.doNotSerializeQueryParams)
                            .subscribe(function (data) { return resolve(data); }, function (err) { return reject(err); }));
                    });
                },
                update: function (item, queryParams) {
                    return new Promise(function (resolve, reject) {
                        ExtendedResource.handlers.push(_this.rest.model(restParams)
                            .mock(_this.mock.data, _this.mock.timeout, _this.mock.controller)
                            .update(item, [queryParams], ExtendedResource.doNotSerializeQueryParams)
                            .subscribe(function (data) { return resolve(data); }, function (err) { return reject(err); }));
                    });
                },
                remove: function (queryPrams) {
                    return new Promise(function (resolve, reject) {
                        ExtendedResource.handlers.push(_this.rest.model(restParams)
                            .mock(_this.mock.data, _this.mock.timeout, _this.mock.controller)
                            .remove([queryPrams], ExtendedResource.doNotSerializeQueryParams)
                            .subscribe(function (data) { return resolve(data); }, function (err) { return reject(err); }));
                    });
                }
            };
        };
        this.rest = resource_service_1.Resource.create(endpoint, path_model);
    }
    return ExtendedResource;
}());
ExtendedResource.doNotSerializeQueryParams = false;
ExtendedResource.handlers = [];
/**
 *
 * @export
 * @class SimpleResource
 * @template A single model type
 * @template TA array model type
 * @template RP rest parameters type
 * @template QP query parameters type
 */
var SimpleResource = (function () {
    function SimpleResource(endpoint, model) {
        var rest = new ExtendedResource(endpoint, model);
        this.model = rest.model;
        this.mock = rest.mock;
        this.destroy = function () {
            ExtendedResource.handlers.forEach(function (h) { return h.unsubscribe(); });
        };
    }
    Object.defineProperty(SimpleResource, "doNotSerializeQueryParams", {
        set: function (value) {
            if (!SimpleResource._isSetQueryParamsSerialization) {
                SimpleResource._isSetQueryParamsSerialization = true;
                ExtendedResource.doNotSerializeQueryParams = value;
                return;
            }
            console.warn("Query params serialization already set as \n        " + ExtendedResource.doNotSerializeQueryParams + ",");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SimpleResource, "mockingMode", {
        get: function () {
            return resource_service_1.Resource.mockingMode;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SimpleResource, "headers", {
        get: function () {
            return resource_service_1.Resource.Headers;
        },
        enumerable: true,
        configurable: true
    });
    SimpleResource.__destroy = function () {
        ExtendedResource.handlers.forEach(function (h) { return h.unsubscribe(); });
    };
    return SimpleResource;
}());
SimpleResource._isSetQueryParamsSerialization = false;
exports.SimpleResource = SimpleResource;


/***/ },
/* 23 */
/***/ function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_23__;

/***/ },
/* 24 */
/***/ function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_24__;

/***/ },
/* 25 */
/***/ function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_25__;

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
__export(__webpack_require__(15));


/***/ }
/******/ ]);
});