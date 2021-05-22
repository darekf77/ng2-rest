
import { _ } from 'tnp-core';
import { describe, it } from 'mocha'
import { expect, use } from 'chai'

import { CLASS } from 'typescript-class-helpers';
// import { BrowserDB } from '../browser-db/browser-db';

import { Mapping } from '../mapping'
import { encode } from 'punycode';
import { Log } from 'ng2-logger';
const log = Log.create('mapping test')

// const instance = BrowserDB.instance;

describe('mapping, default model', () => {


  const testName = 'testname'

  @Mapping.DefaultModelWithMapping<Test1>({
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



  @Mapping.DefaultModelWithMapping<Test2>({

  },
    {
      tests: ['Test1']
    })
  class Test2 {
    tests: Test1[];
  }


  it('Should generate proper mapping object', () => {
    const mapping = Mapping.getModelsMapping(Test2);
    expect(mapping).to.deep.eq({ '': 'Test2', tests: ['Test1'] });
  });

  it('Should generate proper mapping object', () => {
    const mapping = Mapping.getModelsMapping(Test1);
    expect(mapping).to.deep.eq({ '': 'Test1', parent: 'Test2' });
  });



});



describe('mapping, nested classes', () => {

  @CLASS.NAME('Company')
  @Mapping.DefaultModelWithMapping<Company>(
    { isApple: false })

  class Company {
    isApple: boolean;
  }

  @CLASS.NAME('Cover')
  @Mapping.DefaultModelWithMapping<Cover>(
    { thickness: 43 }, { company: 'Company' })

  class Cover {
    thickness: number;
    company: Company;
  }

  @CLASS.NAME('Book')
  @Mapping.DefaultModelWithMapping<Book>(
    { title: 'n/a' },
    { author: 'User', cover: 'Cover' })

  class Book {
    title: string;
    author: User;
    cover: Cover;
  }



  @CLASS.NAME('User')
  @Mapping.DefaultModelWithMapping<User>(
    { name: 'testName' },
    { books: ['Book'] })

  class User {
    name: string;
    books: Book[];
  }


  it('Should generate proper mapping object', () => {

    let m = Mapping.getModelsMapping(User)


    const res: User = Mapping.encode({
      name: 'asd',
      books: [
        {
          title: 'aaaa',
          cover: {
            thickness: 77,
            company: {
              isApple: true
            }
          }
        }
      ]
    }, m)
    console.log('res', res)
    expect(res).to.be.instanceOf(User);
    expect(res.books[0]).to.be.instanceOf(Book);
    expect(res.books[0].cover).to.be.instanceOf(Cover);
    expect(res.books[0].cover.company).to.be.instanceOf(Company);

  });


});
