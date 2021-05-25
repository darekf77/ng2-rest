// import { _ } from 'tnp-core';
// import { Helpers } from './helpers';
// import { Resource } from 'ng2-rest';
// //#region @notForNpm
// import { Morphi } from 'morphi';
// //#endregion

// @Morphi.Controller()
// class RestCtrl extends Morphi.Base.Controller<any> {
//   //#region @backend
//   async initExampleDbData() {

//   }
//   //#endregion

//   @Morphi.Http.GET()
//   ng(): Morphi.Response<any> {
//     return async () => {
//       return 'ng2-rest perfect!'
//     }
//   }
// }




// const start = async (port = 3000) => {

//   const host = `http://localhost:${port}`;
//   console.log(`HOST ng2-rest: ${host}`);
//   //#region @backend
//   const config = {
//     type: "sqlite",
//     database: 'tmp-db.sqlite',
//     synchronize: true,
//     dropSchema: true,
//     logging: false
//   };
//   //#endregion

//   const context = await Morphi.init({
//     host,
//     controllers: [RestCtrl],
//     entities: [],
//     //#region @backend
//     config: config as any
//     //#endregion
//   });


//   if (Morphi.IsBrowser) {
//     const rest = Resource.create(host, '/test');
//     console.log('hello');
//     await rest.model().get();

//     const c: RestCtrl = _.first(context.controllers);
//     const data = (await c.ng().received).body.text;
//     console.log('ng:', data)

//   }
// }

// export default start;

// //#region @notForNpm
// if (Helpers.isBrowser) {
//   start()
// }
// //#endregion
