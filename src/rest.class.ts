import { Http, Response, Headers, Jsonp } from '@angular/http';
import { FormControl, FormGroup } from '@angular/forms';

import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

import {
    DocModel, HttpMethod, Eureka, EurekaState, MockAutoBackend,
    FormGroupArrays, prepareForm, prepareFormArrays, FormInputBind,
    MockingMode, MockController, UrlParams, getParamsUrl, prepareUrlOldWay,
    FnMethodsHttp, decodeUrl, MockResponse, HttpHeaders, Header
} from './models';

function prepare(params: UrlParams[]) {
    if (params && params instanceof Array) {
        params.forEach((p: any) => {
            if (p.regex !== undefined && p.regex instanceof RegExp) p['regex'] = p.regex.source;
        });
    }
}


export class Rest<T, TA> implements FnMethodsHttp<T, TA> {

    public static docServerUrl: string;
    public static docsTitle: string;
    public static headers: Headers = new Headers();
    private form: FormInputBind[];
    public static mockingMode: MockingMode = MockingMode.MIX;
    public _useCaseDescription;
    public static eureka: Eureka<any, any>;
    public static waitingForDocsServer: boolean = false;
    public static restartServerRequest: boolean = false;

    private _endpoint: string;
    public get endpoint() {
        return (Rest.eureka && Rest.eureka.instance) ? Rest.eureka.instance.instanceId : this._endpoint;
    }

