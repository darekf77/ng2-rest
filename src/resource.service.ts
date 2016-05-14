import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';

import { Rest } from './rest.class';

@Injectable()
export class Resource<E> {

    endpoints = {};
    constructor( @Inject(Http) private http: Http) {

    }

    map(endpoint: E, url: string) {
        let e = <string>(endpoint).toString();
        if (this.endpoints[e] !== undefined) {
            console.warn('Cannot use map function at the same API endpoint again');
        }
        this.endpoints[e] = {
            url: url,
            models: {}
        };
    }

    add<T>(endpoint: E, model: string) {
        let e = <string>(endpoint).toString();
        if (this.endpoints[e] === undefined) {
            console.error('Endpoint is not mapped !');
        }
        if (this.endpoints[e].models[model] !== undefined) {
            console.error(`Model ${model} is already defined in endpoint`);
        }
        this.endpoints[e].models[model] =
            new Rest<T>(this.endpoints[e].url
                + '/' + model , this.http);
    }

    api(endpoint: E, model: string): Rest<any> {
        let e = <string>(endpoint).toString();
        if (this.endpoints[e] === undefined) {
            console.error('Endpoint is not mapped !');
        }
        if (this.endpoints[e].models[model] === undefined) {
            console.error(`Model ${model} is undefined in this endpoint`);
        }
        return this.endpoints[<string>(endpoint).toString()].models[model];
    }

}
