import { Morphi } from 'morphi'


@Morphi.Controller()
class TestController {

  @Morphi.Http.GET()
  hello(@Morphi.Http.Param.Query('config') config?: any): Morphi.Response<string> {
    //#region @backendFunc
    return async () => {
      return 'this is cool haha !'
    }
    //#endregion
  }

}

const host = 'http://localhost:3000'
const controllers: Morphi.Base.Controller<any>[] = [TestController as any];

const start = async () => {

  //#region @backend
  const config = {
    type: "sqlite",
    database: 'tmp-db.sqlite',
    synchronize: true,
    dropSchema: true,
    logging: false
  } as any;
  //#endregion

  Morphi.init({
    host,
    controllers,
    //#region @backend
    config
    //#endregion
  })



}


export default start;


if (Morphi.IsBrowser) {

  (async () => {
    start()
    const body: HTMLElement = document.getElementsByTagName('body')[0];
    let test = new TestController()
    test.hello({ siema: 'siema' }).received.observable.subscribe(dataFromBackend => {
      body.innerHTML = `<h1>${dataFromBackend.body.text}</h1>`;
    });

    const helloData = await test.hello().received
    console.log('Realtime hsould not be inited', helloData.body.text)
  })()
}
