// import * as _ from 'lodash';
// import { describe } from 'mocha'
// import { expect, use } from 'chai'
// import sinon from "ts-sinon";
// // import { BrowserDB } from '../browser-db/browser-db';

// import { Mapping } from '../mapping'

// describe('sinon default model conflict', () => {

//   beforeEach(function () {
//     sinon.spy(console, 'warn');
//   });

//   afterEach(function () {
//     (console.warn as sinon.SinonSpy).restore()
//   });

//   it('Should show conflic default values waring', () => {


//     const testName = 'testname'

//     @Mapping.DefaultModelWithMapping<Test1>({
//       name: testName,
//       age: 44
//     }, {

//       })
//     class Test1 {
//       constructor() {

//       }
//        age: number = 12;
//       isHuman: boolean;
//       name: string;

//     }

//     // expect((console.warn as sinon.SinonSpy).called).to.be.true;

//   });



// });

