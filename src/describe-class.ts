import * as _ from 'lodash';
import { SYMBOL } from './symbols';

export function describeClassProperites(targetClass: Function, includeId = true) {
  let res = Describer.describeByDefaultModel(targetClass);
  return (includeId && !res.includes('id') ? ['id'] : []).concat(Describer.describeByDefaultModel(targetClass));
}

class Describer {
  private static FRegEx = new RegExp(/(?:this\.)(.+?(?= ))/g);


  /**
   * @DEPRECATED
   * Describe fields assigned in class
   */
  public static describe(target: Function, parent = false): string[] {
    var result = [];
    if (parent) {
      var proto = Object.getPrototypeOf(target.prototype);
      if (proto) {
        result = result.concat(this.describe(proto.constructor, parent));
      }
    }
    result = result.concat(target.toString().match(this.FRegEx) || []);
    return result.map(prop => prop.replace('this.', ''))

  }

  /**
   * Describe fields assigne through @DefaultModelWithMapping decorator
   * without functions
   */
  public static describeByDefaultModel(target: Function) {
    return getEntityFieldsProperties(target);
  }

  public static describeByEverything(target: Function) {
    const d1 = this.describe(target);
    const d2 = this.describeByDefaultModel(target);
    let uniq = {};
    d1.concat(d2).forEach(p => uniq[p] = p);
    return Object.keys(uniq).filter(d => !!d)
  }

}

export function getEntityFieldsProperties(target: Function): string[] {
  let res = {}
  if (target) {
    if (target[SYMBOL.DEFAULT_MODEL]) {
      Object.keys(target[SYMBOL.DEFAULT_MODEL])
        .filter(key => !_.isFunction(target[SYMBOL.DEFAULT_MODEL][key]))
        .forEach(key => res[key] = null);
    }
    if (target[SYMBOL.MODELS_MAPPING]) {
      Object.keys(target[SYMBOL.MODELS_MAPPING])
        .forEach(key => res[key] = null);
    }
  }
  return Object.keys(res).filter(f => !!f);
}
