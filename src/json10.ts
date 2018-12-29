

import * as _ from 'lodash';
import { Helpers } from './helpers';
import * as jsonStrinigySafe from 'json-stringify-safe';

export type Circ = { pathToObj: string; circuralTargetPath: string; };

function type(o) {
  if (Array.isArray(o)) {
    return 'array'
  }
  return typeof o;
}

export class JSON10 {

  public static circural: Circ[] = [];

  public static getPropertyPath(lodahPath, contetPath) {
    return (lodahPath
      .replace(contetPath, '')
      .replace(/^\./, '')
      .replace(/\[/, '')
      .replace(/\]/, ''))
  }

  public static cleaned(anyJSON: Object) {

    let jsonstring = jsonStrinigySafe(anyJSON)
    let json = JSON.parse(jsonstring);
    let className = Helpers.Class.getFromObject(anyJSON)
    // console.log('className',className)

    Helpers.walkObject(json, (lodahPath) => {
      let o = _.get(json, lodahPath)

      const contetPath = this.getContextPath(lodahPath);
      let property = this.getPropertyPath(lodahPath, contetPath);

      // console.log(`
      // '${lodahPath}'
      // '${contetPath}' + '${property}'
      // `)

      if (!_.isNaN(Number(property))) {
        property = Number(property)
      }

      if (_.isString(o) && o.startsWith('[Circular')) {


        if (property.trim() === '') {
          json[contetPath] = null;
        } else {
          let context = _.get(json, contetPath)
          if (_.isObject(context)) {
            context[property] = null;
          }
        }
      } else if (!Array.isArray(o) && _.isObject(o)) {

        if (contetPath.trim() === '') {
          json[property] = _.merge(new (Helpers.Class.getBy(Helpers.Class.getFromObject(_.get(anyJSON, lodahPath))) as any)(), o);
        } else {
          let context = _.get(json, contetPath)
          let cname = Helpers.Class.getBy(Helpers.Class.getFromObject(_.get(anyJSON, lodahPath)))
          if (_.isObject(context)) {
            context[property] = _.merge(new (cname as any)(), o);
          }
        }
      }

    })
    let res = _.merge(new (Helpers.Class.getBy(className) as any)(), json);

    return res;
  }

  public static stringify(anyJSON: Object, replace?: any, spaces?: number) {
    this.circural = [];
    let jsonstring = jsonStrinigySafe(anyJSON)
    let json = JSON.parse(jsonstring);

    Helpers.walkObject(json, (lodahPath) => {
      let o = _.get(json, lodahPath)
      if (_.isString(o) && o.startsWith('[Circular')) {

        this.circural.push({
          pathToObj: lodahPath,
          circuralTargetPath: this.getCirc(o)
        })

        const contetPath = this.getContextPath(lodahPath);
        const property = lodahPath
          .replace(contetPath, '')
          .replace(/^\./, '')
          .replace(/\[/, '')
          .replace(/\]/, '')

        if (property.trim() === '') {
          json[contetPath] = null;
        } else {
          let context = _.get(json, contetPath)
          context[property] = null;
        }

      }
    })


    return JSON.stringify(json, replace, spaces);
  }


  public static parse(json: string, circs: Circ[] = []) {
    let res = JSON.parse(json);
    circs.forEach(({ circuralTargetPath, pathToObj }) => {
      _.set(res, pathToObj, circuralTargetPath === '' ? res : _.get(res, circuralTargetPath))
    })
    return res;
  }

  private static getContextPath(p: string) {
    if (p.endsWith(']')) {
      return p.replace(/\[(\"|\')?[0-9]+(\"|\')?\]$/, '')
    }
    return p.replace(/\.[a-zA-Z0-9\_]+$/, '')
  }

  private static fixPath(almostLodashPath: string) {
    if (almostLodashPath === '') {
      return ''
    }
    const s = almostLodashPath.split('.');

    for (let index = 0; index < s.length; index++) {
      const part = s[index];
      if (!_.isNaN(Number(part))) {
        s[index] = `[${s[index]}]`
      } else if (index > 0) {
        s[index] = `.${s[index]}`
      }
    }
    return s.join('')
  }

  private static getCirc(circuralTilda: string) {
    circuralTilda = circuralTilda.replace(/^\[Circular \~\.?/, '')

    return this.fixPath(circuralTilda
      .replace(/\]$/, ''))
  }


}
