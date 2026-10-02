//#region imports
import { URL } from 'url'; // @backend

import type express from 'express';
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

//#endregion

//#region constants

const log = Log.create('ng2-rest', Level.WARN, Level.ERROR);

const listenErrorsSrc = new Subject<HttpResponseError | any>();

//#endregion

export const ResponseTypeFetchHeaderKey = 'responsetypefetch';

//#region cookie && cookie jar

export interface TaonCookieJar {
  getCookieHeader(
    url: string,
  ): Promise<string | undefined> | string | undefined;

  setCookie(cookie: string, url: string): Promise<void> | void;
}

export class SimpleCookieJar implements TaonCookieJar {
  private cookies = new Map<string, Map<string, string>>();

  getCookieHeader(url: string): string | undefined {
    const hostname = new URL(url).hostname;

    const cookies = this.cookies.get(hostname);

    if (!cookies?.size) {
      return undefined;
    }

    return [...cookies.entries()]

      .map(([name, value]) => `${name}=${value}`)

      .join('; ');
  }

  setCookie(setCookieHeader: string, url: string): void {
    const hostname = new URL(url).hostname;

    const firstPart = setCookieHeader.split(';', 1)[0];

    const separatorIndex = firstPart.indexOf('=');

    if (separatorIndex === -1) {
      return;
    }

    const name = firstPart.slice(0, separatorIndex).trim();

    const value = firstPart.slice(separatorIndex + 1).trim();

    let cookies = this.cookies.get(hostname);

    if (!cookies) {
      cookies = new Map();

      this.cookies.set(hostname, cookies);
    }

    cookies.set(name, value);
  }
}

//#region @backend

let initializedCookieJar = false;
let globalFetchCookieJar: TaonCookieJar | undefined;

function registerGlobalFetchCookieJar(): void {
  if (initializedCookieJar) {
    return;
  }

  initializedCookieJar = true;
  globalFetchCookieJar = new SimpleCookieJar();
}

//#endregion

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

//#region fetch interceptors

export type FetchResponse = Response;

export interface TaonFetchRequestConfig extends RequestInit {
  url: string;
}

export interface FetchTaonHttpHandler<T = any> {
  handle(req: TaonFetchRequestConfig): Observable<FetchResponse>;
}

export interface TaonClientMiddlewareInterceptOptions<T = any> {
  req: TaonFetchRequestConfig; // <- request config only

  next: FetchTaonHttpHandler<T>;
}

export interface TaonServerMiddlewareInterceptOptions<T = any> {
  req: express.Request;
  res: express.Response;
  next: express.NextFunction;
}

export interface TaonFetchClientInterceptor<T = any> {
  intercept(
    client: TaonClientMiddlewareInterceptOptions<T>,
  ): Observable<Response>;
}

// Optional helper for passing around context (browser/client)

// === Backend handler (last in chain) ===

export class FetchBackendHandler<T = any> implements FetchTaonHttpHandler<T> {
  handle(req: TaonFetchRequestConfig): Observable<FetchResponse> {
    const { url, ...requestInit } = req;

    return from(
      (async () => {
        const headers = new Headers(requestInit.headers);

        //#region @backend
        registerGlobalFetchCookieJar();

        if (globalFetchCookieJar && requestInit.credentials !== 'omit') {
          const cookieHeader = await globalFetchCookieJar.getCookieHeader(url);

          if (cookieHeader) {
            headers.set('cookie', cookieHeader);
          }
        }
        //#endregion

        const response = await fetch(url, {
          ...requestInit,
          headers,
        });

        //#region @backend
        if (globalFetchCookieJar && requestInit.credentials !== 'omit') {
          const responseHeaders = response.headers as Headers & {
            getSetCookie?: () => string[];
          };

          const setCookies =
            typeof responseHeaders.getSetCookie === 'function'
              ? responseHeaders.getSetCookie()
              : [];

          for (const cookie of setCookies) {
            await globalFetchCookieJar.setCookie(cookie, url);
          }
        }
        //#endregion

        return response;
      })(),
    );
  }
}

// === Chain builder (request: forward order, response: reverse order) ===
export const buildInterceptorChain = <T = any>(
  globalInterceptors: Array<TaonFetchClientInterceptor<T>>,

  backend: FetchTaonHttpHandler<T>,
): FetchTaonHttpHandler<T> => {
  return globalInterceptors.reduceRight<FetchTaonHttpHandler<T>>(
    (next, interceptor) => ({
      handle: req => interceptor.intercept({ req, next }),
    }),
    backend,
  );
};

//#endregion

//#region response type fetch

export enum FetchResponseType {
  /**
   * Can be used with `Taon.Response<Blob>`.
   */
  Blob = 'blob',

  /**
   * Can be used with `Taon.Response<string>`.
   */
  Text = 'text',

  /**
   * Can be used with `Taon.Response<T>`.
   *
   * JSON response is parsed and mapped to the expected Taon response type.
   */
  Json = 'json',

