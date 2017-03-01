import {
  Component,
  OnInit, OnDestroy
} from '@angular/core';
import { MdSnackBar } from '@angular/material';
import { Preview } from '../base-preview';

import { Subscription } from 'rxjs';
import { Resource, MockingMode } from '../../../../src';

import { DatabaseService2 } from './database.service';

@Component({
  selector: 'demo2',
  templateUrl: './demo2.component.html'
})
export class Demo2Component implements OnInit, OnDestroy {

  constructor(public db: DatabaseService2, private snackBar: MdSnackBar) {
    Resource.mockingMode.setMocksOnly();
  }

  handlers: Subscription[] = [];

  users = [];

  public ngOnInit() {

  }

  get checked() {
    return Resource.mockingMode.isMockOnlyMode();
  }

  getData() {
    this.handlers.push(this.db.models.users.subscribe(data => {
      this.users = data;
    }));
  }

  toogleMock() {
    if (Resource.mockingMode.isMockOnlyMode()) {
      Resource.mockingMode.setBackendOnly();
    } else {
      Resource.mockingMode.setMocksOnly();
    }
  }

  public ngOnDestroy() {
    this.handlers.forEach(h => h.unsubscribe())
  }




  previews: Preview[] = [
    { content: require('!raw-loader!./database.service.ts'), name: 'database.service.ts', lang: 'typescript' },
    { content: require('!raw-loader!./data.json'), name: 'data.json', lang: 'json' },
    { content: require('!raw-loader!./demo2.component.ts'), name: 'demo2.component..ts', lang: 'typescript' },
    { content: require('!raw-loader!./demo2.component.html'), name: 'demo2.component.html', lang: 'html' },
  ]


}
