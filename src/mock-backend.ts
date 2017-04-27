import { fake } from 'faker';
import { Http } from './http';

import { Helpers } from './helpers';

import { Log, Level } from 'ng2-logger';
import { RestHeaders } from "./rest-headers";
const log = Log.create('eureka', Level.__NOTHING)


export interface MockRequest<T> {
    /**
     * .mock(..) function second argument
     * This data is usualy Object or Array
     * 
     * @type {*}
     * @memberOf MockRequest
     */
    data: any;
    /**
     * Query params passed by user. This is object
     * with poperties from them, but they usualy 
     * look like this in <url>?example=value&emaple2=value2
     * 
     * @type {Object}
     * @memberOf MockRequest
     */
    params: Object;
    /**
     * Params from rest api 'bookid' in /books/:bookId
     */
    restParams?: Object;
    /**
     * POST, PUT http request have also body
     * in request to carry large amount of data
     * 
     * @type {Object}
     * @memberOf MockRequest
     */
    body: Object;
    /**
     * With MockAutobacken you can do:
     * pagination, fitlering, sorting
     * for your models lists
     * 
     * @type {MockAutoBackend<T>}
     * @memberOf MockRequest
     */
    backend?: MockBackend.MockAutoBackend<T>

    method: Http.HttpMethod;
}

export interface MockResponse {
    /**
     * This data will be returned to user in callback
     * as result of request
     * 
     * @type {*}
     * @memberOf MockResponse
     */
    data?: any;
    /**
     * Default http code is 200, but to simulate othe
     * codes and responses use this poperty
     * 
     * @type {HttpCode}
     * @memberOf MockResponse
     */
    code?: Http.HttpCode;
    /**
     * Response errors
     * 
     * @type {string}
     * @memberOf MockResponse
     */
    error?: string;
    headers?: RestHeaders;

    /**
     * do no use
     */
    jobid?: number;
}

export namespace MockBackend {


    export function goInside(o: Object, paths: string[]): Object {
        log.d(`paths`, paths);
        log.d(`o`, o);
        if (paths.length === 0) return o;
        let tmp = o;
        paths.forEach(path => {
            if (tmp[path] === undefined) tmp[path] = {};
            tmp = tmp[path];
            log.d(`upper for path:${path}`, o);
        });
        log.i(`tmp`, tmp);
        return tmp;
    }

    export function isSimpleType(value) {
        return ((typeof value === 'number') ||
            (typeof value === 'boolean') ||
            (typeof value === 'string') ||
            (typeof value === 'undefined'));
    }

    export let pName = p => {
        return p.startsWith('$') ? p.slice(1) : p;
    };

    export function copyFromTo(fromObj: Object, toObj: Object) {
        for (let p in fromObj) {
            if (fromObj.hasOwnProperty(p)) {

                toObj[p] = fromObj[p];
            }
        }
        for (let p in toObj) {
            if (toObj.hasOwnProperty(p)) {
                log.d('p', p);
                if (p.charAt(0) === '$') delete toObj[p];
            }
        }
    }



    /**
     * Function is used to simulate backend contrller.
     * Very useful is you wanna mock different
     * usecases in your application ie.
     * for E2E test purpose
     * 
     * @export
     * @interface MockController
     * @template T
     */
    export interface MockController<T> {
        (request: MockRequest<T>): MockResponse
    };

    export class MockAutoBackend<T> {

        models: T[];

        constructor(template: Object, howManyGen: number) {
            this.models = [];
            for (let i = 0; i < howManyGen; i++) {
                let model: T = <T>{};
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
        getPagination(page: number, pageSize: number): T[] {
            let indexStart = (page - 1) * pageSize;
            let indexEnd = indexStart + pageSize;
            let d = this.models.slice(indexStart, indexEnd);
            return d;
        }

        filterBy(modelKeys: Object) {
            let filterd = [];
            for (let p in modelKeys) {
                if (modelKeys.hasOwnProperty(p)) {
                    filterd.concat(this.models
                        .filter(m => modelKeys[p] === m[p]));
                }
            }
            return filterd;
        }

        updateModelsBy(modelKeys: Object, model: T): T[] {
            let models: T[] = this.filterBy(modelKeys);
            models.forEach(m => {
                m = model;
            });
            return models;
        }

        deleteModelBy(modelKeys: Object, model: T): T[] {
            let models: T[] = this.filterBy(modelKeys);
            let deletedModes = JSON.parse(JSON.stringify(models));
            let indexesToDelete = [];
            models.forEach(m => {
                indexesToDelete.push(this.models.indexOf(m, 0));
            });
            indexesToDelete.forEach(index => {
                if (index > -1) {
                    this.models.splice(index, 1);
                }
            });
            return models;
        }

        addModelBy(newKeys: Object, model: T): T {
            this.models.push(model);
            for (let p in newKeys) {
                if (newKeys.hasOwnProperty(p)) {
                    model[p] = newKeys[p];
                }
            }
            return model;
        }

        sortBy(params: SortModel[]): T[] {
            let models: T[] = JSON.parse(JSON.stringify(this.models));
            params.forEach(s => {
                models = models.sort((a, b) => {
                    if (s.type === 'DESC') {
                        if (a[s.field] < b[s.field])
                            return -1;
                        if (a[s.field] > b[s.field])
                            return 1;
                    } else if (s.type === 'ASC') {
                        if (a[s.field] < b[s.field])
                            return 1;
                        if (a[s.field] > b[s.field])
                            return -1;
                    }
                    return 0;
                });
            });
            return models;
        }


        static goInside = goInside;


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
        construct(template: Object, cModel: T, path: string[] = []) {
            let tmpModel: T;
            for (let p in template) {
                if (template.hasOwnProperty(p)) {

                    let value = template[p];
                    if (Helpers.isArray(value) && p.startsWith('$')) {
                        let arr: any[] = value;
                        arr.forEach(elem => {
                            if (!Helpers.isArray(elem) && !isSimpleType(elem)) {
                                let t: T = <T>{};
                                this.construct(elem, t);
                                copyFromTo(t, elem);

                            }
                        });
                        let g = Helpers.getRandomInt(arr.length - 1);
                        goInside(cModel, path)[pName(p)] = arr[g];
                        tmpModel = JSON.parse(JSON.stringify(cModel));
                        continue;
                    }


                    if (p.startsWith('$') && 'string' === typeof value) {
                        let val: any = undefined;
                        try {
                            val = fake(value);
                        } catch (e) {
                            console.error(e);
                        }
                        goInside(cModel, path)[pName(p)] = val;
                        tmpModel = JSON.parse(JSON.stringify(cModel));
                        continue;
                    }

                    if (Helpers.isObjectButNotArray(value) || Helpers.isArray(value)) {
                        let joinedPath = path.concat(pName(p));
                        this.construct(value, cModel, joinedPath);
                        continue;
                    }

                    if (isSimpleType(value) || p.startsWith('$')) {
                        goInside(cModel, path)[pName(p)] = value;
                        tmpModel = JSON.parse(JSON.stringify(cModel));
                        continue;
                    }

                    throw new Error('bad type of object: ' + value);
                }
            }
        }


    }


    export interface SortModel {
        field: string;
        type?: SortType;
    }

    export type SortType = 'ASC' | 'DESC';

}