  /**
   * Can be used with `Taon.Response<ArrayBuffer>`.
   */
  ArrayBuffer = 'arraybuffer',

  /**
   * Can be used with `Taon.Response<Document>`.
   *
   * Mainly useful in browser environments.
   */
  Document = 'document',

  /**
   * Can be used with `Taon.Response<ReadableStream<Uint8Array>>`.
   *
   * Useful for large files, videos, downloads, and other responses
   * that should not be fully buffered in memory.
   */
  Stream = 'stream',

  /**
   * Can be used with `Taon.Response<FormData>`.
   */
  FormData = 'formdata',
}

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
    if (!headers) {
      return this;
    }

    if (headers instanceof RestHeaders) {
      headers.forEach((values, name) => {
        values.forEach(value => this.append(name, value));
      });

      return this;
    }

    if (headers instanceof Headers) {
      headers.forEach((value, name) => {
        this.append(name, value);
      });

      return this;
    }

    Object.entries(headers).forEach(([name, value]) => {
      this.delete(name);

      const values = Array.isArray(value) ? value : [value];

      values.forEach(value => this.append(name, value));
    });

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
    const values = Array.isArray(value) ? [...value] : [value];

    this._headers.set(name.toLowerCase(), values);

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
  toJSON(): Record<string, string[]> {
    const result: Record<string, string[]> = {};

    this._headers.forEach((values, name) => {
      result[this._normalizedNames.get(name)] = [...values];
    });

    return result;
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
    private readonly response: FetchResponse,
    public readonly responseText: string | undefined,
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

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public get native() {
    return {
      response: this.response.clone(),
      stream: () => this.response.clone().body,
      blob: () => this.response.clone().blob(),
      arrayBuffer: () => this.response.clone().arrayBuffer(),
      bytes: () => this.response.clone().bytes(),
      formData: () => this.response.clone().formData(),
      json: () => this.response.clone().json(),
      text: () => this.response.clone().text(),
    };
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
    private readonly responseText: string | undefined,
  ) {
    super();
  }

  public get json(): T {
    return this.toJSON(this.responseText, { parsingError: true }) as any;
  }

  public get text(): string | undefined {
    return this.responseText;
  }
}

//#endregion

//#region http response
export class HttpResponse<T> {
  public body: HttpBody<T>;

  constructor(
    public readonly url: string,
    public readonly method: CoreModels.HttpMethod,
    public readonly response: FetchResponse,
    public readonly responseText: string | undefined,
    public readonly headers: RestHeaders,
    public readonly statusCode: number,
    public readonly options: ResourceOptions,
    public readonly isArray: boolean,
  ) {
    this.body = new HttpBody(
      url,
      method,
      headers,
      response,
      responseText,
      options,
      isArray,
    );
  }
}

export class HttpResponseError<ERROR_BODY = object> {
  public readonly body: ErrorBody<ERROR_BODY>;

  constructor(
    public readonly url: string,
    public readonly method: CoreModels.HttpMethod,
    public readonly response: FetchResponse,
    public readonly responseText: string | undefined,
    public readonly options: ResourceOptions,
    public readonly headers: RestHeaders,
    public readonly statusCode: number,
    public readonly isArray: boolean,
  ) {
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

  // Binary download (headers only; Taon response handling controls body consumption)
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
    protected body: DATA | DATA[],
    protected urlParams: UrlParams[],
    protected fetchOptions: Ng2RestFetchRequestConfig,
    protected isArray: boolean,
    protected headers: RestHeaders,
    protected globalInterceptors: Map<string, TaonFetchClientInterceptor>,
    protected methodsInterceptors: Map<string, TaonFetchClientInterceptor>,
  ) {}

  //#endregion

  // ✅ NEW: make request cancellable
  protected abstract makeRequest(
    abortSignal: AbortSignal,
  ): Promise<HttpResponse<DATA>>;

  private async makeRequestWithGlobalErrorHandling(
    abortSignal: AbortSignal,
  ): Promise<HttpResponse<DATA>> {
    try {
      return await this.makeRequest(abortSignal);
    } catch (error) {
      // if (error instanceof HttpResponseError) {
      listenErrorsSrc.next(error as any);
      // }

      throw error;
    }
  }

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

      this._promise = this.makeRequestWithGlobalErrorHandling(
        this._promiseAbort.signal,
      );
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

        this.makeRequestWithGlobalErrorHandling(ac.signal)
          .then(res => {
            subscriber.next(res);
            subscriber.complete();
          })
          .catch(err => {
            subscriber.error(err);
          });

