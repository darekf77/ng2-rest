import * as _ from "lodash";
import { CLASSNAME } from 'typescript-class-helpers/classname';
import { SYMBOL } from 'typescript-class-helpers/symbols';
import { Helpers } from './helpers';
import { Circ, JSON10 } from 'json10';
import { walk } from 'lodash-walk-object';
import { CLASS } from 'typescript-class-helpers';


export namespace Mapping {


  export function decode(json: Object, autodetect = false): Mapping {
    if (_.isUndefined(json)) {
      return undefined;
    }

    let mapping = decodeFromDecorator(_.isArray(json) ? _.first(json) : json, !autodetect)

    if (autodetect) {
      mapping = _.merge(getMapping(json), mapping);
    }

    return mapping;
  }

  export function encode<T = Function>(json: Object, mapping: Mapping, circular: Circ[] = []): T {
    if (_.isString(json) || _.isBoolean(json) || _.isNumber(json)) {
      return json as any;
    }

    if (mapping['']) {
      const decoratorMapping = getModelsMapping(CLASSNAME.getClassBy(mapping['']));
      mapping = _.merge(mapping, decoratorMapping)
    }

    let res: any;
    if (_.isArray(circular) && circular.length > 0) {
      res = setMappingCirc(json, mapping, circular);
    } else {
      res = _.merge(setMapping(json, mapping), JSON10.parse(JSON10.stringify(json), circular));
    }
    return res;
  }


  /**
   * Change function to thier names
   * @param json instace of class
   * @param production
   */
  function decodeFromDecorator(json: Object, production = false): Mapping {
    const entityClass = Helpers.Class.getFromObject(json);
    const mappings = getModelsMapping(entityClass);
    if (mappings) {
      Object.keys(mappings).forEach(key => {
        const classFn = mappings[key] as Function;
        if (_.isFunction(classFn)) {
          mappings[key] = CLASSNAME.getClassName(classFn, production);
        }
      })
    }
    return mappings as any;
  }

  export function getModelsMapping(entity: Function): Mapping {
    if (_.isUndefined(entity)) {
      return;
    }
    if (!_.isFunction(entity)) {
      return;
    }
    if (_.isObject(entity[SYMBOL.MODELS_MAPPING])) {
      return entity[SYMBOL.MODELS_MAPPING]
    }
    if (entity.prototype && _.isObject(entity.prototype[SYMBOL.MODELS_MAPPING])) {
      return entity.prototype[SYMBOL.MODELS_MAPPING]
    }
    return {
      '': CLASSNAME.getClassName(entity)
    }
  }

  export type Mapping<T={}> = {
    [P in keyof T]?: string | Function | string[];
  };


  // export interface Mapping<T=string> {
  //   [path: string]: Function | string;
  // }


  function add(o: Object, path: string, mapping: Mapping = {}) {
    if (!o || Array.isArray(o) || typeof o !== 'object') return;
    const objectClassName = CLASSNAME.getClassName(Object.getPrototypeOf(o).constructor);
    const resolveClass = CLASSNAME.getClassBy(objectClassName);
    if (!resolveClass) {
      if (objectClassName !== 'Object') {
        if (Helpers.isBrowser) {
          console.error(`Cannot resolve class: ${objectClassName} while mapping.`)
        }
      }
      return;
    }
    if (!mapping[path]) mapping[path] = CLASSNAME.getClassName(resolveClass) as any;;
  }

  /**
   * USE ONLY IN DEVELOPMENT
   * @param c
   * @param path
   * @param mapping
   * @param level
   */
  function getMapping(c: Object, path = '', mapping: Mapping = {}, level = 0) {
    if (Array.isArray(c)) {
      c.forEach(c => getMapping(c, path, mapping, level))
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
            getMapping(elem, currentPaht, mapping, level);
          })
        } else if (typeof v === 'object') {
          const currentPaht = [path, p].filter(c => c.trim() != '').join('.');
          add(v, currentPaht, mapping);
          getMapping(v, currentPaht, mapping, level);
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


  export function DefaultModelWithMapping<T=Object>(
    defaultModelValues: ModelValue<T>,
    mapping?: Mapping<T>
  ) {
    return function (target: Function) {



      if (!target[SYMBOL.MODELS_MAPPING]) {
        target[SYMBOL.MODELS_MAPPING] = {
          '': CLASSNAME.getClassName(target)
        }
      }
      _.merge(target[SYMBOL.MODELS_MAPPING], mapping);
      Object.keys(target[SYMBOL.MODELS_MAPPING])
        .forEach(key => {
          const v = target[SYMBOL.MODELS_MAPPING][key];
          if (_.isUndefined(v)) {
            throw `


            Class: ${target.name}
            Bad mapping value for key: ${key} is ${v}

            `;

          }
          // else if (_.isString(v)) {
          //   const res = getClassBy(v);
          //   target[SYMBOL.MODELS_MAPPING][key] = res;
          //   console.log(`resolved class from ${v}`, res)
          // }
        });

      // console.info(`IAM IN DefaultModel, taget: ${target && target.name}`)
      // console.info('defaultModelValues:', defaultModelValues)
      // console.info('mapping', mapping)
      if (_.isObject(defaultModelValues)) {
        const toMerge = {};
        const describedTarget = Helpers.Class.describeProperites(target)
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
        _.merge(target.prototype, target[SYMBOL.DEFAULT_MODEL])
        // console.log(`DEFAULT VALUE MERGE for ${target.name}`)
      }
    }
  }



}


// const c = Resource.create<{ name: string; }>('http://onet.pl', 'adasd', User);
// console.log(c)

// let uu = new User();
// uu.name = 'asdasd';
// let book = new Book();
// book.author = new Author();
// book.title = 'roses';
// book.author.friends = [new User(), new User()]
// book.author.user = new User();
// uu.friend = new Author();
// uu.friend.age = 23;
// uu.friend.user = new User();
// uu.books = [book];



// let mapping = decode(uu);
// console.log('mapping', mapping)
// let obj = JSON.parse(JSON.stringify(uu));
// console.log('before', uu)
// console.log('after', encode(obj, mapping))
