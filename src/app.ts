//#region @notForNpm

//#region @backend
import * as express from 'express';
import * as  cors from 'cors';
//#endregion
import { firstValueFrom } from 'rxjs';
//#region @browser
import { NgModule, NgZone } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Resource } from './lib/resource.service';

const rest = Resource.create('http://localhost:3000', 'hello')

@Component({
  selector: 'app-ng2-rest',
  template: `hello from ng2-rest
  <br>
{{ data }}

  `
})
export class Ng2RestComponent implements OnInit {
  constructor(
    private zone: NgZone
  ) { }
  data: string;
  async ngOnInit() {
    Resource.initAngularNgZone(this.zone);
    const data = await (await firstValueFrom(rest.model().get().observable)).body.text;
    this.data = data;
  }
}

@NgModule({
  imports: [],
  exports: [Ng2RestComponent],
  declarations: [Ng2RestComponent],
  providers: [],
})
export class Ng2RestModule { }
//#endregion



//#region @backend



async function start(port: number) {

  const app = express();
  app.use(cors());

  app.get(`/hello`, (req, res) => {
    res.send('heelo');
  });

  app.listen(port, () => {
    console.log(`app is listening on port ${port}`)
  })
}

export default start;

//#endregion

//#endregion
