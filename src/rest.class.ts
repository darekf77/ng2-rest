//#region import
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { Log, Level } from 'ng2-logger';
const log = Log.create('rest.class', Level.__NOTHING)
import * as JSON5 from 'json5';
// local
import { Rest as RestModule } from './rest';
import { UrlNestedParams } from './nested-params';
import { Docs } from './docs';
import { Http as HttpModule } from './http';
import { RestRequest } from "./rest-request";
import { RestHeaders } from "./rest-headers";
//#endregion

export const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};

export class Rest<T, TA = T[]> implements RestModule.FnMethodsHttp<T, TA> {

    //#region  private fields
    public static docServerUrl: string;
    public static docsTitle: string;
    public static headers: RestHeaders = new RestHeaders();
    public static headersResponse: RestHeaders = new RestHeaders();

    public __usecase_desc;
    public static waitingForDocsServer: boolean = false;
    public static restartServerRequest: boolean = false;

    private _endpoint: string;
    private _endpointRest: string;
    private get endpoint() {
        let e = this._endpoint;
        if (this.restQueryParams !== undefined && this._endpointRest !== undefined
            && typeof this._endpointRest === 'string' && this._endpointRest.trim() !== '') e = this._endpointRest;
        return e;
    }
    private restQueryParams: Object;
    public set __rest_endpoint(endpoint) {
        this._endpointRest = endpoint;
        if (endpoint === undefined) {
            this.restQueryParams = undefined;
        } else {
            this.restQueryParams = UrlNestedParams.getRestParams(endpoint, this._endpoint);
        }

    }

    private static _headersAreSet: boolean = false;


    private getHeadersJSON() {
        return Rest.headers.toJSON();
    }

    public static waitTimeMs: number = 1000;
    /**
     * App is waiting unit get response from server
     * 
     * @returns
     * 
     * @memberOf Rest
     */
    private appIsWaiting() {
        return Rest.waitingForDocsServer;
    }

    private prepareUrlOldWay = RestModule.prepareUrlOldWay;
    private getParams = RestModule.getParamsUrl;
    private creatUrl(params: any, doNotSerializeParams: boolean = false) {
        return `${this.endpoint}${RestModule.getParamsUrl(params, doNotSerializeParams)}`;
    }

    //#endregion

    //#region  constructor
    constructor(
        endpoint: string,
        private request: RestRequest,
        private description: string,
        private name: string,
        private group: string) {
        this._endpoint = endpoint;

        if (!Rest._headersAreSet) {
            Rest._headersAreSet = true;
            for (let h in DEFAULT_HEADERS) {
                Rest.headers.append(h, DEFAULT_HEADERS[h]);
            }
        }

        if (Rest.restartServerRequest && Rest.docServerUrl && Rest.docServerUrl.trim() !== '') {
            Rest.restartServerRequest = false;

            let tmpUrl = Rest.docServerUrl.charAt(Rest.docServerUrl.length - 1) === '/' ?
                Rest.docServerUrl.slice(0, Rest.docServerUrl.length - 1) : Rest.docServerUrl;
            tmpUrl = Rest.docsTitle ? `${tmpUrl}/api/start/${encodeURIComponent(Rest.docsTitle)}` : `${tmpUrl}/api/start`;

            Rest.waitingForDocsServer = true;
            request.get(tmpUrl, undefined, Rest.headers).subscribe(() => {
                Rest.waitingForDocsServer = false;
                console.info('Docs server restarted');
            }, (err) => {
                Rest.waitingForDocsServer = false;
                console.error(`Problem with restart server on ${tmpUrl}`);
            });
        }

    }
    //#endregion

