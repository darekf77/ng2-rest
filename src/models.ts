import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import { Log, Level } from 'ng2-logger';
import { RestHeaders } from './rest-headers';
import { Rest } from './rest.class';
import { Cookie } from './cookie';
import { Mapping } from './mapping';
import { AxiosResponse } from 'axios';
import { Models as HelpersModels } from 'typescript-class-helpers'
import { JSON10, Circ } from 'json10';
import { RequestCache } from './request-cache';
import { _ } from 'tnp-core';
import { ConfigModels } from 'tnp-config';
// const log = Log.create('rest namespace', Level.__NOTHING)

export namespace Models {

  export import HttpMethod = ConfigModels.HttpMethod;
  export import ParamType = ConfigModels.ParamType;

  export import MethodConfig = HelpersModels.MethodConfig;
  export import ClassConfig = HelpersModels.ClassConfig;
  export import ParamConfig = HelpersModels.ParamConfig


  export interface HandleResultOptions {
    res: Models.MockResponse;
    method: Models.HttpMethod;
    jobid?: number;
    isArray?: boolean;
  }

  export interface HandleResultSourceRequestOptions {
    url: string,
    method: Models.HttpMethod,
    // headers?: RestHeaders,
    body: any,
    isArray: boolean,
  }

  export type BackendError = {
    msg?: string;
    stack?: string[];
    data: any;
  }

  export type MetaRequest = {
    path: string,
    endpoint: string;
    entity: Mapping.Mapping;
    circular: Circ[];
  }
  export type HttpCode = 200 | 400 | 401 | 404 | 500;

  export type PromiseObservableMix<T> = Promise<T> & {
    cache?: RequestCache,
    observable: Observable<T>;
  }

  export type MethodWithoutBody<E, T, R = PromiseObservableMix<E>> = (params?: UrlParams[], doNotSerializeParams?: boolean) => R
  export type MethodWithBody<E, T, R = PromiseObservableMix<E>> = (item?: T, params?: UrlParams[], doNotSerializeParams?: boolean) => R
  export type ReplayData = {
    subject: Subject<any>,
    data: { url: string, body: string, headers: RestHeaders, isArray: boolean; },
    /**
     * jobid
     */
    id: number;
  };
  export type ReqParams = { url: string, method: ConfigModels.HttpMethod, headers?: RestHeaders, body?: any, jobid: number, isArray: boolean };

  export interface ResourceModel<A, TA> {
    model: (pathModels?: Object, responseObjectType?: Function) => Rest<A, TA>,
    replay: (method: ConfigModels.HttpMethod) => void;
    headers: RestHeaders;
  }

  export interface Ng2RestMethods<E, T> {
    get: MethodWithoutBody<E, T>;
    post: MethodWithBody<E, T>;
    put: MethodWithBody<E, T>;
    patch: MethodWithBody<E, T>;
    head: MethodWithoutBody<E, T>;
    delete: MethodWithoutBody<E, T>;
    jsonp: MethodWithoutBody<E, T>;
  }

  export type MockController = (
    url: string,
    method: ConfigModels.HttpMethod,
    headers?: RestHeaders,
    body?: any
  ) => MockResponse;

  export type MockHttp = (MockResponse | MockController);

  export interface FnMethodsHttp<T, TA> extends Ng2RestMethods<HttpResponse<T>, T> {
    array: Ng2RestMethods<HttpResponse<TA>, TA>;
  };

  export interface FnMethodsHttpWithMock<T, TA> extends Ng2RestMethods<HttpResponse<T>, T> {
    array: Ng2RestMethods<HttpResponse<TA>, TA>;
    mock(mock: MockHttp, code: HttpCode): FnMethodsHttp<T, TA>;
  };



  export interface NestedParams {
    [params: string]: string;
  }

  export interface UrlParams {
    [urlModelName: string]: string | number | boolean | RegExp | Object;
    regex?: RegExp;
  }[];

  export abstract class BaseBody {
    protected toJSON(data, isJSONArray = false) {
      let r = isJSONArray ? [] : {};
      if (typeof data === 'string') {
        try {
          r = JSON.parse(data);
        } catch (e) { }
      } else if (typeof data === 'object') {
        return data;
      }
      return r as any;
    }
  }

  export class HttpBody<T> extends BaseBody {

    constructor(private body: string, private isArray = false,
      private entity: Mapping.Mapping,
      private circular: Circ[]
    ) {
      super();
    }

    public get booleanValue() {
      return ['ok', 'true'].includes(this.body.trim());
    }

    public get json(): T {

      if (this.entity && typeof this.entity === 'object') {
        const json = this.toJSON(this.body, this.isArray);
        return Mapping.encode(json, this.entity, this.circular) as any;
      }
      let res = this.toJSON(this.body, this.isArray);
      if (this.circular && Array.isArray(this.circular)) {
        res = JSON10.parse(JSON.stringify(res), this.circular)
      }
      return res;
    }
    public get text() {
      return this.body.replace(/^\"/, '').replace(/\"$/, '')
    }
  }

  export class ErrorBody extends BaseBody {
    constructor(private data) {
      super();
    }

    public get json(): Object {
      return this.toJSON(this.data);
    }
    public get text() {
      return this.data
    }
  }


  export abstract class BaseResponse<T> {
    protected static readonly cookies = Cookie.Instance;

    public get cookies() {
      return BaseResponse.cookies;
    }
    constructor(
      public responseText?: string,
      public readonly headers?: RestHeaders,
      public readonly statusCode?: HttpCode | number,
      public isArray = false
    ) {
    }
  }

  export class HttpResponse<T> extends BaseResponse<T> {
    public body?: HttpBody<T>;
    // public readonly TOTAL_COUNT_HEADER = 'X-Total-Count'.toLowerCase();
    // public get totalElements(): number {
    //     return Number(this.headers.get(this.TOTAL_COUNT_HEADER));
    // }
    rq: RequestCache;
    constructor(
      public sourceRequest: Models.HandleResultSourceRequestOptions,
      public responseText?: string,
      public headers?: RestHeaders,
      public statusCode?: HttpCode | number,
      public entity?: Mapping.Mapping,
      public circular?: Circ[],
      public jobid?: number,
      public isArray = false,
    ) {
      super(responseText, headers, statusCode, isArray);
      this.init()
    }

    public init() {
      if (typeof this.entity === 'string') {
        // const headerWithMapping = headers.get(entity);
        let entityJSON = this.headers.getAll(this.entity)
        if (!!entityJSON) {
          this.entity = JSON.parse(entityJSON.join());
        }
      }
      if (typeof this.circular === 'string') {
        // const headerWithMapping = headers.get(circular);
        let circuralJSON = this.headers.getAll(this.circular);
        if (!!circuralJSON) {
          this.circular = JSON.parse(circuralJSON.join());
        }

      }
      this.body = new HttpBody(this.responseText, this.isArray, this.entity, this.circular) as any;
    }

    get cache() {
      if (_.isUndefined(this.rq)) {
        this.rq = new RequestCache(this);
      }
      return new RequestCache(this);
    }

  }

  export class HttpResponseError extends BaseResponse<any> {
    private body: ErrorBody;
    // public tryRecconect() {

    // }
    constructor(
      public message: string,
      responseText?: string,
      headers?: RestHeaders,
      statusCode?: HttpCode | number,
      public jobid?: number,
    ) {
      super(responseText, headers, statusCode);
      this.body = new ErrorBody(responseText)
    }
  }

  export interface MockResponse {
    data?: any;
    code?: HttpCode;
    error?: string;
    headers?: RestHeaders;
    jobid?: number;
    isArray: boolean;
  }




}
