import * as _ from 'lodash';
import { Models } from './models';


export class RequestCache {

  private static cached: RequestCache[] = [];

  public static findBy(sourceRequest: Models.HandleResultSourceRequestOptions) {
    return RequestCache.cached.find(c => {
      const a = c.response.sourceRequest;
      const b = sourceRequest;
      return (
        a.isArray === b.isArray &&
        a.url === b.url &&
        a.method === b.method &&
        a.body === b.body
      )
    });
  }


  constructor(
    public response: Models.HttpResponse<any>
  ) {

  }

  get containsCache() {
    return RequestCache.cached.includes(this);
  }


  store() {
    if (!this.containsCache) {
      RequestCache.cached.push(this);
    } else {
      console.log('already stored');
    }
  }

  remove() {
    const index = RequestCache.cached.indexOf(this);
    if (index !== -1) {
      RequestCache.cached.splice(index, 1);
    } else {
      console.log('already removed');
    }
  }

}