        return () => ac.abort('rxjs-unsubscribe');
      }).pipe(
        shareReplay({
          bufferSize: 1,
          refCount: true,
        }),
      );
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
    //#region @backend

    registerGlobalFetchCookieJar();

    //#endregion
    const url = this.creatUrl(
      this.urlParams,

      !!this.fetchOptions?.doNotSerializeParams,
    );

    const method = this.httpMethodName;

    log.d(`Requesting ${method} ${url}`);

    const isFormData = CLASS.getNameFromObject(this.body) === 'FormData';

    if (isFormData) {
      // Native fetch must generate multipart/form-data boundary itself.
      this.headers.delete(HeaderKeyContentType);
    }

    let requestBody: BodyInit | null | undefined = this.body as any;
    const requestContentType = this.headers.get(HeaderKeyContentType) || '';

    if (
      requestBody !== undefined &&
      requestBody !== null &&
      !isFormData &&
      requestContentType.includes('application/json') &&
      typeof requestBody !== 'string'
    ) {
      requestBody = JSON.stringify(requestBody);
    }

    const responseType: FetchResponseType =
      (this.headers.get(ResponseTypeFetchHeaderKey)?.toString() as any) ||
      'text';

    const headersObj = Object.fromEntries(
      Object.entries(this.headers.toJSON()).map(([k, v]) => [
        k,
        Array.isArray(v) ? v.join(',') : v,
      ]),
    );

    const { doNotSerializeParams: _doNotSerializeParams, ...requestInit } =
      this.fetchOptions || {};

    const methodUpperCase = method.toUpperCase();

    if (methodUpperCase === 'GET' || methodUpperCase === 'HEAD') {
      if (_.isObject(requestBody) && Object.keys(requestBody).length > 0) {
        throw new Error(
          `[ng2-rest] Don't use Body params for GET,HEAD requests.`,
        );
      }
      requestBody = undefined;
    }

    // console.log(`[${method}] url ${url}`);
    // Helpers.log({ requestBody });

    const fetchConfig: TaonFetchRequestConfig = {
      url,
      method,
      body: requestBody,
      headers: headersObj,
      signal: abortSignal,
      credentials: 'include',
      ...requestInit,
    };

    let response: FetchResponse;

    try {
      const uri = new URL(url);
      const backend = new FetchBackendHandler<any>();

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
      response = await firstValueFrom(handler.handle(fetchConfig));

      if (!response.ok) {
        const responseText = await response.text();

        throw new HttpResponseError<ERROR>(
          url,
          method,
          response,
          responseText,
          this.options,
          RestHeaders.from(response.headers as any),
          response.status,
          this.isArray,
        );
      }

      //       console.log(`** responseType=(${responseType})
      // ** url ${url}
      // ** text=<<<${await response.clone().text()}>>>`)

      return new HttpResponse<DATA>(
        url,
        method,
        response,
        responseType === 'json' || responseType === 'text' || !responseType
          ? await response.text()
          : void 0,
        RestHeaders.from(response.headers as any),
        response.status,
        this.options,
        this.isArray,
      );
    } catch (catchedError: any) {
      if (catchedError instanceof HttpResponseError) {
        throw catchedError;
      }

      if (catchedError?.name === 'AbortError') {
        throw new HttpResponseError<ERROR>(
          url,
          method,
          response,
          JSON.stringify({ message: 'Request canceled' }),
          this.options,
          RestHeaders.from(),
          0,
          this.isArray,
        );
      }

      const status = catchedError?.response?.status ?? 0; // ✅ FIX: you used "status" before defining it
      const responseText =
        typeof catchedError?.message === 'string'
          ? catchedError.message
          : JSON.stringify(catchedError);

      throw new HttpResponseError<ERROR>(
        url,
        method,
        response,
        responseText,
        this.options,
        RestHeaders.from(),
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

export type Ng2RestFetchRequestConfig = {
  doNotSerializeParams?: boolean;
} & RequestInit;

//#endregion

//#region resource namespace
export namespace Resource {
  export const globalInterceptors = new Map<
    string,
    TaonFetchClientInterceptor
  >();

  export const methodsInterceptors = new Map<
    string,
    TaonFetchClientInterceptor
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
            fetchOptions?: Ng2RestFetchRequestConfig,
          ) => ResourceResponse<T>;
        } => {
          const methodsObj = {};
          for (const methodName of CoreModels.HttpMethodArr) {
            methodsObj[methodName] = (
              body?: MODEL,
              urlParams?: UrlParams[],
              fetchOptions?: Ng2RestFetchRequestConfig,
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
                  fetchOptions,
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

// class ExampleBook {
//   title: string;
// }

// async function example() {
//   const rest = Resource.create<ExampleBook>(
//     'http://my-website.pl',
//     'api/v3/user/:userId',
//     {
//       responseMapping: {
//         entity: () => ({ '': ExampleBook }),
//       },
//     },
//   );

//   const response = await rest.model({ userId: 1 }).get();

//   response; // type of response should be HttpResponse

//   const responseObservable = rest
//     .model({ userId: 1 })
//     .array.post([new ExampleBook()], [{ 'location-id': 123 }]).observable;

//   const responseObservableOnlyONe = rest
//     .model({ userId: 1 })
//     .post(new ExampleBook(), [{ 'location-id': 123 }]).observable;

//   responseObservable.subscribe(data => {
//     data.body.json[1].title
//     data; // HttpResponse<ExampleBook>
//   });
// }
//#endregion
