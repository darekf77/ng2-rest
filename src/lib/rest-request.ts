import { firstValueFrom, Observable } from 'rxjs';
import { Subject } from 'rxjs';

import { _ } from 'tnp-core/src';

import { Models } from './models';
import { RestHeaders } from './rest-headers';

import { Helpers } from 'tnp-core/src';
import { Level } from 'ng2-logger/src';
import axios, { AxiosResponse } from 'axios';
import { Resource } from './resource-service';
import { Log, Logger } from 'ng2-logger/src';

import { RequestCache } from './request-cache';
const log = Log.create('[ng2-rest] rest-request'
  , Level.__NOTHING
)

/**
 * TODO refactor this (remove jobid)
 */
const jobIDkey = 'jobID';
const customObs = 'customObs';
const cancelFn = 'cancelFn';
const isCanceled = 'isCanceled';

//#region mock request
//#endregion

export class RestRequest {

  public static zone;
  private static jobId = 0;
  private subjectInuUse: { [id: number]: Subject<any> } = {};
  private meta: { [id: number]: Models.MetaRequest } = {};


  private handlerResult(options: Models.HandleResultOptions,
    sourceRequest: Models.HandleResultSourceRequestOptions) {
    if (_.isUndefined(options)) {
      options = {} as any;
    }
    // log.d(`HANDLE RESULT (jobid:${options.jobid}) ${sourceRequest.url}`);
    const { res, jobid, isArray, method } = options;

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

    const success = (Resource['_listenSuccess'] as Subject<Models.HttpResponse<any>>)

    const reqResp = new Models.HttpResponse(sourceRequest, res.data, res.headers, res.code, entity, circular, jobid, isArray);
    success.next(reqResp);

    this.subjectInuUse[jobid].next(reqResp);
    this.meta[jobid] = void 0;
    this.subjectInuUse[jobid].complete();
  }
  checkCache(sourceRequest: Models.HandleResultSourceRequestOptions, jobid: number) {
    const existedInCache = RequestCache.findBy(sourceRequest);
    if (existedInCache) {
      // log.i('cache exists', existedInCache)
      const success = (Resource['_listenSuccess'] as Subject<Models.HttpResponse<any>>);
      success.next(existedInCache.response);
      this.subjectInuUse[jobid].next(existedInCache);
      this.subjectInuUse[jobid].complete();
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

    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    this.subjectInuUse[jobid][cancelFn] = source.cancel;

    var response: AxiosResponse<any>;
    if (mockHttp) {

      if (typeof mockHttp === 'object') {
        response = {
          data: mockHttp.data,
          status: mockHttp.code,
          headers: mockHttp.headers as any,
          statusText: mockHttp.error,
          config: {} as any
        }
      } else if (typeof mockHttp === 'function') {
        const r = mockHttp(url, method, headers, body);
        response = {
          data: r.data,
          status: r.code,
          headers: r.headers as any,
          statusText: r.error,
          config: {} as any
        }
      }
    }


    const headersJson = headers.toJSON();
    const responseType = headersJson.responsetypeaxios ? headersJson.responsetypeaxios : 'text';

    try {
      if (!response) {
        // console.log(`[${method}] (jobid=${jobid}) request to:  ${url}`);

        // console.log('headers axios:', headers.toJSON())
        // console.log({ responseType, headersJson, body, method, url })
        response = await axios({
          url,
          method,
          data: body,
          responseType,
          headers: headersJson,
          cancelToken: source.token,
          // withCredentials: true, // this can be done manually
        });
        // log.d(`after response of jobid: ${jobid}`);
      }

      // console.log('AXIOS RESPONES', response)

      if (this.subjectInuUse[jobid][isCanceled]) {
        return;
      }

      this.handlerResult({
        res: {
          code: response.status as any,
          data: response.data,
          isArray,
          jobid,
          headers: RestHeaders.from(response.headers as any)
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
      if (this.subjectInuUse[jobid][isCanceled]) {
        return;
      }
      // console.log('ERROR RESPONESE catchedError typeof ', typeof catchedError)
      // console.log('ERROR RESPONESE catchedError', catchedError)
      if (typeof catchedError === 'object' && catchedError.response && catchedError.response.data) {
        const err = catchedError.response.data;
        const msg: string = catchedError.response.data.message || '';
        // console.log({
        //   'err.stack': err?.stack
        // })
        let stack: string[] = (err.stack || '').split('\n');

        const errObs = (Resource['_listenErrors'] as Subject<Models.BackendError>);
        errObs.next({
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
      if (RestRequest.jobId === Number.MAX_SAFE_INTEGER) {
        RestRequest.jobId = 0;
      }

      const jobid: number = RestRequest.jobId++;
      replay.id = jobid;
      const subject: Subject<any> = replay.subject;
      subject[jobIDkey] = jobid; // modify internal rxjs subject obj

      this.meta[jobid] = meta;
      this.subjectInuUse[jobid] = subject;

      this.subjectInuUse[jobid][customObs] = new Observable((observer) => {
        // observer.remove(() => {

        // });
        observer.add(() => {
          // console.log(`cancel observable job${jobid}`)
          if (!this.subjectInuUse[jobid][isCanceled]) {
            this.subjectInuUse[jobid][isCanceled] = true;
            if (typeof this.subjectInuUse[jobid][cancelFn] === 'function') {
              this.subjectInuUse[jobid][cancelFn]('[ng2-rest] on purpose canceled http request');
            }
          } else {
            // console.log(`somehow second time cancel ${jobid}`)
          }
        })
        const sub = subject.subscribe({
          next: a => observer.next(a),
          error: a => observer.error(a),
          complete: () => {
            sub.unsubscribe();
            observer.complete()
          },
        });
      });


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

    const resp: Models.PromiseObservableMix<any> = firstValueFrom(replay.subject[customObs]) as any;
    resp.observable = replay.subject[customObs];
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

    const resp: Models.PromiseObservableMix<any> = firstValueFrom(replay.subject[customObs]) as any;
    resp.observable = replay.subject[customObs];
    console.log('assiging custom observable')
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
