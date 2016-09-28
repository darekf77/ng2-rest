import { Http, Response, Headers, Jsonp } from '@angular/http';

import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { MockController } from './mock.controller';
import { MockAutoBackend } from './mock-auto-backend.class';
import { MockingMode } from './mocking-mode';
import { DocModel, HttpMethod } from './models';

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
    private useCaseDescription;

    constructor(
        private endpoint: string,
        private http: Http,
        private jp: Jsonp,
        private description: string,
        private name: string,
        private group: string) {
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
    }

    private log(model: DocModel) {
        if (Rest.docServerUrl) {
            model.description = this.description;
            model.name = this.name;
            model.group = this.group;
            model.usecase = this.useCaseDescription;
            let url = Rest.docServerUrl.charAt(Rest.docServerUrl.length - 1) === '/' ?
                Rest.docServerUrl.slice(0, Rest.docServerUrl.length - 1) : Rest.docServerUrl;
            url = `${url}/api/save`;

            this.http.post(Rest.docServerUrl, encodeURI(JSON.stringify(model)));
        }
    }

    /**
     * Request to get collection of objects
     */
    public query = (params: any = undefined): Observable<TA> => {

        if (Rest.mockingMode === MockingMode.MOCKS_ONLY) {
            throw (`In MOCKING MODE you have to define mock of query for enipoint: ${this.endpoint}.`);
        }
        if (params !== undefined) {
            params = transform(params);
            return this.http.get(this.endpoint + '/' + params).map(res => {
                let r = res.json()
                this.log(<DocModel>{
                    params: JSON.stringify(params),
                    body: JSON.stringify(r),
                    method: <HttpMethod>'GET'
                });
                return r;
            });
        }
        return this.http.get(this.endpoint).map(res => {
            let r = res.json()
            this.log(<DocModel>{
                params: JSON.stringify(params),
                body: JSON.stringify(r),
                method: <HttpMethod>'GET'
            });
            return r;
        });
    }

    /**
     * Request to get object
     */
    public get = (id: any): Observable<T> => {
        if (Rest.mockingMode === MockingMode.MOCKS_ONLY) {
            throw (`In MOCKING MODE you have to define mock of get for enipoint: ${this.endpoint}.`);
        }
        if (typeof id === 'object') {
            id = transform(id);
        }
        return this.http.get(this.endpoint + '/' + id).map(res => {
            let r = res.json()
            this.log(<DocModel>{
                params: JSON.stringify(id),
                body: JSON.stringify(r),
                method: <HttpMethod>'GET'
            });
            return r;
        });
    }

    /**
     * Save object with request
     */
    public save = (item: T): Observable<T> => {
        if (Rest.mockingMode === MockingMode.MOCKS_ONLY) {
            throw (`In MOCKING MODE you have to define mock of save for enipoint: ${this.endpoint}.`);
        }
        let toAdd = JSON.stringify(item);

        return this.http.post(this.endpoint, toAdd,
            { headers: this.headers }).map(res => {
                let r = res.json()
                this.log(<DocModel>{
                    params: JSON.stringify(item),
                    body: JSON.stringify(r),
                    method: <HttpMethod>'POST'
                });
                return r;
            });
    }

    /**
     * Update object with request
     */
    public update = (id: any, itemToUpdate: T): Observable<T> => {
        if (Rest.mockingMode === MockingMode.MOCKS_ONLY) {
            throw (`In MOCKING MODE you have to define mock of update for enipoint: ${this.endpoint}.`);
        }
        if (typeof id === 'object') {
            id = transform(id);
        }
        return this.http.put(this.endpoint + '/' + id, JSON.stringify(itemToUpdate),
            { headers: this.headers }).map(res => {
                let r = res.json()
                this.log(<DocModel>{
                    params: JSON.stringify({
                        id,
                        itemToUpdate
                    }),
                    body: JSON.stringify(r),
                    method: <HttpMethod>'PUT'
                });
                return r;
            });
    }

    /**
     * Remove object with request 
     */
    public remove = (id: any): Observable<T> => {
        if (Rest.mockingMode === MockingMode.MOCKS_ONLY) {
            throw (`In MOCKING MODE you have to define mock of remove for enipoint: ${this.endpoint}.`);
        }
        if (typeof id === 'object') {
            id = transform(id);
        }
        return this.http.delete(this.endpoint + '/' + id,
            { headers: this.headers }).map(res => {

                if (res.text() !== '') {
                    let r = res.json()
                    this.log(<DocModel>{
                        params: JSON.stringify({ id: id }),
                        body: JSON.stringify(r),
                        method: <HttpMethod>'DELETE'
                    });
                    return r;
                }
                return {};
            });
    }


    useCase(description: string) {
        this.useCaseDescription = description;
        return this;
    }

    /**
     *  Create JSONP request 
     */
    public jsonp = (): Observable<any> => {
        if (Rest.mockingMode === MockingMode.MOCKS_ONLY) {
            throw (`In MOCKING MODE you have to define mock of jsonp for enipoint: ${this.endpoint}.`);
        }
        return this.jp.request(this.endpoint).map(res => {
            let r = res.json()
            this.log(<DocModel>{
                params: JSON.stringify({}),
                body: JSON.stringify(r),
                method: <HttpMethod>'JSONP'
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
                        params: JSON.stringify(tparams),
                        body: JSON.stringify(d),
                        method: currentMethod
                    });
                    subject.next(d);
                }
            }
            else {
                if (typeof data === 'object') {
                    let res = JSON.parse(JSON.stringify(data));
                    this.log(<DocModel>{
                        params: JSON.stringify(tparams),
                        body: JSON.stringify(res),
                        method: currentMethod
                    });
                    subject.next(res);
                }
                else if (typeof data === 'string') {
                    let res = JSON.parse(data);
                    this.log(<DocModel>{
                        params: JSON.stringify(tparams),
                        body: JSON.stringify(res),
                        method: currentMethod
                    });
                    subject.next(res);
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
                subject = new Subject<TA>();
                return subject.asObservable();
            },

            get: (id: any): Observable<T> => {
                currentMethod = 'GET';
                if (typeof id === 'object') tparams = id;
                else tparams = { id };
                subject = new Subject<T>();
                return subject.asObservable();
            },

            save: (item: T): Observable<T> => {
                currentMethod = 'POST';
                tparams = { item };
                subject = new Subject<T>();
                return subject.asObservable();;
            },

            update: (id: any, itemToUpdate: T): Observable<T> => {
                currentMethod = 'PUT';
                tparams = { id, itemToUpdate };
                subject = new Subject<T>();
                return subject.asObservable();
            },

            remove: (id: any): Observable<T> => {
                currentMethod = 'DELETE';
                tparams = { id };
                subject = new Subject<T>();
                return subject.asObservable();
            },

            jsonp: (): Observable<any> => {
                currentMethod = 'JSONP';
                subject = new Subject<any>();
                return subject.asObservable();
            }
        }
        return t;
    }







}

