import { Http, Response, Headers, Jsonp } from '@angular/http';

import { Subject }    from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

export class Rest<T, TA> {

    private headers: Headers;


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


    mock = (data: string, timeout: number = 0) => {

        let subject;
        let r;
        setTimeout(() => {
            subject.next(JSON.parse(data));
        }, timeout);

        let t = {
            query: (params: any = undefined): Observable<TA> => {
                subject = new Subject<TA>();
                return subject.asObservable();
            },

            get: (id: any): Observable<T> => {
                subject = new Subject<T>();
                return subject.asObservable();
            },

            save: (item: T): Observable<T> => {
                subject = new Subject<T>();
                return subject.asObservable();;
            },

            update: (id: any, itemToUpdate: T): Observable<T> => {
                subject = new Subject<T>();
                return subject.asObservable();
            },

            remove: (id: any): Observable<T> => {
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

