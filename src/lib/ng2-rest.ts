//#region imports
import { URL } from 'url'; // @backend

import { AxiosHeaders, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import type express from 'express';
import * as FormData from 'form-data'; // @backend
import { Circ, JSON10 } from 'json10/src';
import { Level, Log } from 'ng2-logger/src';
import {
  firstValueFrom,
  from,
  Observable,
  shareReplay,
  Subject,
  switchMap,
  throwError,
} from 'rxjs';
import { CoreModels, Helpers, _ } from 'tnp-core/src';
import { CLASS } from 'typescript-class-helpers/src';

import { encodeMapping, EncodeSchema, EncodeSchemaString } from './new-mapping';

// import { Mapping } from './mapping';
//#endregion

const log = Log.create('ng2-rest', Level.WARN, Level.ERROR);

const listenErrorsSrc = new Subject<BackendError>();

//#region cookie

// TODO do it for nodejs

// import { CookieJar } from 'tough-cookie';

// const jar = new CookieJar();

// const rest = Resource.create('http://my-website.pl', 'api/v3/user/:userId', {
//   cookieJar: jar,
// });

// await rest.model({ userId: 1 }).get(); // cookies persist across requests

// import type { CookieJar } from 'tough-cookie';

// interface ResourceOptions {
//   // ...
//   cookieJar?: CookieJar;
// }

// export class CookieJarInterceptor implements TaonAxiosClientInterceptor<any> {
//   constructor(private readonly jar: CookieJar) {}

//   intercept({ req, next }: TaonClientMiddlewareInterceptOptions<any>) {
//     return new Observable<AxiosResponse<any>>(subscriber => {
//       const url = req.url || '';

//       // 1) attach Cookie header from jar
//       this.jar.getCookieString(url, (err, cookieString) => {
//         if (err) {
//           subscriber.error(err);
//           return;
//         }

//         if (cookieString) {
//           req.headers = req.headers || {};
//           // axios headers can be plain object or AxiosHeaders
//           if (req.headers instanceof AxiosHeaders) {
//             req.headers.set('Cookie', cookieString);
//           } else {
//             (req.headers as any)['Cookie'] = cookieString;
//           }
//         }

//         // 2) proceed
//         const sub = next.handle(req).subscribe({
//           next: res => {
//             // 3) store Set-Cookie back into jar
//             const setCookie = (res.headers as any)?.['set-cookie'];
//             const cookies: string[] =
//               typeof setCookie === 'string'
//                 ? [setCookie]
//                 : Array.isArray(setCookie)
//                   ? setCookie
//                   : [];

//             if (!cookies.length) {
//               subscriber.next(res);
//               return;
//             }

//             let pending = cookies.length;
//             for (const c of cookies) {
//               this.jar.setCookie(c, url, () => {
//                 pending--;
//                 if (pending === 0) {
//                   subscriber.next(res);
//                 }
//               });
//             }
//           },
//           error: e => subscriber.error(e),
//           complete: () => subscriber.complete(),
//         });

//         return () => sub.unsubscribe();
//       });
//     });
//   }
// }

export class Cookie {
  public static get Instance(): Cookie {
    if (!Cookie.__instance) {
      Cookie.__instance = new Cookie();
    }
    return Cookie.__instance as any;
  }

  private static __instance;

  private constructor() {}

  read(name: string): string {
    if (typeof document === 'undefined') return null;
    var result = new RegExp(
      '(?:^|; )' + encodeURIComponent(name) + '=([^;]*)',
    ).exec(document.cookie);
    return result ? result[1] : null;
  }

  write(name: string, value: string, days?: number): void {
    if (typeof document === 'undefined') return null;
    if (!days) {
      days = 365 * 20;
    }

    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);

    var expires = '; expires=' + date.toUTCString();

    document.cookie = name + '=' + value + expires + '; path=/';
  }

  remove(name: string): void {
    if (typeof document === 'undefined') return null;
    this.write(name, '', -1);
  }
}

//#endregion

//#region get params url

