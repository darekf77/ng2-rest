import * as JSON5 from 'json5';

import { Observable, Subject } from 'rxjs';
import { Http } from "./http";
import { MockResponse } from './mock-backend';


interface RHeader {
    values: string[];
}

export class RestHeaders {

    private headers: RHeader[];
    constructor() {

    }

    append(key: string, value: string) {

    }

    toJSON(): Object {
        return undefined;
    }

}


type ReqParams = { url: string, method: Http.HttpMethod, headers?: RestHeaders, body?: any };


export class RestRequest {

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

    private worker: Worker;
    private createWorker() {
        // Build a worker from an anonymous function body
        var blobURL = URL.createObjectURL(new Blob(['(',

            function () {

                function request(url: string, method: Http.HttpMethod, headers?: RestHeaders, body?: any): MockResponse {
                    var representationOfDesiredState = body;
                    var client = new XMLHttpRequest();

                    client.addEventListener
                    client.open(method, url, false);
                    client.setRequestHeader("Content-Type", "application/json");
                    client.setRequestHeader("Accept", "application/json");

                    client.send(representationOfDesiredState);

                    return {
                        data: client.responseText,
                        error: client.statusText,
                        code: <Http.HttpCode>client.status
                    };

                }

                // self.postMessage("I\'m working before postMessage(\'ali\').");

                self.addEventListener('message', function (e) {
                    let data: ReqParams = e.data;
                    if (data) {
                        let res = request(data.url, data.method, data.headers, data.body);
                        res['method'] = data.method;
                        self.postMessage(res, undefined)
                    }

                }, false);


            }.toString(),

            ')()'], { type: 'application/javascript' }));

        this.worker = new Worker(blobURL);

        // Won't be needing this anymore
        URL.revokeObjectURL(blobURL);

        let tmp = this;

        this.worker.addEventListener('message', (e) => {
            if (e && e.data) tmp.handlerResult(e.data, e.data['method']);
        }, false);

    }

    private handlerResult(res: MockResponse, method: Http.HttpMethod) {
        console.log('res', res)
        if (res && !res.code) {
            this.subjects[method].next({
                json: () => (typeof res.data === 'string') ? JSON5.parse(res.data) : res.data
            })
            return;
        }
        if (res && res.code >= 200 && res.code < 300) {
            this.subjects[method].next({
                json: () => JSON5.parse(res.data)
            })
        } else {
            this.subjects[method].error({
                error: res ? res.error : 'undefined response'
            })
        }
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
        client.setRequestHeader("Content-Type", "application/json");
        client.setRequestHeader("Accept", "application/json");

        client.send(representationOfDesiredState);

        return {
            data: client.responseText,
            error: client.statusText,
            code: <Http.HttpCode>client.status
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