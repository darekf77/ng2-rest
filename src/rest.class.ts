//#region import
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { Log, Level } from 'ng2-logger';
const log = Log.create('rest.class', Level.__NOTHING)
import * as JSON5 from 'json5';
// local
import { MockingMode } from './mocking-mode';
import { Rest as RestModule } from './rest';
import { UrlNestedParams } from './nested-params';
import { Eureka } from './eureka';
import { Docs } from './docs';
import { MockBackend, MockResponse } from './mock-backend';
import { Http as HttpModule } from './http';
import { RestRequest } from "./rest-request";
import { RestHeaders } from "./rest-headers";
//#endregion

export class Rest<T, TA = T[]> implements RestModule.FnMethodsHttp<T, TA> {

    //#region  private fields
    public static docServerUrl: string;
    public static docsTitle: string;
    public static headers: RestHeaders = new RestHeaders();
    public static headersResponse: RestHeaders = new RestHeaders();

    public static mockingMode: MockingMode;
    public __usecase_desc;
    public static eureka: Eureka.Eureka<any, any>;
    public static waitingForDocsServer: boolean = false;
    public static restartServerRequest: boolean = false;

    private _endpoint: string;
    private _endpointRest: string;
    private get endpoint() {
        let e = (Rest.eureka && Rest.eureka.instance) ? Rest.eureka.instance.instanceId : this._endpoint;
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
    private static _headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

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
        return ((Rest.eureka && Rest.eureka.isWaiting()) || Rest.waitingForDocsServer);
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

        // Quick fix
        if (Rest.mockingMode === undefined) Rest.mockingMode = MockingMode.MIX;

        if (!Rest._headersAreSet) {
            Rest._headersAreSet = true;
            for (let h in Rest._headers) {
                Rest.headers.append(h, Rest._headers[h]);
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
        if (Rest.mockingMode === MockingMode.MOCKS_ONLY) {
            throw (`In MOCKING MODE you have to define mock of update for enipoint: ${this.endpoint}.`);
        }
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
    query(params: RestModule.UrlParams[] = undefined, doNotSerializeParams: boolean = false, _sub: Subject<TA> = undefined): Observable<TA> {
        return this.req('GET', undefined, params, doNotSerializeParams, _sub as any) as any;
    }

    get(params?: RestModule.UrlParams[], doNotSerializeParams: boolean = false, _sub: Subject<T> = undefined): Observable<T> {
        return this.req('GET', undefined, params, doNotSerializeParams, _sub as any) as any;
    }

    save(item: T, params?: RestModule.UrlParams[], doNotSerializeParams: boolean = false, _sub: Subject<T> = undefined): Observable<T> {
        return this.req('POST', item, params, doNotSerializeParams, _sub as any) as any;
    }

    update(item: T, params?: RestModule.UrlParams[], doNotSerializeParams: boolean = false, _sub: Subject<T> = undefined): Observable<T> {
        return this.req('PUT', item, params, doNotSerializeParams, _sub as any) as any;
    }


    remove(params?: RestModule.UrlParams[], doNotSerializeParams: boolean = false, _sub: Subject<T> = undefined): Observable<T> {
        return this.req('DELETE', undefined, params, doNotSerializeParams, _sub as any) as any;
    }
    //#endregion

    //#region jsonp method
    jsonp(url?: string, params?: RestModule.UrlParams[], _sub: Subject<T> = undefined): Observable<T> {
        if (Rest.mockingMode === MockingMode.MOCKS_ONLY) {
            throw (`In MOCKING MODE you have to define mock of jsonp for enipoint: ${this.endpoint}.`);
        }
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

    //#region browser mock
    private backend: MockBackend.MockAutoBackend<T>;

    mock(data: any, timeout: number = 0, controller?: MockBackend.MockController<T>,
        nunOfMocks: number = 0): RestModule.FnMethodsHttp<T, TA> {

        if (Rest.mockingMode === MockingMode.LIVE_BACKEND_ONLY) {
            log.i('FROM MOCK TO LIVE')
            return this;
        }
        let subject: Subject<any>;
        let currentMethod: HttpModule.HttpMethod;
        let currentBodySend: string;
        let currentUrlParams: string;
        let currentFullUrl: string;

        setTimeout(() => {

            if (controller !== undefined) {
                let tdata;
                if (typeof data === 'object') {
                    tdata = JSON.parse(JSON.stringify(data));
                }
                else if (typeof data === 'string') {
                    tdata = JSON5.parse(data);
                }
                else {
                    throw new Error(`Data for mock isn't string or object, endpoint:${this.endpoint}`);
                }
                if (this.backend === undefined && nunOfMocks > 0)
                    this.backend = new MockBackend.MockAutoBackend<T>(tdata, nunOfMocks);

                let bodyPOSTandPUT = (currentBodySend && typeof currentBodySend === 'string') ? JSON.parse(currentBodySend) : undefined;
                log.i('currentFullUrl', currentFullUrl);
                let decodedParams = RestModule.decodeUrl(currentFullUrl);
                log.i('decodedParams', decodedParams);

                let d = nunOfMocks === 0 ? controller({
                    data: tdata,
                    params: decodedParams,
                    body: bodyPOSTandPUT,
                    restParams: this.restQueryParams,
                    method: currentMethod
                }) :
                    controller({
                        data: tdata,
                        params: decodedParams,
                        body: bodyPOSTandPUT,
                        backend: this.backend,
                        restParams: this.restQueryParams,
                        method: currentMethod
                    });
                if (d === undefined) {
                    throw new Error(`Mock controlelr can't return undefined (endpoint:${this.endpoint})`);
                }
                if (d.error !== undefined) {
                    console.error(`Mock server respond with code ${d.code} - ${d.error}`);
                    // TODO each code real message
                }

                if (d.code === undefined) d.code = 200;
                if (d.data === undefined) {
                    this.log(<Docs.DocModel>{
                        urlParams: currentUrlParams,
                        bodySend: currentBodySend,
                        method: currentMethod,
                        urlFull: currentFullUrl,
                        status: d.code,
                    });
                    subject.error(d);
                }
                else {
                    this.log(<Docs.DocModel>{
                        urlParams: currentUrlParams,
                        bodyRecieve: JSON.stringify(d.data),
                        bodySend: currentBodySend,
                        method: currentMethod,
                        urlFull: currentFullUrl,
                        status: d.code
                    });
                    if (this.appIsWaiting()) setTimeout(() => subject.next(d.data), Rest.waitTimeMs);
                    else subject.next(d.data);
                }
            }
            else {
                if (typeof data === 'object' || typeof data === 'string') {
                    let res: MockResponse = {
                        data: (typeof data === 'string') ? JSON5.parse(data) : JSON.parse(JSON.stringify(data)),
                        code: 200
                    };
                    this.log(<Docs.DocModel>{
                        urlParams: currentUrlParams,
                        bodyRecieve: JSON.stringify(res.data),
                        bodySend: currentBodySend,
                        method: currentMethod,
                        urlFull: currentFullUrl,
                        status: res.code
                    });
                    if (this.appIsWaiting()) setTimeout(() => subject.next(res.data), Rest.waitTimeMs);
                    else subject.next(res.data);
                }
                else {
                    throw new Error(`Data for mock isn't string or object, endpoint:${this.endpoint}`);
                }
            }
        }, timeout);

        let t: RestModule.FnMethodsHttp<T, TA> = <RestModule.FnMethodsHttp<T, TA>>{};

        const reqMock = (method: HttpModule.HttpMethod, item: T, params?: RestModule.UrlParams[], doNotSerializeParams: boolean = false) => {
            currentMethod = method;
            subject = new Subject<T>();
            RestModule.prepare(params);
            currentUrlParams = params ? JSON.stringify(params) : '{}';
            currentFullUrl = this.creatUrl(params, doNotSerializeParams);
            if (item) currentBodySend = JSON.stringify(item);
            return subject.asObservable();
        };

        t.query = (params?: RestModule.UrlParams[], doNotSerializeParams: boolean = false): Observable<TA> => {
            return reqMock('GET', undefined, params, doNotSerializeParams);
        };

        t.get = (params?: RestModule.UrlParams[], doNotSerializeParams: boolean = false, _sub: any = undefined): Observable<T> => {
            return reqMock('GET', undefined, params, doNotSerializeParams);
        };

        t.save = (item: T, params?: RestModule.UrlParams[], doNotSerializeParams: boolean = false): Observable<T> => {
            return reqMock('POST', undefined, params, doNotSerializeParams);
        };

        t.update = (item: T, params?: RestModule.UrlParams[], doNotSerializeParams: boolean = false): Observable<T> => {
            return reqMock('PUT', undefined, params, doNotSerializeParams);
        };

        t.remove = (params?: RestModule.UrlParams[], doNotSerializeParams: boolean = false): Observable<T> => {
            return reqMock('DELETE', undefined, params, doNotSerializeParams);
        };

        t.jsonp = (url?: string, params?: RestModule.UrlParams[], ): Observable<T> => {
            currentMethod = 'JSONP';
            subject = new Subject<any>();
            RestModule.prepare(params);
            let u = (url && UrlNestedParams.checkValidUrl(url)) ? url : this.endpoint;
            currentFullUrl = u;

            return subject.asObservable();
        };


        return t;
    }
    //#endregion

}

