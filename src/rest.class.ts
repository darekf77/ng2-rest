//#region import
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { Log, Level } from 'ng2-logger';
const log = Log.create('rest.class', Level.__NOTHING)
import * as JSON5 from 'json5';
// local
import { Docs } from './docs';
import { HttpMethod, HttpResponse, HttpResponseArray, FnMethodsHttp, UrlParams, Ng2RestMethods } from './models';
import { getRestParams, getParamsUrl } from "./params";
import { RestRequest } from "./rest-request";
import { RestHeaders } from "./rest-headers";
//#endregion

export const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};

export class Rest<T, TA = T[]> implements FnMethodsHttp<T, TA> {

    //#region  private fields
    public static docServerUrl: string;
    public static docsTitle: string;
    public static headers: RestHeaders = new RestHeaders();
    public static headersResponse: RestHeaders = new RestHeaders();

    public __usecase_desc;
    public static waitingForDocsServer: boolean = false;
    public static restartServerRequest: boolean = false;

    private __meta_endpoint: string;
    private _endpointRest: string;
    private get endpoint() {
        let e = this.__meta_endpoint;
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
            this.restQueryParams = getRestParams(endpoint, this.__meta_endpoint);
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

    private creatUrl(params: any, doNotSerializeParams: boolean = false) {
        return `${this.endpoint}${getParamsUrl(params, doNotSerializeParams)}`;
    }

    //#endregion

    //#region  constructor
    constructor(
        endpoint: string,
        private request: RestRequest,
        private description: string,
        private name: string,
        private group: string,
        private meta: { path: string, endpoint: string; }
    ) {
        this.__meta_endpoint = endpoint;

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
            request.get(tmpUrl, undefined, Rest.headers, meta).subscribe(() => {
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

            this.request.post(url, JSON.stringify(model), Rest.headers, this.meta).subscribe(() => {
                log.i('request saved in docs server');
            });
        }
    }
    //#endregion

    //#region  req
    private req(method: HttpMethod,
        item: T,
        params?: UrlParams[],
        doNotSerializeParams: boolean = false) {

        const modelUrl = this.creatUrl(params, doNotSerializeParams);
        const body = item ? JSON.stringify(item) : undefined;
        for (let h in DEFAULT_HEADERS) {
            Rest.headers.set(h, DEFAULT_HEADERS[h]);
        }
        return this.request[method.toLowerCase()](modelUrl, body, Rest.headers, this.meta)
            .map(res => {
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
                        bodySend: body,
                        bodyRecieve: JSON.stringify(r),
                        method,
                        urlFull: modelUrl
                    });
                    return r;
                    // return new HttpResponseArray<any>(
                    //     body: {
                    //         json:r,
                    //         text: res.text()
                    //     }
                    // );
                    // return <HttpResponseArray<any>>{
                    //     body: {
                    //         json:r,
                    //         text: res.text()
                    //     },
                    //     headers: 
                    // };  
                }
                return {};
            });
    }
    //#endregion

    //#region http methods

    //#region replay
    replay(method: HttpMethod) {
        this.request.replay(method, this.meta);
    }

    //#endregion

    array = {
        get: (params: UrlParams[] = undefined, doNotSerializeParams?: boolean): Observable<HttpResponseArray<TA>> => {
            return this.req('GET', undefined, params, doNotSerializeParams) as any
        },
        post: (item: TA, params?: UrlParams[], doNotSerializeParams?: boolean): Observable<HttpResponseArray<TA>> => {
            return this.req('POST', item as any, params, doNotSerializeParams) as any;
        },
        put: (item: TA, params?: UrlParams[], doNotSerializeParams?: boolean): Observable<HttpResponseArray<TA>> => {
            return this.req('PUT', item as any, params, doNotSerializeParams) as any;
        },
        delete: (params?: UrlParams[], doNotSerializeParams?: boolean): Observable<HttpResponseArray<TA>> => {
            return this.req('DELETE', undefined, params, doNotSerializeParams) as any;
        },
        jsonp: (params?: UrlParams[], doNotSerializeParams?: boolean): Observable<HttpResponseArray<TA>> => {
            return this.req('JSONP', undefined, params, doNotSerializeParams) as any;
        }
    }

    get(params?: UrlParams[], doNotSerializeParams: boolean = false): Observable<HttpResponse<T>> {
        return this.req('GET', undefined, params, doNotSerializeParams) as any;
    }

    post(item: T, params?: UrlParams[], doNotSerializeParams: boolean = false): Observable<HttpResponse<T>> {
        return this.req('POST', item, params, doNotSerializeParams);
    }

    put(item: T, params?: UrlParams[], doNotSerializeParams: boolean = false): Observable<HttpResponse<T>> {
        return this.req('PUT', item, params, doNotSerializeParams);
    }

    delete(params?: UrlParams[], doNotSerializeParams: boolean = false): Observable<HttpResponse<T>> {
        return this.req('DELETE', undefined, params, doNotSerializeParams);
    }

    jsonp(params?: UrlParams[], doNotSerializeParams: boolean = false): Observable<HttpResponse<T>> {
        return this.req('JSONP', undefined, params, doNotSerializeParams);
    }
    //#endregion

}

