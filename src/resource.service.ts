import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';

import { Rest } from './rest.class';

@Injectable()
export class Resource<E, T, TA> {

    public static reset() {
        Resource.endpoints = {};
    }

    private static endpoints = {};
    constructor( @Inject(Http) private http: Http) {

    }

    public static map(endpoint: string, url: string): boolean {
        let regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
        let e = endpoint;
        if (!regex.test(url)) {
            console.error('Url address is not correct: ' + url);
            return false;
        }
        if (url.charAt(url.length - 1) === '/') url = url.slice(0, url.length - 2);
        if (Resource.endpoints[e] !== undefined) {
            console.warn('Cannot use map function at the same API endpoint again (' 
            + Resource.endpoints[e].url + ')');
            return false;
        }
        Resource.endpoints[e] = {
            url: url,
            models: {}
        };
        return true;
    }

    add(endpoint: E, model: string): boolean {
        if (model.charAt(0) === '/') model = model.slice(1, model.length - 1);
        let e = <string>(endpoint).toString();
        if (Resource.endpoints[e] === undefined) {
            console.error('Endpoint is not mapped ! Cannot add model ' + model);
            return false;
        }
        if (Resource.endpoints[e].models[model] !== undefined) {
            console.warn(`Model '${model}' is already defined in endpoint: `
                + Resource.endpoints[e].url);
            return false;
        }
        Resource.endpoints[e].models[model] =
            new Rest<T, TA>(Resource.endpoints[e].url
                + '/' + model, this.http);
        return true;
    }

    api(endpoint: E, model: string): Rest<T, TA> {
        if (model.charAt(0) === '/') model = model.slice(1, model.length - 1);
        let e = <string>(endpoint).toString();
        if (Resource.endpoints[e] === undefined) {
            console.error('Endpoint is not mapped ! Cannot add model ' + model);
            return;
        }
        if (Resource.endpoints[e].models[model] === undefined) {
            console.error(`Model '${model}' is undefined in endpoint: ${Resource.endpoints[e].url} `);
            return;
        }
        return Resource.endpoints[<string>(endpoint).toString()].models[model];
    }

}
