import { diffChars } from 'diff';
import * as _ from 'lodash';
import { Log, Level } from 'ng2-logger';
import { UrlParams } from './models';

const log = Log.create('ng2-rest params', Level.__NOTHING)


export function checkValidUrl(url: string): boolean {
  let regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
  return regex.test(url);
}

/** check if string is a valid pattern */
export function isValid(pattern: string) {
  return (new RegExp('\/:[a-zA-Z]*', 'g')).test(pattern.replace('://', ''));
}

export function check(url: string, pattern: string): boolean {
  if (!checkValidUrl(url)) {
    console.error(`[ng2-rest] Incorrect url: ${url}`);
    return false;
  }
  if (url.charAt(url.length - 1) === '/') url = url.slice(0, url.length - 2);
  if (pattern.charAt(pattern.length - 1) === '/') pattern = pattern.slice(0, url.length - 2);
  pattern = pattern.replace(/\//g, '\/');
  pattern = pattern.replace(new RegExp('\/:[a-zA-Z]*', 'g'), '.+');
  let reg = new RegExp(pattern, 'g');
  return reg.test(url);
}

export function getModels(pattern: string): string[] {
  let m = pattern.match(new RegExp('[a-z-A-Z]*\/:', 'g'));
  return m.map(p => p.replace('/:', ''));
}

export function getRestPramsNames(pattern: string): string[] {
  if (pattern.charAt(pattern.length - 1) !== '/') pattern = `${pattern}/`;
  let m = pattern.match(new RegExp(':[a-zA-Z]*\/', 'g'));
  let res = m.map(p => p.replace(':', '').replace('/', ''));
  return res.filter(p => p.trim() !== '');
}

export function containsModels(url: string, models: string[]): boolean {
  if (url.charAt(0) !== '/') url = '/' + url;
  // url = url.replace(new RegExp('\/', 'g'), '');
  let res = models.filter(m => {
    let word = '/' + m;
    log.d('word', word)
    let iii = url.indexOf(word);
    log.d('iii', iii)
    if (iii + word.length < url.length && url.charAt(iii + word.length) !== '/') {
      return false;
    }
    if (iii !== -1) {
      url = url.replace(new RegExp('\/' + m, 'g'), '');
      return true;
    }
    return false;
  }).length;
  log.d('containsModels', res);
  return res === models.length;
}

export function stars(n: number): string {
  let res = '';
  for (let i = 0; i < n; i++) res += '*';
  return res;
}

export function getRestParams(url: string, pattern: string): Object {
  let res = {};
  let models = getRestPramsNames(pattern);
  log.d('models', models);
  models.forEach(m => {
    pattern = pattern.replace(`:${m}`, stars(m.length));
  })

  let currentModel: string = undefined;
  diffChars(pattern, url).forEach(d => {
    log.d('d', d);
    if (d.added) {
      if (!isNaN(Number(d.value))) res[currentModel] = Number(d.value);
      else if (d.value.trim() === 'true') res[currentModel] = true;
      else if (d.value.trim() === 'false') res[currentModel] = false;
      else res[currentModel] = decodeURIComponent(d.value);
      currentModel = undefined;
    }
    let m = d.value.replace(':', "");
    log.d('model m', m)
    if (d.removed) {
      currentModel = models.shift();
    }
  });
  return res;
}

export const regexisPath = /[^\..]+(\.[^\..]+)+/g;

/**
 * Models like books/:id
 */
function cutUrlModel(params: Object, models: string[], output: string[]) {
  if (models.length === 0) return output.join('\/');
  let m = models.pop();

  let param = m.match(/:[a-zA-Z0-9\.]+/)[0].replace(':', '');
  const paramIsPath = regexisPath.test(param)
  log.i('cut param', param)
  let model = m.match(/[a-zA-Z0-9]+\//)[0].replace('\/', '');
  if (params === undefined ||
    (paramIsPath ? _.get(params, param) === undefined : params[param] === undefined) ||
    param === 'undefined') {
    output.length = 0;
    output.unshift(model)
    return cutUrlModel(params, models, output);
  } else {
    if (paramIsPath) {
      log.i('param is path', param)
      let mrep = m.replace(new RegExp(`:${param}`, 'g'), `${_.get(params, param)}`)
      output.unshift(mrep)
      return cutUrlModel(params, models, output);
    } else {
      log.i('param is normal', param)
      let mrep = m.replace(new RegExp(`:${param}`, 'g'), `${params[param]}`)
      output.unshift(mrep)
      return cutUrlModel(params, models, output);
    }

  }
}


export function interpolateParamsToUrl(params: Object, url: string): string {

  const regexInt = /\[\[([^\..]+\.[^\..]+)+\]\]/g;

  url = url.split('/').map(p => {
    // log.d('url parts', p)
    let isParam = p.startsWith(':')
    if (isParam) {
      let part = p.slice(1);
      // log.d('url param part', p)
      if (regexInt.test(part)) {
        // let level = (url.split('.').length - 1)
        part = part.replace('[[', '')
        part = part.replace(']]', '')
      }
      return `:${part}`
    }
    return p;
  }).join('/');

  // log.i('URL TO EXPOSE', url)

  // log.i('params', params)

  let slash = {
    start: url.charAt(0) === '\/',
    end: url.charAt(url.length - 1) === '\/'
  }

  let morePramsOnEnd = url.match(/(\/:[a-zA-Z0-9\.]+){2,10}/g);
  if (morePramsOnEnd && (Array.isArray(morePramsOnEnd) && morePramsOnEnd.length === 1)) {
    // log.i('morePramsOnEnd', morePramsOnEnd)
    let m = morePramsOnEnd[0];
    let match = m.match(/\/:[a-zA-Z0-9\.]+/g);
    // log.i('match', match)
    match.forEach(e => {
      let c = e.replace('\/:', '');
      // log.i('c', c)
      if (regexisPath.test(c)) {
        url = url.replace(e, `/${_.get(params, c)}`)
      } else {
        url = url.replace(e, `/${params[c]}`)
      }


      // log.i('prog url', url)
    })
    return url;
  }

  let nestedParams = url.match(/[a-zA-Z0-9]+\/:[a-zA-Z0-9\.]+/g);
  if (!nestedParams || (Array.isArray(nestedParams) && nestedParams.length === 0)) return url;

  // check alone params
  if (!slash.end) url = `${url}/`;
  let addUndefinedForAlone = (!/:[a-zA-Z0-9\.]+\/$/g.test(url) && /[a-zA-Z0-9]+\/$/g.test(url));

  let replace = (nestedParams.length > 1 ? nestedParams.join('\/') : nestedParams[0]) +
    (addUndefinedForAlone ? '\/' + url.match(/[a-zA-Z0-9]+\/$/g)[0] : '\/');
  let beginHref = url.replace(replace, '')

  if (addUndefinedForAlone) {
    url = url.replace(/\/$/g, '/:undefined')
    nestedParams = url.match(/[a-zA-Z0-9]+\/:[a-zA-Z0-9\.]+/g);
    url = cutUrlModel(params, nestedParams, [])
  } else {
    url = cutUrlModel(params, nestedParams, [])
  }
  url = beginHref + url;

  if (url.charAt(url.length - 1) !== '/' && slash.end) url = `${url}/`;
  if (url.charAt(0) !== '\/' && slash.start) url = `/${url}`;

  return url;
}

/**
 * Get query params from url, like 'ex' in /api/books?ex=value
*/
export function decodeUrl(url: string): Object {
  let regex = /[?&]([^=#]+)=([^&#]*)/g,
    params = {},
    match;
  while (match = regex.exec(url)) {
    params[decodeURIComponent(match[1])] = decodeURIComponent(match[2]);
  }
  let paramsObject = <Object>params;
  for (let p in paramsObject) {
    if (paramsObject[p] === undefined) {
      delete paramsObject[p];
      continue;
    }
    if (paramsObject.hasOwnProperty(p)) {
      // chcek if property is number
      let n = Number(params[p]);
      if (!isNaN(n)) {
        params[p] = n;
        continue;
      }
      if (typeof params[p] === 'string') {

        // check if property is object
        let json;
        try {
          json = JSON.parse(params[p]);
        } catch (error) { }
        if (json !== undefined) {
          params[p] = json;
          continue;
        }

        // chcek if property value is like regular rexpression
        // let regexExpression;
        // try {
        //     regexExpression = new RegExp(params[p]);
        // } catch (e) { }
        // if (regexExpression !== undefined) params[p] = regexExpression;
      }
    }
  }
  return params;
}

/**
 * Create query params string for url
 *
 * @export
 * @param {UrlParams[]} params
 * @returns {string}
 */
export function getParamsUrl(params: UrlParams[], doNotSerialize: boolean = false): string {
  let urlparts: string[] = [];
  if (!params) return '';
  if (!(params instanceof Array)) return '';
  if (params.length === 0) return '';

  params.forEach(urlparam => {
    if (JSON.stringify(urlparam) !== '{}') {

      let parameters: string[] = [];
      let paramObject = <Object>urlparam;


      for (let p in paramObject) {
        if (paramObject[p] === undefined) delete paramObject[p];
        if (paramObject.hasOwnProperty(p) && typeof p === 'string' && p !== 'regex' && !(paramObject[p] instanceof RegExp)) {
          if (p.length > 0 && p[0] === '/') {
            let newName = p.slice(1, p.length - 1);
            urlparam[newName] = urlparam[p];
            urlparam[p] = undefined;
            p = newName;
          }
          if (p.length > 0 && p[p.length - 1] === '/') {
            let newName = p.slice(0, p.length - 2);
            urlparam[newName] = urlparam[p];
            urlparam[p] = undefined;
            p = newName;
          }
          let v: any = urlparam[p];
          if (v instanceof Object) {
            urlparam[p] = JSON.stringify(urlparam[p]);
          }
          urlparam[p] = doNotSerialize ? <string>urlparam[p] : encodeURIComponent(<string>urlparam[p]);
          if (urlparam.regex !== undefined && urlparam.regex instanceof RegExp) {

            if (!urlparam.regex.test(<string>urlparam[p])) {
              console.warn(`Data: ${urlparam[p]} incostistent with regex ${urlparam.regex.source}`);
            }
          }
          parameters.push(`${p}=${urlparam[p]}`);
        }

      }

      urlparts.push(parameters.join('&'));


    }


  });
  let join = urlparts.join().trim();
  if (join.trim() === '') return '';
  return `?${urlparts.join('&')}`;
}


function transform(o) {
  if (typeof o === 'object') {
    return encodeURIComponent(JSON.stringify(o));
  }
  return o;
}


export function prepareUrlOldWay(params?: TemplateStringsArray): string {
  if (!params) return this.endpoint;
  if (typeof params === 'object') {
    params = transform(params);
  }
  return this.endpoint + '/' + params;
}

