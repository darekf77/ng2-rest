import {
  Component, NgZone,
  OnInit, OnDestroy
} from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Preview, PreviewBase } from '../base-preview';

declare const require: any;

import { Subscription } from 'rxjs/Subscription';
import { Resource, CLASSNAME } from 'ng2-rest';

@CLASSNAME('Author')
class Author {
  age: number;
  user: User;
  friends: User[];
}

@CLASSNAME('Book')
class Book {
  title: string;
  author: Author;
}

@CLASSNAME('User')
class User {
  name: string;
  friend: Author;
  books: Book[];
}

// initEntities([Author, Book, User]);


const rest = Resource.create('https://demo9781896.mockable.io', 'users', { '_': User });
const rest2 = Resource.create('https://demo9781896.mockable.io/', 'author/:authorid/book/:bookid');
const rest3 = Resource.create('http://localhost:3000', 'users');



@Component({
  selector: 'app-demo-ng2-rest-8',
  templateUrl: './demo2.component.html'
})
export class Demo2Component extends PreviewBase implements OnDestroy {

  constructor(private snackBar: MatSnackBar, zone: NgZone) {
    super(); this.preview(); // ###

    rest.model({
      test: 11
    }).array.get().observable.subscribe(data => {
      console.log(data.body.json);
      // console.log(JSON.stringify(data.headers.toJSON()));
      this.users = data.body.json as any;
    }, err => {
      console.log(err)
    });

    rest3.model().array.get().observable.subscribe(data => {
      console.log(data.body.json);
      console.log(JSON.stringify(data.headers.toJSON()));
      // this.users = data.body.json as any;
    });

    rest3.model().array.get().then(data => {
      console.log(data.body.json);
      console.log(JSON.stringify(data.headers.toJSON()));
      // this.users = data.body.json as any;
    }, err => {
      console.log(err)
    });

    rest2.model({ authorid: 1, bookid: 2 }).get().observable.subscribe(data => {

      console.log(data.body.json);
    });

  }

  private replaydata;


  handlers: Subscription[] = [];
  users = [];
  public replay() {
    rest2.replay('GET');
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
    this.previews.push(new Preview('demo2.component.ts', 'typescript', require('!raw-loader!./demo2.component.ts'))); //###
    this.previews.push(new Preview('demo2.component.html', 'html', require('!raw-loader!./demo2.component.html'))); //###
  } //###


}