/**
 * Create query params string for url
 *
 * @export
 * @param {UrlParams[]} params
 * @returns {string}
 */
export function getParamsUrl(
  params: UrlParams[],
  doNotSerialize: boolean = false,
): string {
  params = _.cloneDeep(params); // TODO refactor it
  let urlparts: string[] = [];
  if (!params) return '';
  if (!(params instanceof Array)) return '';
  if (params.length === 0) return '';

  params.forEach(urlparam => {
    if (JSON.stringify(urlparam) !== '{}') {
      let parameters: string[] = [];
      let paramObject = <Object>urlparam;

      for (let p in paramObject) {
        if (paramObject[p] === void 0) delete paramObject[p];
        if (
          paramObject.hasOwnProperty(p) &&
          typeof p === 'string' &&
          p !== 'regex' &&
          !(paramObject[p] instanceof RegExp)
        ) {
          if (p.length > 0 && p[0] === '/') {
            let newName = p.slice(1, p.length - 1);
            urlparam[newName] = urlparam[p];
            urlparam[p] = void 0;
            p = newName;
          }
          if (p.length > 0 && p[p.length - 1] === '/') {
            let newName = p.slice(0, p.length - 2);
            urlparam[newName] = urlparam[p];
            urlparam[p] = void 0;
            p = newName;
          }
          let v: any = urlparam[p];
          if (v instanceof Object) {
            urlparam[p] = JSON.stringify(urlparam[p]);
          }
          urlparam[p] = doNotSerialize
            ? <string>urlparam[p]
            : encodeURIComponent(<string>urlparam[p]);
          if (urlparam.regex !== void 0 && urlparam.regex instanceof RegExp) {
            if (!urlparam.regex.test(<string>urlparam[p])) {
              console.warn(
                `Data: ${urlparam[p]} incostistent with regex ${urlparam.regex.source}`,
              );
            }
          }
          parameters.push(`${p}=${urlparam[p]}`);
        }
      }

      urlparts.push(parameters.join('&'));
    }
  });
  let join = urlparts.join().trim();
  if (join.trim() === '') return '';
  return `?${urlparts.join('&')}`;
}

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
 * let url = `/books/34`;
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

//#region axios intercepstors
export interface AxiosTaonHttpHandler<T = any> {
  handle(req: AxiosRequestConfig): Observable<AxiosResponse<T>>;
}

export interface TaonClientMiddlewareInterceptOptions<T = any> {
  req: AxiosRequestConfig; // <- request config only (no AxiosResponse here)
  next: AxiosTaonHttpHandler<T>;
}

export interface TaonServerMiddlewareInterceptOptions<T = any> {
  req: express.Request;
  res: express.Response;
  next: express.NextFunction;
}

export interface TaonAxiosClientInterceptor<T = any> {
  intercept(
    client: TaonClientMiddlewareInterceptOptions<T>,
  ): Observable<AxiosResponse<T>>;
}

// Optional helper for passing around context (browser/client)

// === Backend handler (last in chain) ===
export class AxiosBackendHandler<T = any> implements AxiosTaonHttpHandler<T> {
  handle(req: AxiosRequestConfig): Observable<AxiosResponse<T>> {
    // axios returns a Promise; wrap as Observable
    return from(axios.request<T>(req));
  }
}

// === Chain builder (request: forward order, response: reverse order) ===
export const buildInterceptorChain = <T = any>(
  globalInterceptors: Array<TaonAxiosClientInterceptor<T>>,
  backend: AxiosTaonHttpHandler<T>,
): AxiosTaonHttpHandler<T> => {
  return globalInterceptors.reduceRight<AxiosTaonHttpHandler<T>>(
    (next, interceptor) => ({
      handle: req => interceptor.intercept({ req, next }),
    }),
    backend,
  );
};

//#endregion

//#region response type axios
export type ResponseTypeAxios =
  | 'blob'
  | 'text'
  | 'json'
  //#region @backend
  | 'arraybuffer'
  | 'document'
  | 'stream'
  | 'formdata';
//#endregion
//#endregion

