import { Component, OnInit } from '@angular/core';
import { Resource } from 'ng2-rest';
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
    rest.model().array.get().observable.subscribe(models => {
      log.i('models', models);
    });

  }

  replay() {
    rest.replay('get')
  }

}
