// @ts-nocheck
//#region @notForNpm

//#region @backend
import * as express from 'express';
import * as cors from 'cors';
//#endregion
import {
  catchError,
  debounceTime,
  defer,
  EMPTY,
  exhaustMap,
  firstValueFrom,
  fromEvent,
  map,
  Observable,
  switchMap,
  tap,
} from 'rxjs';

export type KeyboardEventType = KeyboardEvent & { target: HTMLButtonElement };

// @browserLine
import { ElementRef, NgModule, ViewChild } from '@angular/core';
// @browserLine
import { Component, OnInit } from '@angular/core';

const port = 3001;

//#region @browser
import { Resource } from './lib/resource.service';

const rest = Resource.create(`http://localhost:${port}`, 'hello');

// const rest2 = Resource.create(`http://localhost:${3333}`, '/api/hamsterByName/:name')

@Component({
  selector: 'app-ng2-rest',
  template: `hello from ng2-rest
    <br />
    {{ data }}
    search:
    <input
      #search
      placeholder="switch map testing" />
    <br />
    exhaust result:
    <input
      #exhaust
      placeholder="exhause map testing" /> `,
})
export class Ng2RestComponent implements OnInit {
  @ViewChild('search', { static: true }) search: ElementRef<HTMLButtonElement>;
  @ViewChild('exhaust', { static: true })
  exhaust: ElementRef<HTMLButtonElement>;

  searchInputChange$ = defer(() =>
    fromEvent<KeyboardEventType>(this.search?.nativeElement as any, 'keyup'),
  ).pipe(
    map(c => c.target.value),
    // debounceTime(500),
    // distinctUntilChanged(),
    // share(),
  );

  exhaustInputChange$ = defer(() =>
    fromEvent<KeyboardEventType>(this.exhaust?.nativeElement as any, 'keyup'),
  ).pipe(
    map(c => c.target.value),
    // debounceTime(500),
    // distinctUntilChanged(),
    // share(),
  );

  data: string;
  async ngOnInit() {
    const data = await (
      await firstValueFrom(rest.model().get().observable)
    ).body.text;
    this.data = data;

    this.searchInputChange$
      .pipe(
        tap(v => {
          console.log('pinging switchMap', v);
        }),
        switchMap(v => {
          return rest
            .model()
            .get([{ delay: true }])
            .observable.pipe(
              catchError(err => {
                return EMPTY;
              }),
            );
        }),
        // map(r => r?.body?.json as any)
      )
      .subscribe();

    this.exhaustInputChange$
      .pipe(
        exhaustMap(v => {
          return rest
            .model()
            .get([{ delay: true }])
            .observable.pipe(
              catchError(err => {
                return EMPTY;
              }),
            );
        }),
        tap(v => {
          console.log('done exhause', v);
        }),
        // map(r => r?.body?.json as any)
      )
      .subscribe();

    Resource.listenSuccessOperations.subscribe(a => {
      console.log('succees');
    });
  }
}

@NgModule({
  imports: [],
  exports: [Ng2RestComponent],
  declarations: [Ng2RestComponent],
  providers: [],
})
export class Ng2RestModule {}
//#endregion

//#region @backend

async function start() {
  const http = require('http');

  const app = express();
  app.use(cors());

  app.get(`/hello`, (req, res) => {
    // console.log(req.params)
    // console.log(req.query)

    // req.on('close', function () {
    //   console.log('user aborted');
    //   req['isCanceled'] = true;
    //   res.end();
    //   // code to handle connection abort
    // });

    if (req.query['delay'] === 'true') {
      setTimeout(() => {
        // if (req['isCanceled']) {
        //   res.sendStatus(400);
        // } else {
        res.send('heelo delay');
        // }
      }, 1000);
    } else {
      // if (req['isCanceled']) {
      //   res.sendStatus(400);
      // } else {
      res.send('heelo');
      // }
    }
  });

  app.listen(port, () => {
    console.log(`app is listening on port ${port}`);
  });
}

export default start;

//#endregion

//#endregion
