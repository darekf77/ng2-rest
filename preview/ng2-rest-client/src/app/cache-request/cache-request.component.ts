import { Component, OnInit } from '@angular/core';
import { Resource, RequestCache, } from 'ng2-rest';
import { Log, Level } from 'ng2-logger';

const rest = Resource.create('http://localhost:3000', 'projects');
const log = Log.create('cache cmp')

@Component({
  selector: 'app-cache-request',
  templateUrl: './cache-request.component.html',
  styleUrls: ['./cache-request.component.scss']
})
export class CacheRequestComponent implements OnInit {

  constructor() { }

  async ngOnInit() {

  }

  cacheHandler: RequestCache;

  clearCache() {
    const existedCacheHandler = rest.model().array.get().cache;
    if (existedCacheHandler) {
      existedCacheHandler.remove();
      this.cacheHandler = void 0;
    }
  }

  async getModels() {
    const existedCacheHandler = rest.model().array.get().cache;
    if (existedCacheHandler) {
      log.i('CACHE FOUNDED !')
      this.cacheHandler = existedCacheHandler;
    }
    if (this.cacheHandler && this.cacheHandler.containsCache) {
      this.show(this.cacheHandler.response);
    } else {
      const models = await rest.model().array.get();
      if (!this.cacheHandler) {
        this.cacheHandler = models.cache.store();
      }
      this.show(models);
    }
  }

  counter = 1;

  show(models) {
    log.i('before request', models);
    models.body.json[0] = ++this.counter;
    log.i('after request', models);
  }

  replay() {
    rest.replay('get')
  }

}
