
import * as _ from 'lodash';
import { describe } from 'mocha'
import { expect, use } from 'chai'
import * as UrlNestedParams from '../params';

describe('Nested params', () => {


  it('shoudl generate stars', () => {
    expect(UrlNestedParams.stars(5)).to.be.eq("*****");
  })

  it('shoudl be good pattern', () => {
    let pattern = 'http://something.com/book/:boookId/author/:author';
    expect(UrlNestedParams.isValid(pattern)).to.be.true;
  })

  it('shoudl not be good pattern', () => {
    let pattern = 'http://something.com/book/boookId/author/author';
    expect(UrlNestedParams.isValid(pattern)).to.be.false;
  })


  it('shoudl valid url - pattern', () => {
    let pattern = 'http://something.com/book/:boookId/author/:author';
    let url = 'http://something.com/book/12/author/jensend';
    expect(UrlNestedParams.check(url, pattern)).to.be.true;
  })

  it('shoudl valid url - pattern (with slash on end) ', () => {
    let pattern = 'http://something.com/book/:boookId/author/:author/';
    let url = 'http://something.com/book/12/author/jensend';
    expect(UrlNestedParams.check(url, pattern)).to.be.true;
  })

  it('shoudl valid url (with slash on end) - pattern ', () => {
    let pattern = 'http://something.com/book/:boookId/author/:author';
    let url = 'http://something.com/book/12/author/jensend/';
    expect(UrlNestedParams.check(url, pattern)).to.be.true;
  })

  it('shoudl not valid bad urls ', () => {
    let pattern = 'http://something.com/book/:boookId/author/:author';
    let url = 'something.com/book/12/author/jensend/';
    expect(UrlNestedParams.check(url, pattern)).to.be.false;
  })

  it('shoudl not valid url with pattern ', () => {
    let pattern = 'http://something.com/book/:boookId/author/:author';
    let url = 'http://something.com/book/12/author';
    expect(UrlNestedParams.check(url, pattern)).to.be.false;
  })

  it('shoudl retrive models ', () => {
    let pattern = 'http://something.com/book/:boookId/author/:authorId';
    expect(UrlNestedParams.getModels(pattern)).to.deep.eq(['book', 'author']);
  })

  it('shoudl check if url contains models ', () => {
    let url = 'http://something.com/book/12/author';
    expect(UrlNestedParams.containsModels(url, ['book', 'author'])).to.be.true;
  })

  it('should retrive proper names of rest query params', () => {
    let pattern = 'http://something.com/book/:bookId/author/:author';
    expect(UrlNestedParams.getRestPramsNames(pattern)).to.deep.eq(['bookId', 'author'])
  })


  it('should retrive pairs value/key for rest query params', () => {
    let pattern = 'http://something.com/book/:bookId/author/:author';
    let url = 'http://something.com/book/12/author/Wilson';
    expect(UrlNestedParams.getRestParams(url, pattern)).to.deep.eq({
      bookId: 12,
      author: 'Wilson'
    })
  })

  it('should retrive pairs value/key for rest query params 3 level', () => {
    let pattern = 'http://something.com/book/:bookId/author/:author/withCover/:withCoverVal';
    let url = 'http://something.com/book/12/author/Wilson/withCover/true';
    expect(UrlNestedParams.getRestParams(url, pattern)).to.deep.eq({
      bookId: 12,
      author: 'Wilson',
      withCoverVal: true
    })
  })

  it('should retrive pairs value/key for rest query params 3 level other case', () => {
    let title = 'aaasdasd'
    let pattern = 'http://something.com/books/:bookid/title/:titleId/mission/:missionId';
    let url = `http://something.com/books/34/title/${title}/mission/true`;
    expect(UrlNestedParams.getRestParams(url, pattern)).to.deep.eq({
      bookid: 34,
      titleId: title,
      missionId: true
    })
  })


  it('should interpolate params 1 level', () => {
    let title = 'aaasdasd'
    let obj = {
      bookid: 34
    }
    let pattern = '/books/:bookid';
    let url = `/books/34`;
    expect(UrlNestedParams.interpolateParamsToUrl(obj, pattern)).to.eq(url)

  })


  it('should interpolate params 1 level, based prefix ', () => {
    let title = 'aaasdasd'
    let obj = {
      bookid: 34
    }
    let pattern = '/api/books/:bookid';
    let url = `/api/books/34`;
    expect(UrlNestedParams.interpolateParamsToUrl(obj, pattern)).to.eq(url)

  })

  it('should interpolate params 3 level', () => {
    let title = 'aaasdasd'
    let obj = {
      bookid: 34,
      titleId: title,
      missionId: true
    }
    let pattern = '/books/:bookid/title/:titleId/mission/:missionId';
    let url = `/books/34/title/${title}/mission/true`;
    expect(UrlNestedParams.interpolateParamsToUrl(obj, pattern)).to.eq(url)

  })

  it('should interpolate params with last alone param', () => {
    let title = 'aaasdasd'
    let obj = {
      bookid: 34,
      titleId: title,
      missionId: true
    }
    let pattern = '/books/:bookid/titles';
    let url = `/books/34/titles`;
    expect(UrlNestedParams.interpolateParamsToUrl(obj, pattern)).to.eq(url)

  })


  it('should interpolate params with last alone param2', () => {
    let title = 'aaasdasd'
    let obj = {}
    let pattern = '/books/:bookid/titles';
    let url = `/books`;
    expect(UrlNestedParams.interpolateParamsToUrl(obj, pattern)).to.eq(url)

  })


  it('shoudl check if url not contains models ', () => {
    let url = 'http://something.com/booka/12/author';
    expect(UrlNestedParams.containsModels(url, ['book', 'author'])).to.be.false;
  })

  // it('should save nested model (1 level) ',
  //     inject([Resource, Http, MockBackend, Jsonp],
  //         (rest: Resource<APIS, User, User[]>, http: Http, backend: MockBackend, jp) => {
  //             backend.connections.subscribe(
  //                 (c: MockConnection) => {

  //                     expect(c.request.method).toBe(RequestMethod.Post);
  //                     // expect(c.request.url).toBe('https://somewhere.com/users/12');
  //                     user.id = 1;
  //                     let res = new Response(new ResponseOptions({
  //                         body: JSON.stringify(user)
  //                     }));
  //                     c.mockRespond(res);

  //                 });

  //             rest = new Resource<APIS, User, User[]>(http, jp);
  //             let url = 'https://somewhere.com/users/:userid';
  //             Resource.map(APIS.FIRST.toString(), url);
  //             Resource.mockingMode.setBackendOnly();
  //             rest.add(APIS.FIRST, 'users/:userid');
  //             rest.api(APIS.FIRST, `users/12`, )
  //                 .save(user).subscribe((res) => {
  //                     expect(res.id).toBeDefined();
  //                 }, (err) => {
  //                     fail;
  //                 });

  //         }));




  // it('should have proper rest query params', async(() => {
  //     let d = inject([Resource, Http, Jsonp],
  //         (rest: Resource<APIS, User, User[]>, http: Http, jp: Jsonp) => {

  //             let title = 'some title';

  //             rest = new Resource<APIS, User, User[]>(http, jp);
  //             let url = 'https://somewhere.com';
  //             Resource.map(APIS.FIRST.toString(), url);
  //             Resource.mockingMode.setMocksOnly();
  //             rest.add(APIS.FIRST, 'books/:bookid/title/:titleId');

  //             let ctrl = (request: MockRequest<User>) => {

  //                 expect(request.restParams).toBeDefined();
  //                 expect(request.restParams['bookid']).toBe(34);
  //                 expect(request.restParams['titleId']).toBe(title)
  //                 return request.data;
  //             }

  //             rest.api(APIS.FIRST, `books/34/title/${title}`)
  //                 .mock(user, 0, ctrl)
  //                 .get([{ id: 0 }]).subscribe((res) => {
  //                     expect(res.id).toBe(100);
  //                 }, (err) => {
  //                     fail;
  //                 });

  //         })

  //     d();
  // }));


  // it('should have proper rest query params 3 level aa', async(() => {
  //     let d = inject([Resource, Http, Jsonp],
  //         (rest: Resource<APIS, User, User[]>, http: Http, jp: Jsonp) => {

  //             let title = 'sometitle';

  //             rest = new Resource<APIS, User, User[]>(http, jp);
  //             let url = 'https://somewhere.com';
  //             Resource.map(APIS.FIRST.toString(), url);
  //             Resource.mockingMode.setMocksOnly();
  //             rest.add(APIS.FIRST, 'books/:bookid/title/:titleId/mission/:missionId');

  //             let ctrl = (request: MockRequest<User>) => {

  //                 expect(request.restParams).toBeDefined();
  //                 expect(request.restParams['bookid']).toBe(34);
  //                 expect(request.restParams['titleId']).toBe(title)
  //                 expect(request.restParams['missionId']).to.be.true;
  //                 return request.data;
  //             }

  //             rest.api(APIS.FIRST, `books/34/title/${title}/mission/true`)
  //                 .mock(user, 0, ctrl)
  //                 .get([{ id: 0 }]).subscribe((res) => {
  //                     expect(res.id).toBe(100);
  //                 }, (err) => {
  //                     fail;
  //                 });

  //         })

  //     d();
  // }));


  // it('shoudl check if url contains models with dash ', () => {
  //     let url = 'http://something.com/book-ddd/12/author';
  //     expect(UrlNestedParams.containsModels(url, ['book-ddd', 'author'])).to.be.true;
  // })

  // it('shoudl retrive models ', () => {
  //     let pattern = 'http://something.com/book-shitty/:boookId/author/:authorId';
  //     expect(UrlNestedParams.getModels(pattern)).toEqual(['book-shitty', 'author']);
  // })


});

