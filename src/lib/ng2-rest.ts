//#region imports
import { URL } from 'url'; // @backend

import { AxiosRequestConfig } from 'axios';
import axios from 'axios';
import { JSON10 } from 'json10/src';
import { from, Observable, shareReplay, switchMap, throwError } from 'rxjs';
import { CoreModels, Helpers, _ } from 'tnp-core/src';
//#endregion

//#region interpolate utils
export const regexisPath = /[^\..]+(\.[^\..]+)+/g;

/**
 * Models like books/:id
 */
const cutUrlModel = (params: Object, models: string[], output: string[]) => {
  if (models.length === 0) return output.join('\/');
  let m = models.pop();

  let param = m.match(/:[a-zA-Z0-9\.]+/)[0].replace(':', '');
  const paramIsPath = regexisPath.test(param);
  // log.i('cut param', param)
  let model = m.match(/[a-zA-Z0-9]+\//)[0].replace('\/', '');
  if (
    params === void 0 ||
    (paramIsPath
      ? _.get(params, param) === void 0
      : params[param] === void 0) ||
    param === 'undefined'
  ) {
    output.length = 0;
    output.unshift(model);
    return cutUrlModel(params, models, output);
  } else {
    if (paramIsPath) {
      // log.i('param is path', param)
      let mrep = m.replace(
        new RegExp(`:${param}`, 'g'),
        `${_.get(params, param)}`,
      );
      output.unshift(mrep);
      return cutUrlModel(params, models, output);
    } else {
      // log.i('param is normal', param)
      let mrep = m.replace(new RegExp(`:${param}`, 'g'), `${params[param]}`);
      output.unshift(mrep);
      return cutUrlModel(params, models, output);
    }
  }
};

/**
   * let pattern = '/books/:bookid';
   # let url = `/books/34`;
   */
export function interpolateParamsToUrl(params: Object, url: string): string {
  const regexInt = /\[\[([^\..]+\.[^\..]+)+\]\]/g;

  url = url
    .split('/')
    .map(p => {
      // log.d('url parts', p)
      let isParam = p.startsWith(':');
      if (isParam) {
        let part = p.slice(1);
        // log.d('url param part', p)
        if (regexInt.test(part)) {
          // let level = (url.split('.').length - 1)
          part = part.replace('[[', '');
          part = part.replace(']]', '');
        }
        return `:${part}`;
      }
      return p;
    })
    .join('/');

  // log.i('URL TO EXPOSE', url)

  // log.i('params', params)

  let slash = {
    start: url.charAt(0) === '\/',
    end: url.charAt(url.length - 1) === '\/',
  };

  let morePramsOnEnd = url.match(/(\/:[a-zA-Z0-9\.]+){2,10}/g);
  if (
    morePramsOnEnd &&
    Array.isArray(morePramsOnEnd) &&
    morePramsOnEnd.length === 1
  ) {
    // log.i('morePramsOnEnd', morePramsOnEnd)
    let m = morePramsOnEnd[0];
    let match = m.match(/\/:[a-zA-Z0-9\.]+/g);
    // log.i('match', match)
    match.forEach(e => {
      let c = e.replace('\/:', '');
      // log.i('c', c)
      if (regexisPath.test(c)) {
        url = url.replace(e, `/${_.get(params, c)}`);
      } else {
        url = url.replace(e, `/${params[c]}`);
      }

      // log.i('prog url', url)
    });
    return url;
  }

  let nestedParams = url.match(/[a-zA-Z0-9]+\/:[a-zA-Z0-9\.]+/g);
  if (
    !nestedParams ||
    (Array.isArray(nestedParams) && nestedParams.length === 0)
  )
    return url;

  // check alone params
  if (!slash.end) url = `${url}/`;
  let addUndefinedForAlone =
    !/:[a-zA-Z0-9\.]+\/$/g.test(url) && /[a-zA-Z0-9]+\/$/g.test(url);

  let replace =
    (nestedParams.length > 1 ? nestedParams.join('\/') : nestedParams[0]) +
    (addUndefinedForAlone ? '\/' + url.match(/[a-zA-Z0-9]+\/$/g)[0] : '\/');
  let beginHref = url.replace(replace, '');

  if (addUndefinedForAlone) {
    url = url.replace(/\/$/g, '/:undefined');
    nestedParams = url.match(/[a-zA-Z0-9]+\/:[a-zA-Z0-9\.]+/g);
    url = cutUrlModel(params, nestedParams, []);
  } else {
    url = cutUrlModel(params, nestedParams, []);
  }
  url = beginHref + url;

  if (url.charAt(url.length - 1) !== '/' && slash.end) url = `${url}/`;
  if (url.charAt(0) !== '\/' && slash.start) url = `/${url}`;

  return url;
}
//#endregion

//#region rest headers
export type RestHeadersOptions =
  | RestHeaders
  | { [name: string]: string | string[] };

export class RestHeaders {
  /** @internal header names are lower case */
  _headers: Map<string, string[]> = new Map();

  /** @internal map lower case names to actual names */
  _normalizedNames: Map<string, string> = new Map();

  public static from(headers?: RestHeadersOptions) {
    return new RestHeaders(headers || {});
  }

  private constructor(headers?: RestHeaders | { [name: string]: string | string[] }) {
    if (headers instanceof RestHeaders) {
      headers.forEach((values: string[], name: string) => {
        values.forEach(value => this.set(name, value));
      });
    } else {
      Object.keys(headers).forEach((name: string) => {
        const values: string[] = (
          Array.isArray(headers[name]) ? headers[name] : [headers[name]]
        ) as any;
        this.delete(name);
        values.forEach(value => this.set(name, value));
      });
    }
  }

  /**
   * Returns a new RestHeaders instance from the given DOMString of Response RestHeaders
   */
  static fromResponseHeaderString(headersString: string): RestHeaders {
    const headers = new RestHeaders();
    // console.log({
    //   headersString
    // })
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

  forEach(
    fn: (
      values: string[],
      name: string,
      headers: Map<string, string[]>,
    ) => void,
  ): void {
    this._headers.forEach((values, lcName) =>
      fn(values, this._normalizedNames.get(lcName), this._headers),
    );
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
  has(name: string): boolean {
    return this._headers.has(name.toLowerCase());
  }

  /**
   * Returns the names of the headers
   */
  keys(): string[] {
    return Array.from(this._normalizedNames.values());
  }

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
  values(): string[][] {
    return Array.from(this._headers.values());
  }

  /**
   * Returns string of all headers.
   */
  // TODO(vicb): returns {[name: string]: string[]}
  toJSON(): { [name: string]: any } {
    const serialized: { [name: string]: string[] } = {};
    if (!this._headers) {
      // debugger
    }
    // console.log('serializing headers',this._headers)
    this._headers.forEach((values: string[], name: string) => {
      const split: string[] = [];
      values.forEach(v => split.push(...v.split(',')));
      // console.log({
      //   values
      // })
      // values.forEach(v => split.push(...(v ? v : '').split(',')));
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

//#region handle result source request options
export interface HandleResultSourceRequestOptions {
  url: string;
  method: CoreModels.HttpMethod;
  body: any;
  isArray: boolean;
}

class RestCommonHttpResponseWrapper {
  declare success?: boolean;
}

export class RestResponseWrapper extends RestCommonHttpResponseWrapper {
  declare data?: any;
}

export class RestErrorResponseWrapper extends RestCommonHttpResponseWrapper {
  declare message: string;

  /**
   * stack trace / more details about error
   */
  declare details?: string;

  /**
   * http status code
   */
  declare status?: number;

  /**
   * custom error code from backend
   */
  declare code?: string;
}
//#endregion

//#region base body
export abstract class BaseBody {
  protected toJSON(
    data,
    opt: {
      isJSONArray?: boolean;
      parsingError?: boolean;
    },
  ): object | undefined {
    opt = opt || { isJSONArray: false };
    let r = opt.isJSONArray ? [] : {};
    if (typeof data === 'string') {
      try {
        let parsed = JSON.parse(data);
        if (typeof parsed === 'string' && parsed.trim().startsWith('{')) {
          parsed = JSON.parse(parsed);
        }
        if (opt.parsingError && parsed[CoreModels.TaonHttpErrorCustomProp]) {
          return _.merge(new RestErrorResponseWrapper(), parsed);
        }
        return parsed;
      } catch (e) {}
    } else if (typeof data === 'object') {
      return data;
    }
    return r as any;
  }
}

export class HttpBody<T> extends BaseBody {
  constructor(
    private responseText: string | Blob,
    private isArray = false,
  ) {
    super();
  }

  public get blob(): Blob {
    return this.responseText as Blob;
  }

  public get booleanValue(): boolean | undefined {
    if (!Helpers.isBlob(this.responseText)) {
      return ['ok', 'true'].includes((this.responseText as string)?.trim());
    }
  }

  public get numericValue(): number | undefined {
    if (!Helpers.isBlob(this.responseText)) {
      return Number((this.responseText as string)?.trim());
    }
  }

  public get rawJson(): Partial<T> {
    if (!Helpers.isBlob(this.responseText)) {
      let res = this.toJSON(this.responseText, { isJSONArray: this.isArray });
      // if (this.circular && Array.isArray(this.circular)) {
      //   res = JSON10.parse(JSON.stringify(res), this.circular);
      // }

      return res;
    }
  }

  public get json(): T {
    const isBlob = Helpers.isBlob(this.responseText);
    if (isBlob) {
      return void 0;
    }

    let res = this.toJSON(this.responseText, { isJSONArray: this.isArray });

    return res as any;
  }

  /**
   * undefined when blob
   */
  public get text(): string | undefined {
    if (!Helpers.isBlob(this.responseText)) {
      return (this.responseText as string)
        .replace(/^\"/, '')
        .replace(/\"$/, '');
    }
  }
}

export class ErrorBody<T = RestErrorResponseWrapper> extends BaseBody {
  constructor(private data) {
    super();
  }

  public get json(): T {
    return this.toJSON(this.data, { parsingError: true }) as any;
  }

  public get text(): string {
    return this.data;
  }
}

export abstract class BaseResponse<T> {
  // protected static readonly cookies = Cookie.Instance;

  // public get cookies() {
  //   return BaseResponse.cookies;
  // }

  constructor(
    public responseText?: string | Blob,
    public readonly headers?: RestHeaders,
    public readonly statusCode?: CoreModels.HttpCode | number,
    public isArray = false,
  ) {}
}

//#endregion

//#region http response
export class HttpResponse<T> extends BaseResponse<T> {
  public body: HttpBody<T>;

  constructor(
    public sourceRequest: HandleResultSourceRequestOptions,
    public responseText?: string | Blob,
    public headers?: RestHeaders,
    public statusCode?: CoreModels.HttpCode | number,
    public isArray = false,
  ) {
    super(responseText, headers, statusCode, isArray);

    this.init();
  }

  public init() {
    this.body = new HttpBody(this.responseText, this.isArray) as any;
  }
}

export class HttpResponseError<ERROR_BODY = object> extends BaseResponse<any> {
  public readonly body: ErrorBody<ERROR_BODY>;
  // public tryRecconect() {

  // }
  constructor(
    public message: string,
    responseText?: string,
    headers?: RestHeaders,
    statusCode?: CoreModels.HttpCode | number,

    public sourceRequest?: HandleResultSourceRequestOptions,
  ) {
    super(responseText, headers, statusCode);
    this.body = new ErrorBody<ERROR_BODY>(responseText);
  }
}

interface ResourceOptions {}

//#endregion

//#region resource reponse class
class ResourceResponse<DATA = any, ERROR = any> implements Promise<
  HttpResponse<DATA>
> {
  [Symbol.toStringTag] = 'Promise';

  private _promise:
    | Promise<HttpResponse<DATA> | HttpResponseError<ERROR>>
    | undefined;

  constructor(
    private httpMethodName: CoreModels.HttpMethod,
    private urlOrigin: string,
    private urlPathname: string,
    private options: ResourceOptions,
    private item?: DATA | DATA,
    private params?: UrlParams[],
    private axiosOptions?: Ng2RestAxiosRequestConfig,
    /**
     * Just to check if response is array
     */
    private isArray = false,
  ) {}

  /**
   * If you prefer explicitness instead of "this object is a Promise"
   */
  public get promise(): Promise<HttpResponse<DATA> | HttpResponseError<ERROR>> {
    if (!this._promise) {
      this._promise = this.makeRequest();
    }
    return this._promise;
  }

  // @ts-ignore
  then<TResult1 = HttpResponse<DATA>, TResult2 = never>(
    onfulfilled?:
      | ((
          value: HttpResponse<DATA> | HttpResponseError<ERROR>,
        ) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null,
  ): Promise<TResult1 | TResult2> {
    return this.promise.then(onfulfilled as any, onrejected as any);
  }

  // @ts-ignore

  catch<TResult = never>(
    onrejected?:
      | ((reason: any) => TResult | PromiseLike<TResult>)
      | undefined
      | null,
  ): Promise<(HttpResponse<DATA> | HttpResponseError<ERROR>) | TResult> {
    return this.promise.catch(onrejected as any);
  }

  // @ts-ignore
  finally(
    onfinally?: (() => void) | undefined | null,
  ): Promise<HttpResponse<DATA> | HttpResponseError<ERROR>> {
    return this.promise.finally(onfinally as any);
  }

  /**
   * Observable that executes the same underlying axios request.
   * Emits DATA (not HttpResponse) to match your example.
   */
  private _observable?: Observable<HttpResponse<DATA>>;

  get observable(): Observable<HttpResponse<DATA>> {
    if (!this._observable) {
      this._observable = from(this.promise).pipe(
        switchMap(res =>
          res instanceof HttpResponseError
            ? throwError(() => res)
            : from([res]),
        ),
        // share the single result for all subscribers
        shareReplay({ bufferSize: 1, refCount: true }),
      );
    }
    return this._observable;
  }

  // -------------------------
  // Internals
  // -------------------------

  private buildUrl(): string {
    // avoid double slashes
    const origin = (this.urlOrigin || '').replace(/\/+$/, '');
    const path = (this.urlPathname || '').replace(/^\/+/, '');
    return `${origin}/${path}`;
  }

  private mergeParamsToHeaders(params?: UrlParams[]): Record<string, any> {
    // Your params[] in example looks like headers (e.g. { 'location-id': 123 })
    // We'll treat them as headers by default.
    const headers: Record<string, any> = {};
    for (const p of params || []) {
      if (!p || typeof p !== 'object') continue;
      for (const [k, v] of Object.entries(p)) {
        if (k === 'regex') continue;
        headers[k] = v as any;
      }
    }
    return headers;
  }

  private serializeResponseText(data: any): string | Blob {
    if (Helpers.isBlob(data)) return data as Blob;
    if (typeof data === 'string') return data;
    try {
      return JSON.stringify(data ?? (this.isArray ? [] : {}));
    } catch {
      return String(data);
    }
  }

  private async makeRequest(): Promise<
    HttpResponse<DATA> | HttpResponseError<ERROR>
  > {
    const url = this.buildUrl();

    const method = String(this.httpMethodName).toLowerCase() as any;

    console.log(`REQUEST ${method} ${url}`);

    const headersFromParams = this.mergeParamsToHeaders(this.params);

    const cfg: AxiosRequestConfig = {
      url,
      method,
      headers: {
        ...(this.axiosOptions?.headers || {}),
        ...headersFromParams,
      },
      // allow your custom flags but don’t break axios
      ...this.axiosOptions,
    };

    // Decide where "item" goes.
    // - For GET/DELETE/HEAD we treat "item" as query params if it's a plain object
    // - For others we send it as request body
    const canHaveBody = !['get', 'delete', 'head'].includes(method);
    if (canHaveBody) {
      (cfg as any).data = this.item;
    } else if (this.item && typeof this.item === 'object') {
      (cfg as any).params = this.item as any;
    }

    const sourceRequest: HandleResultSourceRequestOptions = {
      url,
      method: this.httpMethodName,
      body: this.item,
      isArray: this.isArray,
    };

    try {
      const resp = await axios(cfg);

      const responseText = this.serializeResponseText(resp.data);

      return new HttpResponse<DATA>(
        sourceRequest,
        responseText,
        RestHeaders.from(),
        resp.status,
        this.isArray,
      );
    } catch (e: any) {
      // Axios error shape: e.response?.data / e.response?.status
      const status = e?.response?.status;
      const data = e?.response?.data ?? e?.message ?? e;

      const responseText =
        typeof data === 'string' ? data : this.serializeResponseText(data);

      const message =
        e?.message || (status ? `HTTP ${status}` : 'HTTP request failed');

      return new HttpResponseError<ERROR>(
        message,
        typeof responseText === 'string' ? responseText : undefined,
        RestHeaders.from(),
        status,
        sourceRequest,
      );
    }
  }
}
//#endregion

//#region models
export interface UrlParams {
  [urlModelName: string]: string | number | boolean | RegExp | Object;
  regex?: RegExp;
}
[];

export type Ng2RestAxiosRequestConfig = {
  doNotSerializeParams?: boolean;
} & AxiosRequestConfig<any>;

type ResourceFactory<MODEL> = {
  model: <INTERPOLATE_ARGS = {}>(
    interpolateParams?: INTERPOLATE_ARGS,
  ) => {
    array: {
      [method in CoreModels.HttpMethod]: (
        item?: MODEL | MODEL[],
        params?: UrlParams[],
        axiosOptions?: Ng2RestAxiosRequestConfig,
      ) => ResourceResponse<MODEL[]>;
    };
  } & {
    [method in CoreModels.HttpMethod]: (
      item?: MODEL,
      params?: UrlParams[],
      axiosOptions?: Ng2RestAxiosRequestConfig,
    ) => ResourceResponse<MODEL>;
  };
};
//#endregion

//#region resource namespace
export namespace Resource {
  export function create<MODEL = any>(
    url: URL,
    option?: ResourceOptions,
  ): ResourceFactory<MODEL>;
  export function create<MODEL = any>(
    origin: string,
    pathname: string,
    option?: ResourceOptions,
  ): ResourceFactory<MODEL>;
  export function create<MODEL = any>(
    arg1?: string | URL,
    arg2?: string | Object,
    arg3?: ResourceOptions,
  ): ResourceFactory<MODEL> {
    let url: URL = typeof arg1 === 'string' ? new URL(`${arg1}${arg2}`) : arg1;

    const options: ResourceOptions = typeof arg2 === 'object' ? arg2 : arg3;

    return {
      model: <INTERPOLATE_ARGS = {}>(interpolateParams?: INTERPOLATE_ARGS) => {
        if (interpolateParams) {
          // interpolate args
          let pathNameInterpolated = interpolateParamsToUrl(
            interpolateParams,
            url.pathname,
          );
          url = new URL(`${url.origin}/${pathNameInterpolated}`);
        }

        const methods = <T>(
          isArray = false,
        ): {
          [method in CoreModels.HttpMethod]: (
            item?: T,
            params?: UrlParams[],
            axiosOptions?: Ng2RestAxiosRequestConfig,
          ) => ResourceResponse<T>;
        } => {
          const methodsObj = {};
          for (const methodName of CoreModels.HttpMethodArr) {
            methodsObj[methodName] = (
              item?: MODEL,
              params?: UrlParams[],
              axiosOptions?: Ng2RestAxiosRequestConfig,
            ) =>
              new ResourceResponse(
                methodName,
                url.origin,
                url.pathname,
                options,
                item,
                params,
                axiosOptions,
                isArray,
              );
          }
          return methodsObj as any;
        };

        const methodsRes = methods<MODEL>();
        const methodsArrayRes = methods<MODEL[]>(true);

        return {
          get array() {
            return methodsArrayRes;
          },
          ...methodsRes,
        };
      },
    };
  }
}
//#endregion

//#region exmaple usage
/**
 * EXample useage
 */

class ExampleBook {
  title: string;
}

async function example() {
  const rest = Resource.create<ExampleBook>(
    'http://my-website.pl',
    'api/v3/user/:userId',
  );

  const response = await rest.model({ userId: 1 }).get();

  response; // type of response should be HttpResponse

  const responseObservable = rest
    .model({ userId: 1 })
    .array.post(new ExampleBook(), [{ 'location-id': 123 }]).observable;
  responseObservable.subscribe(data => {
    data; // HttpResponse<ExampleBook>
  });

  // response.
}
//#endregion