    private static _headersAreSet: boolean = false;
    private static _headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    constructor(
        endpoint: string,
        private http: Http,
        private jp: Jsonp,
        private description: string,
        private name: string,
        private group: string) {
        this._endpoint = endpoint;

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
            http.get(tmpUrl).subscribe(() => {
                Rest.waitingForDocsServer = false;
                console.info('Docs server restarted');
            }, (err) => {
                Rest.waitingForDocsServer = false;
                console.error(`Problem with restart server on ${tmpUrl}`);
            });
        }

    }

    private getHeadersJSON() {
        return Rest.headers.toJSON();
    }
    

    private log(model: DocModel) {
        if (Rest.docServerUrl) {

            model.description = this.description;
            model.name = this.name;
            model.group = this.group;
            model.usecase = this._useCaseDescription;
            model.url = this.endpoint;
            model.form = this.form;
            model.headers = this.getHeadersJSON();

            let url = Rest.docServerUrl.charAt(Rest.docServerUrl.length - 1) === '/' ?
                Rest.docServerUrl.slice(0, Rest.docServerUrl.length - 1) : Rest.docServerUrl;
            url = `${url}/api/save`;

            this.http.post(url, JSON.stringify(model), { headers: Rest.headers }).subscribe(() => {
                console.log('request saved in docs server');
            });
        }
    }

    public static waitTimeMs: number = 1000;
    /**
     * App is waiting unit get response from server
     * 
     * @returns
     * 
     * @memberOf Rest
     */
    appIsWaiting() {
        return ((Rest.eureka && Rest.eureka.isWaiting()) || Rest.waitingForDocsServer);
    }

    private prepareUrlOldWay = prepareUrlOldWay;
    private getParams = getParamsUrl;
    private creatUrl(params: any) {
        // console.log('params to url ', params);
        // console.log('params to url string ', JSON.stringify(params));
        return `${this.endpoint}${getParamsUrl(params)}`;
        // if (params instanceof Array && params.length > 0) {
        //     return `${this.endpoint}${getParamsUrl(params)}`
        // }
        // return this.prepareUrlOldWay(params);
    }

    contract(form: FormGroup, arrays?: FormGroupArrays) {
        if (arrays) this.form = prepareForm(form).concat(prepareFormArrays(arrays));
        else this.form = prepareForm(form);
        return this;
    }

    query(params: UrlParams[] = undefined, _sub: Subject<TA> = undefined): Observable<TA> {
        if (Rest.mockingMode === MockingMode.MOCKS_ONLY) {
            throw (`In MOCKING MODE you have to define mock of query for enipoint: ${this.endpoint}.`);
        }
        if (this.appIsWaiting()) {
            let sub: Subject<TA> = _sub ? _sub : new Subject<TA>();
            let obs = sub.asObservable();
            setTimeout(() => {
                this.query(params, sub).subscribe(e => sub.next(e));
            }, Rest.waitTimeMs)
            return sub;
        }
        let u = this.creatUrl(params);
        return this.http.get(u).map(res => {
            let r = res.json()
            this.log(<DocModel>{
                urlParams: JSON.stringify(params),
                bodyRecieve: JSON.stringify(r),
                method: 'GET',
                urlFull: u
            });
            return r;
        });
    }

    get(params?: UrlParams[], _sub: Subject<T> = undefined): Observable<T> {

        if (Rest.mockingMode === MockingMode.MOCKS_ONLY) {
            throw (`In MOCKING MODE you have to define mock of get for enipoint: ${this.endpoint}.`);
        }
        if (this.appIsWaiting()) {
            let sub: Subject<T> = _sub ? _sub : new Subject<T>();
            let obs = sub.asObservable();
            setTimeout(() => {
                this.get(params, sub).subscribe(e => sub.next(e));
            }, Rest.waitTimeMs)
            return sub;
        }
        let u = this.creatUrl(params);
        return this.http.get(u).map(res => {
            let r = res.json()
            this.log(<DocModel>{
                urlParams: JSON.stringify(params),
                bodyRecieve: JSON.stringify(r),
                method: 'GET',
                urlFull: u
            });
            return r;
        });
    }

    save(item: T, params?: UrlParams[], _sub: Subject<T> = undefined): Observable<T> {
        if (Rest.mockingMode === MockingMode.MOCKS_ONLY) {
            throw (`In MOCKING MODE you have to define mock of save for enipoint: ${this.endpoint}.`);
        }
        if (this.appIsWaiting()) {
            let sub: Subject<T> = _sub ? _sub : new Subject<T>();
            let obs = sub.asObservable();
            setTimeout(() => {
                this.save(item, params, sub).subscribe(e => sub.next(e));
            }, Rest.waitTimeMs)
            return sub;
        }
        let u = this.creatUrl(params);
        let d = JSON.stringify(item);
        return this.http.post(u, d,
            { headers: Rest.headers }).map(res => {
                let r = res.json()
                this.log(<DocModel>{
                    bodySend: d,
                    bodyRecieve: JSON.stringify(r),
                    method: 'POST',
                    urlFull: u
                });
                return r;
            });
    }


    update(item: T, params?: UrlParams[], _sub: Subject<T> = undefined): Observable<T> {
        if (Rest.mockingMode === MockingMode.MOCKS_ONLY) {
            throw (`In MOCKING MODE you have to define mock of update for enipoint: ${this.endpoint}.`);
        }
        if (this.appIsWaiting()) {
            let sub: Subject<T> = _sub ? _sub : new Subject<T>();
            let obs = sub.asObservable();
            setTimeout(() => {
                this.update(item, params, sub).subscribe(e => sub.next(e));
            }, Rest.waitTimeMs)
            return sub;
        }
        let u = this.creatUrl(params);
        let d = JSON.stringify(item);
        return this.http.put(u, JSON.stringify(item),
            { headers: Rest.headers }).map(res => {
                let r = res.json()
                this.log(<DocModel>{
                    urlParams: JSON.stringify(params),
                    bodySend: d,
                    bodyRecieve: JSON.stringify(r),
                    method: 'PUT',
                    urlFull: u
                });
                return r;
            });
    }


    remove(params?: UrlParams[], _sub: Subject<T> = undefined): Observable<T> {
        if (Rest.mockingMode === MockingMode.MOCKS_ONLY) {
            throw (`In MOCKING MODE you have to define mock of remove for enipoint: ${this.endpoint}.`);
        }
        if (this.appIsWaiting()) {
            let sub: Subject<T> = _sub ? _sub : new Subject<T>();
            let obs = sub.asObservable();
            setTimeout(() => {
                this.remove(params, sub).subscribe(e => sub.next(e));
            }, Rest.waitTimeMs)
            return sub;
        }
        let u = this.creatUrl(params);
        return this.http.delete(u,
            { headers: Rest.headers }).map(res => {

                if (res.text() !== '') {
                    let r = res.json()
                    this.log(<DocModel>{
                        urlParams: JSON.stringify(params),
                        bodyRecieve: JSON.stringify(r),
                        method: 'DELETE',
                        urlFull: u
                    });
                    return r;
                }
                return {};
            });
    }


    jsonp(params?: UrlParams[], _sub: Subject<T> = undefined): Observable<T> {
        if (Rest.mockingMode === MockingMode.MOCKS_ONLY) {
            throw (`In MOCKING MODE you have to define mock of jsonp for enipoint: ${this.endpoint}.`);
        }
        if (this.appIsWaiting()) {
            let sub: Subject<T> = _sub ? _sub : new Subject<T>();
            let obs = sub.asObservable();
            setTimeout(() => {
                this.jsonp(params, _sub).subscribe(e => sub.next(e));
            }, Rest.waitTimeMs)
            return sub;
        }
        let u = this.endpoint;
        return this.jp.request(u).map(res => {
            let r = res.json()
            this.log(<DocModel>{
                bodyRecieve: JSON.stringify(r),
                method: 'JSONP',
                urlFull: u
            });
            return r;
        });
    }

    private backend: MockAutoBackend<T>;



    mock(data: any, timeout: number = 0, controller?: MockController<T>,
        nunOfMocks: number = 0): FnMethodsHttp<T, TA> {

        if (Rest.mockingMode === MockingMode.LIVE_BACKEND_ONLY) {
            // console.log('FROM MOCK TO LIVE')
            return this;
        }
        let subject: Subject<any>;
        let currentMethod: HttpMethod;
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
                    tdata = JSON.parse(data);
                }
                else {
                    throw new Error(`Data for mock isn't string or object, endpoint:${this.endpoint}`);
                }
                if (this.backend === undefined && nunOfMocks > 0)
                    this.backend = new MockAutoBackend<T>(data, nunOfMocks);

                let bodyPOSTandPUT = (currentBodySend && typeof currentBodySend === 'string') ? JSON.parse(currentBodySend) : undefined;
                // console.log('currentFullUrl', currentFullUrl);
                let decodedParams = decodeUrl(currentFullUrl);
                // console.log('decodedParams', decodedParams);

                let d = nunOfMocks === 0 ? controller({
                    data: tdata,
                    params: decodedParams,
                    body: bodyPOSTandPUT
                }) :
                    controller({
                        data: tdata,
                        params: decodedParams,
                        body: bodyPOSTandPUT,
                        backend: this.backend
                    });
                if (d === undefined) {
                    throw new Error(`Mock controlelr can't return undefined (endpoint:${this.endpoint})`);
                }
                if (d.error !== undefined) {
                    console.error(`Mock server respond with code ${d.code} - ${d.error}`);
                    // TODO each code real message
                }

                // console.log('currentUrlPrams', currentUrlParams);

                if (d.code === undefined) d.code = 200;
                if (d.data === undefined) {
                    this.log(<DocModel>{
                        urlParams: currentUrlParams,
                        bodySend: currentBodySend,
                        method: currentMethod,
                        urlFull: currentFullUrl,
                        status: d.code
                    });
                    subject.error(d);
                }
                else {
                    this.log(<DocModel>{
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
                        data: (typeof data === 'string') ? JSON.parse(data) : JSON.parse(JSON.stringify(data)),
                        code: 200
                    };
                    this.log(<DocModel>{
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

        let t: FnMethodsHttp<T, TA> = <FnMethodsHttp<T, TA>>{};

        t.query = (params?: UrlParams[]): Observable<TA> => {
            currentMethod = 'GET';
            subject = new Subject<TA>();
            prepare(params);
            currentUrlParams = JSON.stringify(params);
            currentFullUrl = this.creatUrl(params);

            return subject.asObservable();
        };

        t.get = (params?: UrlParams[]): Observable<T> => {
            currentMethod = 'GET';
            subject = new Subject<T>();
            prepare(params);
            currentUrlParams = JSON.stringify(params);
            currentFullUrl = this.creatUrl(params);

            return subject.asObservable();
        };

        t.save = (item: T, params?: UrlParams[]): Observable<T> => {
            currentMethod = 'POST';
            subject = new Subject<T>();
            prepare(params);
            currentUrlParams = params ? JSON.stringify(params) : '{}';
            currentFullUrl = this.creatUrl(params);

            currentBodySend = JSON.stringify(item);

            return subject.asObservable();
        };

        t.update = (item: T, params?: UrlParams[]): Observable<T> => {
            currentMethod = 'PUT';
            subject = new Subject<T>();
            prepare(params);
            currentUrlParams = JSON.stringify(params);
            currentFullUrl = this.creatUrl(params);

            currentBodySend = JSON.stringify(item);

            return subject.asObservable();
        };

        t.remove = (params?: UrlParams[]): Observable<T> => {
            currentMethod = 'DELETE';
            subject = new Subject<T>();
            prepare(params);
            currentUrlParams = JSON.stringify(params);
            currentFullUrl = this.creatUrl(params);

            return subject.asObservable();
        };

        t.jsonp = (params?: UrlParams[]): Observable<T> => {
            currentMethod = 'JSONP';
            subject = new Subject<any>();
            prepare(params);
            currentFullUrl = this.endpoint;

            return subject.asObservable();
        };


        return t;
    }







}

