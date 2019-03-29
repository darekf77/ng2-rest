import * as _ from 'lodash';
import { describe } from 'mocha'
import { expect, use } from 'chai'

import { CLASS } from 'typescript-class-helpers';
// import { BrowserDB } from '../browser-db/browser-db';

import { Mapping } from '../mapping'
import { encode } from 'punycode';
import { Log } from 'ng2-logger';
const log = Log.create('mapping test')

// const instance = BrowserDB.instance;

describe('Mapping inheritance', () => {

  // @CLASS.NAME('Coffee')
  class Coffee {

  }

  // @CLASS.NAME('Project')
  @Mapping.DefaultModelWithMapping<Project>(void 0, {
    cup: 'Coffee',
    projectInside: 'Project'
  })
  class Project {
    cup: Coffee;
    projectInside: Project;
    location: string;

  }

  @CLASS.NAME('PROJECT')
  @Mapping.DefaultModelWithMapping<PROJECT>(void 0, {
    mycups: ['Coffee']
  })
  class PROJECT extends Project {

    mycups: Coffee;

  }

  it('Should handle inheritance of mapping', () => {
    const fn = PROJECT as Function;
    const mapping = Mapping.getModelsMapping(fn);
    // console.log('\n\n')
    // console.log(`mapping: '${fn.name}'`, mapping)
    expect(mapping).to.deep.eq({ '': 'PROJECT', mycups: ['Coffee'], cup: 'Coffee', projectInside: 'PROJECT' });
  });





});
