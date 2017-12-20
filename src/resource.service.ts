//#region imports
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/toPromise';

import { Log, Level } from 'ng2-logger';
const log = Log.create('resouce-service', Level.__NOTHING)

import { Rest } from './rest.class';
import { RestRequest } from "./rest-request";
import { RestHeaders } from "./rest-headers";
import { Cookie } from "./cookie";
import { Mapping } from "./mapping";
import { ResourceModel, HttpMethod } from "./models";
import { interpolateParamsToUrl, isValid, containsModels, getModels } from "./params";
//#endregion



export class Resource<E, T, TA> {

    public static enableWarnings: boolean = true;

    //#region private mthods and fields
    private getZone() {
        const isNode = (typeof window === 'undefined')
        if (isNode) return;
        const ng = window['ng'];
        const getAllAngularRootElements = window['getAllAngularRootElements'];
        if (!ng || !getAllAngularRootElements) return;
        const probe = ng.probe;
        const coreTokens = ng.coreTokens;
        if (!coreTokens.NgZone) return;
        const zoneClass = coreTokens.NgZone;
        if (!probe || typeof probe !== 'function' || !getAllAngularRootElements) return;
        const angularElements: any[] = getAllAngularRootElements();
        if (!Array.isArray(angularElements) || angularElements.length === 0) return;
        const rootElement = ng.probe(angularElements[0]);
        if (!rootElement) return;
        const injector = rootElement.injector;
        if (!injector || !injector.get || typeof injector.get !== 'function') return;
        const zone = injector.get(zoneClass)
        return zone;
    }


    private checkNestedModels(model: string, allModels: Object) {
        // if (model.indexOf('/') !== -1) { //TODO make this better, becouse now I unecesary checking shit
        for (let p in allModels) {
            if (allModels.hasOwnProperty(p)) {
                let m = allModels[p];
                if (isValid(p)) {
                    let urlModels = getModels(p);
                    if (containsModels(model, urlModels)) {
                        model = p;
                        break;
                    }
                }
            }
        }
        // }
        return model;
    }

    private static instance = new Resource<string, any, any>();
    private static endpoints = {};
    public static getModel(endpoint: string, model: string): Rest<any> {
        model = Resource.prepareModel(model);
        const e = Resource.endpoints[endpoint];
        if (!e) return undefined;
        const r = Resource.endpoints[endpoint].models[model];
        return Resource.endpoints[endpoint].models[model];
    }
    private static request: RestRequest = new RestRequest();
    //#endregion

    //#region create
    public static create<A, TA = A[]>(e: string, model?: string, entityClass?: Function, entityClassMapping?: Mapping[]): ResourceModel<A, TA> {

        const badRestRegEX = new RegExp('((\/:)[a-z]+)+', 'g');
        const matchArr = model.match(badRestRegEX) || [];
        const badModelsNextToEachOther = matchArr.join();
        const atleas2DoubleDots = ((badModelsNextToEachOther.match(new RegExp(':', 'g')) || []).length >= 2);
        if (atleas2DoubleDots && model.search(badModelsNextToEachOther) !== -1) {
            throw new Error(`

Bad rest model: ${model}

Do not create rest models like this:    /book/author/:bookid/:authorid
Instead use nested approach:            /book/:bookid/author/:authorid
            `)
        };
        Resource.map(e, e);
        Resource.instance.add(e, model ? model : '');
        // if (model.charAt(model.length - 1) !== '/') model = `${model}/`;
        return {
            model: (params?: Object) => Resource.instance.api(
                e,
                interpolateParamsToUrl(params, model)
            ),
            replay: (method: HttpMethod) => {
                Resource.getModel(e, model).replay(method);
            }
        }
    }
    //#endregion

    //#region reset 
    public static reset() {
        Resource.endpoints = {};
    }
    //#endregion

    //#region constructor
    private constructor() {
        setTimeout(() => {
            const zone = this.getZone();
            RestRequest.zone = zone;
        })
    }
    //#endregion

    //#region header
    public static get Headers() {
        let res = {
            request: Rest.headers,
            response: Rest.headersResponse
        }
        return res;
    }
    //#endregion

    public static Cookies = Cookie.Instance;

