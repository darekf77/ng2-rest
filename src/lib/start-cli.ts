import { Resource } from './ng2-rest';

export async function startCli(
  argsv: string[],
  filename: string,
): Promise<void> {
  //#region @backendFunc
  console.log('Hello from cli');

  const arrAPiBad = Resource.create(
    'https://api.restful-api.dev',
    '/user/:user/:author',
  );

  const arrRest = Resource.create('https://api.restful-api.dev', '/objects');
  const objSingle = Resource.create(
    'https://api.restful-api.dev',
    '/objects/:id',
  );

  const respArr = await arrRest.model().array.get();
  console.log('ARRAY');
  console.log(respArr.body.json);

  const respSingle = await objSingle.model({ id: 1 }).get();
  console.log('SINGLE');
  console.log(respSingle.body.json);

  objSingle
    .model({ id: 2 })
    .get()
    .observable.subscribe(d => {
      console.log('THIRD', d.body.json);

      objSingle
        .model({ id: 2 })
        .get({}, [{ location: 'asdas' }])
        .observable.subscribe(async d => {
          console.log('FOURTH', d.body.json);

          // await arrAPiBad.model().get();

          process.exit(0);
        });
    });

  // https://api.restful-api.dev/objects/{id}
  //#endregion
}
