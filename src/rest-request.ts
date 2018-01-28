declare var require: any;

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';

import {
    HttpMethod, HttpCode, HttpResponse, HttpResponseError,
    MockResponse, ReqParams, ReplayData
} from "./models";
import { RestHeaders } from "./rest-headers";
import { Mapping, encode } from './mapping';
import { MetaRequest, PromiseObservableMix } from "./models";
import { isBrowser, isNode } from "ng2-logger";
import axios from 'axios';

const jobIDkey = 'jobID'

//#region mock request
//#endregion

export class RestRequest {

    public static zone;
    private static jobId = 0;
    private subjectInuUse: { [id: number]: Subject<any> } = {};
    private meta: { [id: number]: MetaRequest } = {};

    private handlerResult(res: MockResponse, method: HttpMethod, jobid?: number, isArray?: boolean) {
        if (typeof res !== 'object') throw new Error('[ng2-rest] No resposnse for request. ')

        if (isBrowser) {
            res.headers = new RestHeaders(res.headers, true);
        }

        // error no internet
        if (res.error) {
            this.subjectInuUse[jobid].error(new HttpResponseError(res.error, res.data, res.headers, res.code))
            return;
        }
        const entity = this.meta[jobid].entity;

        // normal request case
        this.subjectInuUse[jobid].next(
            new HttpResponse(res.data, res.headers, res.code, entity, isArray)
        )
        return;
    }


    private async req(url: string, method: HttpMethod, headers?: RestHeaders, body?: any, jobid?: number, isArray = false) {
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
                code: error.response.status as any,
                error: `[${error.response.statusText}]: ${error.message}`,
                data: JSON.stringify(error.response.data),
                isArray,
                jobid,
                headers: new RestHeaders(error.response.headers)
            }, method, jobid, isArray);
        }
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

    private metaReq(method: HttpMethod, url: string, body: string, headers: RestHeaders, meta: MetaRequest, isArray: boolean): PromiseObservableMix<any> {
        const replay: ReplayData = this.getSubject(method, meta);
        replay.data = { url, body, headers, isArray };
        setTimeout(() => this.req(url, method, headers, body, replay.id, isArray))
        const resp: PromiseObservableMix<any> = replay.subject.asObservable().take(1).toPromise() as any;
        resp.observable = replay.subject.asObservable()
        return resp;
    }

    get(url: string, body: string, headers: RestHeaders, meta: MetaRequest, isArray: boolean): PromiseObservableMix<any> {
        return this.metaReq('GET', url, body, headers, meta, isArray);
    }

    delete(url: string, body: string, headers: RestHeaders, meta: MetaRequest, isArray: boolean): PromiseObservableMix<any> {
        return this.metaReq('DELETE', url, body, headers, meta, isArray);
    }

    post(url: string, body: string, headers: RestHeaders, meta: MetaRequest, isArray: boolean): PromiseObservableMix<any> {
        return this.metaReq('POST', url, body, headers, meta, isArray);
    }

    put(url: string, body: string, headers: RestHeaders, meta: MetaRequest, isArray: boolean): PromiseObservableMix<any> {
        return this.metaReq('PUT', url, body, headers, meta, isArray);
    }

    jsonp(url: string, body: string, headers: RestHeaders, meta: MetaRequest, isArray: boolean): PromiseObservableMix<any> {
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
        // return replay.subject.asObservable();
        const resp: PromiseObservableMix<any> = replay.subject.asObservable().take(1).toPromise() as any;
        resp.observable = replay.subject.asObservable()
        return resp;
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
