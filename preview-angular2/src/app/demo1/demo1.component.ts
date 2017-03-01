import {
  Component,
  OnInit, OnDestroy
} from '@angular/core';
import { MdSnackBar } from '@angular/material';
import { Preview } from '../base-preview';
import { SimpleResource } from '../../../../src';

import { DatabaseService } from './database.service';


@Component({
  selector: 'demo1',
  templateUrl: './demo1.component.html'
})
export class Demo1Component implements OnInit, OnDestroy {

  constructor(public db: DatabaseService, private snackBar: MdSnackBar) {
    SimpleResource.mockingMode.setMocksOnly();
  }

  users = [];

  public ngOnInit() {

    this.db.users.mock.data = require('!raw-loader!./data.json');
    this.db.users.mock.controller = (r) => {
      return { data: r.data }
    }
  }

  get checked() {
    return SimpleResource.mockingMode.isMockOnlyMode()
  }

  toogleMock() {
    if (SimpleResource.mockingMode.isMockOnlyMode()) {
      SimpleResource.mockingMode.setBackendOnly();
    } else {
      SimpleResource.mockingMode.setMocksOnly();
    }
  }


  async getData() {
    try {
      let users = await this.db.users.model().query();
      if (users) {
        this.users = users;
      }
      if (this.snackBar._openedSnackBarRef) this.snackBar._openedSnackBarRef.dismiss()
    } catch (e) {
      this.snackBar.open(e, 'Error', {
        duration: 3500,
      })
    }
  }

  public ngOnDestroy() {
    this.db.users.destroy();
  }




  previews: Preview[] = [
    { content: require('!raw-loader!./database.service.ts'), name: 'database.service..ts', lang: 'typescript' },
    { content: require('!raw-loader!./data.json'), name: 'data.json', lang: 'json' },
    { content: require('!raw-loader!./demo1.component.ts'), name: 'demo1.component..ts', lang: 'typescript' },
    { content: require('!raw-loader!./demo1.component.html'), name: 'demo1.component.html', lang: 'html' },
  ]


}
