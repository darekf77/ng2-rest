declare var require: any;

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/take';

import { _ } from 'tnp-core';

import { Models } from './models';
import { RestHeaders } from './rest-headers';

import { Helpers, Level } from 'ng2-logger';
import axios, { AxiosResponse } from 'axios';
import { Resource } from './resource.service';
import { Log, Logger } from 'ng2-logger';
import { isUndefined } from 'util';
import { RequestCache } from './request-cache';
const log = Log.create('[ng2-rest] rest-request'
  , Level.__NOTHING
)

const jobIDkey = 'jobID';
declare const global: any;


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
    // log.d(`HANDLE RESULT (jobid:${options.jobid}) ${sourceRequest.url}`);
    const { res, jobid, isArray, method } = options;
    // if (this.endedJobs[jobid]) {
    //   debugger
    // }
    // this.endedJobs[jobid] = true;
    // log.i(`handle jobid ${jobid}`)
    if (typeof res !== 'object') {
      throw new Error('No resposnse for request. ');
    }

    if (Helpers.isBrowser) {
      res.headers = RestHeaders.from(res.headers);
    }

    // error no internet
    if (res.error) {
      this.subjectInuUse[jobid].error(new Models.HttpResponseError(res.error, res.data, res.headers, res.code, jobid));
      return;
    }
    const entity = this.meta[jobid].entity;
    const circular = this.meta[jobid].circular;

    this.subjectInuUse[jobid].next(
      new Models.HttpResponse(sourceRequest, res.data, res.headers, res.code, entity, circular, jobid, isArray)
    );
    this.meta[jobid] = void 0;
    return;
  }
  checkCache(sourceRequest: Models.HandleResultSourceRequestOptions, jobid: number) {
    const existedInCache = RequestCache.findBy(sourceRequest);
    if (existedInCache) {
      log.i('cache exists', existedInCache)
      this.subjectInuUse[jobid].next(existedInCache);
      return true;
    }
    // log.i(`cache not exists for jobid ${jobid}`)
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
        log.d(`[${method}] (jobid=${jobid}) request to:  ${url}`)
        response = await axios({
          url,
          method,
          data: body,
          responseType: 'text',
          headers: headers.toJSON()
        })
        // log.d(`after response of jobid: ${jobid}`);
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
          code: (catchedError && catchedError.response) ? catchedError.response.status as any : void 0,
          error: `${error}${catchedError.message}`,
          data: (catchedError && catchedError.response) ? JSON.stringify(catchedError.response.data) : void 0,
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

  private getReplay(method: Models.HttpMethod, meta: Models.MetaRequest, onlyGetLastReplayForMethod: boolean): Models.ReplayData {
    let replay: Models.ReplayData;

    //#region prevent empty tree
    if (_.isUndefined(this.replaySubjects[meta.endpoint])) {
      // log.i(`(${meta.endpoint}) `);
      this.replaySubjects[meta.endpoint] = {};
    }
    if (_.isUndefined(this.replaySubjects[meta.endpoint][meta.path])) {
      // log.i(`(${meta.endpoint})(${meta.path}) `);
      this.replaySubjects[meta.endpoint][meta.path] = {};
    }
    if (_.isUndefined(this.replaySubjects[meta.endpoint][meta.path][method])) {
      // log.i(`(${meta.endpoint})(${meta.path}) `);
      this.replaySubjects[meta.endpoint][meta.path][method] = {};
    }
    //#endregion

    const objectIDToCreateOrLast = (Object.keys(this.replaySubjects[meta.endpoint][meta.path][method] as Object).length) +
      (onlyGetLastReplayForMethod ? 0 : 1);
    if (onlyGetLastReplayForMethod && (objectIDToCreateOrLast === 0)) {
      return replay;
    }

    if (_.isUndefined(this.replaySubjects[meta.endpoint][meta.path][method][objectIDToCreateOrLast])) {
      // log.i(`(${meta.endpoint})(${meta.path})(${method}) `);
      this.replaySubjects[meta.endpoint][meta.path][method][objectIDToCreateOrLast] = <Models.ReplayData>{
        subject: new Subject(),
        data: void 0,
      };
    }

    replay = this.replaySubjects[meta.endpoint][meta.path][method][objectIDToCreateOrLast];

    if (!_.isNumber(replay.id)) {
      const jobid: number = RestRequest.jobId++;
      replay.id = jobid;
      const subject: Subject<any> = replay.subject;
      subject[jobIDkey] = jobid; // modify internal rxjs subject obj

      this.meta[jobid] = meta;
      this.subjectInuUse[jobid] = subject;

      //#region DISPOSE  @UNCOMMENT AFTER TESTS
      // if (objectIDToCreateOrLast > 2) {
      //   const oldReq: Models.ReplayData = this.replaySubjects[meta.endpoint][meta.path][method][(objectIDToCreateOrLast - 2)];
      //   if (_.isUndefined(this.meta[oldReq.id])) {
      //     // cant delete this - for counter purpose
      //     this.replaySubjects[meta.endpoint][meta.path][method][(objectIDToCreateOrLast - 2)] = {};
      //     delete this.subjectInuUse[oldReq.id];
      //     delete this.meta[oldReq.id];
      //   }
      // }
      //#endregion
    }

    return replay;
  }


  //#region http methods

  private generalReq(
    method: Models.HttpMethod,
    url: string,
    body: string,
    headers: RestHeaders,
    meta: Models.MetaRequest,
    isArray: boolean,
    mockHttp: Models.MockHttp): Models.PromiseObservableMix<any> {

    const replay: Models.ReplayData = this.getReplay(method, meta, false);
    replay.data = { url, body, headers, isArray };

    ((pthis, purl, pmethod, pheaders, pbody, pid, pisArray, pmockHttp) => {
      // log.d(`for ${purl} jobid ${pid}`);
      setTimeout(() => pthis.req(purl, pmethod, pheaders, pbody, pid, pisArray, pmockHttp));
    })(this, url, method, headers, body, replay.id, isArray, mockHttp)

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
    return this.generalReq('get', url, body, headers, meta, isArray, mockHttp);
  }

  head(
    url: string,
    body: string,
    headers: RestHeaders,
    meta: Models.MetaRequest,
    isArray: boolean, mockHttp: Models.MockHttp
  ): Models.PromiseObservableMix<any> {
    return this.generalReq('head', url, body, headers, meta, isArray, mockHttp);
  }

  delete(
    url: string,
    body: string,
    headers: RestHeaders,
    meta: Models.MetaRequest,
    isArray: boolean,
    mockHttp: Models.MockHttp): Models.PromiseObservableMix<any> {
    return this.generalReq('delete', url, body, headers, meta, isArray, mockHttp);
  }

  post(
    url: string,
    body: string,
    headers: RestHeaders,
    meta: Models.MetaRequest,
    isArray: boolean,
    mockHttp: Models.MockHttp
  ): Models.PromiseObservableMix<any> {
    return this.generalReq('post', url, body, headers, meta, isArray, mockHttp);
  }

  put(
    url: string,
    body: string,
    headers: RestHeaders,
    meta: Models.MetaRequest,
    isArray: boolean,
    mockHttp: Models.MockHttp
  ): Models.PromiseObservableMix<any> {
    return this.generalReq('put', url, body, headers, meta, isArray, mockHttp);
  }

  patch(
    url: string,
    body: string,
    headers: RestHeaders,
    meta: Models.MetaRequest,
    isArray: boolean,
    mockHttp: Models.MockHttp
  ): Models.PromiseObservableMix<any> {
    return this.generalReq('patch', url, body, headers, meta, isArray, mockHttp);
  }

  jsonp(
    url: string,
    body: string,
    headers: RestHeaders,
    meta: Models.MetaRequest,
    isArray: boolean,
    mockHttp: Models.MockHttp
  ): Models.PromiseObservableMix<any> {

    const replay: Models.ReplayData = this.getReplay('jsonp', meta, false);
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
    const replay: Models.ReplayData = this.getReplay(method, meta, true);
    if (!replay || !replay.data) {
      console.warn(`Canno replay first ${method} request from ${meta.endpoint}/${meta.path}`);
      return;
    };
    if (replay && replay.subject && Array.isArray(replay.subject.observers) &&
      replay.subject.observers.length === 0) {
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