    //#region map
    private static map(endpoint: string, url: string): boolean {

        log.i('url', url)
        let regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
        let e = endpoint;
        if (!regex.test(url)) {
            throw `Url address is not correct: ${url}`;
        }
        if (url.charAt(url.length - 1) === '/') url = url.slice(0, url.length - 1);
        log.i('url after', url)
        if (Resource.endpoints[e] !== undefined) {
            if (Resource.enableWarnings) console.warn('Cannot use map function at the same API endpoint again ('
                + Resource.endpoints[e].url + ')');
            return false;
        }
        Resource.endpoints[e] = {
            url: url,
            models: {}
        };
        log.i('enpoints', Resource.endpoints)
        return true;
    }
    //#endregion

    private static prepareModel(model) {
        if (model.charAt(model.length - 1) === '/') model = model.slice(0, model.length - 1);
        if (model.charAt(0) === '/') model = model.slice(1, model.length);
        return model;
    }


    //#region add
    /**
     * And enipoint to application
     * 
     * @param {E} endpoint
     * @param {string} model
     * @returns {boolean}
     */
    private add(endpoint: E, model: string, group?: string, name?: string, description?: string) {
        log.i(`I am maping ${model} on ${<any>endpoint}`);
        if (!name) {
            let exName: string = model.replace(new RegExp('/', 'g'), ' ');
            let slName = exName.split(' ');
            let newName = [];
            let rName = slName.map(fr => (fr[0]) ? (fr[0].toUpperCase() + fr.substr(1)) : '');
            name = rName.join(' ');
        }
        model = Resource.prepareModel(model);

        let e: string;
        e = <string>(endpoint).toString();

        if (Resource.endpoints[e] === undefined) {
            console.error('Endpoint is not mapped ! Cannot add model ' + model);
            return;
        }
        if (Resource.endpoints[e].models[model] !== undefined) {
            if (Resource.enableWarnings) console.warn(`Model '${model}' is already defined in endpoint: `
                + Resource.endpoints[e].url);
            return;
        }
        Resource.endpoints[e].models[model] =
            new Rest<T, TA>(Resource.endpoints[e].url
                + '/' + model, Resource.request, {
                    endpoint: e,
                    path: model
                });
        return;
    }
    //#endregion

    //#region api
    /**
     * Access api throught endpoint
     * 
     * @param {E} endpoint
     * @param {string} model
     * @returns {Rest<T, TA>}
     */
    private api(endpoint: E, model: string): Rest<T, TA> {

        if (model.charAt(0) === '/') model = model.slice(1, model.length);
        let e = <string>(endpoint).toString();
        if (Resource.endpoints[e] === undefined) {
            throw `Endpoint: ${<any>endpoint} is not mapped ! Cannot add model: ${model}`;
        }
        let allModels: Object = Resource.endpoints[e].models;
        let orgModel = model;
        model = this.checkNestedModels(model, allModels);

        if (Resource.endpoints[e].models[model] === undefined) {
            log.d('Resource.endpoints', Resource.endpoints);
            throw `Model '${model}' is undefined in endpoint: ${Resource.endpoints[e].url} `;
        }

        let res: Rest<T, TA> = Resource.endpoints[<string>(endpoint).toString()].models[model];

        if (orgModel !== model) {
            let baseUrl = Resource.endpoints[<string>(endpoint).toString()].url;
            log.d('base', Resource.endpoints[<string>(endpoint).toString()])
            log.d('baseUrl', baseUrl)
            log.d('orgModel', orgModel)
            res.__rest_endpoint = `${baseUrl}/${orgModel}`;
        } else res.__rest_endpoint = undefined;

        return res;
    }
    //#endregion



}

import * as _ from "lodash";

class Author {
    age: number;
    user: User;
    friends: User[];
}

class Book {
    title: string;
    author: Author;
}

class User {
    name: string;
    friend: Author;
    books: Book[];
}


const c = Resource.create<{ name: string; }>('http://onet.pl', 'adasd', User);
console.log(c)

let uu = new User();
uu.name = 'asdasd';
let book = new Book();
book.author = new Author();
book.title = 'roses';
book.author.friends = [new User(), new User()]
book.author.user = new User();
uu.friend = new Author();
uu.friend.age = 23;
uu.friend.user = new User();
uu.books = [book];


// console.log("book is " + Object.getPrototypeOf(book).constructor.name)
// console.log("user is " + Object.getPrototypeOf(uu).constructor.name)
// console.log("user class is " + Object.getPrototypeOf(User).constructor.name)
// console.log("boolean class is " + Object.getOwnPropertyNames(true));


function getClassBy(className: string): Function {
    return [User, Book, Author].find(({ name }) => name === className);
}

