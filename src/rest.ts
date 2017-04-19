
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';

import { Log, Level } from 'ng2-logger';
const log = Log.create('rest namespace', Level.__NOTHING)

export namespace Rest {

    /**
     * Get query params from url, like 'ex' in /api/books?ex=value
    */
    export function decodeUrl(url: string): Object {
        let regex = /[?&]([^=#]+)=([^&#]*)/g,
            params = {},
            match;
        while (match = regex.exec(url)) {
            params[decodeURIComponent(match[1])] = decodeURIComponent(match[2]);
        }
        let paramsObject = <Object>params;
        for (let p in paramsObject) {
            if (paramsObject[p] === undefined) {
                delete paramsObject[p];
                continue;
            }
            if (paramsObject.hasOwnProperty(p)) {
                // chcek if property is number
                let n = Number(params[p]);
                if (!isNaN(n)) {
                    params[p] = n;
                    continue;
                }
                if (typeof params[p] === 'string') {

                    // check if property is object
                    let json;
                    try {
                        json = JSON.parse(params[p]);
                    } catch (error) { }
                    if (json !== undefined) {
                        params[p] = json;
                        continue;
                    }

                    // chcek if property value is like regular rexpression
                    // let regexExpression;
                    // try {
                    //     regexExpression = new RegExp(params[p]);
                    // } catch (e) { }
                    // if (regexExpression !== undefined) params[p] = regexExpression;
                }
            }
        }
        return params;
    }




    export type FnMethodQuery<T> = (params?: UrlParams[], doNotSerializeParams?: boolean, _sub?: Subject<T>) => Observable<T>;
    export type FnMethodGet<T> = (params?: UrlParams[], doNotSerializeParams?: boolean, _sub?: Subject<T>) => Observable<T>
    export type FnMethodSave<T> = (item?: T, params?: UrlParams[], doNotSerializeParams?: boolean, _sub?: Subject<T>) => Observable<T>
    export type FnMethodUpdate<T> = (item?: T, params?: UrlParams[], doNotSerializeParams?: boolean, _sub?: Subject<T>) => Observable<T>
    export type FnMethodRemove<T> = (params?: UrlParams[], doNotSerializeParams?: boolean, _sub?: Subject<T>) => Observable<T>;
    export type FnMethodJsonp<T> = (rl?: string, params?: UrlParams[], _sub?: Subject<T>) => Observable<T>;

    export interface FnMethodsHttp<T, TA> {

        /**
         * Get collection of item from database
         * 
         * @type {FnMethodQuery<TA>}
         * @memberOf FnMethodsHttp
         */
        query: FnMethodQuery<TA>;
        /**
         * Get item from database
         * 
         * @type {FnMethodGet<T>}
         * @memberOf FnMethodsHttp
         */
        get: FnMethodGet<T>;
        /**
         * Save object in database
         * 
         * @type {FnMethodSave<T>}
         * @memberOf FnMethodsHttp
         */
        save: FnMethodSave<T>;
        /**
         * Update object in databse
         * 
         * @type {FnMethodUpdate<T>}
         * @memberOf FnMethodsHttp
         */
        update: FnMethodUpdate<T>;
        /**
         * Remove object from database
         * 
         * @type {FnMethodRemove<T>}
         * @memberOf FnMethodsHttp
         */
        remove: FnMethodRemove<T>;
        /**
         * Get item from JSONP 
         * 
         * @type {FnMethodJsonp<T>}
         * @memberOf FnMethodsHttp
         */
        jsonp: FnMethodJsonp<T>;
    };


    /**
     * Create query params string for url
     * 
     * @export
     * @param {UrlParams[]} params
     * @returns {string}
     */
    export function getParamsUrl(params: UrlParams[], doNotSerialize: boolean = false): string {
        let urlparts: string[] = [];
        if (!params) return '';
        if (!(params instanceof Array)) return '';
        if (params.length === 0) return '';

        params.forEach(urlparam => {
            if (JSON.stringify(urlparam) !== '{}') {

                let parameters: string[] = [];
                let paramObject = <Object>urlparam;


                for (let p in paramObject) {
                    if (paramObject[p] === undefined) delete paramObject[p];
                    if (paramObject.hasOwnProperty(p) && typeof p === 'string' && p !== 'regex' && !(paramObject[p] instanceof RegExp)) {
                        if (p.length > 0 && p[0] === '/') {
                            let newName = p.slice(1, p.length - 1);
                            urlparam[newName] = urlparam[p];
                            urlparam[p] = undefined;
                            p = newName;
                        }
                        if (p.length > 0 && p[p.length - 1] === '/') {
                            let newName = p.slice(0, p.length - 2);
                            urlparam[newName] = urlparam[p];
                            urlparam[p] = undefined;
                            p = newName;
                        }
                        let v: any = urlparam[p];
                        if (v instanceof Object) {
                            urlparam[p] = JSON.stringify(urlparam[p]);
                        }
                        urlparam[p] = doNotSerialize ? <string>urlparam[p] : encodeURIComponent(<string>urlparam[p]);
                        if (urlparam.regex !== undefined && urlparam.regex instanceof RegExp) {

                            if (!urlparam.regex.test(<string>urlparam[p])) {
                                console.warn(`Data: ${urlparam[p]} incostistent with regex ${urlparam.regex.source}`);
                            }
                        }
                        parameters.push(`${p}=${urlparam[p]}`);
                    }

                }

                urlparts.push(parameters.join('&'));


            }


        });
        let join = urlparts.join().trim();
        if (join.trim() === '') return '';
        return `?${urlparts.join('&')}`;
    }


    function transform(o) {
        if (typeof o === 'object') {
            return encodeURIComponent(JSON.stringify(o));
        }
        return o;
    }


    export function prepareUrlOldWay(params?: TemplateStringsArray): string {
        if (!params) return this.endpoint;
        if (typeof params === 'object') {
            params = transform(params);
        }
        return this.endpoint + '/' + params;
    }


    export interface UrlParams {
        [urlModelName: string]: string | number | boolean | RegExp | Object;
        regex?: RegExp;
    }[];

    export function prepare(params: UrlParams[]) {
        if (params && params instanceof Array) {
            params.forEach((p: any) => {
                if (p !== undefined && p.regex !== undefined && p.regex instanceof RegExp) p['regex'] = p.regex.source;
            });
        }
    }

}