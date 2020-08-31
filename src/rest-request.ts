declare var require: any;

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/take';

import * as _ from 'lodash';

import { Models } from './models';
import { RestHeaders } from './rest-headers';

import { Helpers, Level } from 'ng2-logger';
import axios, { AxiosResponse } from 'axios';
import { Resource } from './resource.service';
import { Log, Logger } from 'ng2-logger';
import { isUndefined } from 'util';
import { RequestCache } from './request-cache';
const log = Log.create('rest-resource', Level.__NOTHING)

const jobIDkey = 'jobID'

//#region mock request
//#endregion



export class RestRequest {

  public static zone;
  private static jobId = 0;
  private subjectInuUse: { [id: number]: Subject<any> } = {};
  private meta: { [id: number]: Models.MetaRequest } = {};

  private handlerResult(options: Models.HandleResultOptions,
    sourceRequest: Models.HandleResultSourceRequestOptions) {
    if (isUndefined(options)) {
      options = {} as any;
    }
    console.log(`[ng2-rest] ${sourceRequest.url}`)
    const { res, jobid, isArray, method } = options;
    if (typeof res !== 'object') throw new Error('[ng2-rest] No resposnse for request. ')

    if (Helpers.isBrowser) {
      res.headers = RestHeaders.from(res.headers);
    }

    // error no internet
    if (res.error) {
      this.subjectInuUse[jobid].error(new Models.HttpResponseError(res.error, res.data, res.headers, res.code))
      return;
    }
    const entity = this.meta[jobid].entity;
    const circular = this.meta[jobid].circular

    // normal request case
    this.subjectInuUse[jobid].next(
      new Models.HttpResponse(sourceRequest, res.data, res.headers, res.code, entity, circular, isArray)
    )
    return;
  }
  checkCache(sourceRequest: Models.HandleResultSourceRequestOptions, jobid: number) {
    const existedInCache = RequestCache.findBy(sourceRequest);
    if (existedInCache) {
      log.i('cache exists', existedInCache)
      this.subjectInuUse[jobid].next(existedInCache);
      return true;
    }
    log.i('cache not exists', existedInCache)
    return false;
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
    if (this.checkCache({
      url,
      body,
      isArray,
      method
    }, jobid)) {
      return;
    }

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
        // console.log(`[ng2-rest] ${method} request to:  ${url}`)
        response = await axios({
          url,
          method,
          data: body,
          responseType: 'text',
          headers: headers.toJSON()
        })
      }

      this.handlerResult({
        res: {
          code: response.status as any,
          data: JSON.stringify(response.data),
          isArray,
          jobid,
          headers: RestHeaders.from(response.headers)
        },
        method,
        jobid,
        isArray
      }, {
        url,
        body,
        method,
        isArray,
      });
    } catch (catchedError) {
      // console.log('ERROR RESPONESE catchedError typeof ', typeof catchedError)
      // console.log('ERROR RESPONESE catchedError', catchedError)
      if (typeof catchedError === 'object' && catchedError.response && catchedError.response.data) {
        const err = catchedError.response.data;
        const msg: string = catchedError.response.data.message || '';
        let stack: string[] = (err.stack || '').split('\n');

        (Resource['_listenErrors'] as Subject<Models.BackendError>).next({
          msg,
          stack,
          data: catchedError.response.data
        });

      }
      const error = (catchedError && catchedError.response) ? `[${catchedError.response.statusText}]: ` : '';
      this.handlerResult({
        res: {
          code: (catchedError && catchedError.response) ? catchedError.response.status as any : undefined,
          error: `${error}${catchedError.message}`,
          data: (catchedError && catchedError.response) ? JSON.stringify(catchedError.response.data) : undefined,
          isArray,
          jobid,
          headers: RestHeaders.from(catchedError && catchedError.response && catchedError.response.headers)
        },
        method,
        jobid,
        isArray
      }, {
        url,
        body,
        isArray,
        method
      });
    }
  }

  private getSubject(method: Models.HttpMethod, meta: Models.MetaRequest): Models.ReplayData {
    if (_.isUndefined(this.replaySubjects[meta.endpoint])) {
      log.i(`[getSubject][recreate] (${meta.endpoint}) `);
      this.replaySubjects[meta.endpoint] = {};
    }
    if (_.isUndefined(this.replaySubjects[meta.endpoint][meta.path])) {
      log.i(`[getSubject][recreate] (${meta.endpoint})(${meta.path}) `);
      this.replaySubjects[meta.endpoint][meta.path] = {};
    }

    if (_.isUndefined(this.replaySubjects[meta.endpoint][meta.path][method])) {
      log.i(`[getSubject][recreate] (${meta.endpoint})(${meta.path})(${method}) `);
      this.replaySubjects[meta.endpoint][meta.path][method] = <Models.ReplayData>{
        subject: new Subject(),
        data: undefined,
      };
    }
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
    resp.observable = replay.subject.asObservable();
    resp.cache = RequestCache.findBy({
      body,
      isArray,
      method,
      url
    });
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
    const jobid = replay.id;
    const method = 'jsonp'
    setTimeout(() => {
      if (url.endsWith('/')) url = url.slice(0, url.length - 1)
      let num = Math.round(10000 * Math.random());
      let callbackMethodName = "cb_" + num;
      window[callbackMethodName] = (data) => {
        if (this.checkCache({
          url,
          body,
          isArray,
          method
        }, jobid)) {
          return;
        }
        this.handlerResult({
          res: {
            data, isArray
          },
          method,
          jobid,
          isArray
        }, {
          url,
          body,
          isArray,
          method,
        })
      }
      let sc = document.createElement('script');
      sc.src = `${url}?callback=${callbackMethodName}`;
      document.body.appendChild(sc);
      document.body.removeChild(sc);
    })
    // return replay.subject.asObservable();
    const resp: Models.PromiseObservableMix<any> = replay.subject.asObservable().take(1).toPromise() as any;
    resp.observable = replay.subject.asObservable();
    resp.cache = RequestCache.findBy({
      body,
      isArray,
      method,
      url
    })
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
