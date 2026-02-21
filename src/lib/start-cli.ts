import { Resource } from './ng2-rest';

export async function startCli(argsv: string[], filename: string): Promise<void> {
  //#region @backendFunc
  console.log('Hello from cli');

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

  process.exit(0);
  // https://api.restful-api.dev/objects/{id}
  //#endregion
}
