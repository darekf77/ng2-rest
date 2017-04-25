import {
  Component, NgZone,
  OnInit, OnDestroy
} from '@angular/core';
import { MdSnackBar } from '@angular/material';
import { Preview, PreviewBase } from '../base-preview';

import { Subscription } from 'rxjs';
import { Resource, MockingMode } from '../../../../src';//### import { Resource, MockingMode } from 'ng2-rest'; ###

const rest = Resource.create('http://vinod.co/rest/contactsjp.php');

import { DatabaseService2 } from './database.service';




@Component({
  selector: 'demo2',
  templateUrl: './demo2.component.html'
})
export class Demo2Component extends PreviewBase implements OnDestroy {

  constructor(public db: DatabaseService2, private snackBar: MdSnackBar, zone: NgZone) {
    super(); this.preview() //###
    Resource.mockingMode.setMocksOnly();
    Resource.initNgZone(zone as any);
  }
  handlers: Subscription[] = [];
  users = [];

  public getJSONP() {
    Resource.mockingMode.setBackendOnly()
    let h = rest.model().jsonp().subscribe(data => {
      this.users = data as any;
    })
    this.handlers.push(h);
  }

  getData() {
    Resource.Headers.request.set('Authorizationiaa', 'Basic d2ViX2FwcDo=');
    let h = this.db.models.users.subscribe(data => {
      this.users = data;
    });
    this.handlers.push(h);
  }

  public ngOnDestroy() {
    this.handlers.forEach(h => h.unsubscribe())
  }










  get checked() {
    return Resource.mockingMode.isMockOnlyMode();
  }
  toogleMock() {
    if (Resource.mockingMode.isMockOnlyMode()) {
      Resource.mockingMode.setBackendOnly();
    } else {
      Resource.mockingMode.setMocksOnly();
    }
  }

  

  preview() { //###
    this.previews.push(new Preview('database.service.ts', 'typescript', require('!raw-loader!./database.service.ts'))); //###
    this.previews.push(new Preview('data.json', 'json', require('!raw-loader!./data.json')));//###
    this.previews.push(new Preview('demo2.component.ts', 'typescript', require('!raw-loader!./demo2.component.ts'))); //###
    this.previews.push(new Preview('demo2.component.html', 'html', require('!raw-loader!./demo2.component.html'))); //###
    this.previews.push(new Preview('mock.controller.ts', 'typescript', require('!raw-loader!./mock.controller.ts'))); //###
    this.previews.push(new Preview('user.ts', 'typescript', require('!raw-loader!./user.ts'))); //###
  } //###


}
