import {
  Component, NgZone,
  OnInit, OnDestroy
} from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Preview, PreviewBase } from '../base-preview';

declare const require: any;

import { Subscription } from 'rxjs/Subscription';
import { Resource } from 'ng2-rest';
const rest = Resource.create('https://demo9781896.mockable.io', 'users');
const rest2 = Resource.create('https://demo9781896.mockable.io/', 'author/:authorid/book/:bookid');



@Component({
  selector: 'app-demo-ng2-rest-8',
  templateUrl: './demo2.component.html'
})
export class Demo2Component extends PreviewBase implements OnDestroy {

  constructor(private snackBar: MatSnackBar, zone: NgZone) {
    super(); this.preview(); // ###

    rest.model().array.get().subscribe(data => {
      this.users = data as any;
    });

    rest2.model({ authorid: 1, bookid: 2 }).get().subscribe(data => {
      console.log(data);
    });

  }
  handlers: Subscription[] = [];
  users = [];

  public ngOnDestroy() {
    this.handlers.forEach(h => h.unsubscribe());
  }

  public getJSONP() {
    const h = rest.model().jsonp().subscribe(data => {
      this.users = data as any;
    });
    this.handlers.push(h as any);
  }

  preview() { //###
    this.previews.push(new Preview('demo2.component.ts', 'typescript', require('!raw-loader!./demo2.component.ts'))); //###
    this.previews.push(new Preview('demo2.component.html', 'html', require('!raw-loader!./demo2.component.html'))); //###
  } //###


}
