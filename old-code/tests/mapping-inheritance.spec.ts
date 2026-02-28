// import { expect, use } from 'chai'
// import { describe, it } from 'mocha'
// import { Log } from 'ng2-logger';
// import { _ } from 'tnp-core';
// import { CLASS } from 'typescript-class-helpers';
// // import { BrowserDB } from '../browser-db/browser-db';

// import { Mapping } from '../index'

// const log = Log.create('mapping test')

// // const instance = BrowserDB.instance;

// describe('Mapping inheritance', () => {

//   // @CLASS.NAME('Coffee')
//   class Coffee {

//   }

//   // @CLASS.NAME('Project')
//   @Mapping.DefaultModelWithMapping<Project>(void 0, {
//     cup: 'Coffee',
//     projectInside: 'Project'
//   })
//   class Project {
//     cup: Coffee;

//     projectInside: Project;

//     location: string;

//   }

//   @CLASS.NAME('PROJECT')
//   @Mapping.DefaultModelWithMapping<PROJECT>(void 0, {
//     mycups: ['Coffee']
//   })
//   class PROJECT extends Project {

//     mycups: Coffee;

//   }



//   class SubProject extends PROJECT {

//   }


//   class SubSubProject extends PROJECT {

//   }


//   it('Should handle inheritance of mapping', () => {

//     expect(Mapping.getModelsMapping(PROJECT)).
//       to.deep.eq({ '': 'PROJECT', mycups: ['Coffee'], cup: 'Coffee', projectInside: 'PROJECT' });

//     expect(Mapping.getModelsMapping(SubProject)).
//       to.deep.eq({ '': 'PROJECT', mycups: ['Coffee'], cup: 'Coffee', projectInside: 'PROJECT' });

//     expect(Mapping.getModelsMapping(SubSubProject)).
//       to.deep.eq({ '': 'PROJECT', mycups: ['Coffee'], cup: 'Coffee', projectInside: 'PROJECT' });

//     expect(Mapping.getModelsMapping(Project)).
//       to.deep.eq({ '': 'Project', cup: 'Coffee', projectInside: 'Project' });
//   });





// });
