
import * as _ from 'lodash';
import { describe } from 'mocha'
import { expect, use } from 'chai'
import sinon from "ts-sinon";
// import { BrowserDB } from '../browser-db/browser-db';

import { DefaultModelWithMapping, getModelsMapping } from '../mapping'
import { encode } from 'punycode';

const testName = 'testname'



@DefaultModelWithMapping<Test1>({
  name: testName,
  age: 44,
  isHuman: false
}, {
    parent: 'Test2'
  })
class Test1 {
  constructor(public age: number = 23) {

  }
  isHuman = true;
  name: string;

  parent: Test2;
}



@DefaultModelWithMapping<Test2>({

},
  {
    tests: ['Test1']
  })
class Test2 {
  tests: Test1[];
}


// const instance = BrowserDB.instance;

describe('mapping, default model', () => {



  it('Should generate proper mapping object', () => {
    const mapping = getModelsMapping(Test2);
    expect(mapping).to.deep.eq({ '': 'Test2', tests: ['Test1'] });
  });

  it('Should generate proper mapping object', () => {
    const mapping = getModelsMapping(Test1);
    expect(mapping).to.deep.eq({ '': 'Test1', parent: 'Test2' });
  });



});