//#region rest headers
export type RestHeadersOptions =
  | RestHeaders
  | { [name: string]: string | string[] };

export class RestHeaders {
  /** @internal header names are lower case */
  protected _headers: Map<string, string[]> = new Map();

  /** @internal map lower case names to actual names */
  protected _normalizedNames: Map<string, string> = new Map();

  public static from(headers?: RestHeadersOptions): RestHeaders {
    return new RestHeaders(headers || {});
  }

  apply(headers?: RestHeadersOptions): RestHeaders {
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
    return this;
  }

  private constructor(headers?: RestHeadersOptions) {
    this.apply(headers);
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
    private readonly url: string,
    private readonly method: string,
    private readonly headers: RestHeaders,
    private readonly responseText: string | Blob,
    private readonly options: ResourceOptions,
    private readonly isArray: boolean,
  ) {
    super();
  }

  private get entity(): EncodeSchema | EncodeSchemaString {
    if (typeof this.options.responseMapping?.entity === 'string') {
      // const headerWithMapping = headers.get(entity);
      // console.log('header key ',this.options.responseMapping?.entity);
      // console.log(this.headers)
      let entityJSON = this.headers?.getAll(
        this.options.responseMapping?.entity,
      );
      if (!!entityJSON) {
        return JSON.parse(entityJSON.join());
      }
    }

    const entityAsResolvableFn = this.options?.responseMapping?.entity as () =>
      | EncodeSchema
      | EncodeSchemaString;

    if (typeof entityAsResolvableFn === 'function') {
      const mappingFromFunction = entityAsResolvableFn();
      // console.log({ mappingFromFunction });
      return mappingFromFunction as any;
    }

    return this.options.responseMapping?.entity as any;
  }

