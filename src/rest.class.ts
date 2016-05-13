import { Http, Response, Headers } from '@angular/http';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

import { ENDPOINTS } from './endpoints.enum';

export class Rest<T> {
    private model: T;
    private headers: Headers;

    constructor(private endpoint: string, private http: Http) {
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');
    }

    query = (): Observable<Response> => {
        return this.http.get(this.endpoint).map(res => res.json());
    }

    get = (id: any): Observable<Response> => {
        console.log('SIEMA FROM GET !!');
        return this.http.get(this.endpoint + id).map(res => res.json());
    }

    save = (item: T): Observable<Response> => {
        let toAdd = JSON.stringify(item);

        return this.http.post(this.endpoint, toAdd,
            { headers: this.headers }).map(res => res.json());
    }

    update = (id: any, itemToUpdate: T): Observable<Response> => {
        return this.http.put(this.endpoint + id, JSON.stringify(itemToUpdate),
            { headers: this.headers }).map(res => res.json());
    }

    remove = (id: number): Observable<Response> => {
        return this.http.delete(this.endpoint + id);
    }

}
