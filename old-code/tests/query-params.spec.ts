// import { _ } from 'tnp-core';

// import * as UrlNestedParams from '../index';

// describe('Query params', () => {
//   it('Shoud transform url params from array', () => {
//     let res = UrlNestedParams.getParamsUrl([
//       { super: 122 },
//       { reg: 'ttt', regex: new RegExp('t{3}', 'g') },
//     ]);
//     expect(res).to.deep.eq('?super=122&reg=ttt');
//   });

//   it('Shoud transform url params from one object', () => {
//     let res = UrlNestedParams.getParamsUrl([
//       { super: 122, reg: 'ttt', dd: 12 },
//     ]);
//     expect(res).to.deep.eq('?super=122&reg=ttt&dd=12');
//   });

//   it('Shoud not put undefined in query param', () => {
//     let res = UrlNestedParams.getParamsUrl([{ super: 122, reg: undefined }]);
//     expect(res).to.deep.eq('?super=122');
//   });

//   it('Shoud decode params for string', () => {
//     let p = '?super=122&reg=ttt&dd=12';
//     expect(UrlNestedParams.decodeUrl(p)).to.deep.eq({
//       super: 122,
//       reg: 'ttt',
//       dd: 12,
//     });
//   });

//   it('Shoud decode params for string', () => {
//     let p = '?super=%7B%22name%22%3A%22Dariusz%22%7D';
//     expect(UrlNestedParams.decodeUrl(p)).to.deep.eq({
//       super: { name: 'Dariusz' },
//     });
//   });

//   it('Shoud transform url param into query string with object', () => {
//     let p = '?super=%7B%22name%22%3A%22Dariusz%22%7D';
//     let o = [{ super: { name: 'Dariusz' } }];
//     expect(UrlNestedParams.getParamsUrl(o)).to.deep.eq(p);
//   });

//   it('Shoud transform url param into query string with object and other parasm', () => {
//     let p = '?super=%7B%22name%22%3A%22Dariusz%22%7D&da=10&hi=5';
//     let o = [{ super: { name: 'Dariusz' }, haha: undefined, da: 10, hi: 5 }];
//     expect(UrlNestedParams.getParamsUrl(o)).to.deep.eq(p);
//   });

//   it('Shoud transform url param with empty shits', () => {
//     let p = '?super=&da=10&hi=5&aa=';
//     let o = [
//       { super: '' },
//       {},
//       {},
//       { haha: undefined, da: 10, hi: 5 },
//       {},
//       {},
//       { aa: '' },
//     ];
//     expect(UrlNestedParams.getParamsUrl(o)).to.deep.eq(p);
//   });

//   it('Should transofrm url without problems', () => {
//     let u =
//       'http://10.48.0.173:16185/search?phrase=&pagination=\
// %7B%22number%22%3A1%2C%22numberOfElements%22%3A10%7D&isFromLiveSearch=true';
//     let e = {
//       phrase: 0,
//       pagination: {
//         number: 1,
//         numberOfElements: 10,
//       },
//       isFromLiveSearch: true,
//     };
//     expect(UrlNestedParams.decodeUrl(u)).to.deep.eq(e);
//   });
// });
