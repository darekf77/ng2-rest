//#region imports
import { Circ, JSON10 } from 'json10/src';
import { _, Helpers, UtilsOs } from 'tnp-core/src';
import { CLASS } from 'typescript-class-helpers/src';
//#endregion

//#region constatns
const mappingStore = new WeakMap<
  Function,
  { mapping?: () => EncodeSchema<any> }
>();

const defaultValueStore = new WeakMap<
  Function,
  { defaults?: () => ModelValue<any> }
>();
//#endregion

//#region models
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export type ModelValue<T> =
  | DeepPartial<T>
  | Partial<Record<MappingFrom<T>, any>>;

type Constructor<T = any> = new (...args: any[]) => T;

type MappingFrom<T> = {
  [K in keyof T & string]: T[K] extends Primitive
    ? K
    : T[K] extends Array<infer U>
      ? K | `${K}.${MappingFrom<U>}`
      : K | `${K}.${MappingFrom<T[K]>}`;
}[keyof T & string];

/**
 * Mapping schema that can be set from decorator
 *
 * @DefaultMapping(() => ({
 *   '': User,
 *   'book': Book,
 *   'book.author': Author,
 * }))
 * class User { }
 *
 */
export type EncodeSchema<T = any> = {
  ''?: Constructor<T>;
} & {
  [K in MappingFrom<T>]?: Constructor<any> | [Constructor<any>];
};

/**
 * Mapping schema returned or sended inside http headers
 */
export type EncodeSchemaString<T = any> = {
  ''?: string;
  '[]'?: string[]; // returned only for array, cant be set on class mapping
} & {
  [K in MappingFrom<T>]?: string | string[];
};

type Primitive =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined
  | Date
  | Function;
//#endregion

//#region decorators

export function DefaultMapping<T>(mapping?: () => EncodeSchema<T>) {
  return function (target: Constructor<T>) {
    mappingStore.set(target, { mapping });
  };
}

export function DefaultModel<T>(defaults?: () => ModelValue<T>) {
  return function (target: Constructor<T>) {
    defaultValueStore.set(target, { defaults });
  };
}

//#endregion

//#region helpers

const isPlainObject = (v: any) =>
  !!v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date);

const deepClone = <T>(v: T): T => {
  if (Array.isArray(v)) return v.map(deepClone) as any;
  if (isPlainObject(v)) {
    const out: any = {};
    for (const k of Object.keys(v)) out[k] = deepClone((v as any)[k]);
    return out;
  }
  return v;
};

/**
 * Merge defaults into target, but only when target value is undefined.
 * (Does not overwrite defined values.)
 */
const deepMergeIfUndefined = (target: any, defaults: any) => {
  if (!isPlainObject(defaults)) return;

  for (const k of Object.keys(defaults)) {
    const dv = defaults[k];
    const tv = target[k];

    if (tv === undefined) {
      target[k] = deepClone(dv);
      continue;
    }

    if (isPlainObject(tv) && isPlainObject(dv)) {
      deepMergeIfUndefined(tv, dv);
    }
  }
};

const applyDefaultsToInstance = (instance: any, defaults?: any) => {
  if (!defaults) return;

  // Path-based defaults (keys containing '.')
  for (const k of Object.keys(defaults)) {
    if (k.includes('.')) {
      const value = defaults[k];
      const current = _.get(instance, k);
      if (current === undefined) {
        _.set(instance, k, deepClone(value));
      }
    }
  }

  // Object-based defaults (no dots) -> deep merge (only if undefined)
  const objDefaults: any = {};
  for (const k of Object.keys(defaults)) {
    if (!k.includes('.')) objDefaults[k] = defaults[k];
  }
  deepMergeIfUndefined(instance, objDefaults);
};

const getClassNameTokenFromItem = (item: any): string => {
  if (item == null) return '';
  if (item == undefined) return '';

  // If already constructor
  if (typeof item === 'function') {
    return CLASS.getName(item) || '';
  }

  if (typeof item !== 'object') {
    return '';
  }

  // If instance
  const classFn = item.constructor;
  if (typeof classFn === 'function') {
    return CLASS.getName(classFn) || '';
  }

  return '';
};

