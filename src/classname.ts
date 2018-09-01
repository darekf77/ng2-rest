import * as _ from 'lodash';
import { CLASS_META_CONFIG, ClassConfig } from './models';

const CLASSNAMEKEY = Symbol()
CLASSNAME.prototype.classes = [];

export function getClassConfig(target: Function, configs: ClassConfig[] = []): ClassConfig[] {
  const meta = CLASS_META_CONFIG + target.name;
  // if (!target.prototype[meta]) target.prototype[meta] = {};
  let c: ClassConfig;
  if (target.prototype[meta]) {
    c = target.prototype[meta];
  } else {
    c = new ClassConfig();
    c.classReference = target;
    target.prototype[meta] = c;
  }
  configs.push(c);
  const proto = Object.getPrototypeOf(target)
  if (proto.name && proto.name !== target.name) {
    getClassConfig(proto, configs)
  }
  return configs;
}



/**
 * PLEASE PROVIDE NAME AS TYPED STRING, NOT VARIABLE
 * Decorator requred for production mode
 * @param name Name of class
 */
export function CLASSNAME(className: string) {

  return function (target: Function) {
    // console.log(`CLASSNAME Inited ${className}`)
    if (target.prototype) {
      target.prototype[CLASSNAMEKEY] = className
    }

    CLASSNAME.prototype.classes.push({
      className,
      target
    })
  } as any;
}

export function getClassName(target: Function, production = false) {
  if (_.isString(target)) {
    return target;
  }

  if (target.prototype && target.prototype[CLASSNAMEKEY]) {
    return target.prototype[CLASSNAMEKEY];
  }
  if (production) {
    throw `(PRODUCTION MODE ERROR)
            Please use decoartor @CLASSNAME for each entity or controller
            This is preventing class name problem in minified code.

            import { CLASSNAME } from 'morphi/browser';

            @CLASSNAME('ExampleClass')
            class ExampleClass {
              ...
            }
            `
  }
  return target.name;
}

export function getClassBy(className: string | Function): Function {
  let res;
  if (typeof className === 'function') { // TODO QUICK_FIX
    res = className;
  }
  if (className === 'Date') {
    res = Date;
  }

  let c = CLASSNAME.prototype.classes.find(c => c.className === className);

  if (c) {
    res = c.target;
  }
  // console.log(`getClassBy "${className} return \n\n ${res} \n\n`)
  return res;
}
