import { Http, Response, Headers, Jsonp } from '@angular/http';

import { Subject }    from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { MockController } from './mock.controller';
import { MockAutoBackend } from './mock-auto-backend.class';

function transform(o) {
    if (typeof o === 'object') {
        return encodeURIComponent(JSON.stringify(o));
    }
    return o;
}

export class Rest<T, TA> {

    private headers: Headers;
    public static isProductionVersion: Boolean = false;


    constructor(private endpoint: string, private http: Http, private jp: Jsonp) {
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
    }

    public query = (params: any = undefined): Observable<TA> => {
        if (params !== undefined) {
            params = transform(params);
            return this.http.get(this.endpoint + '/' + params).map(res => res.json());
        }
        return this.http.get(this.endpoint).map(res => res.json());
    }

    public get = (id: any): Observable<T> => {
        if (typeof id === 'object') {
            id = transform(id);
        }
        return this.http.get(this.endpoint + '/' + id).map(res => res.json());
    }

    public save = (item: T): Observable<T> => {
        let toAdd = JSON.stringify(item);

        return this.http.post(this.endpoint, toAdd,
            { headers: this.headers }).map(res => res.json());
    }

    public update = (id: any, itemToUpdate: T): Observable<T> => {
        if (typeof id === 'object') {
            id = transform(id);
        }
        return this.http.put(this.endpoint + '/' + id, JSON.stringify(itemToUpdate),
            { headers: this.headers }).map(res => res.json());
    }

    public remove = (id: any): Observable<T> => {
        if (typeof id === 'object') {
            id = transform(id);
        }
        return this.http.delete(this.endpoint + '/' + id,
            { headers: this.headers }).map(res => res.json());
    }

    public jsonp = (): Observable<any> => {
        return this.jp.request(this.endpoint).map(res => res.json());
    }

    private backend: MockAutoBackend<T>;

    mock = (data: any, timeout: number = 0, controller: MockController<T> = undefined, nunOfMocks: number = 0) => {
        if (Rest.isProductionVersion) return this;
        let subject;
        let r;
        let tparams = {};
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
                else subject.next(d);
            }
            else {
                if (typeof data === 'object') {
                    subject.next(JSON.parse(JSON.stringify(data)));
                }
                else if (typeof data === 'string') {
                    subject.next(JSON.parse(data));
                }
                else {
                    throw new Error(`Data for mock isn't string or object, endpoint:${this.endpoint}`);
                }
            }
        }, timeout);

        let t = {
            query: (params: any = undefined): Observable<TA> => {
                tparams = params;
                subject = new Subject<TA>();
                return subject.asObservable();
            },

            get: (id: any): Observable<T> => {
                if (typeof id === 'object') tparams = id;
                else tparams = { id };
                subject = new Subject<T>();
                return subject.asObservable();
            },

            save: (item: T): Observable<T> => {
                tparams = { item };
                subject = new Subject<T>();
                return subject.asObservable();;
            },

            update: (id: any, itemToUpdate: T): Observable<T> => {
                tparams = { id, itemToUpdate };
                subject = new Subject<T>();
                return subject.asObservable();
            },

            remove: (id: any): Observable<T> => {
                tparams = { id };
                subject = new Subject<T>();
                return subject.asObservable();
            },

            jsonp: (): Observable<any> => {
                subject = new Subject<any>();
                return subject.asObservable();
            }
        }
        return t;
    }







}

