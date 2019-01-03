import * as _ from 'lodash';
import { describe } from 'mocha'
import { expect, use } from 'chai'
import sinon from "ts-sinon";
// import { BrowserDB } from '../browser-db/browser-db';

import { Mapping } from '../mapping'

const testName = 'testname'

@Mapping.DefaultModelWithMapping<Test1>({
  name: testName,
  age: 44,
  isHuman: false
}, {

  })
class Test1 {
  constructor(public age: number = 23) {

  }
  isHuman = true;
  name: string;

}




// const instance = BrowserDB.instance;

describe('mapping, default model', () => {



  it('Should proper init test parmeter', () => {
    const t = new Test1();
    expect(t.name).to.be.eq(testName)
  });

  it('Should not be empty test prameter', () => {
    const t = new Test1();
    expect(_.isUndefined(t.name)).to.not.be.true;
  });

  it('Should shoudl not override typescript constructor', () => {
    const t = new Test1();
    expect(t.age).to.be.eq(23)
  });



});

