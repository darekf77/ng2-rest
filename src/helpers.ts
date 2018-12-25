import * as _ from 'lodash';

import { Helpers as HelpersLogger } from 'ng2-logger';
import { describeFromClassStringify, describeByDefaultModelsAndMapping } from './describe-class';
import { CLASSNAME } from './classname'
import { Models } from './models';
import { Mapping } from './mapping';

export class Helpers extends HelpersLogger {

  static get Class() {
    const self = this;
    return {
      getFromObject(o: Object) {
        const p = Object.getPrototypeOf(o)
        return p && p.constructor;
      },
      getName(target: Function, production = false) {
        return CLASSNAME.getClassName(target, production)
      },
      getNameFromObject(o: Object) {
        return self.Class.getName(self.Class.getFromObject(o));
      },
      getConfig(target: Function, configs: Models.ClassConfig[] = []): Models.ClassConfig[] {
        return CLASSNAME.getClassConfig(target, configs)
      },
      describeProperites(target: Function) {
        const d1 = describeFromClassStringify(target);
        const d2 = describeByDefaultModelsAndMapping(target);
        let uniq = {};
        d1.concat(d2).forEach(p => uniq[p] = p);
        return Object.keys(uniq)
          .filter(d => !!d)
          .filter(d => typeof target.prototype[d] !== 'function')
      }
    }
  }

  static get Mapping() {
    return {
      encode<T = Function>(json: Object, mapping: Mapping.Mapping): T {
        return Mapping.encode(json, mapping);
      },
      decode(json: Object, options?: Mapping.MapingDecodeOptions): Mapping.Mapping {
        return Mapping.decode(json, options)
      }
    }
  }

  static walkObject(obj: Object, callBackFn: (lodashPath: string, isPrefixed: boolean) => void, lodashPath = '') {
    lodashPath = (lodashPath === '') ? `` : `${lodashPath}.`;
    Object.keys(obj).forEach(key => {
      const contactedPath = `${lodashPath}${key}`
      callBackFn(contactedPath, key.startsWith('$'))
      const v = obj[key];
      const isObject = _.isObject(v)
      const isArray = _.isArray(v)
      if (isObject) {
        this.walkObject(v, callBackFn, contactedPath)
      } else if (isArray) {
        (v as Array<any>).forEach((elem, i) => {
          this.walkObject(elem, callBackFn, `${lodashPath}${key}[${i}]`)
        })
      }
    })
  }



  static checkValidUrl(url: string): boolean {
    let regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
    return regex.test(url);
  }



}

