import { NgZone } from '@angular/core'

import * as JSON5 from 'json5';


import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';

import { Http } from "./http";
import { MockResponse } from './mock-backend';
import { RestHeaders } from "./rest-headers";


type ReqParams = { url: string, method: Http.HttpMethod, headers?: RestHeaders, body?: any };



export class RestRequest {

    public static zone: NgZone;
    private subjects = {
        'GET': new Subject(),
        'POST': new Subject(),
        'PUT': new Subject(),
        'DELETE': new Subject(),
        'JSONP': new Subject()
    }

    private workerActive = false;

    constructor() {
        if (typeof (Worker) !== "undefined") {
            this.workerActive = true;
            this.createWorker();
        }
    }

    private static blobURL = URL.createObjectURL(new Blob(['(',

        function () {
            var firstTime = true;
            
            function request(url: string, method: Http.HttpMethod, headers?: RestHeaders, body?: any): MockResponse {
                var representationOfDesiredState = body;
                var client = new XMLHttpRequest();

                client.addEventListener
                client.open(method, url, false);
                client.send(representationOfDesiredState);
                // console.log('RestHeaders', this )
                var h = eval('RestHeaders.fromResponseHeaderString(client.getAllResponseHeaders())');
                return {
                    data: client.responseText,
                    error: client.statusText,
                    code: <Http.HttpCode>client.status,
                    headers: h
                };

            }

            // self.postMessage("I\'m working before postMessage(\'ali\').");

            self.addEventListener('message', (e) => {
                if (firstTime) {
                    firstTime = false;
                    var fn = e.data
                        .replace('export { RestHeaders };', '')
                        .replace('exports.RestHeaders = RestHeaders;', '')
                        .replace('"use strict"','')
                    // console.log('e.data',fn)
                    this.eval(fn)
                    return;
                }
                let data: ReqParams = e.data;
                if (data) {
                    let res = request(data.url, data.method, data.headers, data.body);
                    res['method'] = data.method;
                    self.postMessage(res, undefined)
                }

            }, false);


        }.toString(),

        ')()'], { type: 'application/javascript' }));

    private worker: Worker;
    private static _worker: Worker;

    /**
     * Worke to handle XMLHttpRequest
     */
    private createWorker() {
        // Build a worker from an anonymous function body

        if (!RestRequest._worker) {
            RestRequest._worker = new Worker(RestRequest.blobURL);
            RestRequest._worker.postMessage(require('!raw-loader!awesome-typescript-loader!./rest-headers.ts'))
            URL.revokeObjectURL(RestRequest.blobURL);
        }
        this.worker = RestRequest._worker;

        let tmp = this;

        this.worker.addEventListener('message', (e) => {
            // console.log('inside zone!',RestRequest.zone)
            if (RestRequest.zone) {
                RestRequest.zone.run(() => {
                    if (e && e.data) tmp.handlerResult(e.data, e.data['method']);
                })
            } else {
                if (e && e.data) tmp.handlerResult(e.data, e.data['method']);
            }

        }, false);

    }

    private handlerResult(res: MockResponse, method: Http.HttpMethod) {
        if (res && !res.code) {
            this.subjects[method].next({
                json: () => (typeof res.data === 'string') ? JSON5.parse(res.data) : res.data,
                headers: new RestHeaders(res.headers)
            })
            this.subjects[method].observers.length = 0;
            return;
        }
        if (res && res.code >= 200 && res.code < 300) {
            this.subjects[method].next({
                json: () => JSON5.parse(res.data),
                headers: new RestHeaders(res.headers)
            })
        } else {
            this.subjects[method].error({
                error: res ? res.error : 'undefined response',
                headers: new RestHeaders(res.headers)
            })
        }
        this.subjects[method].observers.length = 0;
    }


    private req(url: string, method: Http.HttpMethod, headers?: RestHeaders, body?: any) {

        if (this.workerActive) {
            this.worker.postMessage({ url, method, headers, body });
        } else {
            let res = this.request(url, method, headers, body);
            this.handlerResult(res, method);
        }

    }

    private request(url: string, method: Http.HttpMethod, headers?: RestHeaders, body?: any): MockResponse {
        var representationOfDesiredState = body;
        var client = new XMLHttpRequest();

        client.addEventListener
        client.open(method, url, false);
        client.send(representationOfDesiredState);

        return {
            data: client.responseText,
            error: client.statusText,
            code: <Http.HttpCode>client.status,
            headers: RestHeaders.fromResponseHeaderString(client.getAllResponseHeaders())
        };

    }



    get(url: string, headers: RestHeaders): Observable<any> {
        setTimeout(() => this.req(url, 'GET', headers))
        return this.subjects['GET'].asObservable();
    }

    delete(url: string, headers: RestHeaders): Observable<any> {
        setTimeout(() => this.req(url, 'DELETE', headers))
        return this.subjects['DELETE'].asObservable();
    }

    post(url: string, body: string, headers: RestHeaders): Observable<any> {
        setTimeout(() => this.req(url, 'POST', headers, body))
        return this.subjects['POST'].asObservable();
    }

    put(url: string, body: string, headers: RestHeaders): Observable<any> {
        setTimeout(() => this.req(url, 'PUT', headers, body))
        return this.subjects['PUT'].asObservable();
    }

    jsonp(url: string): Observable<any> {
        setTimeout(() => {
            if (url.endsWith('/')) url = url.slice(0, url.length - 1)
            let num = Math.round(10000 * Math.random());
            let callbackMethodName = "cb_" + num;
            window[callbackMethodName] = (data) => {
                this.handlerResult({
                    data
                }, 'JSONP')
            }
            let sc = document.createElement('script');
            sc.src = `${url}?callback=${callbackMethodName}`;
            document.body.appendChild(sc);
            document.body.removeChild(sc);
        })
        return this.subjects['JSONP'].asObservable();
    }


}