/**
 * Encode consecutive equal tokens using # run-length.
 *
 * Examples:
 * - ['User','User','Author','User'] -> ['User#2','Author','User']
 * - ['User','User','User','User'] -> ['User#4']
 * - ['User', '', '', '', 'Author', ''] -> ['User', '#3', 'Author', '']
 */
const rleEncodeTokens = (tokens: string[]): string[] => {
  const out: string[] = [];
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];
    let j = i + 1;
    while (j < tokens.length && tokens[j] === token) j++;
    const count = j - i;

    if (token === '') {
      // null/undefined run
      out.push(count >= 2 ? `#${count}` : '');
    } else {
      out.push(count >= 2 ? `${token}#${count}` : token);
    }

    i = j;
  }

  return out;
};

type ParsedToken = { name: string; count: number };

const parseRleToken = (token: string): ParsedToken => {
  // '' => no mapping for 1
  if (token === '') return { name: '', count: 1 };

  // '#N' => no mapping for next N
  if (token.startsWith('#')) {
    const count = Number(token.slice(1));
    return { name: '', count: Number.isFinite(count) && count > 0 ? count : 1 };
  }

  // 'Name#N' => Name for next N
  const idx = token.lastIndexOf('#');
  if (idx > 0) {
    const name = token.slice(0, idx);
    const count = Number(token.slice(idx + 1));
    if (name && Number.isFinite(count) && count > 0) {
      return { name, count };
    }
  }

  // 'Name' => Name for 1
  return { name: token, count: 1 };
};

const expandRleTokens = (tokens: string[]): string[] => {
  const out: string[] = [];
  for (const t of tokens) {
    const { name, count } = parseRleToken(t);
    for (let i = 0; i < count; i++) out.push(name);
  }
  return out;
};

//#endregion

//#region get default value for class instance from decorator data
export function getDefaultModel<T>(
  instanceOrClass: T | Constructor<T>,
): ModelValue<T> | undefined {
  const classFn =
    typeof instanceOrClass === 'function'
      ? instanceOrClass
      : (instanceOrClass as any).constructor;

  const getter = defaultValueStore.get(classFn)?.defaults;
  return getter ? (getter() as any) : undefined;
}
//#endregion

//#region get mapping from decorator data (may container Entites classes)
export function getDefaultMappingSingleObjOrClass<T>(
  instanceOrClass: T | Constructor<T>,
): EncodeSchema<T> | undefined {
  const classFn =
    typeof instanceOrClass === 'function'
      ? instanceOrClass
      : (instanceOrClass as any).constructor;

  const getter = mappingStore.get(classFn)?.mapping;
  return getter ? (getter() as any) : undefined;
}
//#endregion

//#region decode mapping (replace entites with names)

/**
 * This will be send in request header to later restore class mapping
 */
export function getMappingHeaderString<T = any>(
  instanceOrClass: T | Constructor<T> | (T | Constructor<T>)[],
): string {
  return JSON.stringify(decodeMappingForHeaderJson(instanceOrClass));
}

/**
 *
 * @param instanceOrClass class instance or class object
 * OR array of class instancess or class objects
 * @returns Mapping object ready to be JSON.stringify
 */
export function decodeMappingForHeaderJson<T>(
  instanceOrClass: T | Constructor<T> | (T | Constructor<T>)[],
  options?: {
    useFirstArrayItemClassNameForAllElements?: boolean;
  },
): EncodeSchemaString<T> {
  options = options || {};
  // Array encoding (special protocol)
  if (
    Array.isArray(instanceOrClass) &&
    !options.useFirstArrayItemClassNameForAllElements
  ) {
    const tokens = instanceOrClass.map(getClassNameTokenFromItem);
    return { '[]': rleEncodeTokens(tokens) } as any;
  }

  if (
    Array.isArray(instanceOrClass) &&
    options.useFirstArrayItemClassNameForAllElements
  ) {
    instanceOrClass = _.first(instanceOrClass);
  }

  // Single object / class encoding
  const mapping = getDefaultMappingSingleObjOrClass(instanceOrClass);
  if (!mapping || !mapping['']) {
    const className =
      CLASS.getClassNameFromObjInstanceOrClassFn(instanceOrClass as any) || '';

    return {
      '': className,
    };
  }

  // Your EncodeSchema is flat (dot-path keys), so we can encode it flat too.
  const mappingObj: any = {};

  for (const key of Object.keys(mapping)) {
    const v: any = (mapping as any)[key];

    if (key === '') {
      mappingObj[''] = CLASS.getName(v);
      continue;
    }

    if (Array.isArray(v) && v.length === 1) {
      const item = v[0];
      mappingObj[key] =
        typeof item === 'function' ? CLASS.getName(item) : String(item);
      continue;
    }

    if (typeof v === 'function') {
      mappingObj[key] = CLASS.getName(v);
      continue;
    }
  }

  return mappingObj;
}
//#endregion

