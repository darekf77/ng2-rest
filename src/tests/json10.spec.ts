import * as _ from 'lodash';
import { describe, before } from 'mocha'
import { expect } from 'chai';
// import { BrowserDB } from '../browser-db/browser-db';
import * as jsonStrinigySafe from 'json-stringify-safe';

import { Helpers } from '../helpers';
import { Log } from 'ng2-logger'
import { JSON10 } from '../json10';
const log = Log.create('Spec JSON10')

class Test {
  static id = 0;

  id: number;

  users: User[];

  name: string;
  constructor() {
    this.id = Test.id++;
  }
}


class User {
  static id = 0;


  id: number;

  authors: User[];
  friend: User;
  test: Test;
  constructor() {
    this.id = User.id++;
  }
}







// const instance = BrowserDB.instance;

describe('Json 10 circural references tests', () => {

  xit('Circural refences should works', async () => {

    let u1 = new User()
    let u2 = new User()
    let test = new Test()
    u1.test = test;
    test.users = [u1, u2]


    let s = JSON10.stringify(test)
    log.i('stringify', s)
    log.i('circural', JSON10.circural)


  })


});

xit('Should clean objec', async () => {

  let u1 = new User()
  let u2 = new User()
  let test = new Test()
  u1.test = test;
  test.users = [u1, u2]
  u1.friend = new User();

  let s = JSON10.cleaned(test) as Test;
  log.i('clean', s)

  expect(s).to.be.instanceOf(Test)
  expect(s.users[0]).to.be.instanceOf(User);
  expect(s.users[0].friend).to.be.instanceOf(User);
  expect(s.users[1]).to.be.instanceOf(User);
  console.log(s)

})



it('Should array of objects', async () => {
  console.clear()
  let u1 = new User()
  let u2 = new User()
  let u3 = new User()
  u1.friend = u2;
  u2.friend = u1;
  u3.authors = [u1, u2]
  let arr = [u1, u2, u3]
  // log.i('before',arr)
  let s = JSON10.cleaned(arr) as User[];
  // log.i('clean', s)

  // expect(s).to.be.instanceOf(Test)
  // expect(s.users[0]).to.be.instanceOf(User);
  // expect(s.users[0].friend).to.be.instanceOf(User);
  log.i('out',s)
  expect(s[0]).to.be.instanceOf(User);
  expect(s[1]).to.be.instanceOf(User);
  expect(s[2]).to.be.instanceOf(User);


})