    //#region  log
    private log(model: Docs.DocModel) {
        if (Rest.docServerUrl) {

            model.description = this.description;
            model.name = this.name;
            model.group = this.group;
            model.usecase = this.__usecase_desc;
            model.url = this.endpoint;
            // model.form = this.form;
            model.headers = this.getHeadersJSON();
            model.restQueryParams = JSON.stringify(this.restQueryParams);

            let url = Rest.docServerUrl.charAt(Rest.docServerUrl.length - 1) === '/' ?
                Rest.docServerUrl.slice(0, Rest.docServerUrl.length - 1) : Rest.docServerUrl;
            url = `${url}/api/save`;

            this.request.post(url, JSON.stringify(model), Rest.headers).subscribe(() => {
                log.i('request saved in docs server');
            });
        }
    }
    //#endregion

    //#region  req
    private req(method: HttpModule.HttpMethod,
        item: T,
        params?: RestModule.UrlParams[],
        doNotSerializeParams: boolean = false,
        _sub: Subject<T> = undefined): Observable<T> {
        if (this.appIsWaiting()) {
            let sub: Subject<T> = _sub ? _sub : new Subject<T>();
            let obs = sub.asObservable();
            setTimeout(() => {
                this[method.toLowerCase()](item, params, doNotSerializeParams, sub).subscribe(e => sub.next(e));
            }, Rest.waitTimeMs)
            return sub as any;
        }
        let u = this.creatUrl(params, doNotSerializeParams);
        let d = JSON.stringify(item);
        for (let h in DEFAULT_HEADERS) {
            Rest.headers.set(h, DEFAULT_HEADERS[h]);
        }
        return this.request[method.toLowerCase()](u, JSON.stringify(item),
            Rest.headers).map(res => {
                if (res.text() !== '') {
                    Rest.headersResponse = res.headers;
                    let r = undefined;
                    try {
                        r = res.json()
                    } catch (error) {
                        console.warn(error);
                    }
                    this.log(<Docs.DocModel>{
                        urlParams: JSON.stringify(params),
                        bodySend: d,
                        bodyRecieve: JSON.stringify(r),
                        method,
                        urlFull: u
                    });
                    return r;
                }
                return {};
            });
    }
    //#endregion

    //#region http methods

    array = {
        get: (params: RestModule.UrlParams[] = undefined, doNotSerializeParams: boolean = false): Observable<TA> => {
            return this.req('GET', undefined, params, doNotSerializeParams) as any
        }
    }

    get(params?: RestModule.UrlParams[], doNotSerializeParams: boolean = false): Observable<T> {
        return this.req('GET', undefined, params, doNotSerializeParams);
    }

    post(item: T, params?: RestModule.UrlParams[], doNotSerializeParams: boolean = false): Observable<T> {
        return this.req('POST', item, params, doNotSerializeParams);
    }

    put(item: T, params?: RestModule.UrlParams[], doNotSerializeParams: boolean = false, _sub: Subject<T> = undefined): Observable<T> {
        return this.req('PUT', item, params, doNotSerializeParams);
    }


    delete(params?: RestModule.UrlParams[], doNotSerializeParams: boolean = false, _sub: Subject<T> = undefined): Observable<T> {
        return this.req('DELETE', undefined, params, doNotSerializeParams);
    }
    //#endregion

    //#region jsonp method
    jsonp(url?: string, params?: RestModule.UrlParams[], _sub: Subject<T> = undefined): Observable<T> {
        if (this.appIsWaiting()) {
            let sub: Subject<T> = _sub ? _sub : new Subject<T>();
            let obs = sub.asObservable();
            setTimeout(() => {
                this.jsonp(url, params, _sub).subscribe(e => sub.next(e));
            }, Rest.waitTimeMs)
            return sub as any;
        }
        let u = (url && UrlNestedParams.checkValidUrl(url)) ? url : this.endpoint;
        return this.request.jsonp(u).map(res => {
            Rest.headersResponse = res.headers;
            let r = undefined;
            try {
                r = res.json()
            } catch (error) {
                console.warn(error);
            }
            this.log(<Docs.DocModel>{
                bodyRecieve: JSON.stringify(r),
                method: 'JSONP',
                urlFull: u
            });
            return r;
        });
    }
    //#endregion

}