  private get circular(): Circ[] {
    if (typeof this.options.responseMapping?.circular === 'string') {
      // const headerWithMapping = headers.get(circular);
      let circuralJSON = this.headers?.getAll(
        this.options.responseMapping.circular,
      );
      if (!!circuralJSON) {
        return JSON.parse(circuralJSON.join());
      }
    }
    return (this.options.responseMapping?.circular || []) as any;
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
      if (this.circular && Array.isArray(this.circular)) {
        res = JSON10.parse(JSON.stringify(res), this.circular);
      }

      return res;
    }
  }

  public get json(): T {
    const isBlob = Helpers.isBlob(this.responseText);
    if (isBlob) {
      return void 0;
    }

    if (this.entity && typeof this.entity === 'object') {
      const json = this.toJSON(this.responseText, {
        isJSONArray: this.isArray,
      });
      // console.log({ entityMapping: this.entity })

      const resEntityMapping = encodeMapping(
        json,
        this.entity,
        this.circular,
      ) as any;

      // console.log({ resEntityMapping })

      this.displayWarningWhenNotUsingProperAPI(resEntityMapping);

      return resEntityMapping;
    }
    let res = this.toJSON(this.responseText, { isJSONArray: this.isArray });
    if (this.circular && Array.isArray(this.circular)) {
      res = JSON10.parse(JSON.stringify(res), this.circular);
    }
    this.displayWarningWhenNotUsingProperAPI(res);
    return res as any;
  }

  private displayWarningWhenNotUsingProperAPI(res: any): void {
    if (!this.options.useArrayApiWarning) {
      return;
    }
    if (this.isArray) {
      Helpers.warn(`[${this.method}: ${this.url}]
Your api response is object, but you are using .array api`);
    } else {
      if (Array.isArray(res)) {
        Helpers.warn(
          `[${this.method}: ${this.url}]
Your api response is array, but you are using object api instread .arrray.`,
        );
      }
    }
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
  constructor(
    private readonly url: string,
    private readonly data: any,
  ) {
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
  constructor(
    public readonly responseText: string | Blob,
    public readonly options: ResourceOptions,
    public readonly statusCode: number,
    public readonly headers: RestHeaders,
    public readonly isArray: boolean,
  ) {}
}

//#endregion

//#region http response
export class HttpResponse<T> extends BaseResponse<T> {
  public body: HttpBody<T>;

  constructor(
    public readonly url: string,
    public readonly method: CoreModels.HttpMethod,
    public readonly responseText: string | Blob,
    public readonly headers: RestHeaders,
    public readonly statusCode: number,
    public readonly options: ResourceOptions,
    public readonly isArray: boolean,
  ) {
    super(responseText, options, statusCode, headers, isArray);

    this.body = new HttpBody(
      url,
      method,
      headers,
      responseText,
      options,
      isArray,
    );
  }
}

export class HttpResponseError<ERROR_BODY = object> extends BaseResponse<any> {
  public readonly body: ErrorBody<ERROR_BODY>;

  constructor(
    public readonly url: string,
    public readonly method: CoreModels.HttpMethod,
    public readonly responseText: string,
    public readonly options: ResourceOptions,
    public readonly headers: RestHeaders,
    public readonly statusCode: number,
    public readonly isArray: boolean,
  ) {
    super(responseText, options, statusCode, headers, isArray);
    this.body = new ErrorBody<ERROR_BODY>(url, responseText);
  }
}

//#endregion

//#region resource strategy
export type ResourceStrategy = 'http' | 'ipc-electron' | 'js-mock';

interface ResourceOptions {
  strategy?: ResourceStrategy;
  headers?: RestHeaders;
  useArrayApiWarning?: boolean;
  defaultHeadersProfile?: keyof typeof DEFAULT_HEADERS;
  responseMapping?: {
    /**
     * Use ()=> MyEntity to avoid js circural dependencies.
     * String only when as header key value.
     */
    entity?:
      | (EncodeSchema | EncodeSchemaString)
      | { (): EncodeSchema | EncodeSchemaString }
      | string;
    /**
     * Metadata for remapping circular objects.
     * Generated from json10 packages.
     * String only when as header key value.
     */
    circular?: Circ[] | string;
  };
}
//#endregion

type BackendError = {
  msg?: string;
  stack?: string[];
  data: any;
};

//#region default headers
export const HeaderKeyContentType = 'Content-Type';
export const HeaderKeyAccept = 'Accept';

export const DEFAULT_HEADERS = {
  // JSON (most APIs)
  APPLICATION_JSON: RestHeaders.from({
    [HeaderKeyContentType]: 'application/json',
    [HeaderKeyAccept]: 'application/json',
  }),

  // JSON:API (you already have)
  APPLICATION_VND_API_JSON: RestHeaders.from({
    [HeaderKeyContentType]: 'application/vnd.api+json',
    [HeaderKeyAccept]: 'application/vnd.api+json',
  }),

  // Form URL encoded (old APIs, OAuth token endpoints)
  APPLICATION_X_WWW_FORM_URLENCODED: RestHeaders.from({
    [HeaderKeyContentType]: 'application/x-www-form-urlencoded',
    [HeaderKeyAccept]: 'application/json',
  }),

  // Multipart form-data (file uploads) — note: boundary will be set by FormData in Node
  MULTIPART_FORM_DATA: RestHeaders.from({
    [HeaderKeyContentType]: 'multipart/form-data',
    [HeaderKeyAccept]: 'application/json',
  }),

  // Plain text request/response (health checks, simple endpoints)
  TEXT_PLAIN: RestHeaders.from({
    [HeaderKeyContentType]: 'text/plain; charset=utf-8',
    [HeaderKeyAccept]: 'text/plain',
  }),

  // Accept anything (downloads, weird backends)
  ACCEPT_ANY: RestHeaders.from({
    [HeaderKeyAccept]: '*/*',
  }),

  // Binary download (still just headers; axios responseType controls actual handling)
  OCTET_STREAM: RestHeaders.from({
    [HeaderKeyAccept]: 'application/octet-stream',
  }),
} as const;
//#endregion

//#region abstract resource reponse class
export abstract class ResourceResponse<
  DATA = any,
  ERROR = any,
> implements Promise<HttpResponse<DATA> | HttpResponseError<ERROR>> {
  [Symbol.toStringTag] = 'Promise';

  private _promise?: Promise<HttpResponse<DATA>>;

  private _promiseAbort?: AbortController;

  private _observable?: Observable<HttpResponse<DATA>>;

  //#region constructor
  constructor(
    protected httpMethodName: CoreModels.HttpMethod,
    protected urlOrigin: string,
    protected urlPathname: string,
    protected options: ResourceOptions,
    protected body: DATA | DATA,
    protected urlParams: UrlParams[],
    protected axiosOptions: Ng2RestAxiosRequestConfig,
    protected isArray: boolean,
    protected headers: RestHeaders,
    protected globalInterceptors: Map<string, TaonAxiosClientInterceptor>,
    protected methodsInterceptors: Map<string, TaonAxiosClientInterceptor>,
  ) {}
  //#endregion

  // ✅ NEW: make request cancellable
  protected abstract makeRequest(
    abortSignal: AbortSignal,
  ): Promise<HttpResponse<DATA>>;

  /**
   * ✅ Explicit cancel (useful for "promise style")
   */
  public cancel(reason?: string): void {
    this._promiseAbort?.abort(reason);
  }

  /**
   * Promise API (cannot be auto-cancelled by consumer, so we expose cancel())
   */
  public get promise(): Promise<HttpResponse<DATA> | HttpResponseError<ERROR>> {
    if (!this._promise) {
      this._promiseAbort = new AbortController();
      this._promise = this.makeRequest(this._promiseAbort.signal);
    }
    return this._promise;
  }

  then<TResult1 = HttpResponse<DATA>, TResult2 = never>(
    onfulfilled?:
      | ((value: HttpResponse<DATA>) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.promise.then(onfulfilled as any, onrejected as any);
  }

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null,
  ): Promise<(HttpResponse<DATA> | HttpResponseError<ERROR>) | TResult> {
    return this.promise.catch(onrejected as any);
  }

  finally(
    onfinally?: (() => void) | null,
  ): Promise<HttpResponse<DATA> | HttpResponseError<ERROR>> {
    return this.promise.finally(onfinally as any);
  }

  /**
   * ✅ Observable owns AbortController:
   * - subscribe starts request
   * - unsubscribe aborts request
   * - shareReplay shares the same in-flight request among subscribers
   */
  get observable(): Observable<HttpResponse<DATA>> {
    if (!this._observable) {
      this._observable = new Observable<HttpResponse<DATA>>(subscriber => {
        const ac = new AbortController();

        this.makeRequest(ac.signal)
          .then(res => {
            if (res instanceof HttpResponseError) {
              subscriber.error(res);
              return;
            }
            subscriber.next(res);
            subscriber.complete();
          })
          .catch(err => subscriber.error(err));

        return () => ac.abort('rxjs-unsubscribe');
      }).pipe(shareReplay({ bufferSize: 1, refCount: true }));
    }
    return this._observable;
  }

  // -------------------------
  // Internals
  // -------------------------

  protected creatUrl(
    params: any,
    doNotSerializeParams: boolean = false,
  ): string {
    const origin = (this.urlOrigin || '').replace(/\/+$/, '');
    const path = (this.urlPathname || '').replace(/^\/+/, '');
    const endpoint = `${origin}/${path}`;
    return `${endpoint}${getParamsUrl(params, doNotSerializeParams)}`;
  }
}
//#endregion

//#region resource reponse http strategy

class ResourceResponseHttp<DATA = any, ERROR = any> extends ResourceResponse<
  DATA,
  ERROR
> {
  protected async makeRequest(
    abortSignal: AbortSignal,
  ): Promise<HttpResponse<DATA>> {
    const url = this.creatUrl(
      this.urlParams,
      !!this.axiosOptions?.doNotSerializeParams,
    );
    const method = this.httpMethodName;

    log.d(`Requesting ${method} ${url}`);

    const isFormData = CLASS.getNameFromObject(this.body) === 'FormData';
    const formData: FormData = isFormData ? (this.body as any) : void 0;

    //#region @backend
    if (formData) {
      const headersForm = formData.getHeaders();
      headersForm['Content-Length'] = formData.getLengthSync();
      for (const [key, value] of Object.entries(headersForm)) {
        this.headers.set(key, value?.toString() as string);
      }
    }
    //#endregion

    const responseType: ResponseTypeAxios =
      (this.headers.get('responsetypeaxios')?.toString() as any) || 'text';

    const headersObj = Object.fromEntries(
      Object.entries(this.headers.toJSON()).map(([k, v]) => [
        k,
        Array.isArray(v) ? v.join(',') : v,
      ]),
    );

    const axiosConfig: AxiosRequestConfig = {
      url,
      method,
      data: this.body,
      responseType,
      headers: headersObj,
      signal: abortSignal, // ✅ this is the key
      ...this.axiosOptions,
    };

    if (isFormData) {
      axiosConfig.maxBodyLength = Infinity;
    }

    try {
      const uri = new URL(url);
      const backend = new AxiosBackendHandler<any>();

      const globalInterceptors = Array.from(this.globalInterceptors.values());
      const methodInterceptors = Array.from(this.methodsInterceptors.entries())
        .filter(([key]) =>
          key.endsWith(`-${method?.toUpperCase()}-${uri.pathname}`),
        )
        .map(([_, interceptor]) => interceptor);

      const handler = buildInterceptorChain(
        [...globalInterceptors, ...methodInterceptors],
        backend,
      );
      const response = await firstValueFrom(handler.handle(axiosConfig));

      return new HttpResponse<DATA>(
        url,
        method,
        response.data,
        RestHeaders.from(response.headers as any),
        response.status,
        this.options,
        this.isArray,
      );
    } catch (catchedError: any) {
      // ✅ treat cancellation separately (nice UX)
      if (
        catchedError?.code === 'ERR_CANCELED' ||
        catchedError?.name === 'CanceledError'
      ) {
        throw new HttpResponseError<ERROR>(
          url,
          method,
          JSON.stringify({ message: 'Request canceled' }),
          this.options,
          RestHeaders.from(),
          0,
          this.isArray,
        );
      }

      //#region handle global error listener for notificaitons
      if (
        typeof catchedError === 'object' &&
        catchedError.response &&
        catchedError.response.data
      ) {
        const err = catchedError.response.data;
        const msg: string = catchedError.response.data.message || '';
        // console.log({
        //   'err.stack': err?.stack
        // })
        let stack: string[] = (err.stack || '').split('\n');

        listenErrorsSrc.next({
          msg,
          stack,
          data: catchedError.response.data,
        });
      }
      //#endregion

      const status = catchedError?.response?.status ?? 0; // ✅ FIX: you used "status" before defining it
      const data =
        catchedError?.response?.data ?? catchedError?.message ?? catchedError;

      const responseText =
        typeof data === 'string' ? data : JSON.stringify(data);

      throw new HttpResponseError<ERROR>(
        url,
        method,
        responseText,
        this.options,
        RestHeaders.from(catchedError?.response?.headers),
        status,
        this.isArray,
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

//#endregion

//#region resource namespace
export namespace Resource {
  export const globalInterceptors = new Map<
    string,
    TaonAxiosClientInterceptor
  >();
  export const methodsInterceptors = new Map<
    string,
    TaonAxiosClientInterceptor
  >();

  export const listenErrors = listenErrorsSrc.asObservable();

  export const Cookies = Cookie.Instance;

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  export function create<MODEL = any>(
    originUrl: string,
    pathnameModel: string,
    resourceOptions?: ResourceOptions,
  ) {
    return {
      model: <INTERPOLATE_ARGS = {}>(
        interpolateParams?: INTERPOLATE_ARGS,
        overrideOptions?:
          | ResourceOptions
          | { (options: ResourceOptions): ResourceOptions },
      ) => {
        const methods = <T>(
          isArray = false,
        ): {
          [method in CoreModels.HttpMethod]: (
            item?: T,
            urlParams?: UrlParams[],
            axiosOptions?: Ng2RestAxiosRequestConfig,
          ) => ResourceResponse<T>;
        } => {
          const methodsObj = {};
          for (const methodName of CoreModels.HttpMethodArr) {
            methodsObj[methodName] = (
              body?: MODEL,
              urlParams?: UrlParams[],
              axiosOptions?: Ng2RestAxiosRequestConfig,
            ) => {
              let localPathname = pathnameModel;
              if (!localPathname.startsWith('/')) {
                localPathname = `/${localPathname}`;
              }
              let localOriginUrl = originUrl;
              if (localOriginUrl.endsWith('/')) {
                localOriginUrl = localOriginUrl.replace(/\/$/, '');
              }

              let localUrl: URL = new URL(`${localOriginUrl}${localPathname}`);

              //#region validate pathname model
              const badRestRegEX = new RegExp('((\/:)[a-z]+)+', 'g');
              const matchArr = localPathname.match(badRestRegEX) || [];
              const badModelsNextToEachOther = matchArr.join();
              const atleas2DoubleDots =
                (badModelsNextToEachOther.match(new RegExp(':', 'g')) || [])
                  .length >= 2;
              if (
                atleas2DoubleDots &&
                localPathname.search(badModelsNextToEachOther) !== -1
              ) {
                throw new Error(`

Bad rest model: ${localPathname}

Do not create rest models like this:    /book/author/:bookid/:authorid
Instead use nested approach:            /book/:bookid/author/:authorid
            `);
              }
              //#endregion

              let options: ResourceOptions = resourceOptions;
              options = options || {};

              options.responseMapping = options.responseMapping || {};

              options = {
                ...options,
                ...(_.isFunction(overrideOptions)
                  ? overrideOptions(options)
                  : overrideOptions || {}),
              };

              if (interpolateParams) {
                // console.log({ interpolateParams });
                // interpolate args
                let pathNameInterpolated = interpolateParamsToUrl(
                  interpolateParams,
                  localUrl.pathname,
                );
                // console.log(
                //   `interpolated ${pathNameInterpolated}, url ${url.toString()}`,
                // );
                localUrl = new URL(
                  `${localUrl.origin}/${pathNameInterpolated}`,
                );
              }

              const headers: RestHeaders = RestHeaders.from(options.headers);

              options.strategy = options.strategy || 'http';

              options.defaultHeadersProfile =
                options.defaultHeadersProfile || 'APPLICATION_JSON';

              if (options.defaultHeadersProfile) {
                DEFAULT_HEADERS[options.defaultHeadersProfile].forEach(
                  (values, name) => {
                    values.forEach(headerValue =>
                      headers.set(name, headerValue),
                    );
                  },
                );
              }

              if (options.strategy === 'http') {
                return new ResourceResponseHttp(
                  methodName,
                  localUrl.origin,
                  localUrl.pathname,
                  options,
                  body,
                  urlParams,
                  axiosOptions,
                  isArray,
                  headers,
                  globalInterceptors,
                  methodsInterceptors,
                );
              } else if (options.strategy === 'ipc-electron') {
                // TODO later
              } else if (options.strategy === 'js-mock') {
                // TODO later
              }
            };
          }
          return methodsObj as any;
        };

        const methodsRes = methods<MODEL>();
        const methodsArrayRes = methods<MODEL[]>(true);

        const res = {
          get array() {
            return methodsArrayRes;
          },
          ...methodsRes,
        };
        return res;
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
    {
      responseMapping: {
        entity: () => ({ '': ExampleBook }),
      },
    },
  );

  const response = await rest.model({ userId: 1 }).get();

  response; // type of response should be HttpResponse

  const responseObservable = rest
    .model({ userId: 1 })
    .array.post([new ExampleBook()], [{ 'location-id': 123 }]).observable;

  const responseObservableOnlyONe = rest
    .model({ userId: 1 })
    .post(new ExampleBook(), [{ 'location-id': 123 }]).observable;

  responseObservable.subscribe(data => {
    data; // HttpResponse<ExampleBook>
  });
}
//#endregion
