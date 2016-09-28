import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers, Jsonp } from '@angular/http';
import { MockingMode } from './mocking-mode';

import {Rest} from './rest.class';

@Injectable()
export class Resource<E, T, TA> {

    private static endpoints = {};
    public static reset() {
        Resource.endpoints = {};
        Resource.mockingModeIsSet = false;
    }

    constructor( @Inject(Http) private http: Http,
        @Inject(Jsonp) private jp: Jsonp) {

    }

    public static recreateServer() {
        if (!Rest.docServerUrl) {
            throw `Can't recreate sever without URL do docs server. Use function Resource.setUrlToDocsServer().`;
        }
        let url = Rest.docServerUrl.charAt(Rest.docServerUrl.length - 1) === '/' ?
            Rest.docServerUrl.slice(0, Rest.docServerUrl.length - 1) : Rest.docServerUrl;
        url = `${url}/api/start`;
        return this.http.get(url);
    }

    public static setUrlToDocsServer(url: string) {
        Rest.docServerUrl = url;
    }

    private static mockingModeIsSet = false;
    private static mockingMode: MockingMode = MockingMode.MIX;

    /**
     * Define source of your microsevices
     * 
     * @static
     * @param {MockingMode} mode
     * @returns
     */
    public static setMockingMode(mode: MockingMode) {

        if (Resource.mockingModeIsSet) {
            console.warn('MOCKING MODE already set for entire application');
            return;
        }
        Resource.mockingModeIsSet = true;
        Resource.mockingMode = mode;
        Rest.mockingMode = mode;
        console.log('mode is set ', mode);
    }

    /**
     * Use enpoint in your app
     * 
     * @static
     * @template T
     * @param {T} endpoint_url
     * @returns {boolean}
     */
    public static use<T extends string>(endpoint_url: T): boolean {
        let regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
        let e: string = endpoint_url;
        if (!regex.test(endpoint_url)) {
            console.error('Url address is not correct: ' + endpoint_url);
            return false;
        }
        if (Resource.endpoints[e] !== undefined) {
            console.warn('Cannot use map function at the same API endpoint again ('
                + Resource.endpoints[e].url + ')');
            return false;
        }
        Resource.endpoints[e] = {
            url: endpoint_url,
            models: {}
        };
        return true;
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

    /**
     * And enipoint to application
     * 
     * @param {E} endpoint
     * @param {string} model
     * @returns {boolean}
     */
    add(endpoint: E, model: string, group: string = 'no_group', name: string, description: string = '<< no description >>'): boolean {
        if (model.charAt(0) === '/') model = model.slice(1, model.length);
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
                + '/' + model, this.http, this.jp, description, name, group);
        return true;
    }

    /**
     * Access api throught endpoint
     * 
     * @param {E} endpoint
     * @param {string} model
     * @returns {Rest<T, TA>}
     */
    api(endpoint: E, model: string): Rest<T, TA> {
        if (model.charAt(0) === '/') model = model.slice(1, model.length);
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