//#region encode mapping from mapping schema and circular metadata
export const encodeMapping = <T>(
  input: any,
  schema: EncodeSchema | EncodeSchemaString,
  circular: Circ[] = [],
): T => {
  const mapped = encodeMappingFn<{}>(input, schema as any, circular);
  JSON10.applyCircularMapping(mapped, circular);
  return mapped as any;
};

const encodeMappingFn = <T>(
  input: any,
  schema: EncodeSchema<T> | EncodeSchemaString<T>,
  circular: Circ[],
  parentPath: string = '',
): T => {
  /**
   * HANDLE ARRAYS IN SCHEMA (header-only protocol)
   *
   * {
   *   '[]': ['User#1000'], // input should be in this case array...
   * }                      // 1000 objects ready to be changed to User class instances
   */
  if (Array.isArray(input) && (schema as any)['[]']) {
    const rle = (schema as any)['[]'] as string[];
    const expanded = expandRleTokens(rle);

    const out: any[] = [];
    const max = input.length;

    for (let i = 0; i < max; i++) {
      const className = expanded[i] ?? '';
      const raw = input[i];

      // keep null/undefined and "no mapping" items as-is
      if (!className || raw == null) {
        out.push(raw);
        continue;
      }

      const ClassFn = CLASS.getBy(className);

      if (!ClassFn) {
        out.push(raw);
        continue;
      }

      out.push(
        encodeMappingFn(
          raw,
          { ...(schema as any), '': ClassFn },
          circular,
          parentPath,
        ),
      );
    }

    return out as any;
  }

  // Normal array (no header array schema) -> map items using same schema
  if (Array.isArray(input)) {
    return input.map(item =>
      encodeMappingFn(item, schema, circular, parentPath),
    ) as any;
  }

  if (!input || typeof input !== 'object') {
    return input;
  }

  const RootClass = (
    _.isString((schema as any)[''])
      ? CLASS.getBy((schema as any)[''])
      : (schema as any)['']
  ) as Constructor | undefined;

  const instance = RootClass ? new RootClass() : {};

  // Apply defaults from decorator (if RootClass is known)
  if (RootClass) {
    const defaults = getDefaultModel(RootClass);
    applyDefaultsToInstance(instance, defaults);
  }

  for (const key of Object.keys(input)) {
    const value = (input as any)[key];

    const fullPath = parentPath ? `${parentPath}.${key}` : key;
    const rule: any = (schema as any)[fullPath];

    if (!rule) {
      // still recurse so nested objects/arrays also get mapped when they have deep rules
      (instance as any)[key] = encodeMappingFn(
        value,
        schema,
        circular,
        fullPath,
      );
      continue;
    }

    // Array rule (value is expected to be array)
    if (Array.isArray(rule)) {
      const ItemClass =
        typeof rule[0] === 'string' ? CLASS.getBy(rule[0]) : rule[0];

      (instance as any)[key] = Array.isArray(value)
        ? value.map(v =>
            encodeMappingFn(
              v,
              { ...(schema as any), '': ItemClass },
              circular,
              fullPath,
            ),
          )
        : [];

      continue;
    }

    // Object rule
    const NestedClass = typeof rule === 'string' ? CLASS.getBy(rule) : rule;

    (instance as any)[key] = encodeMappingFn(
      value,
      { ...(schema as any), '': NestedClass },
      circular,
      fullPath,
    );
  }

  return instance as any;
};

//#endregion
