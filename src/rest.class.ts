//#region import
import 'rxjs/add/operator/map';
import { Log, Level } from 'ng2-logger';
// const log = Log.create('rest.class', Level.__NOTHING)
// local
import { Models } from './models';
import { getRestParams, getParamsUrl } from './params';
import { RestRequest } from './rest-request';
import { RestHeaders } from './rest-headers';
//#endregion

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

export class Rest<T, TA = T[]> implements Models.FnMethodsHttpWithMock<T, TA> {

  private mockHttp: Models.MockHttp;
  mock(mock: Models.MockHttp): Models.FnMethodsHttp<T, TA> {
    if ((typeof mock === 'function') || (typeof mock === 'object')) {
      this.mockHttp = mock;
    } else {
      throw `[ng2-rest]
      .model(...)
      .mock( < BAD MOCK DATA > )
      ...
      `
    }
    return this;
  }



  //#region  private fields
  private __meta_endpoint: string;
  private _endpointRest: string;
  private get endpoint() {
    let e = this.__meta_endpoint;
    if (this.restQueryParams !== void 0 && this._endpointRest !== void 0
      && typeof this._endpointRest === 'string' && this._endpointRest.trim() !== '') e = this._endpointRest;
    return e;
  }
  private restQueryParams: Object;
  public set __rest_endpoint(endpoint) {
    this._endpointRest = endpoint;
    if (endpoint === void 0) {
      this.restQueryParams = void 0;
    } else {
      this.restQueryParams = getRestParams(endpoint, this.__meta_endpoint);
    }

  }

  private creatUrl(params: any, doNotSerializeParams: boolean = false) {
    return `${this.endpoint}${getParamsUrl(params, doNotSerializeParams)}`;
  }

  //#endregion

  //#region  constructor
  private _headers = RestHeaders.from(DEFAULT_HEADERS);
  get headers() {
    return this._headers;
  }
  constructor(
    endpoint: string,
    private request: RestRequest,
    private meta: Models.MetaRequest,
  ) {
    this.__meta_endpoint = endpoint;

  }
  //#endregion

  //#region  req

  private req(method: Models.HttpMethod,
    item: T,
    params?: Models.UrlParams[],
    doNotSerializeParams: boolean = false,
    isArray: boolean = false
  ) {

    const modelUrl = this.creatUrl(params, doNotSerializeParams);
    const body = item ? JSON.stringify(item) : void 0;
    const result = this.request[method.toLowerCase()](
      modelUrl,
      body,
      this.headers,
      this.meta,
      isArray,
      this.mockHttp
    );
    this._headers = RestHeaders.from(DEFAULT_HEADERS);
    this.mockHttp = void 0;
    return result;
  }
  //#endregion

  //#region http methods

  //#region replay
  replay(method: Models.HttpMethod) {
    this.request.replay(method, this.meta);
  }
  //#endregion

  array = {
    get: (params: Models.UrlParams[] = void 0, doNotSerializeParams?: boolean): Models.PromiseObservableMix<Models.HttpResponse<TA>> => {
      return this.req('get', void 0, params, doNotSerializeParams, true) as any
    },
    head: (params: Models.UrlParams[] = void 0, doNotSerializeParams?: boolean): Models.PromiseObservableMix<Models.HttpResponse<TA>> => {
      return this.req('head', void 0, params, doNotSerializeParams, true) as any
    },
    post: (item: TA, params?: Models.UrlParams[], doNotSerializeParams?: boolean): Models.PromiseObservableMix<Models.HttpResponse<TA>> => {
      return this.req('post', item as any, params, doNotSerializeParams, true) as any;
    },
    put: (item: TA, params?: Models.UrlParams[], doNotSerializeParams?: boolean): Models.PromiseObservableMix<Models.HttpResponse<TA>> => {
      return this.req('put', item as any, params, doNotSerializeParams, true) as any;
    },
    patch: (item: TA, params?: Models.UrlParams[], doNotSerializeParams?: boolean): Models.PromiseObservableMix<Models.HttpResponse<TA>> => {
      return this.req('patch', item as any, params, doNotSerializeParams, true) as any;
    },
    delete: (params?: Models.UrlParams[], doNotSerializeParams?: boolean): Models.PromiseObservableMix<Models.HttpResponse<TA>> => {
      return this.req('delete', void 0, params, doNotSerializeParams, true) as any;
    },
    jsonp: (params?: Models.UrlParams[], doNotSerializeParams?: boolean): Models.PromiseObservableMix<Models.HttpResponse<TA>> => {
      return this.req('jsonp', void 0, params, doNotSerializeParams, true) as any;
    }
  }

  get(params?: Models.UrlParams[], doNotSerializeParams: boolean = false): Models.PromiseObservableMix<Models.HttpResponse<T>> {
    return this.req('get', void 0, params, doNotSerializeParams) as any;
  }

  head(params?: Models.UrlParams[], doNotSerializeParams: boolean = false): Models.PromiseObservableMix<Models.HttpResponse<T>> {
    return this.req('head', void 0, params, doNotSerializeParams) as any;
  }

  post(item: T, params?: Models.UrlParams[], doNotSerializeParams: boolean = false): Models.PromiseObservableMix<Models.HttpResponse<T>> {
    return this.req('post', item, params, doNotSerializeParams);
  }

  put(item: T, params?: Models.UrlParams[], doNotSerializeParams: boolean = false): Models.PromiseObservableMix<Models.HttpResponse<T>> {
    return this.req('put', item, params, doNotSerializeParams);
  }

  patch(item: T, params?: Models.UrlParams[], doNotSerializeParams: boolean = false): Models.PromiseObservableMix<Models.HttpResponse<T>> {
    return this.req('patch', item, params, doNotSerializeParams);
  }

  delete(params?: Models.UrlParams[], doNotSerializeParams: boolean = false): Models.PromiseObservableMix<Models.HttpResponse<T>> {
    return this.req('delete', void 0, params, doNotSerializeParams);
  }

  jsonp(params?: Models.UrlParams[], doNotSerializeParams: boolean = false): Models.PromiseObservableMix<Models.HttpResponse<T>> {
    return this.req('jsonp', void 0, params, doNotSerializeParams);
  }
  //#endregion

}
