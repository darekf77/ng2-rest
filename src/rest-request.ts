declare var require: any;

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';

import {
    HttpMethod, HttpCode, HttpResponse, HttpResponseError,
    MockRequest, MockResponse, ReqParams, ReplayData
} from "./models";
import { RestHeaders } from "./rest-headers";
import { Mapping, encode } from './mapping';
import { MetaRequest } from "./models";
import { isBrowser, isNode } from "ng2-logger";

const jobIDkey = 'jobID'

if (isNode) {
    var URL = require('url');
    var axios = require('axios');
}

//#region mock request
//#endregion

export class RestRequest {

    public static zone;

    private static jobId = 0;
    private subjectInuUse: { [id: number]: Subject<any> } = {};
    private meta: { [id: number]: MetaRequest } = {};

    private workerActive = false;

    constructor() {

        if (typeof (Worker) !== "undefined" && isBrowser) {
            this.workerActive = true;
            this.createWorker();
        }
    }

    private static blobURL = (isBrowser ? window.URL.createObjectURL(new Blob(['(',

        function () {

            //#region headers
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

            //#endregion

            var firstTime = true;

            function request(url: string, method: HttpMethod, headers?: RestHeaders, body?: any, jobid?: number, isArray = false): MockResponse {
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
                    // console.log(client.getAllResponseHeaders())
                    var h = eval('RestHeaders.fromResponseHeaderString(client.getAllResponseHeaders())');
                    return {
                        data: client.responseText,
                        code: <HttpCode>client.status,
                        headers: h,
                        jobid,
                        isArray
                    };
                } catch (error) {
                    return {
                        data: client.responseText,
                        error: typeof error === 'object' ? JSON.stringify(error) : error,
                        jobid,
                        isArray
                    };
                }


            }

            self.addEventListener('message', (e) => {
                let data: ReqParams = e.data;
                if (data) {
                    // let res = request(data.url, data.method, eval('new RestHeaders(data.headers)') , data.body);
                    let res = request(data.url, data.method, data.headers as any, data.body, data.jobid, data.isArray);
                    res['method'] = data.method;
                    self.postMessage(res, undefined)
                }

            }, false);


        }.toString(),

        ')()'], { type: 'application/javascript' })) : undefined);

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
            window.URL.revokeObjectURL(RestRequest.blobURL);
        }
        this.worker = RestRequest._worker;

        let tmp = this;

        this.worker.addEventListener('message', (e) => {

            // console.log('inside zone!',RestRequest.zone)
            if (RestRequest.zone) {
                RestRequest.zone.run(() => {
                    if (e && e.data) tmp.handlerResult(e.data, e.data['method'], e.data.jobid, e.data.isArray);
                })
            } else {
                if (e && e.data) tmp.handlerResult(e.data, e.data['method'], e.data.jobid, e.data.isArray);
            }

        }, false);

    }

    private handlerResult(res: MockResponse, method: HttpMethod, jobid?: number, isArray?: boolean) {
        if (isBrowser) {
            res.headers = new RestHeaders(res.headers, true);
        } 

        // error no internet
        if (res && res.error) {
            this.subjectInuUse[jobid].error(new HttpResponseError(res.error, undefined, res.code))
            return;
        }
        const entity = this.meta[jobid].entity;

        // jsonp - no http code case
        if (res && !res.code) {
            this.subjectInuUse[jobid].next(
                new HttpResponse(res.data, res.headers, res.code, entity, isArray)
            )
            return;
        }

        // normal request case
        if (res && res.code >= 200 && res.code < 300 && !res.error) {
            this.subjectInuUse[jobid].next(
                new HttpResponse(res.data, res.headers, res.code, entity, isArray)
            )
            return;
        }

        // normal error
        this.subjectInuUse[jobid].error(new HttpResponseError(res.data, res.headers, res.code))
    }


    private async req(url: string, method: HttpMethod, headers?: RestHeaders, body?: any, jobid?: number, isArray = false) {
        if (isBrowser) {
            if (this.workerActive) {
                this.worker.postMessage({ url, method, headers, body, jobid, isArray });
            } else {
                let res = this.request(url, method, headers, body);
                this.handlerResult(res, method, jobid, isArray);
            }
        }
        if (isNode) {
            try {
                const response = await axios({
                    url,
                    method,
                    data: body,
                    responseType: 'text',
                    headers: headers.toJSON()
                })
                this.handlerResult({
                    code: response.status as any,
                    data: JSON.stringify(response.data),
                    isArray,
                    jobid,
                    headers: new RestHeaders(response.headers)
                }, method, jobid, isArray);
            } catch (error) {
                this.handlerResult({
                    code: error.status as any,
                    error: error.message,
                    isArray,
                    jobid,
                    headers: new RestHeaders(error.headers)
                }, method, jobid, isArray);
            }
        }

    }

    private request(url: string, method: HttpMethod, headers?: RestHeaders, body?: any, isArray = false): MockResponse {
        var representationOfDesiredState = body;
        var client = new XMLHttpRequest();

        client.addEventListener
        client.open(method, url, false);
        client.send(representationOfDesiredState);

        return {
            data: client.responseText,
            error: client.statusText,
            code: <HttpCode>client.status,
            headers: RestHeaders.fromResponseHeaderString(client.getAllResponseHeaders()),
            isArray
        };

    }


    private getSubject(method: HttpMethod, meta: MetaRequest): ReplayData {
        if (!this.replaySubjects[meta.endpoint]) this.replaySubjects[meta.endpoint] = {};
        if (!this.replaySubjects[meta.endpoint][meta.path]) this.replaySubjects[meta.endpoint][meta.path] = {};
        if (!this.replaySubjects[meta.endpoint][meta.path][method]) {
            this.replaySubjects[meta.endpoint][meta.path][method] = <ReplayData>{
                subject: new Subject(),
                data: undefined,
            };
        }
        const replay: ReplayData = this.replaySubjects[meta.endpoint][meta.path][method];

        const id: number = RestRequest.jobId++;
        replay.id = id;

        const subject: Subject<any> = replay.subject;
        subject[jobIDkey] = id;

        this.meta[id] = meta;
        this.subjectInuUse[id] = subject;
        return replay;
    }


    //#region http methods

    private metaReq(method: HttpMethod, url: string, body: string, headers: RestHeaders, meta: MetaRequest, isArray: boolean): Observable<any> {
        const replay: ReplayData = this.getSubject(method, meta);
        replay.data = { url, body, headers, isArray };
        setTimeout(() => this.req(url, method, headers, body, replay.id, isArray))
        if (method.toLowerCase() === 'GET'.toLowerCase() && isBrowser) {
            return replay.subject.asObservable();
        }
        return replay.subject.asObservable().take(1).toPromise() as any;
    }

    get(url: string, body: string, headers: RestHeaders, meta: MetaRequest, isArray: boolean): Observable<any> {
        return this.metaReq('GET', url, body, headers, meta, isArray);
    }

    delete(url: string, body: string, headers: RestHeaders, meta: MetaRequest, isArray: boolean): Observable<any> {
        return this.metaReq('DELETE', url, body, headers, meta, isArray);
    }

    post(url: string, body: string, headers: RestHeaders, meta: MetaRequest, isArray: boolean): Observable<any> {
        return this.metaReq('POST', url, body, headers, meta, isArray);
    }

    put(url: string, body: string, headers: RestHeaders, meta: MetaRequest, isArray: boolean): Observable<any> {
        return this.metaReq('PUT', url, body, headers, meta, isArray);
    }

    jsonp(url: string, body: string, headers: RestHeaders, meta: MetaRequest, isArray: boolean): Observable<any> {
        const replay: ReplayData = this.getSubject('JSONP', meta);
        setTimeout(() => {
            if (url.endsWith('/')) url = url.slice(0, url.length - 1)
            let num = Math.round(10000 * Math.random());
            let callbackMethodName = "cb_" + num;
            window[callbackMethodName] = (data) => {
                this.handlerResult({
                    data, isArray
                }, 'JSONP', replay.id, isArray)
            }
            let sc = document.createElement('script');
            sc.src = `${url}?callback=${callbackMethodName}`;
            document.body.appendChild(sc);
            document.body.removeChild(sc);
        })
        return replay.subject.asObservable();
    }
    //#endregion
    private replaySubjects = {};
    public replay(method: HttpMethod, meta: MetaRequest) {
        const replay: ReplayData = this.getSubject(method, meta);
        if (!replay.data) {
            console.warn(`Canno replay first ${method} request from ${meta.endpoint}/${meta.path}`);
            return;
        };
        if (replay && replay.subject && Array.isArray(replay.subject.observers) &&
            replay.subject.observers.length == 0) {
            console.warn(`No observators for ${method} request from ${meta.endpoint}/${meta.path}`);
            return;
        }
        const url = replay.data.url;
        const headers = replay.data.headers;
        const body = replay.data.body;
        const isArray = replay.data.isArray;
        setTimeout(() => this.req(url, method, headers, body, replay.id, isArray))
    }

}
