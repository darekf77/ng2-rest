import {
  Component, NgZone,
  OnInit, OnDestroy
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Preview, PreviewBase } from '../base-preview';
import { _ } from 'tnp-core';
declare const require: any;

import { CLASS } from 'typescript-class-helpers';
import { Subscription } from 'rxjs';
import { Resource } from 'ng2-rest';

@CLASS.NAME('Author')
class Author {
  age: number;
  user: User;
  friends: User[];
}

@CLASS.NAME('Book')
class Book {
  title: string;
  author: Author;
}

@CLASS.NAME('User')
class User {
  name: string;
  friend: Author;
  books: Book[];
}

// initEntities([Author, Book, User]);

const port = ENV.workspace.projects.find(p => p.name === 'ng2-rest-server').port;

// const rest = Resource.create('https://demo9781896.mockable.io', 'users', { '_': User });
// const rest2 = Resource.create('https://demo9781896.mockable.io/', 'author/:authorid/book/:bookid');
const rest3 = Resource.create(`http://localhost:${port}`, 'users');



@Component({
  selector: 'app-demo-ng2-rest-8',
  templateUrl: './demo2.component.html'
})
export class Demo2Component extends PreviewBase implements OnDestroy {

  constructor(private snackBar: MatSnackBar, zone: NgZone) {
    super(); this.preview(); // ###

    // rest.model({
    //   test: 11
    // }).array.get().observable.subscribe(data => {
    //   console.log(data.body.json);
    //   // console.log(JSON.stringify(data.headers.toJSON()));
    //   this.users = data.body.json as any;
    // }, err => {
    //   console.log(err);
    // });

    rest3.model().array.get().observable.subscribe(data => {
      console.log(data.body.json);
      console.log(JSON.stringify(data.headers.toJSON()));
      // this.users = data.body.json as any;
    });

    rest3.model().array.get().observable.subscribe(data => {
      console.log(data.body.json);
      console.log(JSON.stringify(data.headers.toJSON()));
      // this.users = data.body.json as any;
    }, err => {
      console.log(err);
    });

    // rest2.model({ authorid: 1, bookid: 2 }).get().observable.subscribe(data => {

    //   console.log(data.body.json);
    // });

  }

  private replaydata;


  handlers: Subscription[] = [];
  users = [];
  public replay() {
    rest3.replay('get');
  }

  public ngOnDestroy() {
    this.handlers.forEach(h => h.unsubscribe());
  }

  public getJSONP() {
    // const h = rest.model().jsonp().toPromise().subscribe(data => {
    //   this.users = data as any;
    // });
    // this.handlers.push(h as any);

  }

  preview() { //###
    const componentTs = require('!raw-loader!./demo2.component.ts');//###
    const componentHtml = require('!raw-loader!./demo2.component.html');//###

    this.previews.push(new Preview('demo2.component.ts', 'typescript', _.isObject(componentTs) ? componentTs.default : componentTs)); //###
    this.previews.push(new Preview('demo2.component.html', 'html', _.isObject(componentHtml) ? componentHtml.default : componentHtml)); //###
  } //###


}
