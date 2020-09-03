import * as _ from 'lodash';
import { Helpers } from './helpers';
import { Circ, JSON10 } from 'json10';
import { walk } from 'lodash-walk-object';
import { CLASS, SYMBOL } from 'typescript-class-helpers';
import { Helpers as HelpersLog } from 'ng2-logger';

export namespace Mapping {

  export function decode(json: Object, autodetect = false): Mapping {
    HelpersLog.simulateBrowser = true;
    // console.log('DECODE isBrowser', HelpersLog.isBrowser)
    if (_.isUndefined(json)) {
      return void 0;
    }

    let mapping = decodeFromDecorator(_.isArray(json) ? _.first(json) : json, !autodetect)

    if (autodetect) {
      mapping = _.merge(getMappingNaive(json), mapping);
    }
    HelpersLog.simulateBrowser = false;
    return mapping;
  }

  export function encode<T = Function>(json: Object, mapping: Mapping, circular: Circ[] = []): T {
    if (_.isString(json) || _.isBoolean(json) || _.isNumber(json)) {
      return json as any;
    }

    if (mapping['']) {
      const decoratorMapping = getModelsMapping(CLASS.getBy(mapping['']));
      mapping = _.merge(mapping, decoratorMapping)
    }

    let res: any;
    if (_.isArray(circular) && circular.length > 0) {
      res = setMappingCirc(json, mapping, circular);
    } else {
      res = setMapping(json, mapping);
    }
    return res;
  }


  function decodeFromDecorator(json: Object, production = false): Mapping {
    const entityClass = CLASS.getFromObject(json);
    const mappings = getModelsMapping(entityClass);
    return mappings as any;
  }

  export function getModelsMapping(entity: Function) {

    if (!_.isFunction(entity) || entity === Object) {
      return {};
    }
    const className = CLASS.getName(entity)
    // console.log(`getMaping for: '${className}' `)
    let enityOWnMapping: any[] = _.isArray(entity[SYMBOL.MODELS_MAPPING]) ?
      entity[SYMBOL.MODELS_MAPPING] : [{ '': className }];

    let res = {};
    let parents = enityOWnMapping
      .filter(m => !_.isUndefined(m['']) && m[''] !== className)
      .map(m => m['']);

    enityOWnMapping.reverse().forEach(m => {
      m = _.cloneDeep(m);
      // console.log(`'${className}' m:`, m)
      Object.keys(m).forEach(key => {
        const v = m[key]
        const isArr = _.isArray(v)
        const model = isArr ? _.first(v) : v;
        if (parents.includes(model)) {
          m[key] = isArr ? [className] : className;
        }
      })
      res = _.merge(res, m)
    })
    res[''] = className;
    // console.log(`mapping for ${className} : ${JSON.stringify(res)}`)
    return res;
  }


  export type Mapping<T = {}> = {
    [P in keyof T]?: string | string[];
  };

  function add(o: Object, path: string, mapping: Mapping = {}) {
    if (!o || Array.isArray(o) || typeof o !== 'object') return;
    const objectClassName = CLASS.getName(Object.getPrototypeOf(o).constructor);
    const resolveClass = CLASS.getBy(objectClassName);
    if (!resolveClass) {
      if (objectClassName !== 'Object') {
        if (Helpers.isBrowser) {
          console.error(`Cannot resolve class: ${objectClassName} while mapping.`)
        }
      }
      return;
    }
    if (!mapping[path]) mapping[path] = CLASS.getName(resolveClass) as any;;
  }

  /**
   * USE ONLY IN DEVELOPMENT
   * @param c
   * @param path
   * @param mapping
   * @param level
   */
  function getMappingNaive(c: Object, path = '', mapping: Mapping = {}, level = 0) {
    if (Array.isArray(c)) {
      c.forEach(c => getMappingNaive(c, path, mapping, level))
      return mapping;
    }
    if (++level === 16) return;
    add(c, path, mapping);
    for (var p in c) {
      if (c.hasOwnProperty(p)) {
        const v = c[p];
        if (Array.isArray(v) && v.length > 0) { // reducer as impovement
          v.forEach((elem, i) => {
            // const currentPaht = [`path[${i}]`, p].filter(c => c.trim() != '').join('.');
            const currentPaht = [path, p].filter(c => c.trim() != '').join('.');
            getMappingNaive(elem, currentPaht, mapping, level);
          })
        } else if (typeof v === 'object') {
          const currentPaht = [path, p].filter(c => c.trim() != '').join('.');
          add(v, currentPaht, mapping);
          getMappingNaive(v, currentPaht, mapping, level);
        }
      }
    }
    return mapping;
  }

