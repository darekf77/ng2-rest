import { _, UtilsOs } from 'tnp-core/src';
import { Models } from './models';
import { Log, Level } from 'ng2-logger/src';
import { Helpers } from 'tnp-core/src';
import { RestHeaders } from './rest-headers';
// const log = Log.create('request-cache', Level.__NOTHING);

/**
 * @deprecated
 * there is Cache API for that
 */
export class RequestCache {
  static readonly LOCAL_STORAGE_KEY = 'ng2restrequestcache';

  private static cached: RequestCache[] = [];
  private static isRestoredFromLocalStorage = false;

  private static restoreFromLocalStorage() {
    if (UtilsOs.isSSRMode) {
      return;
    }
    if (Helpers.isNode) {
      return;
    }
    if (!RequestCache.isRestoredFromLocalStorage) {
      RequestCache.isRestoredFromLocalStorage = true;
      const data = localStorage.getItem(RequestCache.LOCAL_STORAGE_KEY);
      let requests: RequestCache[] = [];
      if (data) {
        try {
          requests = JSON.parse(data) as RequestCache[];
        } catch (error) {}
        const restored = requests.map(r => {
          let {
            sourceRequest,
            responseText,
            body,
            headers,
            circular,
            entity,
            isArray,
            cookies,
            statusCode,
          } = r.response;
          r.response = new Models.HttpResponse(
            sourceRequest,
            responseText,
            RestHeaders.from(headers),
            statusCode,
            entity,
            circular,
            -1, // jobid from local storage TODO
            isArray,
          );
          r = new RequestCache(r.response);
          r.response.rq = r;

          return r;
        });
        // log.i('RESTORED FROM LOCAL STORAGE', restored);
        RequestCache.cached = restored;
      }
    }
  }

  public static findBy(sourceRequest: Models.HandleResultSourceRequestOptions) {
    if (UtilsOs.isSSRMode) {
      return;
    }
    // log.i('findby', sourceRequest);
    // log.i('RequestCache.cached', RequestCache.cached);
    RequestCache.restoreFromLocalStorage();
    return RequestCache.cached.find(c => {
      const a = c.response.sourceRequest;
      const b = sourceRequest;
      return (
        a.isArray === b.isArray &&
        a.url === b.url &&
        a.method === b.method &&
        a.body === b.body
      );
    });
  }

  constructor(public response: Models.HttpResponse<any>) {}

  get containsCache() {
    RequestCache.restoreFromLocalStorage();
    return RequestCache.cached.includes(this);
  }

  private persistsInLocalStorage() {
    if (UtilsOs.isSSRMode) {
      return;
    }
    localStorage.setItem(
      RequestCache.LOCAL_STORAGE_KEY,
      JSON.stringify(
        RequestCache.cached.map(r => {
          return {
            response: {
              sourceRequest: r.response.sourceRequest,
              responseText: r.response.responseText,
              headers: r.response.headers,
              statusCode: r.response.statusCode,
              entity: r.response.entity,
              circular: r.response.circular,
              isArray: r.response.isArray,
            } as Models.HttpResponse<any>,
          };
        }),
      ),
    );
  }

  store() {
    if (UtilsOs.isSSRMode) {
      return;
    }
    RequestCache.restoreFromLocalStorage();
    if (!this.containsCache) {
      RequestCache.cached.push(this);
      this.persistsInLocalStorage();
    } else {
      console.log('already stored');
    }
    return this;
  }

  remove() {
    if (UtilsOs.isSSRMode) {
      return;
    }
    RequestCache.restoreFromLocalStorage();
    const index = RequestCache.cached.indexOf(this);
    if (index !== -1) {
      RequestCache.cached.splice(index, 1);
      this.persistsInLocalStorage();
    } else {
      console.log('already removed');
    }
  }
}
