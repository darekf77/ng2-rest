import * as JSON5 from 'json5';


import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';

import { Http } from "./http";
import { RestHeaders } from "./rest-headers";

const jobIDkey = 'jobID'

type ReqParams = { url: string, method: Http.HttpMethod, headers?: RestHeaders, body?: any, jobid: number };

//#region mock request
export interface MockRequest<T> {
    data: any;
    params: Object;
    restParams?: Object;
    body: Object;
    method: Http.HttpMethod;
}
//#endregion
//#region mock repos
export interface MockResponse {
    data?: any;
    code?: Http.HttpCode;
    error?: string;
    headers?: RestHeaders;
    jobid?: number;
}

export class RestRequest {

    public static zone;

    private static jobId = 0;
    private freeSubjects: Subject<any>[] = [];
    private subjectInuUse: { [id: number]: Subject<any> } = {};

    private workerActive = false;

    constructor() {

        if (typeof (Worker) !== "undefined") {
            this.workerActive = true;
            this.createWorker();
        }
    }

    private static blobURL = URL.createObjectURL(new Blob(['(',

        function () {


            // TODO how to put in worker code from rest-headers
            class RestHeaders {
                /** @internal header names are lower case */
                _headers: Map<string, string[]> = new Map();
                /** @internal map lower case names to actual names */
                _normalizedNames: Map<string, string> = new Map();

                // TODO(vicb): any -> string|string[]
                constructor(headers?: RestHeaders | { [name: string]: any }) {
                    if (!headers) {
                        return;
                    }

                    if (headers instanceof RestHeaders) {
                        headers.forEach((values: string[], name: string) => {
                            values.forEach(value => this.append(name, value));
                        });
                        return;
                    }

                    Object.keys(headers).forEach((name: string) => {
                        const values: string[] = Array.isArray(headers[name]) ? headers[name] : [headers[name]];
                        this.delete(name);
                        values.forEach(value => this.append(name, value));
                    });
                }

                /**
                 * Returns a new RestHeaders instance from the given DOMString of Response RestHeaders
                 */
                static fromResponseHeaderString(headersString: string): RestHeaders {
                    const headers = new RestHeaders();

                    headersString.split('\n').forEach(line => {
                        const index = line.indexOf(':');
                        if (index > 0) {
                            const name = line.slice(0, index);
                            const value = line.slice(index + 1).trim();
                            headers.set(name, value);
                        }
                    });

                    return headers;
                }

                /**
                 * Appends a header to existing list of header values for a given header name.
                 */
                append(name: string, value: string): void {
                    const values = this.getAll(name);

                    if (values === null) {
                        this.set(name, value);
                    } else {
                        values.push(value);
                    }
                }

                /**
                 * Deletes all header values for the given name.
                 */
                delete(name: string): void {
                    const lcName = name.toLowerCase();
                    this._normalizedNames.delete(lcName);
                    this._headers.delete(lcName);
                }

                forEach(fn: (values: string[], name: string, headers: Map<string, string[]>) => void): void {
                    this._headers.forEach(
                        (values, lcName) => fn(values, this._normalizedNames.get(lcName), this._headers));
                }

                /**
                 * Returns first header that matches given name.
                 */
                get(name: string): string {
                    const values = this.getAll(name);

                    if (values === null) {
                        return null;
                    }

                    return values.length > 0 ? values[0] : null;
                }

                /**
                 * Checks for existence of header by given name.
                 */
                has(name: string): boolean { return this._headers.has(name.toLowerCase()); }

                /**
                 * Returns the names of the headers
                 */
                keys(): string[] { return Array.from(this._normalizedNames.values()); }

                /**
                 * Sets or overrides header value for given name.
                 */
                set(name: string, value: string | string[]): void {
                    if (Array.isArray(value)) {
                        if (value.length) {
                            this._headers.set(name.toLowerCase(), [value.join(',')]);
                        }
                    } else {
                        this._headers.set(name.toLowerCase(), [value]);
                    }
                    this.mayBeSetNormalizedName(name);
                }

                /**
                 * Returns values of all headers.
                 */
                values(): string[][] { return Array.from(this._headers.values()); }

                /**
                 * Returns string of all headers.
                 */
                // TODO(vicb): returns {[name: string]: string[]}
                toJSON(): { [name: string]: any } {
                    const serialized: { [name: string]: string[] } = {};

                    this._headers.forEach((values: string[], name: string) => {
                        const split: string[] = [];
                        values.forEach(v => split.push(...v.split(',')));
                        serialized[this._normalizedNames.get(name)] = split;
                    });

                    return serialized;
                }

                /**
                 * Returns list of header values for a given name.
                 */
                getAll(name: string): string[] {
                    return this.has(name) ? this._headers.get(name.toLowerCase()) : null;
                }

                private mayBeSetNormalizedName(name: string): void {
                    const lcName = name.toLowerCase();

                    if (!this._normalizedNames.has(lcName)) {
                        this._normalizedNames.set(lcName, name);
                    }
                }
            }





            var firstTime = true;

            function request(url: string, method: Http.HttpMethod, headers?: RestHeaders, body?: any, jobid?: number): MockResponse {
                var representationOfDesiredState = body;
                var client = new XMLHttpRequest();
                try {
                    // console.log('RestHeaders', this )


                    client.open(method, url, false);

                    var headersMap: Map<string, string[]> = headers._headers;
                    if (headersMap) headersMap.forEach((v, k) => {
                        client.setRequestHeader(k, v.join(';'))
                    })
                    client.send(representationOfDesiredState);

                    var h = eval('RestHeaders.fromResponseHeaderString(client.getAllResponseHeaders())');
                    return {
                        data: client.responseText,
                        code: <Http.HttpCode>client.status,
                        headers: h,
                        jobid
                    };
                } catch (error) {
                    return {
                        data: client.responseText,
                        error: typeof error === 'object' ? JSON.stringify(error) : error,
                        jobid
                    };
                }


            }

            // self.postMessage("I\'m working before postMessage(\'ali\').");

            self.addEventListener('message', (e) => {
                // if (firstTime) {
                //     firstTime = false;
                //     var fn = e.data
                //         .replace('export { RestHeaders };', '')
                //         .replace('exports.RestHeaders = RestHeaders;', '')
                //         .replace('"use strict"', '')
                //     // console.log('e.data',fn)
                //     this.eval(fn)
                //     return;
                // }
                let data: ReqParams = e.data;
                if (data) {
                    // let res = request(data.url, data.method, eval('new RestHeaders(data.headers)') , data.body);
                    let res = request(data.url, data.method, data.headers as any, data.body, data.jobid);
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
            // let workerFN = require('!raw-loader!awesome-typescript-loader!./rest-headers.ts')
            // console.log('workerFN', workerFN)
            // RestRequest._worker.postMessage(workerFN)
            URL.revokeObjectURL(RestRequest.blobURL);
        }
        this.worker = RestRequest._worker;

        let tmp = this;

        this.worker.addEventListener('message', (e) => {

            // console.log('inside zone!',RestRequest.zone)
            if (RestRequest.zone) {
                RestRequest.zone.run(() => {
                    if (e && e.data) tmp.handlerResult(e.data, e.data['method'], e.data.jobid);
                })
            } else {
                if (e && e.data) tmp.handlerResult(e.data, e.data['method'], e.data.jobid);
            }

        }, false);

    }

    private handlerResult(res: MockResponse, method: Http.HttpMethod, jobid?: number) {

        // error no internet
        if (res && res.error) {
            this.subjectInuUse[jobid].error({
                error: JSON5.parse(res.error)
            })
            this.subjectInuUse[jobid].observers.length = 0;
            this.freeSubjects.push(this.subjectInuUse[jobid]);
            return;
        }

        // jsonp - no http code case
        if (res && !res.code) {
            this.subjectInuUse[jobid].next({
                json: () => (typeof res.data === 'string') ? JSON5.parse(res.data) : res.data,
                text: () => res.data,
                headers: new RestHeaders(res.headers, true)
            })
            this.subjectInuUse[jobid].observers.length = 0;
            this.freeSubjects.push(this.subjectInuUse[jobid]);
            return;
        }

        // normal request case
        if (res && res.code >= 200 && res.code < 300 && !res.error) {
            let headers = new RestHeaders(res.headers, true);
            this.subjectInuUse[jobid].next({
                json: () => JSON5.parse(res.data),
                text: () => res.data,
                headers
            })
            this.subjectInuUse[jobid].observers.length = 0;
            this.freeSubjects.push(this.subjectInuUse[jobid]);
            return;
        }

        // error bad request  
        let err = res.data;
        try {
            err = JSON5.parse(err)
        } catch (e) { }

        this.subjectInuUse[jobid].error({
            error: err
        })

        this.subjectInuUse[jobid].observers.length = 0;
        this.freeSubjects.push(this.subjectInuUse[jobid]);
    }


    private req(url: string, method: Http.HttpMethod, headers?: RestHeaders, body?: any, jobid?: number) {

        if (this.workerActive) {
            this.worker.postMessage({ url, method, headers, body, jobid });
        } else {
            let res = this.request(url, method, headers, body);
            this.handlerResult(res, method, jobid);
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


    private getSubject(): { subject: Subject<any>, id: number } {
        let id: number, subject: Subject<any>;

        // if (this.freeSubjects.length > 0) {
        //     subject = this.freeSubjects.shift();
        //     id = subject[jobIDkey];
        // } else {
        id = RestRequest.jobId++;
        subject = new Subject()
        subject[jobIDkey] = id;
        this.subjectInuUse[id] = subject;
        // }
        // console.info('id', id)
        // console.info('subject', subject)
        return { subject, id };
    }


    get(url: string, body: string, headers: RestHeaders): Observable<any> {
        let { id, subject } = this.getSubject();
        setTimeout(() => this.req(url, 'GET', headers, undefined, id))
        return subject.asObservable();
    }

    delete(url: string, body: string, headers: RestHeaders): Observable<any> {
        let { id, subject } = this.getSubject();
        setTimeout(() => this.req(url, 'DELETE', headers, undefined, id))
        return subject.asObservable();
    }

    post(url: string, body: string, headers: RestHeaders): Observable<any> {
        let { id, subject } = this.getSubject();
        setTimeout(() => this.req(url, 'POST', headers, body, id))
        return subject.asObservable();
    }

    put(url: string, body: string, headers: RestHeaders): Observable<any> {
        let { id, subject } = this.getSubject();
        setTimeout(() => this.req(url, 'PUT', headers, body, id))
        return subject.asObservable();
    }

    jsonp(url: string, body: string, headers: RestHeaders): Observable<any> {
        let { id, subject } = this.getSubject();
        setTimeout(() => {
            if (url.endsWith('/')) url = url.slice(0, url.length - 1)
            let num = Math.round(10000 * Math.random());
            let callbackMethodName = "cb_" + num;
            window[callbackMethodName] = (data) => {
                this.handlerResult({
                    data
                }, 'JSONP', id)
            }
            let sc = document.createElement('script');
            sc.src = `${url}?callback=${callbackMethodName}`;
            document.body.appendChild(sc);
            document.body.removeChild(sc);
        })
        return subject.asObservable();
    }


}
