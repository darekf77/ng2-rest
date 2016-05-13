import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';

import { Rest } from './rest.class';
import { ENDPOINTS } from './endpoints.enum';


export class Resource {

    endpoints = {};
    constructor( @Inject(Http) private http: Http) {

        this.endpoints[ENDPOINTS.API] = {
            url: 'http://localhost:3002/api/',
            models: {}
        };

    }

    add<T>(endpoint: ENDPOINTS, model: string) {
        this.endpoints[ENDPOINTS.API].models[model] =
            new Rest<T>(this.endpoints[ENDPOINTS.API].url + model, this.http);
    }

    api(endpoint: ENDPOINTS, model: string): Rest<any> {
        return this.endpoints[endpoint].models[model];
    }



}