  function getMappingPathFrom(pathLodhas: string) {
    if (!_.isString(pathLodhas)) {
      return void 0;
    }
    const regex = /\[([0-9a-zA-Z]|\'|\")*\]/g;
    pathLodhas = pathLodhas
      .replace(regex, '')
      .replace('..', '.');
    if (pathLodhas.startsWith('.')) {
      pathLodhas = pathLodhas.slice(1)
    }
    return pathLodhas;
  }

  function setMappingCirc(json: Object, mapping: Mapping = {}, circular: Circ[] = []) {

    const mainClassFn = !_.isArray(json) && CLASS.getBy(mapping['']);
    // console.log(mapping)
    walk.Object(json, (v, lodashPath, changeValue) => {
      if (!_.isUndefined(v) && !_.isNull(v)) {
        const mappingPath = getMappingPathFrom(lodashPath)
        if (!_.isUndefined(mapping[mappingPath])) {
          const isArray = _.isArray(mapping[mappingPath]);
          if (!isArray) {
            const className = isArray ? _.first(mapping[mappingPath]) : mapping[mappingPath];
            const classFN = CLASS.getBy(className)
            if (_.isFunction(classFN)) {
              // console.log(`mapping: '${mappingPath}', lp: '${lodashPath}' class: '${className}' , set `, v.location)
              changeValue(_.merge(new (classFN as any)(), v))
            }
          }
        }
      }
    })

    circular.forEach(c => {
      const ref = _.get(json, c.circuralTargetPath)
      _.set(json, c.pathToObj, ref)
    })

    if (_.isFunction(mainClassFn)) {
      json = _.merge(new (mainClassFn as any)(), json)
    }

    return json;
  }



  function setMapping(json: Object, mapping: Mapping = {}) {

    // console.log('mapping', mapping)
    if (Array.isArray(json)) {
      return json.map(j => {
        return setMapping(j, mapping)
      })
    }

    const mainClassFn = CLASS.getBy(mapping['']);

    for (const key in json) {
      if (json.hasOwnProperty(key)) {
        // if (mainClassFn && mainClassFn.name === 'Project') {
        //   // console.log(`OWn property: "${key}"`)
        // }
        if (_.isArray(json[key])) {
          json[key] = json[key].map(arrObj => {
            const objMapping = getModelsMapping(CLASS.getBy(mapping[key]))
            return setMapping(arrObj, objMapping)
          })
        } else if (_.isObject(json[key])) {
          const objMapping = getModelsMapping(CLASS.getBy(mapping[key]))
          json[key] = setMapping(json[key], objMapping)
        }
      }
      // else {
      //   if (mainClassFn && mainClassFn.name === 'Project') {
      //     // console.log(`Not own property: "${key}"`)
      //   }
      // }
    }

    Object
      .keys(mapping)
      .filter(key => key !== '' && key.split('.').length >= 2)
      .forEach(lodasPath => {
        // console.log(`Loadsh path: ${lodasPath}`)
        const objMapping = getModelsMapping(CLASS.getBy(mapping[lodasPath]))
        const input = _.get(json, lodasPath)
        if (!_.isUndefined(input)) {
          const res = setMapping(input, objMapping)
          _.set(json, lodasPath, res)
        }
      })

    if (!mainClassFn) {
      return json;
    }
    return _.merge(new (mainClassFn as any)(), json)
  }




  export type ModelValue<T> = {
    /**
     * Inside models types
     */
    [propName in keyof T]?: T[propName];
  };


  export function DefaultModelWithMapping<T = Object>(
    defaultModelValues?: ModelValue<T>,
    mapping?: Mapping<T>
  ) {
    return function (target: Function) {

      if (!_.isArray(target[SYMBOL.MODELS_MAPPING])) {
        target[SYMBOL.MODELS_MAPPING] = [];
      }

      (target[SYMBOL.MODELS_MAPPING] as any[]).push({ '': CLASS.getName(target) });
      if (_.isObject(mapping)) {
        target[SYMBOL.MODELS_MAPPING] = (target[SYMBOL.MODELS_MAPPING] as any[]).concat(mapping)
        Object.keys(mapping)
          .forEach(key => {
            const v = mapping;
            if (_.isUndefined(v) || _.isFunction(v)) {
              throw `


            Class: '${target.name}'
[ng2rest] Bad mapping value for path: ${key} , please use type: <string> or [<string>]
`;

            }
          });
      }


      if (_.isObject(defaultModelValues)) {
        const toMerge = {};
        const describedTarget = CLASS
          .describeProperites(target)
          .filter(prop => /^([a-zA-Z0-9]|\_|\#)+$/.test(prop))
        // console.log(`describedTarget: ${describedTarget} for ${target.name}`)
        describedTarget.forEach(propDefInConstr => {
          if (defaultModelValues[propDefInConstr]) {
            console.warn(`

            CONFLICT: default value for property: "${propDefInConstr}"
            in class "${target.name}" already defined as typescript
            default class proprty value.

            `)
          } else {
            toMerge[propDefInConstr] = null; // TODO from toString I can't know that
          }
        });

        // console.log(`merge "${JSON.stringify(target.prototype)}" with "${JSON.stringify(defaultModelValues)}"`)

        target[SYMBOL.DEFAULT_MODEL] = _.merge(toMerge, defaultModelValues);

        const propsToOmmit = Object
          .keys(target[SYMBOL.DEFAULT_MODEL])
          .filter(key => {
            const descriptor = Object
              .getOwnPropertyDescriptor(target.prototype, key);
            return !!descriptor;
          });
        _.merge(target.prototype, _.omit(target[SYMBOL.DEFAULT_MODEL], propsToOmmit));

        // console.log(`DEFAULT VALUE MERGE for ${target.name}`)
      }
    }
  }

}
