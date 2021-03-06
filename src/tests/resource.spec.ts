import { _ } from 'tnp-core';
import { describe, it } from 'mocha'
import { expect, use } from 'chai'
import * as UrlNestedParams from '../params';
import { Resource } from '../resource.service';
import axios from 'axios';
import { RestHeaders } from '../rest-headers';

describe('Resource requests', () => {

  // let sandbox;
  // let server;

  // beforeEach(() => {
  //   sandbox = sinon.sandbox.create()
  //   server = sandbox.useFakeServer();
  // });
  // afterEach(() => {
  //   server.restore();
  //   sandbox.restore();
  // });



  it('Shoud handle simple get request', async function () {
    const data = { hello: 'world' }

    const rest = Resource.create('http://onet.pl', '/api');

    const res = await rest.model()
      .mock({
        data,
        code: 200,
        headers: RestHeaders.from({}),
        isArray: false
      })
      .get()
    expect(res.body.json).to.deep.eq(data);
  });



});

