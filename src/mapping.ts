import * as _ from "lodash";
import { ClassConfig, CLASS_META_CONFIG } from './models';

export function decode(json: Object, entities?: Function[]): Mapping {
  getClassBy.prototype.classes = entities;
  return getMapping(json);
}

export function encode<T = Function>(json: Object, mapping: Mapping): T {

  return setMapping(json, mapping);
}

export interface Mapping {
  [path: string]: Function;
}
export function initEntities(entities: Function[]) {
  getClassBy.prototype.classes = entities;
}


export function getClassConfig(target: Function, configs: ClassConfig[] = []): ClassConfig[] {
  const meta = CLASS_META_CONFIG + target.name;
  // if (!target.prototype[meta]) target.prototype[meta] = {};
  let c: ClassConfig;
  if (target.prototype[meta]) {
    c = target.prototype[meta];
  } else {
    c = new ClassConfig();
    c.name = target.name;
    target.prototype[meta] = c;
  }
  configs.push(c);
  const proto = Object.getPrototypeOf(target)
  if (proto.name && proto.name !== target.name) {
    getClassConfig(proto, configs)
  }
  return configs;
}

const NAME_CACHE = '$$fn_name_cache'

export function getClassName(entityOrController: Function) {
  if(!getClassName.prototype[NAME_CACHE]) {
    getClassName.prototype[NAME_CACHE] = {};
  }
  if (getClassName.prototype[NAME_CACHE][entityOrController.name]) {
    return getClassName.prototype[NAME_CACHE][entityOrController.name];
  }
  const configs = getClassConfig(entityOrController.constructor);
  const c = configs[0];
  if (c.className) {
    getClassName.prototype[NAME_CACHE][entityOrController.name] = c.className;
    return c.className
  }
  return entityOrController.name;
}

function getClassBy(className: string | Function): Function {
  if (typeof className === 'function') {
    return className;
  }
  if (className === 'Date') {
    return Date;
  }
  const clases = getClassBy.prototype.classes;
  return clases.find((c) => getClassName(c) === className);
}

function add(o: Object, path: string, mapping: Mapping = {}) {
  if (!o || Array.isArray(o) || typeof o !== 'object') return;
  const objectClassName = Object.getPrototypeOf(o).constructor.name;
  const resolveClass = getClassBy(objectClassName);
  if (!resolveClass) {
    if (objectClassName !== 'Object') {
      console.error(`Cannot resolve class: ${objectClassName} white mapping.`)
    }
    return;
  }
  if (!mapping[path]) mapping[path] = resolveClass.name as any;
}

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

function clearPath(path: string) {
  return path.replace(/\[.\]/g, '.').replace(/\.$/, '').replace(/\.\./g, '.');
}

function setMapping(json: Object, mapping: Mapping = {},
  path = '', realPath: string = '',
  level = 0, result?: Function) {
  if (++level === 16) return;
  const ClassTemplate: { new(any?): Function } = getClassBy(mapping[path] as any) as any;
  let toInterate: Object;
  if (ClassTemplate) {
    if (path === '') {
      result = new ClassTemplate();
      toInterate = json;
    } else {
      _.set(result, realPath, new ClassTemplate())
      toInterate = _.get(json, realPath);
    }
  }

  for (let propertyPath in toInterate) {
    if (toInterate.hasOwnProperty(propertyPath)) {
      const v = toInterate[propertyPath];
      const tmpPath = `${path === '' ? '' : `${realPath}.`}${propertyPath}`;
      if (_.isArray(v)) {
        v.forEach((elem, index) => {
          const pathArray = `${tmpPath}[${index}]`;
          return setMapping(json, mapping, clearPath(pathArray), pathArray, level, result);
        });
      } else if (_.isObject(v)) {
        setMapping(json, mapping, clearPath(tmpPath), tmpPath, level, result);
      } else {
        _.set(result, tmpPath, v);
      }
    }
  }
  if (path === '') {
    if (!result) return json;
    return result;
  }
  return _.get(result, realPath);
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
