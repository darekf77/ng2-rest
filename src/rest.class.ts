import { Http, Response, Headers, Jsonp } from '@angular/http';

import { Subject }    from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { MockController } from './mock.controller';

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
            if (typeof params === 'object') params = JSON.stringify(params);
            params = encodeURI(params);
            return this.http.get(this.endpoint + '/' + params).map(res => res.json());
        }
        return this.http.get(this.endpoint).map(res => res.json());
    }

    public get = (id: any): Observable<T> => {
        if (typeof id === 'object') {
            id = JSON.stringify(id);
            id = encodeURI(id);
        }
        return this.http.get(this.endpoint + '/' + id).map(res => res.json());
    }

    public save = (item: T): Observable<T> => {
        let toAdd = JSON.stringify(item);

        return this.http.post(this.endpoint, toAdd,
            { headers: this.headers }).map(res => res.json());
    }

    public update = (id: any, itemToUpdate: T): Observable<T> => {
        return this.http.put(this.endpoint + '/' + id, JSON.stringify(itemToUpdate),
            { headers: this.headers }).map(res => res.json());
    }

    public remove = (id: any): Observable<T> => {
        return this.http.delete(this.endpoint + '/' + id,
            { headers: this.headers }).map(res => res.json());
    }

    public jsonp = (): Observable<any> => {
        return this.jp.request(this.endpoint).map(res => res.json());
    }


    mock = (data: any, timeout: number = 0, controller: MockController = undefined) => {
        if (Rest.isProductionVersion) return this;
        let subject;
        let r;
        let tparams = {};
        setTimeout(() => {
            if (controller !== undefined) {
                let d = controller(data, tparams);
                subject.next(data);
            }
            else {
                if (typeof data === 'object') {
                    subject.next(data);
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
                tparams = { id };
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

