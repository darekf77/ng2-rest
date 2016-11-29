import { Http, Response, Headers, Jsonp } from '@angular/http';
import { FormControl, FormGroup } from '@angular/forms';

import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

import {
    DocModel, HttpMethod, Eureka, EurekaState, MockAutoBackend,
    FormGroupArrays, prepareForm, prepareFormArrays, FormInputBind,
    MockingMode, MockController, UrlParams, getParamsUrl, prepareUrlOldWay,
    FnMethodsHttp
} from './models';

export class Rest<T, TA> implements FnMethodsHttp<T, TA> {

    public static docServerUrl: string;
    public static docsTitle: string;
    private headers: Headers;
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
    private _headers = {
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
        this.headers = new Headers();
        for (let h in this._headers) {
            this.headers.append(h, this._headers[h]);
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

    private log(model: DocModel) {
        if (Rest.docServerUrl) {

            model.description = this.description;
            model.name = this.name;
            model.group = this.group;
            model.usecase = this._useCaseDescription;
            model.url = this.endpoint;
            model.form = this.form;
            model.headers = this._headers;

            let url = Rest.docServerUrl.charAt(Rest.docServerUrl.length - 1) === '/' ?
                Rest.docServerUrl.slice(0, Rest.docServerUrl.length - 1) : Rest.docServerUrl;
            url = `${url}/api/save`;

            this.http.post(url, JSON.stringify(model), { headers: this.headers }).subscribe(() => {
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
        if (params instanceof Array && params.length > 0) {
            return `${this.endpoint}${getParamsUrl(params)}`
        }
        return this.prepareUrlOldWay(params);
    }

    contract(form: FormGroup, arrays?: FormGroupArrays) {
        if (arrays) this.form = prepareForm(form).concat(prepareFormArrays(arrays));
        else this.form = prepareForm(form);
        return this;
    }



    /**
     * Get items collection from database
     * 
     * @param {(any | UrlParams[])} [params=undefined]
     * @returns {Observable<TA>}
     * 
     * @memberOf Rest
     */
    query(params: Object | UrlParams[] = undefined, _sub: Subject<TA> = undefined): Observable<TA> {
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
                method: <HttpMethod>'GET',
                urlFull: u
            });
            return r;
        });
    }


    /**
     * Get item from database
     * 
     * @param {(any | UrlParams[])} id of object or params to get it
     * @returns {Observable<T>}
     * 
     * @memberOf Rest
     */
    get(params: Object | UrlParams[], _sub: Subject<T> = undefined): Observable<T> {

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
                method: <HttpMethod>'GET',
                urlFull: u
            });
            return r;
        });
    }

    /**
     * Save item in database
     * 
     * @param {T} item
     * @param {UrlParams[]} [params]
     * @returns {Observable<T>}
     * 
     * @memberOf Rest
     */
    save(item: T, params?: Object | UrlParams[], _sub: Subject<T> = undefined): Observable<T> {
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
            { headers: this.headers }).map(res => {
                let r = res.json()
                this.log(<DocModel>{
                    bodySend: d,
                    bodyRecieve: JSON.stringify(r),
                    method: <HttpMethod>'POST',
                    urlFull: u
                });
                return r;
            });
    }

    /**
     * Update data in your database
     * 
     * @param {(any | UrlParams[])} id of updated element
     * @param {T} itemToUpdate
     * @returns {Observable<T>}
     * 
     * @memberOf Rest
     */
    update(params: Object | UrlParams[], itemToUpdate: T, _sub: Subject<T> = undefined): Observable<T> {
        if (Rest.mockingMode === MockingMode.MOCKS_ONLY) {
            throw (`In MOCKING MODE you have to define mock of update for enipoint: ${this.endpoint}.`);
        }
        if (this.appIsWaiting()) {
            let sub: Subject<T> = _sub ? _sub : new Subject<T>();
            let obs = sub.asObservable();
            setTimeout(() => {
                this.update(params, itemToUpdate, _sub).subscribe(e => sub.next(e));
            }, Rest.waitTimeMs)
            return sub;
        }
        let u = this.creatUrl(params);
        let d = JSON.stringify(itemToUpdate);
        return this.http.put(u, JSON.stringify(itemToUpdate),
            { headers: this.headers }).map(res => {
                let r = res.json()
                this.log(<DocModel>{
                    urlParams: JSON.stringify(params),
                    bodySend: d,
                    bodyRecieve: JSON.stringify(r),
                    method: <HttpMethod>'PUT',
                    urlFull: u
                });
                return r;
            });
    }

    /**
     * Delete data from your endpoint
     * 
     * @param {(any | UrlParams[])} id of deleted object
     * @returns {Observable<T>}
     * 
     * @memberOf Rest
     */
    remove(params: Object | UrlParams[], _sub: Subject<T> = undefined): Observable<T> {
        if (Rest.mockingMode === MockingMode.MOCKS_ONLY) {
            throw (`In MOCKING MODE you have to define mock of remove for enipoint: ${this.endpoint}.`);
        }
        if (this.appIsWaiting()) {
            let sub: Subject<T> = _sub ? _sub : new Subject<T>();
            let obs = sub.asObservable();
            setTimeout(() => {
                this.remove(params, _sub).subscribe(e => sub.next(e));
            }, Rest.waitTimeMs)
            return sub;
        }
        let u = this.creatUrl(params);
        return this.http.delete(u,
            { headers: this.headers }).map(res => {

                if (res.text() !== '') {
                    let r = res.json()
                    this.log(<DocModel>{
                        urlParams: JSON.stringify(params),
                        bodyRecieve: JSON.stringify(r),
                        method: <HttpMethod>'DELETE',
                        urlFull: u
                    });
                    return r;
                }
                return {};
            });
    }


    /**
     * Request for jsonp
     * 
     * @memberOf Rest
     */
    jsonp(_sub: Subject<T> = undefined): Observable<any> {
        if (Rest.mockingMode === MockingMode.MOCKS_ONLY) {
            throw (`In MOCKING MODE you have to define mock of jsonp for enipoint: ${this.endpoint}.`);
        }
        if (this.appIsWaiting()) {
            let sub: Subject<T> = _sub ? _sub : new Subject<T>();
            let obs = sub.asObservable();
            setTimeout(() => {
                this.jsonp(_sub).subscribe(e => sub.next(e));
            }, Rest.waitTimeMs)
            return sub;
        }
        let u = this.endpoint;
        return this.jp.request(u).map(res => {
            let r = res.json()
            this.log(<DocModel>{
                bodyRecieve: JSON.stringify(r),
                method: <HttpMethod>'JSONP',
                urlFull: u
            });
            return r;
        });
    }

    private backend: MockAutoBackend<T>;

    mock = (data: any, timeout: number = 0, controller: MockController<T> = undefined, nunOfMocks: number = 0): FnMethodsHttp<T, TA> => {
        if (Rest.mockingMode === MockingMode.LIVE_BACKEND_ONLY) {
            console.log('FROM MOCK TO LIVE')
            return this;
        }
        let subject: Subject<any>;
        let r;
        let tparams = {};
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

                let d = nunOfMocks === 0 ? controller(tdata, tparams) :
                    controller(tdata, tparams, this.backend);
                if (d === undefined) subject.error(d);
                else {
                    this.log(<DocModel>{
                        urlParams: currentUrlParams,
                        bodyRecieve: JSON.stringify(d),
                        bodySend: currentBodySend,
                        method: currentMethod,
                        urlFull: currentFullUrl
                    });
                    if (this.appIsWaiting()) setTimeout(() => subject.next(d), Rest.waitTimeMs);
                    else subject.next(d);
                }
            }
            else {
                if (typeof data === 'object') {
                    let res = JSON.parse(JSON.stringify(data));
                    this.log(<DocModel>{
                        urlParams: currentUrlParams,
                        bodyRecieve: JSON.stringify(res),
                        bodySend: currentBodySend,
                        method: currentMethod,
                        urlFull: currentFullUrl
                    });
                    if (this.appIsWaiting()) setTimeout(() => subject.next(res), Rest.waitTimeMs);
                    else subject.next(res);
                }
                else if (typeof data === 'string') {
                    let res = JSON.parse(data);
                    this.log(<DocModel>{
                        urlParams: currentUrlParams,
                        bodyRecieve: JSON.stringify(res),
                        bodySend: currentBodySend,
                        method: currentMethod,
                        urlFull: currentFullUrl
                    });
                    if (this.appIsWaiting()) setTimeout(() => subject.next(res), Rest.waitTimeMs);
                    else subject.next(res);
                }
                else {
                    throw new Error(`Data for mock isn't string or object, endpoint:${this.endpoint}`);
                }
            }
        }, timeout);

        let t: FnMethodsHttp<T, TA> = <FnMethodsHttp<T, TA>>{};

        t.query = (params: any = undefined): Observable<TA> => {
            currentMethod = 'GET';
            tparams = params;
            currentUrlParams = JSON.stringify(tparams);
            currentFullUrl = this.creatUrl(params);
            subject = new Subject<TA>();
            return subject.asObservable();
        };

        t.get = (params: Object): Observable<T> => {
            currentMethod = 'GET';
            if (typeof params === 'object') tparams = params;
            else tparams = { params };
            currentFullUrl = this.creatUrl(params);
            currentUrlParams = JSON.stringify(params);
            subject = new Subject<T>();
            return subject.asObservable();
        };

        t.save = (item: T, params?: Object | UrlParams[]): Observable<T> => {
            currentMethod = 'POST';
            tparams = { item, params };
            subject = new Subject<T>();
            currentFullUrl = this.creatUrl(params);
            currentBodySend = JSON.stringify(item);
            return subject.asObservable();;
        };

        t.update = (params: Object, itemToUpdate: T): Observable<T> => {
            currentMethod = 'PUT';
            tparams = { params, itemToUpdate };
            subject = new Subject<T>();
            currentFullUrl = this.creatUrl(params);
            currentUrlParams = JSON.stringify(params);
            currentBodySend = JSON.stringify(itemToUpdate);
            return subject.asObservable();
        };

        t.remove = (params: Object): Observable<T> => {
            currentMethod = 'DELETE';
            tparams = { params };
            currentFullUrl = this.creatUrl(params);
            currentUrlParams = JSON.stringify(params);
            subject = new Subject<T>();
            return subject.asObservable();
        };

        t.jsonp = (): Observable<any> => {
            currentMethod = 'JSONP';
            currentFullUrl = this.endpoint;
            subject = new Subject<any>();
            return subject.asObservable();
        };


        return t;
    }







}

