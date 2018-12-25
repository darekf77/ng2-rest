import * as _ from 'lodash';
import { SYMBOL } from './symbols';



/**
  * @DEPRECATED
  * Describe fields assigned in class
  */
const FRegEx = new RegExp(/(?:this\.)(.+?(?= ))/g);
export function describeFromClassStringify(target: Function, parent = false): string[] {
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
export function describeByDefaultModelsAndMapping(target: Function): string[] {
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
