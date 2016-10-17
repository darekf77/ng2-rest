import { Http, Response, Headers, Jsonp } from '@angular/http';

import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { MockController } from './mock.controller';
import { MockAutoBackend } from './mock-auto-backend.class';
import { MockingMode } from './mocking-mode';
import { DocModel, HttpMethod, Eureka, EurekaState } from './models';

function transform(o) {
    if (typeof o === 'object') {
        return encodeURIComponent(JSON.stringify(o));
    }
    return o;
}

export class Rest<T, TA> {

    public static docServerUrl: string;
    private headers: Headers;
    public static mockingMode: MockingMode = MockingMode.MIX;
    public _useCaseDescription;
    public static eureka: Eureka<any, any>;
    public static waitingForDocsServer: boolean = false;
    public static restartServerRequest: boolean = true;

    private _endpoint: string;
    public get endpoint() {
        return (Rest.eureka && Rest.eureka.instance) ? Rest.eureka.instance.instanceId : this._endpoint;
    }

    constructor(
        endpoint: string,
        private http: Http,
        private jp: Jsonp,
        private description: string,
        private name: string,
        private group: string) {
        this._endpoint = endpoint;
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');

        if (Rest.restartServerRequest && Rest.docServerUrl && Rest.docServerUrl.trim() !== '') {
            Rest.restartServerRequest = false;

            let tmpUrl = Rest.docServerUrl.charAt(Rest.docServerUrl.length - 1) === '/' ?
                Rest.docServerUrl.slice(0, Rest.docServerUrl.length - 1) : Rest.docServerUrl;
            tmpUrl = `${tmpUrl}/api/start`;

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
            // console.log('model.usecase = Rest.useCaseDescdription;', this._useCaseDescription)
            model.description = this.description;
            model.name = this.name;
            model.group = this.group;
            model.usecase = this._useCaseDescription;
            model.url = this.endpoint;

            let url = Rest.docServerUrl.charAt(Rest.docServerUrl.length - 1) === '/' ?
                Rest.docServerUrl.slice(0, Rest.docServerUrl.length - 1) : Rest.docServerUrl;
            url = `${url}/api/save`;

            this.http.post(url, JSON.stringify(model), { headers: this.headers }).subscribe(() => {
                console.log('request saved in docs server');
            });
        }
    }

    public static waitTimeMs: number = 1000;
    appIsWaiting() {
        return ((Rest.eureka && Rest.eureka.isWaiting()) || Rest.waitingForDocsServer);
    }


    private prepare = {
        url: {
            query: (params?: any): string => {
                if (params) params = transform(params);
                return (params) ? this.endpoint + '/' + params : this.endpoint;
            },
            get: (id?: any) => {
                if (typeof id === 'object') {
                    id = transform(id);
                }
                return (id) ? this.endpoint + '/' + id : this.endpoint
            },
            save: () => this.endpoint,
            update: (id?: any) => {
                if (typeof id === 'object') {
                    id = transform(id);
                }
                return (id) ? this.endpoint + '/' + id : this.endpoint
            },
            remove: (id?: any) => {
                if (typeof id === 'object') {
                    id = transform(id);
                }
                return (id) ? this.endpoint + '/' + id : this.endpoint
            },
            // remove: (params) => this.endpoint + '/' + params,
            // jsonp: (params) => this.endpoint + '/' + params,

        }
    };

