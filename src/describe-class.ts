import * as _ from 'lodash';
import { SYMBOL } from './symbols';

export function describeClassProperites(targetClass: Function, includeId = true) {
  return describeByEverything(targetClass);
}

function describeByEverything(target: Function) {
  const d1 = describeFromClassStringify(target);
  const d2 = describeByDefaultModelsAndMapping(target);
  let uniq = {};
  d1.concat(d2).forEach(p => uniq[p] = p);
  return Object.keys(uniq)
    .filter(d => !!d)
    .filter(d => typeof target.prototype[d] !== 'function')
}

/**
  * @DEPRECATED
  * Describe fields assigned in class
  */
const FRegEx = new RegExp(/(?:this\.)(.+?(?= ))/g);
function describeFromClassStringify(target: Function, parent = false): string[] {
  var result = [];
  if (parent) {
    var proto = Object.getPrototypeOf(target.prototype);
    if (proto) {
      result = result.concat(describeFromClassStringify(proto.constructor, parent));
    }
  }
  result = result.concat(target.toString().match(FRegEx) || []);
  return result.map(prop => prop.replace('this.', ''))

}

/**
   * Describe fields assigne through @DefaultModelWithMapping decorator
   * without functions
   */
function describeByDefaultModelsAndMapping(target: Function): string[] {
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

  let propNames = Object.keys(res).filter(f => !!f);
  propNames = (!propNames.includes('id') ? ['id'] : []).concat(propNames);
  return propNames;
}
