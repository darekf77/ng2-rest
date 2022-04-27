//#region @notForNpm

//#region @backend
import * as express from 'express';
import * as  cors from 'cors';
//#endregion
import { firstValueFrom } from 'rxjs';

// @browserLine
import { NgModule, NgZone } from '@angular/core';
// @browserLine
import { Component, OnInit } from '@angular/core';

const port = 3001;

//#region @browser
import { Resource } from './lib/resource.service';



const rest = Resource.create(`http://localhost:${port}`, 'hello')

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



async function start() {

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