    /**
     * Request to get collection of objects
     */
    public query = (params: any = undefined, _sub: Subject<TA> = undefined): Observable<TA> => {
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
        let u = this.prepare.url.query(params);
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
     * Request to get object
     */
    public get = (id: any, _sub: Subject<T> = undefined): Observable<T> => {
        if (Rest.mockingMode === MockingMode.MOCKS_ONLY) {
            throw (`In MOCKING MODE you have to define mock of get for enipoint: ${this.endpoint}.`);
        }
        if (this.appIsWaiting()) {
            let sub: Subject<T> = _sub ? _sub : new Subject<T>();
            let obs = sub.asObservable();
            setTimeout(() => {
                this.get(id, sub).subscribe(e => sub.next(e));
            }, Rest.waitTimeMs)
            return sub;
        }
        let u = this.prepare.url.get(id);
        return this.http.get(u).map(res => {
            let r = res.json()
            this.log(<DocModel>{
                urlParams: JSON.stringify(id),
                bodyRecieve: JSON.stringify(r),
                method: <HttpMethod>'GET',
                urlFull: u
            });
            return r;
        });
    }

    /**
     * Save object with request
     */
    public save = (item: T, _sub: Subject<T> = undefined): Observable<T> => {
        if (Rest.mockingMode === MockingMode.MOCKS_ONLY) {
            throw (`In MOCKING MODE you have to define mock of save for enipoint: ${this.endpoint}.`);
        }
        if (this.appIsWaiting()) {
            let sub: Subject<T> = _sub ? _sub : new Subject<T>();
            let obs = sub.asObservable();
            setTimeout(() => {
                this.save(item, sub).subscribe(e => sub.next(e));
            }, Rest.waitTimeMs)
            return sub;
        }
        let u = this.prepare.url.save();
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
     * Update object with request
     */
    public update = (id: any, itemToUpdate: T, _sub: Subject<T> = undefined): Observable<T> => {
        if (Rest.mockingMode === MockingMode.MOCKS_ONLY) {
            throw (`In MOCKING MODE you have to define mock of update for enipoint: ${this.endpoint}.`);
        }
        if (this.appIsWaiting()) {
            let sub: Subject<T> = _sub ? _sub : new Subject<T>();
            let obs = sub.asObservable();
            setTimeout(() => {
                this.update(id, itemToUpdate, _sub).subscribe(e => sub.next(e));
            }, Rest.waitTimeMs)
            return sub;
        }
        let u = this.prepare.url.update(id); // this.endpoint + '/' + id;
        let d = JSON.stringify(itemToUpdate);
        return this.http.put(u, JSON.stringify(itemToUpdate),
            { headers: this.headers }).map(res => {
                let r = res.json()
                this.log(<DocModel>{
                    urlParams: JSON.stringify(id),
                    bodySend: d,
                    bodyRecieve: JSON.stringify(r),
                    method: <HttpMethod>'PUT',
                    urlFull: u
                });
                return r;
            });
    }

    /**
     * Remove object with request 
     */
    public remove = (id: any, _sub: Subject<T> = undefined): Observable<T> => {
        if (Rest.mockingMode === MockingMode.MOCKS_ONLY) {
            throw (`In MOCKING MODE you have to define mock of remove for enipoint: ${this.endpoint}.`);
        }
        if (this.appIsWaiting()) {
            let sub: Subject<T> = _sub ? _sub : new Subject<T>();
            let obs = sub.asObservable();
            setTimeout(() => {
                this.remove(id, _sub).subscribe(e => sub.next(e));
            }, Rest.waitTimeMs)
            return sub;
        }
        let u = this.prepare.url.remove(id); // this.endpoint + '/' + id;
        return this.http.delete(u,
            { headers: this.headers }).map(res => {

                if (res.text() !== '') {
                    let r = res.json()
                    this.log(<DocModel>{
                        urlParams: JSON.stringify(id),
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
     *  Create JSONP request 
     */
    public jsonp = (_sub: Subject<T> = undefined): Observable<any> => {
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

    mock = (data: any, timeout: number = 0, controller: MockController<T> = undefined, nunOfMocks: number = 0) => {
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

        let t = {
            query: (params: any = undefined): Observable<TA> => {
                currentMethod = 'GET';
                tparams = params;
                currentUrlParams = JSON.stringify(tparams);
                currentFullUrl = this.prepare.url.query(params);
                subject = new Subject<TA>();
                return subject.asObservable();
            },

            get: (id: any): Observable<T> => {
                currentMethod = 'GET';
                if (typeof id === 'object') tparams = id;
                else tparams = { id };
                currentFullUrl = this.prepare.url.get(id);
                currentUrlParams = JSON.stringify({ id: id });
                subject = new Subject<T>();
                return subject.asObservable();
            },

            save: (item: T): Observable<T> => {
                currentMethod = 'POST';
                tparams = { item };
                subject = new Subject<T>();
                currentFullUrl = this.prepare.url.save();
                currentBodySend = JSON.stringify(item);
                return subject.asObservable();;
            },


            update: (id: any, itemToUpdate: T): Observable<T> => {
                currentMethod = 'PUT';
                tparams = { id, itemToUpdate };
                subject = new Subject<T>();
                currentFullUrl = this.prepare.url.update(id);
                currentUrlParams = JSON.stringify(id);
                currentBodySend = JSON.stringify(itemToUpdate);
                return subject.asObservable();
            },

            remove: (id: any): Observable<T> => {
                currentMethod = 'DELETE';
                tparams = { id };
                currentFullUrl = this.prepare.url.remove(id);
                currentUrlParams = JSON.stringify(id);
                subject = new Subject<T>();
                return subject.asObservable();
            },

            jsonp: (): Observable<any> => {
                currentMethod = 'JSONP';
                currentFullUrl = this.endpoint;
                subject = new Subject<any>();
                return subject.asObservable();
            }
        }
        return t;
    }







}

