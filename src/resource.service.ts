import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/toPromise';

import { Log, Level } from 'ng2-logger';
const log = Log.create('resouce-service', Level.__NOTHING)

import { UrlNestedParams } from './nested-params';
import { Rest } from './rest.class';
import { RestRequest } from "./rest-request";
import { RestHeaders } from "./rest-headers";
import { Cookie } from "./cookie";

export interface ResourceModel<A, TA> {
    model: (m?: Object) => Rest<A, TA>
}

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
        if(!rootElement) return;
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
                if (UrlNestedParams.isValid(p)) {
                    let urlModels = UrlNestedParams.getModels(p);
                    if (UrlNestedParams.containsModels(model, urlModels)) {
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
    private static request: RestRequest = new RestRequest();
    //#endregion

    //#region create
    public static create<A, TA = A[]>(e: string, model?: string): ResourceModel<A, TA> {

        const badRestRegEX = new RegExp('((\/:)[a-z]+)+', 'g');
        const matchArr = model.match(badRestRegEX) || [];
        const badModelsNextToEachOther = matchArr.join();
        const atleas2DoubleDots = ((badModelsNextToEachOther.match(new RegExp(':', 'g')) || []).length >= 2 );
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
                UrlNestedParams.interpolateParamsToUrl(params, model)
            )
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

    public static get Cookies() {
        return Cookie;
    }

    //#region docs server
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
    public static setUrlToDocsServerAndRecreateIt(url: string, docsTitle: string = undefined,
        forceRecreate: boolean = false) {
        if (docsTitle) Rest.docsTitle = docsTitle;
        Rest.docServerUrl = sessionStorage.getItem('url');
        log.d('Rest.docServerUrl from session storage', Rest.docServerUrl);

        if (forceRecreate ||
            Rest.docServerUrl === undefined ||
            Rest.docServerUrl === null ||
            Rest.docServerUrl.trim() === '') {

            Rest.docServerUrl = url;
            sessionStorage.setItem('url', url);
            Rest.restartServerRequest = true;
            log.i('Recreate docs server request');
        }

    }
    //#endregion

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
        if (model.charAt(model.length - 1) === '/') model = model.slice(0, model.length - 1);
        if (model.charAt(0) === '/') model = model.slice(1, model.length);

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
                + '/' + model, Resource.request, description, name, group);
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
    private api(endpoint: E, model: string, usecase?: string): Rest<T, TA> {

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
        res.__usecase_desc = usecase;

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