function add(o: Object, path: string, mapping: Mapping = {}) {
    if (path !== '_') path = path.replace(/^_./, '');
    const objectClassName = Object.getPrototypeOf(o).constructor.name;
    const resolveClass = getClassBy(objectClassName);
    if (!mapping[path]) mapping[path] = resolveClass.name as any;
}

function getMapping(c: Object, path = '_', mapping: Mapping = {}, level = 0) {
    if (++level === 16) return;
    add(c, path, mapping);
    for (var p in c) {
        if (c.hasOwnProperty(p)) {
            const v = c[p];
            if (Array.isArray(v) && v.length > 0) { // reducer as impovement
                v.forEach((elem, i) => {
                    // const currentPaht = [`path[${i}]`, p].filter(c => c.trim() != '').join('.');
                    const currentPaht = [path, p].filter(c => c.trim() != '').join('.');
                    getMapping(elem, currentPaht, mapping, level);
                })
            } else if (typeof v === 'object') {
                const currentPaht = [path, p].filter(c => c.trim() != '').join('.');
                add(v, currentPaht, mapping);
                getMapping(v, currentPaht, mapping, level);
            }
        }
    }
    return mapping;
}




import * as JSON5 from 'json5';



function clearPath(path: string) {
    return path.replace(/\[.\]/g, '.').replace(/\.$/, '').replace(/\.\./g, '.');
}


function setMapping(json: Object, mapping: Mapping = {},
    path = '_', realPath: string = '',
    level = 0, result?: Function) {
    if (++level === 16) return;
    const ClassTemplate: { new(any?): Function } = getClassBy(mapping[path] as any) as any;
    let toInterate: Object;
    if (ClassTemplate) {
        if (path === '_') {
            result = new ClassTemplate();
            toInterate = json;
        } else {
            _.set(result, realPath, new ClassTemplate())
            toInterate = _.get(json, realPath);
        }
    }

    for (let propertyPath in toInterate) {
        if (toInterate.hasOwnProperty(propertyPath)) {
            const v = toInterate[propertyPath];
            const tmpPath = `${path === '_' ? '' : `${realPath}.`}${propertyPath}`;
            if (_.isArray(v)) {
                v.forEach((elem, index) => {
                    const pathArray = `${tmpPath}[${index}]`;
                    return setMapping(json, mapping, clearPath(pathArray), pathArray, level, result);
                });
            } else if (_.isObject(v)) {
                setMapping(json, mapping, clearPath(tmpPath), tmpPath, level, result);
            } else {
                _.set(result, tmpPath, v);
            }
        }
    }
    if (path === '_') return result;
    return _.get(result, realPath);
}


const mapFromObjectClasses = getMapping(uu);
const rrr = JSON.parse(JSON.stringify(uu));
const remapping = setMapping(rrr, mapFromObjectClasses);
console.log('before', uu)
console.log('before', uu)
console.log('mapFromObjectClasses', mapFromObjectClasses);
console.log('mapFromObjectClasses', JSON.stringify(mapFromObjectClasses));

// console.log(JSON.stringify(uu))

// for (var i in uu) {
//     if (uu.hasOwnProperty(i)) {
//         console.log('i', i)
//         console.log('v', uu[i])
//     }
// }

// c.model().get().subscribe(d => {
//     d.body.json.
// });

// c.model().array.post([]).subscribe(d => {
//     d.body.json.
// });


// function applyMap(c: Object, mappings: Mapping = {}) {
//     const m: { class: { new(any?): Function }, path: string; }[] = [];
//     for (let path in mappings) {
//         if (mappings.hasOwnProperty(path)) {
//             m.push({ class: mappings[path] as any, path });
//         }
//     }
//     applyMapping(c, m);
// }


// function applyMapping(obj: Object, mappings: { class: { new(any?): Function }, path: string; }[] = [], result?: Function) {
//     if (mappings.length === 0) return;
//     if (!result) {
//         const map = mappings.find(({ path }) => path === '_');
//         mappings.splice(mappings.indexOf(map), 1);
//         result = new map.class();
//     }
//     const map = mappings.shift();
//     const path = map.path.replace(/^_./, '');
//     const next = _.get(obj, path);
//     if (Array.isArray(next)) {

//     } else if (_.isObject(next)) {
//         _.set(result, path, new map.class());
//     } else {
//         _.set(result, path, next);
//     }
//     return result;
// }
