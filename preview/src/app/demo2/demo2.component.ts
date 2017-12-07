import {
  Component, NgZone,
  OnInit, OnDestroy
} from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Preview, PreviewBase } from '../base-preview';

declare const require: any;

import { Subscription } from 'rxjs';
import { Resource } from '../../../../src'; // ###import { Resource } from 'ng2-rest';###
const rest = Resource.create('https://demo9781896.mockable.io/', 'users');



@Component({
  selector: 'demo2',
  templateUrl: './demo2.component.html'
})
export class Demo2Component extends PreviewBase implements OnDestroy {

  constructor(private snackBar: MatSnackBar, zone: NgZone) {
    super(); this.preview() // ###
    // Resource.mockingMode.setMocksOnly();
    // Resource.initNgZone(zone as any);
  }
  handlers: Subscription[] = [];
  users = [];

  public ngOnDestroy() {
    this.handlers.forEach(h => h.unsubscribe());
  }

  preview() { //###
    this.previews.push(new Preview('demo2.component.ts', 'typescript', require('!raw-loader!./demo2.component.ts'))); //###
    this.previews.push(new Preview('demo2.component.html', 'html', require('!raw-loader!./demo2.component.html'))); //###
  } //###


}
