declare var require: any;

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/take';

import { Models } from "./models";
import { RestHeaders } from "./rest-headers";

import { Helpers } from "ng2-logger";
import axios, { AxiosResponse } from 'axios';

const jobIDkey = 'jobID'

//#region mock request
//#endregion

export class RestRequest {

  public static zone;
  private static jobId = 0;
  private subjectInuUse: { [id: number]: Subject<any> } = {};
  private meta: { [id: number]: Models.MetaRequest } = {};

  private handlerResult(res: Models.MockResponse, method: Models.HttpMethod, jobid?: number, isArray?: boolean) {
    if (typeof res !== 'object') throw new Error('[ng2-rest] No resposnse for request. ')

    if (Helpers.isBrowser) {
      res.headers = new RestHeaders(res.headers, true);
    }

    // error no internet
    if (res.error) {
      this.subjectInuUse[jobid].error(new Models.HttpResponseError(res.error, res.data, res.headers, res.code))
      return;
    }
    const entity = this.meta[jobid].entity;

    // normal request case
    this.subjectInuUse[jobid].next(
      new Models.HttpResponse(res.data, res.headers, res.code, entity, isArray)
    )
    return;
  }


  private async req(
    url: string,
    method: Models.HttpMethod,
    headers?: RestHeaders,
    body?: any,
    jobid?: number,
    isArray = false,
    mockHttp?: Models.MockHttp
  ) {
    var response: AxiosResponse<any>;
    if (mockHttp) {

      if (typeof mockHttp === 'object') {
        response = {
          data: mockHttp.data,
          status: mockHttp.code,
          headers: mockHttp.headers,
          statusText: mockHttp.error,
          config: {}
        }
      } else if (typeof mockHttp === 'function') {
        const r = mockHttp(url, method, headers, body);
        response = {
          data: r.data,
          status: r.code,
          headers: r.headers,
          statusText: r.error,
          config: {}
        }
      }
    }

    try {
      if (!response) {
        response = await axios({
          url,
          method,
          data: body,
          responseType: 'text',
          headers: headers.toJSON()
        })
      }

      this.handlerResult({
        code: response.status as any,
        data: JSON.stringify(response.data),
        isArray,
        jobid,
        headers: (response.headers instanceof RestHeaders) ? response.headers : new RestHeaders(response.headers)
      }, method, jobid, isArray);
    } catch (e) {
      const error = (e && e.response) ? `[${e.response.statusText}]: ` : '';

      this.handlerResult({
        code: (e && e.response) ? e.response.status as any : undefined,
        error: `${error}${e.message}`,
        data: (e && e.response) ? JSON.stringify(e.response.data) : undefined,
        isArray,
        jobid,
        headers: (e && e.response) ?
          ((response.headers instanceof RestHeaders) ? e.response.headers : new RestHeaders(e.response.headers))
          : undefined
      }, method, jobid, isArray);
    }
  }

  private getSubject(method: Models.HttpMethod, meta: Models.MetaRequest): Models.ReplayData {
    // if (!this.replaySubjects[meta.endpoint])
    this.replaySubjects[meta.endpoint] = {};
    // if (!this.replaySubjects[meta.endpoint][meta.path])
    this.replaySubjects[meta.endpoint][meta.path] = {};
    // if (!this.replaySubjects[meta.endpoint][meta.path][method]) {
    this.replaySubjects[meta.endpoint][meta.path][method] = <Models.ReplayData>{
      subject: new Subject(),
      data: undefined,
    };
    // }
    const replay: Models.ReplayData = this.replaySubjects[meta.endpoint][meta.path][method];

    const id: number = RestRequest.jobId++;
    replay.id = id;

    const subject: Subject<any> = replay.subject;
    subject[jobIDkey] = id;

    this.meta[id] = meta;
    this.subjectInuUse[id] = subject;
    return replay;
  }


  //#region http methods

  private metaReq(
    method: Models.HttpMethod,
    url: string,
    body: string,
    headers: RestHeaders,
    meta: Models.MetaRequest,
    isArray: boolean,
    mockHttp: Models.MockHttp): Models.PromiseObservableMix<any> {

    const replay: Models.ReplayData = this.getSubject(method, meta);
    replay.data = { url, body, headers, isArray };
    setTimeout(() => this.req(url, method, headers, body, replay.id, isArray, mockHttp))
    const resp: Models.PromiseObservableMix<any> = replay.subject.asObservable().take(1).toPromise() as any;
    resp.observable = replay.subject.asObservable()
    return resp;
  }

  get(
    url: string,
    body: string,
    headers: RestHeaders,
    meta: Models.MetaRequest,
    isArray: boolean, mockHttp: Models.MockHttp
  ): Models.PromiseObservableMix<any> {
    return this.metaReq('get', url, body, headers, meta, isArray, mockHttp);
  }

  head(
    url: string,
    body: string,
    headers: RestHeaders,
    meta: Models.MetaRequest,
    isArray: boolean, mockHttp: Models.MockHttp
  ): Models.PromiseObservableMix<any> {
    return this.metaReq('head', url, body, headers, meta, isArray, mockHttp);
  }

  delete(
    url: string,
    body: string,
    headers: RestHeaders,
    meta: Models.MetaRequest,
    isArray: boolean,
    mockHttp: Models.MockHttp): Models.PromiseObservableMix<any> {
    return this.metaReq('delete', url, body, headers, meta, isArray, mockHttp);
  }

  post(
    url: string,
    body: string,
    headers: RestHeaders,
    meta: Models.MetaRequest,
    isArray: boolean,
    mockHttp: Models.MockHttp
  ): Models.PromiseObservableMix<any> {
    return this.metaReq('post', url, body, headers, meta, isArray, mockHttp);
  }

  put(
    url: string,
    body: string,
    headers: RestHeaders,
    meta: Models.MetaRequest,
    isArray: boolean,
    mockHttp: Models.MockHttp
  ): Models.PromiseObservableMix<any> {
    return this.metaReq('put', url, body, headers, meta, isArray, mockHttp);
  }

  patch(
    url: string,
    body: string,
    headers: RestHeaders,
    meta: Models.MetaRequest,
    isArray: boolean,
    mockHttp: Models.MockHttp
  ): Models.PromiseObservableMix<any> {
    return this.metaReq('patch', url, body, headers, meta, isArray, mockHttp);
  }

  jsonp(
    url: string,
    body: string,
    headers: RestHeaders,
    meta: Models.MetaRequest,
    isArray: boolean,
    mockHttp: Models.MockHttp
  ): Models.PromiseObservableMix<any> {

    const replay: Models.ReplayData = this.getSubject('jsonp', meta);
    setTimeout(() => {
      if (url.endsWith('/')) url = url.slice(0, url.length - 1)
      let num = Math.round(10000 * Math.random());
      let callbackMethodName = "cb_" + num;
      window[callbackMethodName] = (data) => {
        this.handlerResult({
          data, isArray
        }, 'jsonp', replay.id, isArray)
      }
      let sc = document.createElement('script');
      sc.src = `${url}?callback=${callbackMethodName}`;
      document.body.appendChild(sc);
      document.body.removeChild(sc);
    })
    // return replay.subject.asObservable();
    const resp: Models.PromiseObservableMix<any> = replay.subject.asObservable().take(1).toPromise() as any;
    resp.observable = replay.subject.asObservable()
    return resp;
  }
  //#endregion
  private replaySubjects = {};
  public replay(method: Models.HttpMethod, meta: Models.MetaRequest) {
    const replay: Models.ReplayData = this.getSubject(method, meta);
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
