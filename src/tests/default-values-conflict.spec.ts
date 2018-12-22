import * as _ from 'lodash';
import { describe } from 'mocha'
import { expect, use } from 'chai'
import sinon from "ts-sinon";
// import { BrowserDB } from '../browser-db/browser-db';

import { DefaultModelWithMapping } from '../mapping'

describe('default model conflict', () => {

  it('Should show conflic default values waring', () => {

    var prev = console.warn;
    var called = false;
    console.warn = function (arg) {
      called = true;
    };

    const testName = 'testname'

    @DefaultModelWithMapping<Test1>({
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



    // restore console.log
    console.warn = prev;
    expect(called).to.be.true;
  });



});
